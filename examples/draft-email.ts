/**
 * Example: Draft an Email
 *
 * Run: npx tsx examples/draft-email.ts
 *
 * Creates a draft email in Mail.app with pre-filled content.
 * The email is NOT sent — it opens as a draft for your review.
 *
 * This is a write action — requires approval.
 * Pass --approve flag to actually execute.
 */

import { LiteEngine } from "../src/lib/lite/engine";

async function main() {
  const engine = new LiteEngine();
  const approved = process.argv.includes("--approve");

  const result = await engine.run(
    "Draft an email to alex@example.com — subject: Project Update, " +
    "body: quick status update about the launch timeline",
    approved
  );

  console.log("Success:", result.success);
  console.log("Tools:", result.toolsUsed);

  if (result.requiresApproval) {
    console.log("\nApproval required. Run with --approve to execute:");
    console.log("  npx tsx examples/draft-email.ts --approve");
  } else {
    console.log("\n" + result.message);
  }
}

main().catch(console.error);
