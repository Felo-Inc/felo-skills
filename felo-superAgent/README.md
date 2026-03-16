# Felo SuperAgent Skill for Claude Code

**AI conversation with real-time streaming output, supporting continuous conversation.**

Use the Felo Open Platform SuperAgent API in Claude Code to initiate conversations with SuperAgent, receive real-time SSE streaming responses, and query conversation details.

---

## Features

- **Streaming conversation**: Create a conversation and receive AI responses in real-time via SSE
- **LiveDoc association**: Each conversation corresponds to a LiveDoc for subsequent resource viewing
- **Continuous conversation**: Continue asking questions in an existing conversation using `--thread-id`
- **LiveDoc management**: List LiveDocs and view resources within a specific LiveDoc
- **Multi-language**: Supports `accept_language` (e.g., zh, en, ja, ko)
- **Tool invocation**: Supports image generation, research reports, documents, PPT, HTML, Twitter search, and more

**Use cases:**

- Need SuperAgent streaming answers
- Need conversation associated with LiveDoc for traceable resources
- Multi-turn/continuous conversation (reuse the same LiveDoc)

**Not suitable for:**

- Simple one-off real-time information retrieval → use `felo-search`
- Only need to fetch webpage content → use `felo-web-fetch`
- Only need to generate PPT → use `felo-slides`
- Need LiveDoc knowledge base features → use `felo-livedoc`

---

## Quick Start

### 1. Installation

**One-click install (recommended):**

```bash
npx skills add Felo-Inc/felo-skills --skill felo-superAgent
```

**Manual install:** If the above command is unavailable, copy from this repository to Claude Code's skills directory:

```bash
# Linux/macOS
cp -r felo-superAgent ~/.claude/skills/

# Windows (PowerShell)
Copy-Item -Recurse felo-superAgent "$env:USERPROFILE\.claude\skills\"
```

(If using a local skill, ensure Cursor/Claude Code has configured the skill path.)

### 2. Configure API Key

Same as other Felo skills, use the same API Key:

1. Open [felo.ai](https://felo.ai) and log in
2. Avatar → **Settings** → **API Keys** → Create and copy Key
3. Set environment variable:

```bash
# Linux/macOS
export FELO_API_KEY="your-api-key-here"

# Windows PowerShell
$env:FELO_API_KEY="your-api-key-here"
```

For permanent configuration, add to your shell profile (~/.bashrc, ~/.zshrc) or system environment variables.

### 3. Usage

**Trigger in conversation:**

- Explicit commands: `/felo-superagent`, "use felo super agent"
- Describe intent: SuperAgent conversation, streaming conversation, LiveDoc conversation, continuous conversation

**Run script directly from command line:**

```bash
node felo-superAgent/scripts/run_superagent.mjs --query "What is the latest news about AI?"
```

Output is the complete answer text after streaming aggregation. Add `--json` to get JSON including `thread_short_id` and `live_doc_short_id`.

**CLI commands (after installation):**

```bash
# SuperAgent conversation
felo superagent "What is the latest news about AI?"

# Continue conversation
felo superagent "Tell me more" --thread-id <thread_short_id>

# List LiveDocs
felo livedocs
felo livedocs --page 2 --size 10
felo livedocs --keyword AI

# View resources in a specific LiveDoc
felo livedoc-resources <livedoc-id>
```

---

## Script Parameters

### superagent

| Parameter                         | Description                                                       |
| --------------------------------- | ----------------------------------------------------------------- |
| `--query <text>`                  | User question (required, 1-2000 characters)                       |
| `--thread-id <id>`               | Existing thread ID for follow-up conversations                    |
| `--live-doc-id <id>`             | Reuse existing LiveDoc short_id (continuous conversation)         |
| `--skill-id <id>`                | Skill ID (new conversations only)                                 |
| `--selected-resource-ids <ids>`  | Comma-separated resource IDs (new conversations only)             |
| `--ext <json>`                   | Extra parameters as JSON, e.g., `'{"style_id":"xxx"}'` (new conversations only) |
| `--accept-language <lang>`       | Language preference, e.g., zh, en, ja, ko                         |
| `--timeout <seconds>`            | Request/stream timeout, default 60                                |
| `--json`                         | Output JSON (includes answer, thread_short_id, live_doc_short_id) |
| `--verbose`                      | Log stream connection details to stderr                           |

### livedocs

| Parameter                  | Description                     |
| -------------------------- | ------------------------------- |
| `-p, --page <number>`     | Page number, default 1          |
| `-s, --size <number>`     | Items per page, default 20      |
| `-k, --keyword <text>`    | Keyword filter                  |
| `-j, --json`              | Output raw JSON                 |
| `-t, --timeout <seconds>` | Request timeout, default 60     |

### livedoc-resources

| Parameter                  | Description                     |
| -------------------------- | ------------------------------- |
| `<livedoc-id>`            | LiveDoc short_id (required)     |
| `-j, --json`              | Output raw JSON                 |
| `-t, --timeout <seconds>` | Request timeout, default 60     |

---

## Output Format

**Default (plain text):**
Script stdout is the complete answer content (concatenated from SSE `message` events).

**`--json`:**
Single-line JSON object, for example:

```json
{
  "status": "ok",
  "data": {
    "answer": "Complete answer content...",
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

Use `thread_short_id` to call the "query conversation details" API, and `live_doc_short_id` can be passed to `felo-livedoc` to query related resources.

---

## Complete Examples

### Example 1: Simple question

```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "What is quantum computing?" \
  --accept-language en \
  --timeout 90
```

**Output:**
```
SuperAgent: creating conversation...
Quantum computing is a revolutionary approach to computation that leverages...
[complete streaming answer]
```

### Example 2: Continue conversation on existing LiveDoc

```bash
# First conversation
node felo-superAgent/scripts/run_superagent.mjs \
  --query "Explain artificial intelligence" \
  --json

# Returns: {"data": {"live_doc_short_id": "PvyKouzJirXjFdst4uKRK3", ...}}

# Continue on same LiveDoc
node felo-superAgent/scripts/run_superagent.mjs \
  --query "What are the main applications?" \
  --live-doc-id "PvyKouzJirXjFdst4uKRK3"
```

### Example 3: Follow-up question in thread

```bash
# First question
node felo-superAgent/scripts/run_superagent.mjs \
  --query "What is machine learning?" \
  --json

# Returns: {"data": {"thread_short_id": "TvyKouzJirXjFdst4uKRK3", ...}}

# Follow-up question
node felo-superAgent/scripts/run_superagent.mjs \
  --query "Can you elaborate on neural networks?" \
  --thread-id "TvyKouzJirXjFdst4uKRK3"
```

### Example 4: With verbose logging

```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "Latest developments in AI" \
  --accept-language en \
  --verbose \
  --json
```

**Stderr output:**
```
SuperAgent: creating conversation...
Stream key: abc123...
Thread ID: TvyKouzJirXjFdst4uKRK3
LiveDoc ID: PvyKouzJirXjFdst4uKRK3
[stream] event=message
[stream] data={"content":"Recent AI developments..."}
```

---

## Tool Support

SuperAgent may invoke tools during conversation. The script automatically extracts and displays:

### Image Generation
- Tool: `generate_images`
- Output: Image URLs and titles
- Example: `[AI Generated Image](https://felo.ai/zh-Hans/livedoc/...)`

### Research & Discovery
- Tool: `generate_discovery`
- Output: Research report titles
- Example: `[AI Research Report](https://felo.ai/zh-Hans/livedoc/...)`

### Document Generation
- Tool: `generate_document`
- Output: Document titles
- Example: `[Generated Document](https://felo.ai/zh-Hans/livedoc/...)`

### Presentation Generation
- Tool: `generate_ppt`
- Output: PPT titles
- Example: `[AI Presentation](https://felo.ai/zh-Hans/livedoc/...)`

### HTML Generation
- Tool: `generate_html`
- Output: HTML page titles
- Example: `[HTML Page](https://felo.ai/zh-Hans/livedoc/...)`

### Twitter/X Search
- Tool: `search_x`
- Output: Tweet content, author info, metrics (likes, retweets, views)
- Example:
  ```
  [Twitter Search Results] (5 tweets)
    Elon Musk (@elonmusk) [1.2K likes | 234 retweets | 45K views]
    AI is the future of humanity...
    https://twitter.com/...
  ```

---

## Error Handling

Common error codes (see [SuperAgent API documentation](https://openapi.felo.ai/docs/api-reference/v2/superagent.html)):

- `INVALID_API_KEY` (401): Key is invalid or revoked
- `SUPER_AGENT_CONVERSATION_CREATE_FAILED` (502): Failed to create conversation
- Other 502 errors: Downstream service issues, retry or contact support

If `FELO_API_KEY` is not configured, the script will error and show configuration instructions.

---

## API Workflow

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
   - Automatically detects and formats tool outputs
   - Deduplicates results to avoid showing the same resource multiple times

Base URL: `https://openapi.felo.ai` (override with `FELO_API_BASE` if needed).

---

## Conversation Continuity

**Three modes of conversation:**

1. **New conversation:** No IDs provided — creates fresh thread and LiveDoc
2. **LiveDoc continuation:** Provide `--live-doc-id` — new thread, same knowledge base
3. **Thread follow-up:** Provide `--thread-id` — continue exact conversation

**When to use each mode:**
- Use **new conversation** for unrelated questions
- Use **LiveDoc continuation** to build knowledge on a topic across multiple threads
- Use **thread follow-up** for clarifying questions or continuing the exact same discussion

---

## Troubleshooting

### API Key Not Set

**Error:**
```
ERROR: FELO_API_KEY not set
```

**Solution:**
1. Get your API key from https://felo.ai (Settings → API Keys)
2. Set the environment variable:
   ```bash
   export FELO_API_KEY="your-api-key-here"
   ```
3. Restart your terminal or reload the environment

### Invalid API Key

**Error:**
```
HTTP 401: INVALID_API_KEY
```

**Solution:**
- Check if your API key is correct
- Verify the key hasn't been revoked at https://felo.ai
- Generate a new key if needed

### Stream Timeout

**Error:**
```
Stream idle timeout (no data for 7200s)
```

**Solution:**
- The stream was idle for 2 hours with no data
- This is normal for very long-running conversations
- Retry the query or increase timeout with `--timeout 120`

### Connection Issues

**Behavior:** Script shows "SuperAgent: creating conversation..." but hangs

**Solution:**
- Check your internet connection
- Verify `https://openapi.felo.ai` is accessible
- Try with `--verbose` to see detailed connection logs
- Check if a firewall is blocking SSE connections

### Tool Results Not Showing

**Behavior:** Answer appears but tool results (images, documents) are missing

**Solution:**
- Tool results appear inline during streaming
- Use `--json` to see all tool results in structured format
- Check if LiveDoc URL is accessible

---

## Advanced Usage

### Custom API Base URL

Override the API base URL:

```bash
export FELO_API_BASE="https://custom-api.example.com"
node felo-superAgent/scripts/run_superagent.mjs --query "test"
```

### Custom Web Base URL

Override the web base URL for LiveDoc links:

```bash
export FELO_WEB_BASE="https://custom-web.example.com"
node felo-superAgent/scripts/run_superagent.mjs --query "test"
```

### Extended Parameters

Pass custom parameters to the API:

```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "Generate a report" \
  --ext '{"style_id":"professional","format":"detailed"}'
```

### Resource Selection

Select specific resources for the conversation:

```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "Summarize these documents" \
  --live-doc-id "PvyKouzJirXjFdst4uKRK3" \
  --selected-resource-ids "res1,res2,res3"
```

---

## References

- [SuperAgent API Documentation](https://openapi.felo.ai/docs/api-reference/v2/superagent.html)
- [Felo Open Platform](https://openapi.felo.ai/docs/)
- [Get API Key](https://felo.ai) (Settings → API Keys)
- [GitHub Repository](https://github.com/Felo-Inc/felo-skills)
