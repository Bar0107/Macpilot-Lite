/**
 * Lite Tool Registry
 *
 * Simplified tool registry for MacPilot Lite.
 * Each tool declares its ID, description, risk level, and executor type.
 *
 * This is a subset of the full Autopilot tool registry (~25 tools).
 * Lite ships with the most common tools; users can register custom tools.
 */

export type RiskLevel = "low" | "medium" | "high";
export type ExecutorType = "applescript" | "shell" | "in-app";

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, { type: string; description: string }>;
  executor: ExecutorType;
  risk: RiskLevel;
  template?: (params: Record<string, string>) => string;
}

class ToolRegistry {
  private tools = new Map<string, ToolDefinition>();

  register(tool: ToolDefinition): void {
    this.tools.set(tool.id, tool);
  }

  get(id: string): ToolDefinition | undefined {
    return this.tools.get(id);
  }

  getAll(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  getByRisk(risk: RiskLevel): ToolDefinition[] {
    return this.getAll().filter((t) => t.risk === risk);
  }
}

// ─── Singleton Registry ──────────────────────────────────────────────────────

export const toolRegistry = new ToolRegistry();

// ─── Built-in Tools ──────────────────────────────────────────────────────────

toolRegistry.register({
  id: "app_open",
  name: "Open Application",
  description: "Open a macOS application by name",
  parameters: {
    app: { type: "string", description: "Application name" },
  },
  executor: "applescript",
  risk: "low",
  template: (p) => `tell application "${p.app}" to activate`,
});

toolRegistry.register({
  id: "system_info",
  name: "System Status",
  description: "Get CPU, memory, disk, and battery info",
  parameters: {},
  executor: "shell",
  risk: "low",
});

toolRegistry.register({
  id: "fs_list",
  name: "List Files",
  description: "List files in a directory",
  parameters: {
    path: { type: "string", description: "Directory path" },
  },
  executor: "shell",
  risk: "low",
});

toolRegistry.register({
  id: "fs_move",
  name: "Move Files",
  description: "Move or reorganize files",
  parameters: {
    pattern: { type: "string", description: "Move strategy (e.g. by_type)" },
  },
  executor: "shell",
  risk: "medium",
});

toolRegistry.register({
  id: "mail_draft",
  name: "Draft Email",
  description: "Create a draft email in Mail.app",
  parameters: {
    content: { type: "string", description: "Email content or instructions" },
  },
  executor: "applescript",
  risk: "medium",
  template: (p) =>
    `tell application "Mail" to make new outgoing message with properties {visible:true, content:"${p.content}"}`,
});

toolRegistry.register({
  id: "mail_send",
  name: "Send Email",
  description: "Send an email via Mail.app",
  parameters: {
    to: { type: "string", description: "Recipient email" },
    subject: { type: "string", description: "Email subject" },
    body: { type: "string", description: "Email body" },
  },
  executor: "applescript",
  risk: "high",
});

toolRegistry.register({
  id: "calendar_view",
  name: "View Calendar",
  description: "Show calendar events for a time range",
  parameters: {
    range: { type: "string", description: "Time range (today, this_week, this_month)" },
  },
  executor: "applescript",
  risk: "low",
});

toolRegistry.register({
  id: "clipboard_read",
  name: "Read Clipboard",
  description: "Read current clipboard contents",
  parameters: {},
  executor: "applescript",
  risk: "low",
  template: () => `the clipboard`,
});

toolRegistry.register({
  id: "notification_show",
  name: "Show Notification",
  description: "Display a macOS notification",
  parameters: {
    title: { type: "string", description: "Notification title" },
    message: { type: "string", description: "Notification body" },
  },
  executor: "applescript",
  risk: "low",
  template: (p) =>
    `display notification "${p.message}" with title "${p.title}"`,
});
