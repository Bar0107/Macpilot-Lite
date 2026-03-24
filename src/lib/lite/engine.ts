/**
 * Lite Engine
 *
 * Simplified 1-2 step orchestrator for MacPilot Lite.
 * Handles: intent parsing → tool selection → approval check → execution → response.
 *
 * Unlike the full Autopilot engine, Lite skips multi-step planning,
 * persistent memory, verification, and rollback. It's designed for
 * single-turn command execution with a basic approval gate.
 */

import { LitePlanner, type LitePlan } from "./planner";
import { toolRegistry } from "./tool-registry";
import { executeStep, type ExecutionResult } from "./executor";

export interface LiteEngineResult {
  success: boolean;
  message: string;
  toolsUsed: string[];
  requiresApproval: boolean;
  plan: LitePlan | null;
  executionResults: ExecutionResult[];
}

export class LiteEngine {
  private planner: LitePlanner;

  constructor() {
    this.planner = new LitePlanner();
  }

  async run(userInput: string, approved = false): Promise<LiteEngineResult> {
    // 1. Plan: determine intent and select tools
    const plan = this.planner.plan(userInput);

    if (!plan) {
      return {
        success: false,
        message: "I couldn't determine what action to take.",
        toolsUsed: [],
        requiresApproval: false,
        plan: null,
        executionResults: [],
      };
    }

    // 2. Check approval requirement for medium/high risk tools
    const needsApproval = plan.steps.some((step) => {
      const tool = toolRegistry.get(step.toolId);
      return tool?.risk === "high" || tool?.risk === "medium";
    });

    if (needsApproval && !approved) {
      return {
        success: true,
        message: `Approval required: ${plan.description}`,
        toolsUsed: plan.steps.map((s) => s.toolId),
        requiresApproval: true,
        plan,
        executionResults: [],
      };
    }

    // 3. Execute each step for real
    const executedTools: string[] = [];
    const executionResults: ExecutionResult[] = [];

    for (const step of plan.steps) {
      const tool = toolRegistry.get(step.toolId);
      if (!tool) {
        return {
          success: false,
          message: `Unknown tool: ${step.toolId}`,
          toolsUsed: executedTools,
          requiresApproval: false,
          plan,
          executionResults,
        };
      }

      const result = await executeStep(step);
      executionResults.push(result);
      executedTools.push(step.toolId);

      if (!result.success) {
        return {
          success: false,
          message: result.error || `Failed at step: ${step.toolId}`,
          toolsUsed: executedTools,
          requiresApproval: false,
          plan,
          executionResults,
        };
      }
    }

    // 4. Build summary from execution outputs
    const outputSummary = executionResults
      .map((r) => r.output)
      .filter(Boolean)
      .join("\n\n");

    return {
      success: true,
      message: outputSummary || plan.description,
      toolsUsed: executedTools,
      requiresApproval: false,
      plan,
      executionResults,
    };
  }
}
