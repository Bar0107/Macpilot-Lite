/**
 * Example: Open Calendar and Show This Week
 *
 * Run: npx tsx examples/calendar-this-week.ts
 *
 * Opens Calendar.app and navigates to the current week view.
 * This is a read-only action — executes immediately, no approval needed.
 */

import { LiteEngine } from "../src/lib/lite/engine";

async function main() {
  const engine = new LiteEngine();

  const result = await engine.run(
    "Open Calendar and show me this week"
  );

  console.log("Success:", result.success);
  console.log("Tools:", result.toolsUsed);
  console.log("\n" + result.message);
}

main().catch(console.error);
