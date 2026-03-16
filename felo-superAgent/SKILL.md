---
name: felo-superAgent
description: "Felo SuperAgent API: AI conversation with real-time SSE streaming on a persistent LiveDoc canvas. Use when users want SuperAgent chat, continuous conversation, tweet writing, logo/branding design, or e-commerce product images. Explicit commands: /felo-superagent."
---

# Felo SuperAgent Skill

## Constraints (MUST READ FIRST)

These rules are mandatory. Violating any of them will produce incorrect behavior.

1. **NEVER use `--json` flag.** The script MUST run in default (streaming) mode so that SuperAgent's answer is printed directly to stdout in real time. The `--json` flag suppresses all streaming output and is forbidden. State IDs are extracted from the `[state]` line in stderr instead.

2. **NEVER summarize, rewrite, or re-output the script's stdout.** The script already streams the full answer and tool results directly to the user. After the script finishes, do NOT repeat, paraphrase, or summarize the answer. Only output supplementary information (LiveDoc URL, session state notes) if needed.

3. **`--live-doc-id` is REQUIRED when creating a conversation.** Never call `run_superagent.mjs` without `--live-doc-id`. If you do not have one yet, obtain it first (see Step 2 below).

4. **Reuse `live_doc_id` from ANY source.** If you already have a `live_doc_id` from any previous operation in this session — whether from a prior SuperAgent call, a `felo-livedoc` skill operation, user-provided input, or any other skill — use it directly. Do NOT request the LiveDoc list again. Only fetch the list when no `live_doc_id` is available from any source. (Note: `live_doc_id` corresponds to the API field `live_doc_short_id` and the `[state]` output key `live_doc_short_id`.)

5. **One LiveDoc per session.** All conversations within a session MUST use the same `--live-doc-id`. Do NOT create a new LiveDoc unless the user explicitly asks to "open a new canvas" / "start a new LiveDoc" / "create a new workspace".

6. **Default behavior is follow-up, not new conversation.** After the first question, every subsequent user message is a follow-up. You MUST pass `--thread-id` from the previous response. Only omit `--thread-id` (to start a new thread on the same LiveDoc) when:
   - The user explicitly says "new topic" / "change subject" / "start over"
   - The user's intent requires a specific `--skill-id` (e.g., tweet writing, logo design, product image) and the current thread was not created with that skill — because `--skill-id` only takes effect in new conversations

7. **Always persist state.** After every call, extract `thread_short_id` and `live_doc_id` from the stderr `[state]` line (where `live_doc_id` is output as `live_doc_short_id`). Use them in the next call. Losing these IDs breaks conversation continuity.

8. **Skill ID selection (New Conversations Only).** When creating a new conversation (no `--thread-id`), analyze the user's intent and determine if it matches one of the supported skill IDs:

   **Available skill IDs:**
   - `twitter-writer` — For composing, drafting, or posting tweets/X posts
   - `logo-and-branding` — For creating logos, brand designs, or visual identity
   - `ecommerce-product-image` — For generating product images for e-commerce use

   **Selection logic:**
   - If the user explicitly requests a specific skill-id, use their specified value
   - If the user's intent clearly matches one of the above, pass `--skill-id` with that value
   - If none of the above match, do NOT pass `--skill-id` (general conversation mode)
   - `--skill-id` is only effective when creating a new conversation. It is ignored in follow-up mode (`--thread-id`).

9. **Never create a new LiveDoc casually.** Reuse the existing one. The only exception is an explicit user request for a new canvas/workspace.

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

### Step 2: Obtain `live_doc_id`

This step ensures you always have a valid `--live-doc-id` before creating any conversation. (Note: `live_doc_id` corresponds to the API field `live_doc_short_id`.)

**2a. If you already have a `live_doc_id` from ANY source in this session:**
Skip to Step 3. Reuse the same ID. Sources include: a previous SuperAgent call's `[state]` output (the `live_doc_short_id` field), a `felo-livedoc` skill operation (create, list, etc.), user-provided input, or any other skill that returned a LiveDoc ID.

**2b. If no `live_doc_id` is available from any source — fetch the LiveDoc list:**

```bash
node felo-livedoc/scripts/run_livedoc.mjs list --json
```

Parse the JSON output. The response contains `data.items` — an array of LiveDoc objects sorted by modification time. Pick the first item's `short_id` as your `live_doc_id`.

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

Use: `live_doc_id = items[0].short_id`

**2c. If the list is empty (no LiveDocs exist) — create one:**

```bash
node felo-livedoc/scripts/run_livedoc.mjs create --name "SuperAgent Workspace" --json
```

Parse the JSON output and extract `data.short_id` as your `live_doc_id`.

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

Create a new LiveDoc (same as 2c), then use the new ID for all subsequent calls. Discard the old `live_doc_id`.

### Step 3: Determine Conversation Mode

Decide whether this is a **new conversation** or a **follow-up**:

| Condition                                                    | Mode             | What to pass                                |
| ------------------------------------------------------------ | ---------------- | ------------------------------------------- |
| First question in session (no `thread_short_id` yet)         | New conversation | `--live-doc-id` only                        |
| User asks a follow-up / continues the topic (DEFAULT)        | Follow-up        | `--thread-id` AND `--live-doc-id`           |
| User explicitly says "new topic" / "change subject"          | New conversation | `--live-doc-id` only (same LiveDoc)         |
| User's intent requires a `--skill-id` not matching current thread | New conversation | `--live-doc-id` + `--skill-id` (same LiveDoc) |
| User explicitly says "new canvas" / "new LiveDoc"            | New conversation | New `--live-doc-id` from Step 2d            |

**IMPORTANT:** The default for any user message after the first one is ALWAYS follow-up. Only treat it as a new conversation if the user explicitly requests it.

### Step 4: Determine Skill ID (New Conversations Only)

If this is a new conversation (no `--thread-id`), analyze the user's intent:

**Available skill IDs:**
- `twitter-writer` — For composing, drafting, or posting tweets/X posts
- `logo-and-branding` — For creating logos, brand designs, or visual identity
- `ecommerce-product-image` — For generating product images for e-commerce use

**How to decide:**
1. If the user explicitly specifies a skill-id, use that value
2. Otherwise, analyze the user's request and determine if it matches one of the above
3. If none match, do NOT pass `--skill-id`

If this is a follow-up (`--thread-id` is set), skip this step entirely. `--skill-id` is ignored in follow-up mode.

### Step 5: Run the Script

Construct and execute the command. **NEVER use `--json`** — the script must run in default streaming mode so the answer is printed directly to the user in real time.

**IMPORTANT:** The SSE stream may take a long time (especially for image generation, research reports, etc.). You MUST set the Bash tool timeout to at least 600000ms (10 minutes) when executing the script to prevent premature termination.

**`--accept-language` selection:** Default is `en`. Match the user's language — if the user writes in Chinese use `zh`, Japanese use `ja`, Korean use `ko`, etc.

**`--query` construction:** Do NOT simply pass the user's raw input as-is. You should enrich and refine the query to make it more complete and effective for SuperAgent:

- **Add context:** If the conversation has prior context (e.g., the user previously discussed a topic), incorporate relevant details so SuperAgent understands the full picture.
- **Clarify vague requests:** If the user says something brief like "continue" or "go on", expand it to describe what should be continued (e.g., "Please continue the previous analysis and provide more details").
- **Supplement missing details:** If the user's request implies information they mentioned earlier (e.g., brand name, product type, style preference), include those details in the query.
- **Preserve user intent:** Never change the user's core intent. Only add context and clarity — do not inject opinions or redirect the topic.
- **Keep it concise:** The query has a 2000-character limit. Enrich the content but stay focused and avoid unnecessary padding.

Examples:
- User says "继续" → `--query "请继续上面关于量子计算的分析，进一步展开实际应用场景"`
- User says "再来一张" → `--query "请再生成一张类似风格的无线耳机产品图，白色背景"`
- User says "帮我改改" → `--query "请修改上面生成的推文，语气更轻松一些，加一些emoji"`

**New conversation (first question):**
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "USER_QUERY_HERE" \
  --live-doc-id "LIVE_DOC_ID" \
  --accept-language en \
  --timeout 3600
```

**New conversation with skill ID (e.g., tweet writing):**
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "Write a tweet about the latest AI trends" \
  --live-doc-id "LIVE_DOC_ID" \
  --skill-id twitter-writer \
  --accept-language en \
  --timeout 3600
```

**Follow-up question (DEFAULT for 2nd+ messages):**
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "USER_FOLLOW_UP_QUERY" \
  --thread-id "THREAD_SHORT_ID_FROM_PREVIOUS" \
  --live-doc-id "LIVE_DOC_ID" \
  --timeout 3600
```

### Step 6: Extract State from stderr (Do NOT Re-output the Answer)

The script has already streamed the full answer and tool results directly to stdout. **Do NOT repeat, summarize, or rewrite any of that content.**

After the script finishes, look for the `[state]` line in stderr output:

```
[state] thread_short_id=CmYpuGwBgCnrUdDx5ZtmxA live_doc_short_id=QPetunwpGnkKuZHStP7gwt live_doc_url=https://felo.ai/livedoc/QPetunwpGnkKuZHStP7gwt
```

1. **Extract and save** `thread_short_id` and `live_doc_id` (from the `live_doc_short_id` field in the `[state]` line) — you MUST use these in the next call.
2. **Optionally show** the `live_doc_url` link to the user so they can view the LiveDoc canvas in a browser.

Do NOT show `thread_short_id` or `live_doc_id` to the user unless they ask for it. These are internal state for the skill to manage.

## Complete Workflow Examples

### Example A: Multi-turn Conversation (Most Common)

```
User: "What is quantum computing?"
```

**Step 2b:** Fetch LiveDoc list → get `live_doc_id = "QPetunwpGnkKuZHStP7gwt"`
**Step 3:** First question → New conversation
**Step 4:** No special skill → no `--skill-id`
**Step 5:**
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "What is quantum computing?" \
  --live-doc-id "QPetunwpGnkKuZHStP7gwt" \
  --accept-language en --timeout 3600
```
**Step 6:** The answer is already streamed to the user. Extract from stderr `[state]` line: `thread_short_id = "CmYpuGwBgCnrUdDx5ZtmxA"`, `live_doc_id = "QPetunwpGnkKuZHStP7gwt"`. Do NOT repeat the answer.

```
User: "What are its practical applications?"
```

**Step 2a:** Already have `live_doc_id` → skip
**Step 3:** Follow-up (default) → use saved `thread_short_id`
**Step 5:**
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "What are its practical applications?" \
  --thread-id "CmYpuGwBgCnrUdDx5ZtmxA" \
  --live-doc-id "QPetunwpGnkKuZHStP7gwt" \
  --timeout 3600
```
**Step 6:** Answer already streamed. Extract updated `thread_short_id` from stderr `[state]` line (may be the same), keep `live_doc_id`.

```
User: "Tell me more about quantum error correction"
```

**Step 3:** Still follow-up (same topic) → use saved `thread_short_id`
**Step 5:** Same pattern as above with new query

### Example B: Tweet Writing

```
User: "Help me write a tweet about AI trends"
```

**Step 2a:** Already have `live_doc_id` → reuse
**Step 3:** New conversation — `--skill-id twitter-writer` is required, which only takes effect in new conversations
**Step 4:** User intent matches "write a tweet" → `--skill-id twitter-writer`
**Step 5:**
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "Help me write a tweet about AI trends" \
  --live-doc-id "QPetunwpGnkKuZHStP7gwt" \
  --skill-id twitter-writer \
  --accept-language en --timeout 3600
```
**Step 6:** Answer already streamed. Extract new `thread_short_id` from stderr `[state]` line, keep same `live_doc_id`.

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
  --timeout 3600
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
  --accept-language en --timeout 3600
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
  --accept-language en --timeout 3600
```

### Example E: User Requests a New Canvas

```
User: "Open a new canvas for a different project"
```

**Step 2d:** Create new LiveDoc:
```bash
node felo-livedoc/scripts/run_livedoc.mjs create --name "New Project" --json
```
Extract new `live_doc_id`. Discard the old one. All subsequent calls use the new ID.

## Available Script Options

**Core parameters:**
- `--query <text>` (REQUIRED) — User question, 1-2000 characters
- `--live-doc-id <id>` (REQUIRED for new conversations) — LiveDoc ID (`live_doc_id`) to associate with
- `--thread-id <id>` — Thread ID from previous response, for follow-up conversations
- `--timeout <seconds>` — Request/stream timeout, default 3600 seconds

**Skill parameters (new conversations only, ignored in follow-up):**
- `--skill-id <id>` — Skill ID (see Constraint #8 for available skill IDs)
- `--selected-resource-ids <ids>` — Comma-separated resource IDs to include
- `--ext <json>` — Extra parameters as JSON object

**Output control:**
- `--json` / `-j` — Output JSON format with full metadata (DO NOT use in this skill — it suppresses streaming output)
- `--verbose` / `-v` — Log stream connection details to stderr (for debugging only, not needed for normal use)
- `--accept-language <lang>` — Language preference (e.g., en, ja, ko)

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

- Default timeout: 3600 seconds (recommended for all SuperAgent calls due to SSE streaming)
- Idle timeout: 2 hours (no data received)
- **Bash tool timeout:** MUST be set to at least 600000ms (10 minutes) when executing the script

## Important Notes

- Execute this skill immediately using the Bash tool — do not just describe what you would do
- **NEVER use `--json`** — it suppresses all streaming output. State IDs come from the `[state]` line in stderr
- **NEVER summarize or re-output the answer** — the script already streams it directly to the user
- After create, the script connects to the stream **immediately** — the `stream_key` has a limited validity period
- Use the bundled Node script to consume SSE; do not assume `jq` or other tools for parsing SSE
- Same API key as other Felo skills (`FELO_API_KEY`)
- The script handles reconnection automatically if the stream drops
- Tool results are deduplicated to avoid showing the same resource multiple times
- If `live_doc_id` is already known from any source (other skills, user input, previous calls), use it directly — do NOT fetch the LiveDoc list again
- Multi-language support: Fully supports Simplified Chinese, Traditional Chinese, Japanese, and English
- The API returns results in the same language as the query when possible

## Decision Flowchart

```
User sends a message
        |
        v
Have live_doc_id from ANY source?
   NO  --> Step 2b: fetch list --> got items?
              YES --> use items[0].short_id as live_doc_id
              NO  --> Step 2c: create new LiveDoc
   YES --> continue (reuse it, do NOT fetch list)
        |
        v
Have thread_short_id from previous call?
   NO  --> This is a NEW conversation
              --> Step 4: determine skill-id by analyzing user intent
              --> Step 5: run WITHOUT --thread-id
   YES --> Does user's intent require a skill-id not matching current thread?
              YES --> NEW conversation (same live-doc-id, with --skill-id)
              NO  --> Is user explicitly starting a new topic?
                        YES --> NEW conversation (same live-doc-id, no --thread-id)
                        NO  --> FOLLOW-UP (pass --thread-id)
        |
        v
Run script (NO --json, Bash timeout >= 600000ms) --> answer streams directly to user
        |
        v
Extract thread_short_id + live_doc_id from stderr [state] line
        |
        v
Do NOT repeat or summarize the answer (already shown)
```

## References

- [SuperAgent API (Felo Open Platform)](https://openapi.felo.ai/docs/api-reference/v2/superagent.html)
- [Felo Open Platform](https://openapi.felo.ai/docs/)
- [Get API Key](https://felo.ai) (Settings -> API Keys)
