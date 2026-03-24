/**
 * MacPilot Lite — Interactive CLI
 *
 * Type natural language commands and watch your Mac execute them.
 * Type "quit" or "exit" to stop.
 */

import * as readline from "node:readline";
import { LiteEngine } from "./lib/lite/engine";

const engine = new LiteEngine();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("");
console.log("  MacPilot Lite");
console.log("  Control your Mac with natural language.");
console.log("");
console.log("  Try:");
console.log('    "What\'s my system status?"');
console.log('    "Open Calendar and show me this week"');
console.log('    "Organize my Downloads folder by file type"');
console.log('    "Draft an email to alex@example.com about the project"');
console.log("");
console.log("  Commands that modify files or send emails require approval.");
console.log('  Type "approve" after a blocked command to execute it.');
console.log('  Type "quit" to exit.');
console.log("");

let lastInput: string | null = null;

function prompt() {
  rl.question("macpilot> ", async (input) => {
    const trimmed = input.trim();

    if (!trimmed) {
      prompt();
      return;
    }

    if (trimmed === "quit" || trimmed === "exit") {
      console.log("Bye.");
      rl.close();
      process.exit(0);
    }

    // Handle "approve" — re-run last command with approval
    const isApprove = trimmed === "approve";
    const command = isApprove ? lastInput : trimmed;

    if (isApprove && !lastInput) {
      console.log("  Nothing to approve.\n");
      prompt();
      return;
    }

    try {
      const result = await engine.run(command!, isApprove);

      if (result.requiresApproval) {
        lastInput = command!;
        console.log("");
        console.log(`  Approval required: ${result.message}`);
        console.log(`  Tools: ${result.toolsUsed.join(", ")}`);
        console.log('  Type "approve" to execute, or enter a new command.');
        console.log("");
      } else if (result.success) {
        lastInput = null;
        console.log("");
        console.log(result.message.split("\n").map((l) => `  ${l}`).join("\n"));
        console.log("");
      } else {
        lastInput = null;
        console.log("");
        console.log(`  Error: ${result.message}`);
        console.log("");
      }
    } catch (e) {
      console.log(`  Error: ${(e as Error).message}\n`);
    }

    prompt();
  });
}

prompt();
