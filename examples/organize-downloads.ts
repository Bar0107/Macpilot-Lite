/**
 * Example: Organize Downloads Folder
 *
 * Run: npx tsx examples/organize-downloads.ts
 *
 * Groups files in ~/Downloads by type into subfolders
 * (Images/, Documents/, Archives/, Videos/, Other/).
 *
 * This is a write action — requires approval.
 * Pass --approve flag to actually execute.
 */

import { LiteEngine } from "../src/lib/lite/engine";

async function main() {
  const engine = new LiteEngine();
  const approved = process.argv.includes("--approve");

  const result = await engine.run(
    "Organize my Downloads folder by file type",
    approved
  );

  console.log("Success:", result.success);
  console.log("Tools:", result.toolsUsed);

  if (result.requiresApproval) {
    console.log("\nApproval required. Run with --approve to execute:");
    console.log("  npx tsx examples/organize-downloads.ts --approve");
  } else {
    console.log("\n" + result.message);
  }
}

main().catch(console.error);
