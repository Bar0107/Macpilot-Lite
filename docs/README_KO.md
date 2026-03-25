# MacPilot Lite

![macOS](https://img.shields.io/badge/macOS-Ventura+-black)
![Local First](https://img.shields.io/badge/local--first-yes-green)
![License](https://img.shields.io/badge/license-MIT-blue)

**자연어로 맥을 제어하세요.**
앱 열기, 이메일 초안 작성, 파일 정리, 워크플로우 자동화 — 전부 로컬에서.
macOS 전용 로컬 AI 오퍼레이터.

대부분의 AI 에이전트는 클라우드에서 실행됩니다. MacPilot은 당신의 맥에서 실행됩니다.

- 맥에서만 실행됩니다.
- 원격 실행 없음.
- 파일 업로드 없음.
- 텔레메트리 없음.

---

# Part 1: 시작하기

> 처음 사용하는 분을 위한 단계별 가이드입니다.
> 개발 경험이 없어도 괜찮습니다. 순서대로 따라하세요.

MacPilot Lite는 macOS 전용입니다.

---

### Step 1. Node.js 설치

터미널을 열고 아래 명령어를 입력하세요:

```bash
node -v
```

`v18.x.x` 이상이 출력되면 이미 설치되어 있습니다. Step 2로 넘어가세요.

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

먼저 설정 파일을 복사하세요:

```bash
cp .env.example .env.local
```

이제 `.env.local` 파일을 편집해야 합니다. 아래 명령어로 여세요:

```bash
nano .env.local
```

터미널 안에서 간단한 텍스트 편집기가 열립니다. 아래 옵션 중 **하나를 골라서** 해당 줄을 수정하세요:

---

**옵션 A: Anthropic (추천)**

이 두 줄을 수정하세요:
```
AI_PROVIDER="anthropic"
ANTHROPIC_API_KEY="여기에-키를-붙여넣기"
```
키 발급: https://console.anthropic.com/settings/keys

---

**옵션 B: OpenAI**

이 두 줄을 수정하세요:
```
AI_PROVIDER="openai"
OPENAI_API_KEY="여기에-키를-붙여넣기"
```
키 발급: https://platform.openai.com/api-keys

---

**옵션 C: Ollama (무료, 맥에서 로컬 실행)**

1. https://ollama.com 에서 Ollama를 다운로드하고 설치하세요
2. **새 터미널 창**을 열고 아래 명령어를 실행하세요:
   ```bash
   ollama serve
   ```
3. 그 창은 열어두세요. 원래 터미널 창으로 돌아가세요.
4. `.env.local`에서 이 줄을 수정하세요:
   ```
   AI_PROVIDER="ollama"
   ```

---

**옵션 D: 설정 없이 바로 사용 (기본값)**

아무것도 수정하지 않으면 mock 모드로 실행됩니다. API 키 불필요. 다만 아래 5개 명령만 인식합니다:
- 시스템 상태 확인
- 앱 열기
- 캘린더 열기 (주간 보기)
- 다운로드 폴더 정리
- 이메일 초안 작성

---

편집이 끝나면 파일을 저장하세요:
- `Ctrl + O` 누르고 `Enter` → 저장
- `Ctrl + X` → 편집기 종료

**중요:** MacPilot Lite는 **영어 명령만** 지원합니다. 한국어는 인식되지 않습니다.

### Step 5. MacPilot Lite 실행

Step 2에서 이미 `Macpilot-Lite` 폴더 안에 있어야 합니다. 실행:

```bash
npm run dev
```

터미널에 인터랙티브 CLI가 열립니다:

```
  MacPilot Lite
  Control your Mac with natural language.

macpilot> _
```

아무 명령어나 영어로 입력하고 Enter를 누르세요. 실제 세션 예시:

```
macpilot> What's my system status?

  CPU: Apple M4
  CPU Usage: 12.3%
  Memory: 24.0 GB total
  Disk: 227Gi available of 460Gi
  Battery: 100% (charging)

macpilot> Open Calendar and show me this week

  Opened Calendar
  Calendar opened in week view

macpilot> Organize my Downloads folder by file type

  Approval required: Organize Downloads folder by file type
  Tools: fs_list, fs_move
  Type "approve" to execute, or enter a new command.

macpilot> approve

  Organized 34 files:
    photo.png -> Images/
    report.pdf -> Documents/
    backup.zip -> Archives/
    ...

macpilot> quit
  Bye.
```

**주요 명령:**
- 자연어 명령을 입력하면 실행됩니다
- `approve` — 파일 수정이나 이메일 전송 같은 작업을 승인합니다
- `quit` — 종료합니다

### Step 6. macOS 권한 허용

Calendar.app이나 Mail.app을 제어하려면 Accessibility 권한이 필요합니다.
처음 실행하면 macOS가 권한을 요청합니다:

**시스템 설정 → 개인정보 보호 및 보안 → 손쉬운 사용** 에서 터미널 앱을 허용하세요.

---

# Part 2: 개요

> MacPilot Lite가 무엇이고, 어떤 일을 할 수 있는지 설명합니다.

---

## 이런 걸 할 수 있습니다

```
"Draft an email to Sarah about tomorrow's meeting"
→ Mail.app에서 바로 보낼 수 있는 초안을 엽니다

"Organize my Downloads folder by file type"
→ 폴더를 만들고, 파일을 이동하고, 변경 내용을 보고합니다

"What's my system status?"
→ CPU, 메모리, 디스크, 배터리 — 즉시 요약

"Open Calendar and show me this week"
→ Calendar.app을 열고, 이번 주 보기로 이동합니다
```

MacPilot은 실험에서 시작했습니다: 맥이 클릭이 아니라 의도를 실행할 수 있다면?

---

# Part 3: 개발자용

> 아키텍처, 코드 구조, 확장 방법을 다룹니다.

---

## 개발자 명령어

### 요구사항

- macOS 13+ (Ventura 이상)
- Node.js 18+

```bash
npm run typecheck         # 타입 체크
npm run build             # dist/로 컴파일
npm run example:organize  # 다운로드 정리 예제
npm run example:email     # 이메일 초안 예제
npm run example:calendar  # 캘린더 예제
```

---

## 아키텍처

```
사용자 (채팅) → Lite Engine → Tool Registry → Executor → macOS
                   ↓
            Approval Gate
          (위험한 작업은
           승인 필요)
```

MacPilot Lite의 실행 파이프라인:

1. **사용자가 입력** — 자연어 명령
2. **Lite Planner** — 의도를 파악하고 도구를 선택
3. **Approval Policy** — 자동 실행 가능 여부 확인
4. **Executor** — AppleScript, 셸 명령, 인앱 로직으로 실행
5. **결과 표시** — 채팅에 결과 출력

### 지원 프로바이더

| 프로바이더 | 모델 | 로컬? |
|-----------|------|-------|
| Anthropic | Claude 3.5+ | 아니오 |
| OpenAI | GPT-4+ | 아니오 |
| Ollama | Llama, Mistral 등 | 예 |

프로바이더를 바꿔도 워크플로우는 그대로 동작합니다.

---

## 프로젝트 구조

```
macpilot-lite/
├── src/
│   ├── cli.ts                 # 인터랙티브 CLI
│   ├── index.ts               # 라이브러리 진입점
│   └── lib/
│       └── lite/
│           ├── engine.ts      # 1-2 단계 오케스트레이터
│           ├── executor.ts    # macOS 실행 디스패처
│           ├── planner.ts     # 규칙 기반 의도 → 액션
│           └── tool-registry.ts # 도구 정의 및 레지스트리
│
├── examples/                  # 바로 실행 가능한 데모
│   ├── organize-downloads.ts
│   ├── draft-email.ts
│   └── calendar-this-week.ts
│
├── docs/                      # 문서
│   ├── SAFETY_POLICY.md
│   └── README_KO.md           # 한국어 README
│
├── .env.example
├── LICENSE
├── package.json
└── tsconfig.json
```

---

## 코드 예제

### 다운로드 폴더 정리

```typescript
// examples/organize-downloads.ts
import { LiteEngine } from '../src/lib/lite/engine'

const engine = new LiteEngine()
const result = await engine.run(
  "Organize my Downloads folder — group files by type into subfolders"
)
// → Images/, Documents/, Archives/ 등 생성
// → 파일을 해당 폴더로 이동
// → 변경 요약 반환
```

### 이메일 초안 작성

```typescript
// examples/draft-email.ts
const result = await engine.run(
  "Draft an email to alex@example.com — subject: Project Update, " +
  "body: quick status update about the launch timeline"
)
// → Mail.app에서 초안 열림
// → 보내기 전 검토 대기
```

### 캘린더 열기

```typescript
// examples/calendar-this-week.ts
const result = await engine.run("Open Calendar and show me this week")
// → Calendar.app 열림
// → 이번 주 보기로 이동
```

---

## 안전 정책

MacPilot Lite에는 기본 승인 시스템이 포함되어 있습니다:

- **즉시 실행**: 읽기 전용 작업 (시스템 정보, 파일 목록)
- **승인 필요**: 쓰기 작업 (파일 이동, 이메일 전송, 삭제)
- **차단**: 파괴적인 시스템 명령, sudo 작업

자세한 내용은 [docs/SAFETY_POLICY.md](./SAFETY_POLICY.md)를 참고하세요.

---

## Lite에 포함된 것 vs. 포함되지 않은 것

MacPilot Lite는 투명성과 확장성을 위해 의도적으로 단순화된 macOS 에이전트입니다.

### Lite에 포함

- 자연어 → macOS 액션 파이프라인
- 멀티 프로바이더 LLM 지원 (Anthropic, OpenAI, Ollama)
- AppleScript 및 셸 명령 실행
- 위험한 작업을 위한 기본 승인 게이트
- 세션 범위 메모리
- 3개의 데모 워크플로우

### 포함되지 않음

다음 기능은 전체 버전에 있지만 이 저장소에는 포함되지 않습니다:

- **멀티스텝 계획** — 5단계 이상의 고급 작업 분해
- **리스크 티어 실행 정책** — T0–T3 단계별 안전 제어
- **영구 메모리** — 세션 간 사용자 선호 학습
- **롤백 엔진** — 실패한 작업의 실행 취소 및 상태 복구
- **검증 레이어** — 실행 후 결과 검증
- **캘린더 및 커뮤니케이션 통합** — Mail/Calendar 심층 연동

MacPilot Lite는 실험과 확장을 위해 설계되었습니다.
MacPilot Pro는 일상적인 자율 워크플로우를 위해 설계되었습니다.

> **전체 런타임에 관심이 있으신가요?**
> MacPilot Pro는 프로덕션급 계획, 안전, 메모리 시스템을 포함합니다. [문의하기 →](mailto:you@example.com)

---

## MacPilot Lite 확장하기

### 커스텀 도구 추가

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

## 기여하기

기여를 환영합니다! 우선 영역:

- 새로운 도구 정의 (macOS 앱 연동)
- AppleScript 템플릿
- 버그 수정 및 예외 처리
- 문서 개선

---

## 라이선스

MIT — 자세한 내용은 [LICENSE](../LICENSE)를 참고하세요.

---

**TypeScript와 맥을 더 빠르게 만들고 싶은 마음으로 만들었습니다.**
