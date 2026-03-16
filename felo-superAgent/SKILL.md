---
name: felo-superAgent
description: "Felo SuperAgent API: AI conversation with real-time SSE streaming and LiveDoc. Use when users want SuperAgent chat, continuous conversation, or LiveDoc-backed answers. Explicit commands: /felo-superagent."
---

# Felo SuperAgent Skill

## When to Use

Trigger this skill when users want:

- **SuperAgent conversation:** AI conversation with Felo SuperAgent, with real-time streaming output
- **LiveDoc association:** Each session corresponds to a LiveDoc for subsequent resource viewing and knowledge accumulation
- **Continuous conversation:** Continue asking questions on an existing LiveDoc (pass `live_doc_short_id`)
- **Multi-turn conversation:** Follow-up questions in an existing thread (pass `thread_short_id`)
- **Tool-augmented answers:** Responses that may include image generation, document creation, PPT generation, or Twitter/X search
- **Streaming responses:** Real-time answer generation with Server-Sent Events (SSE)

**Trigger words:**

- English: superagent, super agent, stream chat, streaming conversation, livedoc conversation, continuous chat, follow-up question
- 简体中文: 超级助手、流式对话、连续对话、追问、LiveDoc对话
- 繁體中文: 超級助手、流式對話、連續對話、追問、LiveDoc對話
- 日本語: スーパーエージェント、ストリーミング会話、継続会話、フォローアップ

**Explicit commands:** `/felo-superagent`, "use felo superagent", "felo superagent"

**Do NOT use for:**

- Simple one-off Q&A or real-time information queries (prefer `felo-search`)
- Web page content fetching only (use `felo-web-fetch`)
- PPT/slide generation only (use `felo-slides`)
- LiveDoc knowledge base management (use `felo-livedoc`)
- Twitter/X search only (use `felo-x-search`)

## Setup

### 1. Get Your API Key

1. Visit [felo.ai](https://felo.ai) and log in (or register)
2. Click your avatar in the top right corner → Settings
3. Navigate to the "API Keys" tab
4. Click "Create New Key" to generate a new API Key
5. Copy and save your API Key securely

### 2. Configure API Key

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

For permanent configuration, add it to your shell profile (~/.bashrc, ~/.zshrc) or system environment variables.

## How to Execute

When this skill is triggered, execute the SuperAgent script using the Bash tool.

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

**New conversation:**
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "USER_QUERY_HERE" \
  --timeout 60
```

**Continue on existing LiveDoc:**
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "USER_QUERY_HERE" \
  --live-doc-id "PvyKouzJirXjFdst4uKRK3" \
  --timeout 60
```

**Follow-up in existing thread:**
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "USER_QUERY_HERE" \
  --thread-id "TvyKouzJirXjFdst4uKRK3" \
  --timeout 60
```

### Available Options

**Core parameters:**
- `--query <text>` (required) — User question, 1-2000 characters
- `--thread-id <id>` — Existing thread ID for follow-up conversations
- `--live-doc-id <id>` — Reuse existing LiveDoc short_id for continuous conversation
- `--timeout <seconds>` — Request/stream timeout, default 60 seconds

**Advanced parameters (new conversations only):**
- `--skill-id <id>` — Skill ID to use for this conversation
- `--selected-resource-ids <ids>` — Comma-separated resource IDs to include
- `--ext <json>` — Extra parameters as JSON object

**Output control:**
- `--json` / `-j` — Output JSON format with full metadata
- `--verbose` / `-v` — Log stream connection details to stderr
- `--accept-language <lang>` — Language preference (e.g., zh, en, ja)

**Note:** When using `--thread-id` for follow-up, the `--skill-id`, `--selected-resource-ids`, and `--ext` parameters are ignored.

### Complete Examples

**Example 1: Simple question**
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "What is the latest news about AI?" \
  --accept-language en \
  --timeout 90
```

**Example 2: Continue conversation on LiveDoc**
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "Tell me more about the applications" \
  --live-doc-id "PvyKouzJirXjFdst4uKRK3" \
  --accept-language en
```

**Example 3: Follow-up question in thread**
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "Can you elaborate on that?" \
  --thread-id "TvyKouzJirXjFdst4uKRK3"
```

**Example 4: With JSON output for metadata**
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "Explain quantum computing" \
  --accept-language en \
  --json
```

### Step 3: Parse and Present

**Default output (plain text):**
- Script prints the full answer text (from SSE `message` events) to stdout
- Tool results (images, documents, tweets) are printed inline during streaming
- Status messages appear on stderr

**JSON output (`--json`):**
Script prints one JSON object with complete metadata:
```json
{
  "status": "ok",
  "data": {
    "answer": "complete answer text",
    "thread_short_id": "TvyKouzJirXjFdst4uKRK3",
    "live_doc_short_id": "PvyKouzJirXjFdst4uKRK3",
    "live_doc_url": "https://felo.ai/zh-Hans/livedoc/...",
    "image_urls": [{"url": "...", "title": "..."}],
    "discoveries": [{"title": "Research Report"}],
    "documents": [{"title": "Generated Document"}],
    "ppts": [{"title": "Presentation"}],
    "htmls": [{"title": "HTML Page"}],
    "search_x": [{"tweets": [...]}]
  }
}
```

Present to the user in this format:

```markdown
## SuperAgent Answer

[Full answer text from stream]

## Generated Resources (if any)

- Images: [list image titles and URLs]
- Documents: [list document titles]
- Presentations: [list PPT titles]
- Twitter Results: [summarize tweets]

## Metadata

- Thread ID: <thread_short_id>
- LiveDoc ID: <live_doc_short_id>
- LiveDoc URL: <live_doc_url>
```

If the user asked for conversation detail or LiveDoc resources, you can use the `thread_short_id` / `live_doc_short_id` with other Felo skills (e.g., `felo-livedoc`).

## API Workflow (Reference)

The script handles this workflow automatically:

1. **Create conversation:**
   - New: `POST /v2/conversations`
   - Follow-up: `POST /v2/conversations/{threadId}/follow_up`
   - Returns: `stream_key`, `thread_short_id`, `live_doc_short_id`

2. **Consume SSE stream:**
   - `GET /v2/conversations/stream/{stream_key}`
   - Supports offset parameter for resuming: `?offset={lastOffset}`
   - Reconnects automatically if connection drops (2-second delay)

3. **Parse events:**
   - `message` — Direct text content
   - `stream` — Wrapped content with type information
   - `heartbeat` — Keep-alive signal
   - `done` / `completed` / `complete` — Stream finished
   - `error` — Error event (non-terminal, continues reading)

4. **Extract tool results:**
   - Image generation (`generate_images`)
   - Research reports (`generate_discovery`)
   - Document generation (`generate_document`)
   - PPT generation (`generate_ppt`)
   - HTML generation (`generate_html`)
   - Twitter/X search (`search_x`)

Base URL: `https://openapi.felo.ai` (override with `FELO_API_BASE` if needed).

## Tool Support

SuperAgent may invoke tools during conversation. The script automatically extracts and displays:

**Image Generation:**
- Tool: `generate_images`
- Output: Image URLs and titles

**Research & Discovery:**
- Tool: `generate_discovery`
- Output: Research report titles and status

**Document Generation:**
- Tool: `generate_document`
- Output: Document titles and status

**Presentation Generation:**
- Tool: `generate_ppt`
- Output: PPT titles and status

**HTML Generation:**
- Tool: `generate_html`
- Output: HTML page titles and status

**Twitter/X Search:**
- Tool: `search_x`
- Output: Tweet content, author info, metrics (likes, retweets, views)

## Error Handling

### Common Error Codes

| Code                                   | HTTP | Description                                      |
| -------------------------------------- | ---- | -------------------------------------------- |
| INVALID_API_KEY                        | 401  | API Key is invalid or has been revoked        |
| SUPER_AGENT_CONVERSATION_CREATE_FAILED | 502  | Failed to create conversation (upstream error)|
| SUPER_AGENT_CONVERSATION_QUERY_FAILED  | 502  | Failed to query conversation details          |

### SSE Stream Errors

The stream may send:
- `event: error` with `data: {"message": "..."}` — treat as failure and show message
- Connection timeout — script automatically reconnects with 2-second delay
- Idle timeout (2 hours) — stream aborted if no data received

### Missing API Key

If `FELO_API_KEY` is not set, display this message:

```
ERROR: FELO_API_KEY not set

To use this skill, you need to set up your Felo API Key:

1. Get your API key from https://felo.ai (Settings → API Keys)
2. Set the environment variable:

   Linux/macOS:
   export FELO_API_KEY="your-api-key-here"

   Windows (PowerShell):
   $env:FELO_API_KEY="your-api-key-here"

3. Restart Claude Code or reload the environment
```

### Timeout Handling

- Default timeout: 60 seconds
- Idle timeout: 2 hours (no data received)
- Increase timeout for complex queries: `--timeout 120`
- Script shows elapsed time during streaming

## Important Notes

- Execute this skill when the user clearly wants SuperAgent / streaming conversation / LiveDoc capabilities
- After create, the script connects to the stream **immediately** — the `stream_key` has a limited validity period
- Use the bundled Node script to consume SSE; do not assume `jq` or other tools for parsing SSE
- Same API key as other Felo skills (`FELO_API_KEY`)
- The script handles reconnection automatically if the stream drops
- Tool results are deduplicated to avoid showing the same resource multiple times
- Execute immediately using the Bash tool — don't just describe what you would do
- Always save `thread_short_id` and `live_doc_short_id` for potential follow-up questions
- Multi-language support: Fully supports Simplified Chinese, Traditional Chinese, Japanese, and English
- The API returns results in the same language as the query when possible

## Conversation Continuity

**Three modes of conversation:**

1. **New conversation:** No IDs provided — creates fresh thread and LiveDoc
2. **LiveDoc continuation:** Provide `--live-doc-id` — new thread, same knowledge base
3. **Thread follow-up:** Provide `--thread-id` — continue exact conversation

**When to use each mode:**
- Use **new conversation** for unrelated questions
- Use **LiveDoc continuation** to build knowledge on a topic across multiple threads
- Use **thread follow-up** for clarifying questions or continuing the exact same discussion

## References

- [SuperAgent API (Felo Open Platform)](https://openapi.felo.ai/docs/api-reference/v2/superagent.html)
- [Felo Open Platform](https://openapi.felo.ai/docs/)
- [Get API Key](https://felo.ai) (Settings → API Keys)
