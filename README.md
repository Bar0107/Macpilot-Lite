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

> 처음 사용하는 분을 위한 단계별 가이드입니다.
> 개발 경험이 없어도 괜찮습니다. 순서대로 따라하세요.

MacPilot Lite는 macOS 전용입니다.

---

### Step 1. Node.js 설치

터미널을 열고 아래 명령어를 입력하세요:

```bash
node -v
```

`v18.x.x` 이상이 출력되면 이미 설치되어 있습니다. 건너뛰세요.

설치되어 있지 않다면:

- **방법 A (Homebrew):**
  ```bash
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  brew install node
  ```

- **방법 B (공식 설치파일):**
  https://nodejs.org 에서 LTS 버전을 다운로드하고 설치하세요.

### Step 2. 프로젝트 다운로드

```bash
git clone https://github.com/Bar0107/Macpilot-Lite.git
cd Macpilot-Lite
```

### Step 3. 의존성 설치

```bash
npm install
```

### Step 4. 환경 설정

```bash
cp .env.example .env.local
```

`.env.local` 파일을 열고 사용할 AI 프로바이더의 API 키를 입력하세요.
API 키가 없어도 기본 mock 모드로 동작합니다.

### Step 5. 예제 실행

```bash
# 시스템 상태 확인 (즉시 실행 — 안전한 읽기 전용 명령)
npm run example:calendar

# 다운로드 폴더 정리 (승인 게이트 — 실제로 파일을 이동하지 않음)
npm run example:organize

# 이메일 초안 작성 (승인 게이트 — 실제로 Mail.app을 열지 않음)
npm run example:email
```

승인이 필요한 명령을 실제로 실행하려면 `--approve` 플래그를 붙이세요:

```bash
npx tsx examples/organize-downloads.ts --approve
npx tsx examples/draft-email.ts --approve
```

### Step 6. macOS 권한 허용

Calendar.app이나 Mail.app을 제어하려면 Accessibility 권한이 필요합니다.
처음 실행하면 macOS가 권한을 요청합니다:

**System Settings → Privacy & Security → Accessibility** 에서 터미널 앱을 허용하세요.

---

# Part 2: Overview

> MacPilot Lite가 무엇이고, 어떤 일을 할 수 있는지 설명합니다.

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

> 아래부터는 개발자용 문서입니다.
> 아키텍처, 코드 구조, 확장 방법을 다룹니다.

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
