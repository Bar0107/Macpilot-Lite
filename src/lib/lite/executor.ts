/**
 * Lite Executor
 *
 * Dispatches plan steps to real macOS actions.
 * Only whitelisted, safe tool IDs are allowed to execute.
 * No arbitrary shell. No destructive commands. No network calls.
 */

import { execFile } from "node:child_process";
import { readdir, mkdir, rename, stat } from "node:fs/promises";
import { join, extname, resolve } from "node:path";
import { homedir } from "node:os";
import type { PlanStep } from "./planner";

export interface ExecutionResult {
  toolId: string;
  success: boolean;
  output: string;
  error?: string;
}

// ─── Whitelisted tool IDs ────────────────────────────────────────────────────

const ALLOWED_TOOLS = new Set([
  "system_info",
  "app_open",
  "calendar_view",
  "fs_list",
  "fs_move",
  "mail_draft",
]);

// ─── AppleScript runner ──────────────────────────────────────────────────────

function runAppleScript(script: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile("osascript", ["-e", script], { timeout: 10_000 }, (err, stdout, stderr) => {
      if (err) reject(new Error(stderr || err.message));
      else resolve(stdout.trim());
    });
  });
}

// ─── File type categories ────────────────────────────────────────────────────

const FILE_CATEGORIES: Record<string, string[]> = {
  Images: [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".webp", ".heic", ".tiff", ".ico"],
  Documents: [".pdf", ".doc", ".docx", ".txt", ".rtf", ".odt", ".pages", ".xlsx", ".xls", ".csv", ".pptx", ".ppt", ".md"],
  Archives: [".zip", ".tar", ".gz", ".rar", ".7z", ".dmg", ".iso"],
  Videos: [".mp4", ".mov", ".avi", ".mkv", ".wmv", ".flv", ".webm"],
  Audio: [".mp3", ".wav", ".aac", ".flac", ".ogg", ".m4a", ".wma"],
  Code: [".js", ".ts", ".py", ".java", ".c", ".cpp", ".html", ".css", ".json", ".xml", ".sh"],
  Apps: [".app", ".pkg", ".deb"],
};

function categorize(ext: string): string {
  const lower = ext.toLowerCase();
  for (const [category, exts] of Object.entries(FILE_CATEGORIES)) {
    if (exts.includes(lower)) return category;
  }
  return "Other";
}

// ─── Tool implementations ────────────────────────────────────────────────────

async function execSystemInfo(): Promise<ExecutionResult> {
  const results: string[] = [];

  // CPU
  try {
    const cpu = await new Promise<string>((res, rej) => {
      execFile("sysctl", ["-n", "machdep.cpu.brand_string"], { timeout: 5000 }, (err, out) => {
        if (err) rej(err); else res(out.trim());
      });
    });
    results.push(`CPU: ${cpu}`);
  } catch {
    results.push("CPU: unavailable");
  }

  // CPU usage
  try {
    const usage = await new Promise<string>((res, rej) => {
      execFile("ps", ["-A", "-o", "%cpu"], { timeout: 5000 }, (err, out) => {
        if (err) rej(err);
        else {
          const lines = out.trim().split("\n").slice(1);
          const total = lines.reduce((sum, l) => sum + parseFloat(l.trim() || "0"), 0);
          res(total.toFixed(1));
        }
      });
    });
    results.push(`CPU Usage: ${usage}%`);
  } catch {
    results.push("CPU Usage: unavailable");
  }

  // Memory
  try {
    const mem = await new Promise<string>((res, rej) => {
      execFile("sysctl", ["-n", "hw.memsize"], { timeout: 5000 }, (err, out) => {
        if (err) rej(err);
        else {
          const gb = (parseInt(out.trim()) / 1073741824).toFixed(1);
          res(gb);
        }
      });
    });
    results.push(`Memory: ${mem} GB total`);
  } catch {
    results.push("Memory: unavailable");
  }

  // Disk
  try {
    const disk = await new Promise<string>((res, rej) => {
      execFile("df", ["-h", "/"], { timeout: 5000 }, (err, out) => {
        if (err) rej(err);
        else {
          const lines = out.trim().split("\n");
          if (lines.length >= 2) {
            const parts = lines[1].split(/\s+/);
            res(`${parts[3]} available of ${parts[1]}`);
          } else {
            res("unknown");
          }
        }
      });
    });
    results.push(`Disk: ${disk}`);
  } catch {
    results.push("Disk: unavailable");
  }

  // Battery
  try {
    const battery = await new Promise<string>((res, rej) => {
      execFile("pmset", ["-g", "batt"], { timeout: 5000 }, (err, out) => {
        if (err) rej(err);
        else {
          const match = out.match(/(\d+)%/);
          const charging = out.includes("AC Power") ? " (charging)" : " (battery)";
          res(match ? `${match[1]}%${charging}` : "unavailable");
        }
      });
    });
    results.push(`Battery: ${battery}`);
  } catch {
    results.push("Battery: unavailable (desktop Mac)");
  }

  return {
    toolId: "system_info",
    success: true,
    output: results.join("\n"),
  };
}

async function execAppOpen(params: Record<string, string>): Promise<ExecutionResult> {
  const app = params.app;
  if (!app || app.length > 100) {
    return { toolId: "app_open", success: false, output: "", error: "Invalid app name" };
  }

  // Block dangerous app names (injection prevention)
  if (/[";\\`$]/.test(app)) {
    return { toolId: "app_open", success: false, output: "", error: "Invalid characters in app name" };
  }

  try {
    await runAppleScript(`tell application "${app}" to activate`);
    return { toolId: "app_open", success: true, output: `Opened ${app}` };
  } catch (e) {
    return { toolId: "app_open", success: false, output: "", error: (e as Error).message };
  }
}

async function execCalendarView(params: Record<string, string>): Promise<ExecutionResult> {
  try {
    // Open Calendar and switch to week view
    const script = `
tell application "Calendar"
  activate
end tell
delay 0.5
tell application "System Events"
  tell process "Calendar"
    -- Cmd+3 = week view in Calendar.app
    keystroke "3" using command down
  end tell
end tell
`;
    await runAppleScript(script);
    return { toolId: "calendar_view", success: true, output: "Calendar opened in week view" };
  } catch (e) {
    return { toolId: "calendar_view", success: false, output: "", error: (e as Error).message };
  }
}

async function execFsList(params: Record<string, string>): Promise<ExecutionResult> {
  const rawPath = params.path || "~/Downloads";
  const resolvedPath = rawPath.replace(/^~/, homedir());

  // Safety: only allow listing inside home directory
  const absPath = resolve(resolvedPath);
  if (!absPath.startsWith(homedir())) {
    return { toolId: "fs_list", success: false, output: "", error: "Can only list files inside home directory" };
  }

  try {
    const entries = await readdir(absPath);
    const lines: string[] = [];
    for (const entry of entries.slice(0, 100)) {
      try {
        const s = await stat(join(absPath, entry));
        const type = s.isDirectory() ? "dir" : "file";
        lines.push(`  ${type}  ${entry}`);
      } catch {
        lines.push(`  ???  ${entry}`);
      }
    }
    const header = `${absPath} (${entries.length} items)`;
    return { toolId: "fs_list", success: true, output: `${header}\n${lines.join("\n")}` };
  } catch (e) {
    return { toolId: "fs_list", success: false, output: "", error: (e as Error).message };
  }
}

async function execFsMove(params: Record<string, string>): Promise<ExecutionResult> {
  if (params.pattern !== "by_type") {
    return { toolId: "fs_move", success: false, output: "", error: "Only 'by_type' pattern is supported in Lite" };
  }

  const downloadsPath = join(homedir(), "Downloads");
  const moved: string[] = [];
  const errors: string[] = [];

  try {
    const entries = await readdir(downloadsPath);

    for (const entry of entries) {
      // Skip hidden files and directories
      if (entry.startsWith(".")) continue;

      const fullPath = join(downloadsPath, entry);
      const s = await stat(fullPath).catch(() => null);
      if (!s || s.isDirectory()) continue;

      const ext = extname(entry);
      if (!ext) continue;

      const category = categorize(ext);
      const categoryDir = join(downloadsPath, category);

      try {
        await mkdir(categoryDir, { recursive: true });
        const dest = join(categoryDir, entry);
        await rename(fullPath, dest);
        moved.push(`${entry} -> ${category}/`);
      } catch (e) {
        errors.push(`Failed to move ${entry}: ${(e as Error).message}`);
      }
    }

    const summary = moved.length > 0
      ? `Organized ${moved.length} files:\n${moved.map(m => `  ${m}`).join("\n")}`
      : "No files to organize.";

    const errorSummary = errors.length > 0
      ? `\n\nErrors:\n${errors.join("\n")}`
      : "";

    return { toolId: "fs_move", success: true, output: summary + errorSummary };
  } catch (e) {
    return { toolId: "fs_move", success: false, output: "", error: (e as Error).message };
  }
}

async function execMailDraft(params: Record<string, string>): Promise<ExecutionResult> {
  const content = params.content || "";

  // Sanitize content for AppleScript string (escape backslashes and quotes)
  const safe = content.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

  if (safe.length > 5000) {
    return { toolId: "mail_draft", success: false, output: "", error: "Content too long" };
  }

  try {
    const script = `tell application "Mail"
  set newMsg to make new outgoing message with properties {visible:true, content:"${safe}"}
  activate
end tell`;
    await runAppleScript(script);
    return { toolId: "mail_draft", success: true, output: "Draft created in Mail.app" };
  } catch (e) {
    return { toolId: "mail_draft", success: false, output: "", error: (e as Error).message };
  }
}

// ─── Dispatcher ──────────────────────────────────────────────────────────────

export async function executeStep(step: PlanStep): Promise<ExecutionResult> {
  if (!ALLOWED_TOOLS.has(step.toolId)) {
    return {
      toolId: step.toolId,
      success: false,
      output: "",
      error: `Blocked: tool "${step.toolId}" is not in the Lite allowed list`,
    };
  }

  switch (step.toolId) {
    case "system_info":
      return execSystemInfo();
    case "app_open":
      return execAppOpen(step.params);
    case "calendar_view":
      return execCalendarView(step.params);
    case "fs_list":
      return execFsList(step.params);
    case "fs_move":
      return execFsMove(step.params);
    case "mail_draft":
      return execMailDraft(step.params);
    default:
      return {
        toolId: step.toolId,
        success: false,
        output: "",
        error: `No executor implemented for "${step.toolId}"`,
      };
  }
}
