---
name: felo-superAgent
description: "Felo SuperAgent API: AI conversation with real-time SSE streaming and LiveDoc. Use when users want SuperAgent chat, continuous conversation, or LiveDoc-backed answers. Explicit commands: /felo-superagent."
---

# Felo SuperAgent Skill

## When to Use

Trigger this skill for:

- **SuperAgent 对话**：需要与 Felo SuperAgent 进行 AI 对话、流式输出
- **LiveDoc 关联**：每次会话对应一个 LiveDoc，可后续查看资源
- **连续对话**：在已有 LiveDoc 上继续提问（传入 `live_doc_short_id`）
- **多轮对话**：需要 thread_short_id / live_doc_short_id 以便后续查询会话详情

**Trigger words / 触发词：**

- 简体中文：SuperAgent、超级助手、流式对话、LiveDoc、连续对话
- English: superagent, super agent, stream chat, livedoc, conversation
- **Explicit commands:** `/felo-superagent`, "use felo superagent", "felo superagent"

**Do NOT use for:**

- 简单单次问答、实时信息查询（优先用 `felo-search`）
- 仅需抓取网页内容（用 `felo-web-fetch`）
- 仅需生成 PPT（用 `felo-slides`）
- 需要 LiveDoc 知识库功能（用 `felo-livedoc`）

## Setup

### 1. Get API Key

1. Visit [felo.ai](https://felo.ai) and log in (or register)
2. Click your avatar (top right) → **Settings**
3. Open **API Keys** tab → Create and copy your API key

### 2. Configure

Set the `FELO_API_KEY` environment variable:

**Linux/macOS:**

```bash
export FELO_API_KEY="your-api-key-here"
```

**Windows (PowerShell):**

```powershell
$env:FELO_API_KEY="your-api-key-here"
```

**Windows (CMD):**

```cmd
set FELO_API_KEY=your-api-key-here
```

## How to Execute

Use the Bash tool and follow this workflow.

### Step 1: Check API Key

```bash
if [ -z "$FELO_API_KEY" ]; then
  echo "ERROR: FELO_API_KEY not set"
  exit 1
fi
```

If not set, stop and show the user the setup instructions above.

### Step 2: Run Node Script

From the project root (or ensure script path is correct):

```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "USER_QUERY_HERE" \
  --timeout 60
```

Optional:

- **Language:** `--accept-language zh` or `--accept-language en`
- **Reuse LiveDoc (连续对话):** `--live-doc-id "PvyKouzJirXjFdst4uKRK3"`
- **JSON output:** `--json` (includes thread_short_id, live_doc_short_id, full answer)
- **Verbose:** `--verbose` (logs stream connection to stderr)

Example with options:

```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "What is the latest news about AI?" \
  --accept-language en \
  --timeout 90 \
  --json
```

### Step 3: Parse and Present

- **Default:** script prints the full answer text (from SSE `message` events) to stdout.
- **With `--json`:** script prints one JSON object with `answer`, `thread_short_id`, `live_doc_short_id`, etc.

Present to the user in this format:

```markdown
## SuperAgent Answer

[Full answer text from stream]

## Metadata (optional, when using --json)

- Thread ID: <thread_short_id>
- LiveDoc ID: <live_doc_short_id>
```

If the user asked for conversation detail or LiveDoc resources, you can call the REST APIs (see API Reference below) with `thread_short_id` / `live_doc_short_id`.

## API Workflow (Reference)

1. **POST** `/v2/conversations` → get `stream_key`, `thread_short_id`, `live_doc_short_id`
2. **GET** `/v2/conversations/stream/{stream_key}` → consume SSE until `done` or `error`
3. Optionally: **GET** `/v2/conversations/{thread_short_id}` → conversation detail

Base URL: `https://openapi.felo.ai` (override with `FELO_API_BASE` if needed).

## Error Handling

| Code                                   | HTTP | Description              |
| -------------------------------------- | ---- | ------------------------ |
| INVALID_API_KEY                        | 401  | API Key 无效或已撤销     |
| SUPER_AGENT_CONVERSATION_CREATE_FAILED | 502  | 创建会话失败（下游错误） |
| SUPER_AGENT_CONVERSATION_QUERY_FAILED  | 502  | 查询会话详情失败         |

SSE stream may send:

- `event: error` with `data: {"message": "..."}` — treat as failure and show message.

If `FELO_API_KEY` is not set, show:

```
❌ Felo API Key 未配置

请设置环境变量 FELO_API_KEY：
1. 在 https://felo.ai 获取 API Key（Settings → API Keys）
2. 设置后重启 Claude Code 或重新加载环境
```

## Important Notes

- Execute this skill when the user clearly wants SuperAgent / 流式对话 / LiveDoc 能力。
- After create, connect to the stream **immediately** — `stream_key` 有效期有限。
- Use the bundled Node script to consume SSE; do not assume `jq` or other tools for parsing SSE.
- Same API key as other Felo skills (`FELO_API_KEY`).

## References

- [SuperAgent API (Felo Open Platform)](https://openapi.felo.ai/docs/api-reference/v2/superagent.html)
- [Felo Open Platform](https://openapi.felo.ai/docs/)
