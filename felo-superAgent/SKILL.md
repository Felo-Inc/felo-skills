---
name: felo-superAgent
description: "Felo SuperAgent API: AI conversation with real-time SSE streaming on a persistent LiveDoc canvas. Use when users want SuperAgent chat, continuous conversation, tweet writing, logo/branding design, or e-commerce product images. Explicit commands: /felo-superagent."
---

# Felo SuperAgent Skill

## Constraints (MUST READ FIRST)

These rules are mandatory. Violating any of them will produce incorrect behavior.

1. **`--live-doc-id` is REQUIRED when creating a conversation.** Never call `run_superagent.mjs` without `--live-doc-id`. If you do not have one yet, obtain it first (see Step 2 below).

2. **One LiveDoc per session.** All conversations within a session MUST use the same `--live-doc-id`. Do NOT create a new LiveDoc unless the user explicitly asks to "open a new canvas" / "start a new LiveDoc" / "create a new workspace".

3. **Default behavior is follow-up, not new conversation.** After the first question, every subsequent user message is a follow-up. You MUST pass `--thread-id` from the previous response. Only omit `--thread-id` (to start a new thread on the same LiveDoc) when the user explicitly says "new topic" / "change subject" / "start over".

4. **Always persist state.** After every call, save the returned `thread_short_id` and `live_doc_short_id`. Use them in the next call. Losing these IDs breaks conversation continuity.

5. **Skill ID auto-detection.** When creating a new conversation (no `--thread-id`), detect user intent and set `--skill-id` accordingly:

   | User intent                                      | `--skill-id` value          |
   | ------------------------------------------------ | --------------------------- |
   | Write/post/compose/draft a tweet                 | `twitter-writer`            |
   | Create a logo or brand design                    | `logo-and-branding`         |
   | Generate e-commerce / product images             | `ecommerce-product-image`   |
   | All other conversations                          | Do NOT pass `--skill-id`    |

   `--skill-id` is only effective when creating a new conversation. It is ignored in follow-up mode (`--thread-id`).

6. **Never create a new LiveDoc casually.** Reuse the existing one. The only exception is an explicit user request for a new canvas/workspace.

## When to Use

Trigger this skill when users want:

- **SuperAgent conversation:** AI conversation with Felo SuperAgent, with real-time streaming output
- **Continuous conversation:** Multi-turn Q&A on a persistent LiveDoc canvas
- **Tweet writing:** Compose or post tweets (auto-selects `twitter-writer` skill)
- **Logo & branding:** Create logos or brand designs (auto-selects `logo-and-branding` skill)
- **E-commerce images:** Generate product images (auto-selects `ecommerce-product-image` skill)
- **Tool-augmented answers:** Responses that may include image generation, document creation, PPT generation, or Twitter/X search
- **Streaming responses:** Real-time answer generation with Server-Sent Events (SSE)

**Trigger words:**

- English: superagent, super agent, stream chat, streaming conversation, livedoc conversation, continuous chat, follow-up question, write a tweet, post a tweet, create a logo, brand design, product image, e-commerce image
- Simplified Chinese (pinyin): chao ji zhu shou, liu shi dui hua, lian xu dui hua, zhui wen, fa tui wen, xie tui wen, she ji logo, pin pai she ji, dian shang tu pian
- Traditional Chinese (pinyin): chao ji zhu shou, liu shi dui hua, lian xu dui hua, zhui wen, fa tui wen, xie tui wen, she ji logo, pin pai she ji, dian shang tu pian
- Japanese (romaji): suupaa eejento, sutoriimingu kaiwa, keizoku kaiwa, tsuiito wo kaku, rogo sakusei, shouhin gazou

**Explicit commands:** `/felo-superagent`, "use felo superagent", "felo superagent"

**Do NOT use for:**

- Simple one-off Q&A or real-time information queries (prefer `felo-search`)
- Web page content fetching only (use `felo-web-fetch`)
- PPT/slide generation only (use `felo-slides`)
- LiveDoc knowledge base management only (use `felo-livedoc`)
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

### 3. Dependency: felo-livedoc

This skill depends on the `felo-livedoc` skill to obtain and create LiveDocs. Ensure `felo-livedoc/scripts/run_livedoc.mjs` is available at the same level as `felo-superAgent/`.

## How to Execute

When this skill is triggered, follow these steps strictly in order. Execute all commands using the Bash tool.

### Step 1: Check API Key

```bash
if [ -z "$FELO_API_KEY" ]; then
  echo "ERROR: FELO_API_KEY not set"
  exit 1
fi
```

If not set, stop and show the user the setup instructions above.

### Step 2: Obtain `live_doc_short_id`

This step ensures you always have a valid `--live-doc-id` before creating any conversation.

**2a. If you already have a `live_doc_short_id` from a previous call in this session:**
Skip to Step 3. Reuse the same ID.

**2b. If this is the first call in the session — fetch the LiveDoc list:**

```bash
node felo-livedoc/scripts/run_livedoc.mjs list --json
```

Parse the JSON output. The response contains `data.items` — an array of LiveDoc objects sorted by modification time. Pick the first item's `short_id` as your `live_doc_short_id`.

Example response:
```json
{
  "status": "ok",
  "data": {
    "total": 3,
    "items": [
      { "short_id": "QPetunwpGnkKuZHStP7gwt", "name": "My Workspace", "modified_at": "..." },
      ...
    ]
  }
}
```

Use: `live_doc_short_id = items[0].short_id`

**2c. If the list is empty (no LiveDocs exist) — create one:**

```bash
node felo-livedoc/scripts/run_livedoc.mjs create --name "SuperAgent Workspace" --json
```

Parse the JSON output and extract `data.short_id` as your `live_doc_short_id`.

Example response:
```json
{
  "status": "ok",
  "data": {
    "short_id": "NewDocId123abc",
    "name": "SuperAgent Workspace",
    ...
  }
}
```

**2d. If the user explicitly requests a new canvas/workspace:**

Create a new LiveDoc (same as 2c), then use the new ID for all subsequent calls. Discard the old `live_doc_short_id`.

### Step 3: Determine Conversation Mode

Decide whether this is a **new conversation** or a **follow-up**:

| Condition                                                    | Mode             | What to pass                                |
| ------------------------------------------------------------ | ---------------- | ------------------------------------------- |
| First question in session (no `thread_short_id` yet)         | New conversation | `--live-doc-id` only                        |
| User asks a follow-up / continues the topic (DEFAULT)        | Follow-up        | `--thread-id` AND `--live-doc-id`           |
| User explicitly says "new topic" / "change subject"          | New conversation | `--live-doc-id` only (same LiveDoc)         |
| User explicitly says "new canvas" / "new LiveDoc"            | New conversation | New `--live-doc-id` from Step 2d            |

**IMPORTANT:** The default for any user message after the first one is ALWAYS follow-up. Only treat it as a new conversation if the user explicitly requests it.

### Step 4: Detect Skill ID (New Conversations Only)

If this is a new conversation (no `--thread-id`), check the user's intent:

- If the user wants to **write/post/compose/draft a tweet** → add `--skill-id twitter-writer`
- If the user wants to **create a logo or brand design** → add `--skill-id logo-and-branding`
- If the user wants to **generate e-commerce/product images** → add `--skill-id ecommerce-product-image`
- Otherwise → do NOT pass `--skill-id`

If this is a follow-up (`--thread-id` is set), skip this step entirely. `--skill-id` is ignored in follow-up mode.

### Step 5: Run the Script

Construct and execute the command. Always use `--json` to capture metadata for state management.

**New conversation (first question):**
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "USER_QUERY_HERE" \
  --live-doc-id "LIVE_DOC_SHORT_ID" \
  --accept-language en \
  --timeout 60 \
  --json
```

**New conversation with skill ID (e.g., tweet writing):**
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "Write a tweet about the latest AI trends" \
  --live-doc-id "LIVE_DOC_SHORT_ID" \
  --skill-id twitter-writer \
  --accept-language en \
  --timeout 60 \
  --json
```

**Follow-up question (DEFAULT for 2nd+ messages):**
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "USER_FOLLOW_UP_QUERY" \
  --thread-id "THREAD_SHORT_ID_FROM_PREVIOUS" \
  --live-doc-id "LIVE_DOC_SHORT_ID" \
  --timeout 60 \
  --json
```

### Step 6: Save State and Present Result

After every call, parse the JSON output and:

1. **Save** `thread_short_id` and `live_doc_short_id` from the response — you MUST use these in the next call.
2. **Present** the answer to the user.

JSON response structure:
```json
{
  "status": "ok",
  "data": {
    "answer": "complete answer text",
    "thread_short_id": "CmYpuGwBgCnrUdDx5ZtmxA",
    "live_doc_short_id": "QPetunwpGnkKuZHStP7gwt",
    "live_doc_url": "https://felo.ai/livedoc/QPetunwpGnkKuZHStP7gwt",
    "image_urls": [{"url": "...", "title": "..."}],
    "discoveries": [{"title": "Research Report"}],
    "documents": [{"title": "Generated Document"}],
    "ppts": [{"title": "Presentation"}],
    "htmls": [{"title": "HTML Page"}],
    "search_x": [{"tweets": [...]}]
  }
}
```

Present to the user:

```markdown
## SuperAgent Answer

[Full answer text from the "answer" field]

## Generated Resources (if any)

- Images: [list image titles and URLs]
- Documents: [list document titles]
- Presentations: [list PPT titles]
- Twitter Results: [summarize tweets]

## Session Info

- LiveDoc: [live_doc_url]
```

Do NOT show `thread_short_id` or `live_doc_short_id` to the user unless they ask for it. These are internal state for the skill to manage.

## Complete Workflow Examples

### Example A: Multi-turn Conversation (Most Common)

```
User: "What is quantum computing?"
```

**Step 2b:** Fetch LiveDoc list → get `live_doc_short_id = "QPetunwpGnkKuZHStP7gwt"`
**Step 3:** First question → New conversation
**Step 4:** No special skill → no `--skill-id`
**Step 5:**
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "What is quantum computing?" \
  --live-doc-id "QPetunwpGnkKuZHStP7gwt" \
  --accept-language en --timeout 60 --json
```
**Step 6:** Save `thread_short_id = "CmYpuGwBgCnrUdDx5ZtmxA"`, `live_doc_short_id = "QPetunwpGnkKuZHStP7gwt"`

```
User: "What are its practical applications?"
```

**Step 2a:** Already have `live_doc_short_id` → skip
**Step 3:** Follow-up (default) → use saved `thread_short_id`
**Step 5:**
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "What are its practical applications?" \
  --thread-id "CmYpuGwBgCnrUdDx5ZtmxA" \
  --live-doc-id "QPetunwpGnkKuZHStP7gwt" \
  --timeout 60 --json
```
**Step 6:** Save updated `thread_short_id` (may be the same), keep `live_doc_short_id`

```
User: "Tell me more about quantum error correction"
```

**Step 3:** Still follow-up (same topic) → use saved `thread_short_id`
**Step 5:** Same pattern as above with new query

### Example B: Tweet Writing

```
User: "Help me write a tweet about AI trends"
```

**Step 2a:** Already have `live_doc_short_id` → reuse
**Step 3:** New conversation (different intent from previous thread)
**Step 4:** Detected "write a tweet" → `--skill-id twitter-writer`
**Step 5:**
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "Help me write a tweet about AI trends" \
  --live-doc-id "QPetunwpGnkKuZHStP7gwt" \
  --skill-id twitter-writer \
  --accept-language en --timeout 60 --json
```
**Step 6:** Save new `thread_short_id`, keep same `live_doc_short_id`

```
User: "Make it more casual and add some emojis"
```

**Step 3:** Follow-up → use saved `thread_short_id`
**Step 5:**
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "Make it more casual and add some emojis" \
  --thread-id "NEW_THREAD_FROM_TWEET" \
  --live-doc-id "QPetunwpGnkKuZHStP7gwt" \
  --timeout 60 --json
```

### Example C: Logo Design

```
User: "Design a logo for my coffee shop called Bean & Brew"
```

**Step 4:** Detected "design a logo" → `--skill-id logo-and-branding`
**Step 5:**
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "Design a logo for my coffee shop called Bean & Brew" \
  --live-doc-id "QPetunwpGnkKuZHStP7gwt" \
  --skill-id logo-and-branding \
  --accept-language en --timeout 90 --json
```

### Example D: E-commerce Product Image

```
User: "Generate a product image for a wireless headphone on white background"
```

**Step 4:** Detected "product image" → `--skill-id ecommerce-product-image`
**Step 5:**
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "Generate a product image for a wireless headphone on white background" \
  --live-doc-id "QPetunwpGnkKuZHStP7gwt" \
  --skill-id ecommerce-product-image \
  --accept-language en --timeout 90 --json
```

### Example E: User Requests a New Canvas

```
User: "Open a new canvas for a different project"
```

**Step 2d:** Create new LiveDoc:
```bash
node felo-livedoc/scripts/run_livedoc.mjs create --name "New Project" --json
```
Extract new `live_doc_short_id`. Discard the old one. All subsequent calls use the new ID.

## Available Script Options

**Core parameters:**
- `--query <text>` (REQUIRED) — User question, 1-2000 characters
- `--live-doc-id <id>` (REQUIRED for new conversations) — LiveDoc short_id to associate with
- `--thread-id <id>` — Thread ID from previous response, for follow-up conversations
- `--timeout <seconds>` — Request/stream timeout, default 60 seconds

**Skill parameters (new conversations only, ignored in follow-up):**
- `--skill-id <id>` — Skill ID (see Skill ID auto-detection table in Constraints)
- `--selected-resource-ids <ids>` — Comma-separated resource IDs to include
- `--ext <json>` — Extra parameters as JSON object

**Output control:**
- `--json` / `-j` — Output JSON format with full metadata (RECOMMENDED: always use this)
- `--verbose` / `-v` — Log stream connection details to stderr
- `--accept-language <lang>` — Language preference (e.g., zh, en, ja)

## API Workflow (Reference)

The script handles this workflow automatically:

1. **Create conversation:**
   - New: `POST /v2/conversations` (requires `live_doc_short_id` in body)
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

| Code                                   | HTTP | Description                                       |
| -------------------------------------- | ---- | ------------------------------------------------- |
| INVALID_API_KEY                        | 401  | API Key is invalid or has been revoked             |
| SUPER_AGENT_CONVERSATION_CREATE_FAILED | 502  | Failed to create conversation (upstream error)     |
| SUPER_AGENT_CONVERSATION_QUERY_FAILED  | 502  | Failed to query conversation details               |

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

1. Get your API key from https://felo.ai (Settings -> API Keys)
2. Set the environment variable:

   Linux/macOS:
   export FELO_API_KEY="your-api-key-here"

   Windows (PowerShell):
   $env:FELO_API_KEY="your-api-key-here"

3. Restart Claude Code or reload the environment
```

### Timeout Handling

- Default timeout: 60 seconds (increase to 90 for image/design generation)
- Idle timeout: 2 hours (no data received)
- Increase timeout for complex queries: `--timeout 120`

## Important Notes

- Execute this skill immediately using the Bash tool — do not just describe what you would do
- After create, the script connects to the stream **immediately** — the `stream_key` has a limited validity period
- Use the bundled Node script to consume SSE; do not assume `jq` or other tools for parsing SSE
- Same API key as other Felo skills (`FELO_API_KEY`)
- The script handles reconnection automatically if the stream drops
- Tool results are deduplicated to avoid showing the same resource multiple times
- Always use `--json` flag to capture `thread_short_id` and `live_doc_short_id` for state management
- Multi-language support: Fully supports Simplified Chinese, Traditional Chinese, Japanese, and English
- The API returns results in the same language as the query when possible

## Decision Flowchart

```
User sends a message
        |
        v
Have live_doc_short_id?
   NO  --> Step 2b: fetch list --> got items?
              YES --> use items[0].short_id
              NO  --> Step 2c: create new LiveDoc
   YES --> continue
        |
        v
Have thread_short_id from previous call?
   NO  --> This is a NEW conversation
              --> Step 4: detect skill-id
              --> Step 5: run WITHOUT --thread-id
   YES --> Is user explicitly starting a new topic?
              YES --> NEW conversation (same live-doc-id, no --thread-id)
              NO  --> FOLLOW-UP (pass --thread-id)
        |
        v
Run script --> parse JSON --> save thread_short_id + live_doc_short_id
        |
        v
Present answer to user
```

## References

- [SuperAgent API (Felo Open Platform)](https://openapi.felo.ai/docs/api-reference/v2/superagent.html)
- [Felo Open Platform](https://openapi.felo.ai/docs/)
- [Get API Key](https://felo.ai) (Settings -> API Keys)
