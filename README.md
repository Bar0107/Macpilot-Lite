# MacPilot Lite

![macOS](https://img.shields.io/badge/macOS-Ventura+-black)
![Local First](https://img.shields.io/badge/local--first-yes-green)
![License](https://img.shields.io/badge/license-MIT-blue)

**Control your Mac with natural language.**
Open apps, draft emails, organize files, and automate workflows — locally.
A local-first AI operator for macOS.

Most AI agents run in the cloud. MacPilot runs on your machine.

- Runs entirely on your Mac.
- No remote execution.
- No file uploads.
- No telemetry.

---

# Part 1: Getting Started

> A step-by-step guide for first-time users.
> No coding experience required. Just follow the steps.

MacPilot Lite is macOS only.

---

### Step 1. Install Node.js

Open Terminal and run:

```bash
node -v
```

If you see `v18.x.x` or higher, you're good. Skip to Step 2.

If not installed:

- **Option A (Homebrew):**
  ```bash
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  brew install node
  ```

- **Option B (Official installer):**
  Download the LTS version from https://nodejs.org and install it.

### Step 2. Download the project

```bash
git clone https://github.com/Bar0107/Macpilot-Lite.git
cd Macpilot-Lite
```

### Step 3. Install dependencies

```bash
npm install
```

### Step 4. Configure environment

```bash
cp .env.example .env.local
```

Open `.env.local` and add your AI provider API key.
No API key? No problem — it runs in mock mode by default.

### Step 5. Run examples

```bash
# Open Calendar in week view (runs immediately — safe, read-only)
npm run example:calendar

# Organize Downloads folder (approval gate — won't move files without approval)
npm run example:organize

# Draft an email (approval gate — won't open Mail.app without approval)
npm run example:email
```

To actually execute actions that require approval, add the `--approve` flag:

```bash
npx tsx examples/organize-downloads.ts --approve
npx tsx examples/draft-email.ts --approve
```

### Step 6. Grant macOS permissions

To control Calendar.app or Mail.app, MacPilot needs Accessibility access.
macOS will prompt you on first run:

**System Settings → Privacy & Security → Accessibility** — enable your Terminal app.

---

# Part 2: Overview

> What MacPilot Lite is and what it can do.

---

## What You Can Do

```
"Draft an email to Sarah about tomorrow's meeting"
→ Opens Mail.app with a ready-to-send draft

"Organize my Downloads folder by file type"
→ Creates folders, moves files, reports what changed

"What's my system status?"
→ CPU, memory, disk, battery — instant summary

"Open Calendar and show me this week"
→ Launches Calendar.app, navigates to current week
```

MacPilot started as an experiment: what if your Mac could execute intent, not clicks?

---

# Part 3: For Developers

> Architecture, code structure, and how to extend MacPilot Lite.

---

## Developer Commands

### Requirements

- macOS 13+ (Ventura or later)
- Node.js 18+

```bash
npm run typecheck         # Type-check
npm run build             # Compile to dist/
npm run example:organize  # Run organize example
npm run example:email     # Run email example
npm run example:calendar  # Run calendar example
```

---

## Architecture

```
You (chat) → Lite Engine → Tool Registry → Executor → macOS
                ↓
         Approval Gate
       (dangerous actions
        require confirmation)
```

MacPilot Lite uses a simplified execution pipeline:

1. **You type** a natural language command
2. **Lite Planner** determines intent and selects tools
3. **Approval Policy** checks if the action is safe to auto-execute
4. **Executor** runs the action via AppleScript, shell commands, or in-app logic
5. **You see** the result in chat

### Supported Providers

| Provider | Model | Local? |
|----------|-------|--------|
| Anthropic | Claude 3.5+ | No |
| OpenAI | GPT-4+ | No |
| Ollama | Llama, Mistral, etc. | Yes |

Switch providers without changing your workflows.

---

## Project Structure

```
macpilot-lite/
├── src/
│   └── lib/
│       └── lite/               # Lite engine (simplified runtime)
│           ├── engine.ts       # 1-2 step orchestrator
│           ├── planner.ts      # Rule-based intent → action
│           └── tool-registry.ts# Tool definitions & registry
│
├── examples/                   # Ready-to-run demo workflows
│   ├── organize-downloads.ts
│   ├── draft-email.ts
│   └── calendar-this-week.ts
│
├── docs/                       # Safety docs
│   └── SAFETY_POLICY.md
│
├── .env.example
├── LICENSE
├── package.json
└── tsconfig.json
```

---

## Examples

### Organize Downloads

```typescript
// examples/organize-downloads.ts
import { LiteEngine } from '../src/lib/lite/engine'

const engine = new LiteEngine()
const result = await engine.run(
  "Organize my Downloads folder — group files by type into subfolders"
)
// → Creates Images/, Documents/, Archives/, etc.
// → Moves files accordingly
// → Returns summary of changes
```

### Draft an Email

```typescript
// examples/draft-email.ts
const result = await engine.run(
  "Draft an email to alex@example.com — subject: Project Update, " +
  "body: quick status update about the launch timeline"
)
// → Opens Mail.app with pre-filled draft
// → Waits for your review before sending
```

### Open Calendar

```typescript
// examples/calendar-this-week.ts
const result = await engine.run("Open Calendar and show me this week")
// → Opens Calendar.app
// → Navigates to current week view
```

---

## Safety

MacPilot Lite includes a basic approval system:

- **Auto-execute**: Read-only actions (system info, listing files)
- **Require approval**: Write actions (moving files, sending emails, deleting anything)
- **Blocked**: Destructive system commands, sudo operations

See [docs/SAFETY_POLICY.md](./docs/SAFETY_POLICY.md) for details.

---

## What's Included vs. What's Not

MacPilot Lite is a fully functional macOS agent, intentionally simplified for transparency and hackability.

### Included in Lite

- Natural language → macOS action pipeline
- Multi-provider LLM support (Anthropic, OpenAI, Ollama)
- AppleScript & shell command execution
- Basic approval gate for dangerous actions
- Session-scoped memory
- 3 demo workflows out of the box

### Not Included

These capabilities exist in the full version but are not part of this repo:

- **Multi-step planning** — advanced task decomposition across 5+ steps
- **Risk-tier execution policy** — T0–T3 graduated safety controls
- **Persistent memory** — cross-session user preference learning
- **Rollback engine** — undo and state recovery for failed actions
- **Verification layer** — post-execution result validation
- **Calendar & communications integration** — deep Mail/Calendar orchestration

MacPilot Lite is designed for experimentation and extension.
MacPilot Pro is designed for daily autonomous workflows.

> **Interested in the full runtime?**
> MacPilot Pro includes production-grade planning, safety, and memory systems built for daily use. [Get in touch →](mailto:you@example.com)

---

## Extending MacPilot Lite

### Add a Custom Tool

```typescript
// src/lib/lite/tool-registry.ts
toolRegistry.register({
  id: 'spotify_play',
  name: 'Play on Spotify',
  description: 'Play a song or playlist on Spotify',
  parameters: {
    query: { type: 'string', description: 'Song or playlist name' }
  },
  executor: 'applescript',
  risk: 'low',
  template: (params) =>
    `tell application "Spotify" to play track "${params.query}"`
})
```

---

## Contributing

Contributions welcome! Priority areas:

- New tool definitions (macOS app integrations)
- AppleScript templates
- Bug fixes and edge case handling
- Documentation improvements

---

## License

MIT — see [LICENSE](./LICENSE) for details.

---

**Built with** TypeScript and a love for making Macs do things faster.
