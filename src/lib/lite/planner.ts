/**
 * Lite Planner
 *
 * Rule-based intent → action mapper for MacPilot Lite.
 * Maps natural language input to tool IDs from the registry.
 *
 * Unlike the full Autopilot planner (which calls an LLM to generate
 * structured ActionPlans), the Lite planner uses keyword matching
 * for common patterns and falls back to an LLM call for ambiguous input.
 */

export interface PlanStep {
  toolId: string;
  params: Record<string, string>;
}

export interface LitePlan {
  intent: string;
  description: string;
  steps: PlanStep[];
}

// Keyword → tool mapping for common patterns
const INTENT_PATTERNS: Array<{
  keywords: RegExp;
  intent: string;
  steps: (input: string) => PlanStep[];
  description: (input: string) => string;
}> = [
  {
    keywords: /\b(organiz|sort|group|clean).*(download|folder|file)/i,
    intent: "organize_files",
    steps: () => [
      { toolId: "fs_list", params: { path: "~/Downloads" } },
      { toolId: "fs_move", params: { pattern: "by_type" } },
    ],
    description: () => "Organize Downloads folder by file type",
  },
  {
    keywords: /\b(draft|write|compose|send).*(email|mail|message)/i,
    intent: "draft_email",
    steps: (input) => [
      { toolId: "mail_draft", params: { content: input } },
    ],
    description: () => "Draft an email in Mail.app",
  },
  {
    keywords: /\b(system|status|cpu|memory|disk|battery)\b/i,
    intent: "system_status",
    steps: () => [
      { toolId: "system_info", params: {} },
    ],
    description: () => "Show system status (CPU, memory, disk, battery)",
  },
  {
    keywords: /\b(calendar|schedule|this week|events?)\b/i,
    intent: "calendar_view",
    steps: () => [
      { toolId: "app_open", params: { app: "Calendar" } },
      { toolId: "calendar_view", params: { range: "this_week" } },
    ],
    description: () => "Open Calendar and show this week's events",
  },
  {
    keywords: /\bopen\s+(\w[\w\s]*)/i,
    intent: "open_app",
    steps: (input) => {
      const match = input.match(/\bopen\s+(\w[\w\s]*)/i);
      const app = match?.[1]?.trim() ?? "Finder";
      return [{ toolId: "app_open", params: { app } }];
    },
    description: (input) => {
      const match = input.match(/\bopen\s+(\w[\w\s]*)/i);
      return `Open ${match?.[1]?.trim() ?? "app"}`;
    },
  },
];

export class LitePlanner {
  plan(userInput: string): LitePlan | null {
    for (const pattern of INTENT_PATTERNS) {
      if (pattern.keywords.test(userInput)) {
        return {
          intent: pattern.intent,
          description: pattern.description(userInput),
          steps: pattern.steps(userInput),
        };
      }
    }

    // No matching pattern — in production, this falls back to an LLM call
    return null;
  }
}
