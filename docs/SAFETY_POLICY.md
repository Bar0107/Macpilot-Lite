# Safety Policy — MacPilot Lite

## Principles

1. **Draft before send** — All external communications are created as drafts. No message is sent without explicit user approval.
2. **Approval gates are mandatory** — Medium and high-risk actions always pause for user review. This cannot be bypassed.
3. **Audit everything** — Every consequential action is logged.
4. **Explain before executing** — The agent always shows the plan before running it.
5. **Safe defaults** — Unknown action types are classified as medium risk (require approval).

## Risk Classification

### Low Risk — Automatic execution
Actions that are read-only or only affect the user's local data.

| Action | Examples |
|--------|----------|
| Summaries | Summarise a document, email, or thread |
| Draft creation | Create a draft (not send) |
| Information retrieval | Search memory, get schedule |
| System info | CPU, memory, disk, battery status |
| Open apps | Launch applications |

### Medium Risk — Requires approval
Actions that modify local state or create records.

| Action | Examples |
|--------|----------|
| File operations | Moving, renaming, organizing files |
| Calendar events | Create or update events |
| Draft emails | Create email drafts in Mail.app |

### High Risk — Requires approval + explicit warning
Irreversible actions or actions with external consequences.

| Action | Examples |
|--------|----------|
| Sending emails | Any external communication |
| Data deletion | Delete files, events, contacts |
| Bulk operations | Bulk send, bulk delete |

## What MacPilot Lite Will NEVER Do

- Send any email or message without explicit approval
- Delete any data without explicit approval
- Execute destructive system commands (`rm -rf`, `sudo rm`, `shutdown`, etc.)
- Run commands piped from the internet (`curl | bash`)
- Hide its plan or intentions from the user

## Blocked Commands

The following patterns are unconditionally blocked:

```
rm -rf /
mkfs
dd if=
shutdown
reboot
sudo rm
:(){ :|:& };:
curl | bash
curl | sh
```
