---
name: felo-superAgent
description: "Felo SuperAgent API: AI conversation with real-time SSE streaming on a persistent LiveDoc canvas. Use when users want SuperAgent chat, continuous conversation, logo/branding design, or e-commerce product images. Do NOT use for tweet/X post writing — use felo-twitter-writer instead. Explicit commands: /felo-superAgent."
---

# Felo SuperAgent Skill

## Constraints (MUST READ FIRST)

These rules are mandatory. Violating any of them will produce incorrect behavior.

1. **ALWAYS use `--json` flag.** The script MUST run in JSON mode (`--json`). In Claude Code's Bash tool, stdout is always captured — it never streams directly to the user. JSON mode returns the full answer in a structured response that Claude can then output as text. State IDs are extracted from the JSON response fields `thread_short_id` and `live_doc_short_id`.

2. **ALWAYS output the answer directly as text.** After the script finishes, read `data.answer` from the JSON output and print it verbatim as your response text. Do NOT summarize, paraphrase, or add commentary around it. Output it exactly as-is so the user sees the full content. Then, if `data.image_urls` is non-empty, append image links immediately after, formatted as one line per image: `[title](url)`.

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

9. **Brand style selection for skill-based new conversations.** When starting a NEW conversation that uses a skill ID (`twitter-writer`, `logo-and-branding`, `ecommerce-product-image`), you MUST fetch the style library and let the user choose a style BEFORE calling `run_superagent.mjs`. The chosen style is passed via `--ext '{"brand_style_requirement":"<style_string>"}'`. See Step 4.5 for the full procedure.

   - The style string is the exact text block output by `run_style_library.mjs` for that entry. Fields vary by category:
     - **TWITTER**: `Style name` + `Style labels` (language-aware) + `Style DNA` + `Cover file ID` (omitted if null)
     - **IMAGE**: `Style name` + `Style labels` + `Style DNA` or `Cover file ID` depending on what is present
   - Use the category that matches the skill: `TWITTER` for `twitter-writer`, `IMAGE` for `logo-and-branding` and `ecommerce-product-image`.
   - Always pass `--accept-language` to `run_style_library.mjs` so labels are returned in the user's language.
   - If the user has already specified a style (by name or by pasting the style block), skip the fetch and use their choice directly.
   - If the style library returns no entries, proceed without `--ext`.
   - `--ext` is only valid for new conversations. Never pass it in follow-up mode (`--thread-id`).

10. **Never create a new LiveDoc casually.** Reuse the existing one. The only exception is an explicit user request for a new canvas/workspace.

## When to Use

Trigger this skill when users want:

- **SuperAgent conversation:** AI conversation with Felo SuperAgent, with real-time streaming output
- **Continuous conversation:** Multi-turn Q&A on a persistent LiveDoc canvas
- **Logo & branding:** Create logos or brand designs (auto-selects `logo-and-branding` skill)
- **E-commerce images:** Generate product images (auto-selects `ecommerce-product-image` skill)
- **Tool-augmented answers:** Responses that may include image generation, document creation, PPT generation, or Twitter/X search
- **Streaming responses:** Real-time answer generation with Server-Sent Events (SSE)

**Trigger words:**

- English: superagent, super agent, stream chat, streaming conversation, livedoc conversation, continuous chat, follow-up question, create a logo, brand design, product image, e-commerce image
- Simplified Chinese (pinyin): chao ji zhu shou, liu shi dui hua, lian xu dui hua, zhui wen, she ji logo, pin pai she ji, dian shang tu pian
- Traditional Chinese (pinyin): chao ji zhu shou, liu shi dui hua, lian xu dui hua, zhui wen, she ji logo, pin pai she ji, dian shang tu pian
- Japanese (romaji): suupaa eejento, sutoriimingu kaiwa, keizoku kaiwa, rogo sakusei, shouhin gazou

**Explicit commands:** `/felo-superAgent`, "use felo superagent", "felo superagent"

**Do NOT use for:**

- Tweet/X post writing of any kind (use `felo-twitter-writer` instead)
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

The scripts (`run_superagent.mjs`, `run_style_library.mjs`) read the API key **only from the `FELO_API_KEY` environment variable**. The `felo config set` CLI command writes to `~/.felo/config.json` which these scripts do NOT read — environment variable is the only supported method.

**Linux/macOS:**
```bash
export FELO_API_KEY="your-api-key-here"
```

For permanent configuration, add to your shell profile (`~/.bashrc` or `~/.zshrc`):
```bash
echo 'export FELO_API_KEY="your-api-key-here"' >> ~/.zshrc
source ~/.zshrc
```

**Windows (PowerShell):**
```powershell
$env:FELO_API_KEY="your-api-key-here"
```

**Windows (CMD):**
```cmd
set FELO_API_KEY=your-api-key-here
```

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

Parse the JSON output. The response contains `data.items` — an array of LiveDoc objects sorted by modification time descending. Find the **first item where `is_shared === false`** and use its `short_id` as your `live_doc_id`. **NEVER pick an item where `is_shared === true`** — shared LiveDocs belong to other projects and will cause a 502 error.

Example response:
```json
{
  "status": "ok",
  "data": {
    "total": 3,
    "items": [
      { "short_id": "abc123", "name": "Shared Project", "is_shared": true, "modified_at": "..." },
      { "short_id": "QPetunwpGnkKuZHStP7gwt", "name": "My Workspace", "is_shared": false, "modified_at": "..." },
      ...
    ]
  }
}
```

Use: `live_doc_id = data.items.find(i => !i.is_shared)?.short_id`

**2c. If no `is_shared === false` item exists (or list is empty) — create one:**

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

### Step 4.5: Fetch and Select Brand Style (New Skill Conversations Only)

**When to run this step:** Only when this is a NEW conversation AND a skill ID was determined in Step 4 (`twitter-writer`, `logo-and-branding`, or `ecommerce-product-image`). Skip entirely for follow-up conversations or general (no skill) conversations.

**Category mapping:**
| Skill ID | Style category |
|---|---|
| `twitter-writer` | `TWITTER` |
| `logo-and-branding` | `IMAGE` |
| `ecommerce-product-image` | `IMAGE` |

**4.5a. If the user has already specified a style** (by name, or by pasting a style block), use it directly — skip to 4.5d.

**4.5b. Fetch the style list (names only):**

IMPORTANT: Style DNA content is very large. Always use `--json` and extract only names/labels via Node.js to avoid Bash tool output truncation. Never call `run_style_library.mjs` without `--json` for listing purposes.

```bash
# For twitter-writer
node felo-superAgent/scripts/run_style_library.mjs --category TWITTER --accept-language en --json | node -e "
const d=require('fs').readFileSync('/dev/stdin','utf8');
const j=JSON.parse(d);
const list=j.list||[];
const user=list.filter(s=>!s.recommended);
const rec=list.filter(s=>s.recommended);
if(user.length){console.log('[Your styles]');user.forEach((s,i)=>{const labels=(s.content?.labels?.en||[]).join(', ');console.log((i+1)+'. '+s.name+(labels?' — '+labels:''));});}
if(rec.length){console.log('[Recommended styles]');rec.forEach((s,i)=>{const labels=(s.content?.labels?.en||[]).join(', ');console.log((user.length+i+1)+'. '+s.name+(labels?' — '+labels:''));});}
if(!list.length)console.log('(No styles found)');
"

# For logo-and-branding or ecommerce-product-image
node felo-superAgent/scripts/run_style_library.mjs --category IMAGE --accept-language en --json | node -e "
const d=require('fs').readFileSync('/dev/stdin','utf8');
const j=JSON.parse(d);
const list=j.list||[];
if(list.length){list.forEach((s,i)=>{const labels=(s.content?.labels?.en||s.content?.tags?.en||[]).join(', ');console.log((i+1)+'. '+s.name+(labels?' — '+labels:''));});}
else console.log('(No styles found)');
"
```

Replace `en` with the matching `--accept-language` value for the user's language (`zh`, `ja`, `ko`, `en`). Also update the `.labels?.en` reference in the node script to match (e.g. `.labels?.zh` for Chinese).

**4.5c. Present the styles to the user and ask them to choose:**

Output the COMPLETE list as plain text — every style returned, numbered sequentially. NEVER use the `AskUserQuestion` tool (it limits to 4 options and will silently drop styles). NEVER pre-select or filter styles on behalf of the user. Always append a "no preference" option last. Wait for the user's plain-text reply before proceeding.

Example output:
```
Here are the available writing styles — choosing one will make the output more accurate:

[Your styles]
1. My Bold Voice — bold, provocative

[Recommended styles]
2. darioamodei — Thoughtful long-form essays
3. Casual & Witty — humor, relatable
...(ALL styles listed, none omitted)

0. No preference — use default style
```

If the user picks "no preference" (0) or the list is empty, proceed to Step 5 without `--ext`.

**4.5d. Build the `--ext` value:**

Take the full text block for the chosen style (exactly as output by the script) and use it as the value of `brand_style_requirement`. The block may contain multiple lines — serialize them into a single JSON string with `\n` for newlines and `\"` for any double quotes inside field values:

Example style block output:
```
Style name: darioamodei
Style labels: Thoughtful long-form essays
Style DNA: # Dario Amodei (@DarioAmodei) Tweet Writing Style DNA\n\n## Style Overview\nDario writes like a serious intellectual...
```

Serialized as `--ext`:
```bash
--ext '{"brand_style_requirement":"Style name: darioamodei\nStyle labels: Thoughtful long-form essays\nStyle DNA: # Dario Amodei (@DarioAmodei) Tweet Writing Style DNA\n\n## Style Overview\nDario writes like a serious intellectual..."}'
```

**Important:** Pass the `brand_style_requirement` value completely and verbatim — do NOT truncate `Style DNA`. Partial style content will degrade output quality.

### Step 5: Run the Script

Construct and execute the command. **ALWAYS use `--json`** — in Claude Code's Bash tool, stdout is captured, not streamed to the user. JSON mode returns the full answer in a structured response.

**IMPORTANT:** The SSE stream may take a long time (especially for image generation, research reports, etc.). You MUST set the Bash tool timeout to at least 600000ms (10 minutes) when executing the script to prevent premature termination.

**`--accept-language` selection:** Default is `en`. Match the user's language — if the user writes in Chinese use `zh`, Japanese use `ja`, Korean use `ko`, etc.

**`--query` construction:** Do NOT simply pass the user's raw input as-is. You should enrich and refine the query to make it more complete and effective for SuperAgent:

- **Add context:** If the conversation has prior context (e.g., the user previously discussed a topic), incorporate relevant details so SuperAgent understands the full picture.
- **Clarify vague requests:** If the user says something brief like "continue" or "go on", expand it to describe what should be continued (e.g., "Please continue the previous analysis and provide more details").
- **Supplement missing details:** If the user's request implies information they mentioned earlier (e.g., brand name, product type, style preference), include those details in the query.
- **Preserve user intent:** Never change the user's core intent. Only add context and clarity — do not inject opinions or redirect the topic.
- **Keep it concise:** The query has a 2000-character limit. Enrich the content but stay focused and avoid unnecessary padding.

Examples:
- User says "continue" → `--query "Please continue the analysis above on quantum computing, expanding on real-world applications"`
- User says "one more" → `--query "Please generate another product image in a similar style, white background"`
- User says "fix it" → `--query "Please revise the tweet generated above, make the tone more casual and add some emojis"`

**New conversation (first question, no skill):**
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "USER_QUERY_HERE" \
  --live-doc-id "LIVE_DOC_ID" \
  --accept-language en \
  --json
```

**New conversation with skill ID, no style selected:**
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "Write a tweet about the latest AI trends" \
  --live-doc-id "LIVE_DOC_ID" \
  --skill-id twitter-writer \
  --accept-language en \
  --json
```

**New conversation with skill ID and brand style (from Step 4.5):**
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "Write a tweet about the latest AI trends" \
  --live-doc-id "LIVE_DOC_ID" \
  --skill-id twitter-writer \
  --ext '{"brand_style_requirement":"Style name: darioamodei\nStyle labels: Thoughtful long-form essays\nStyle DNA: # Dario Amodei (@DarioAmodei) Tweet Writing Style DNA\n\n## Style Overview\nDario writes like a serious intellectual...（full content）"}' \
  --accept-language en \
  --json
```

**Follow-up question (DEFAULT for 2nd+ messages):**
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "USER_FOLLOW_UP_QUERY" \
  --thread-id "THREAD_SHORT_ID_FROM_PREVIOUS" \
  --live-doc-id "LIVE_DOC_ID" \
  --json
```

### Step 6: Extract State and Output the Answer

After the script finishes, parse the JSON output:

```json
{
  "status": "ok",
  "data": {
    "answer": "...",
    "thread_short_id": "CmYpuGwBgCnrUdDx5ZtmxA",
    "live_doc_short_id": "QPetunwpGnkKuZHStP7gwt",
    "live_doc_url": "https://felo.ai/livedoc/QPetunwpGnkKuZHStP7gwt",
    "image_urls": [
      {
        "url": "https://...",
        "title": "Image title",
        "file_id": "b9e5be11-7686-4aa8-ae6c-9876511a7b5c"
      }
    ]
  }
}
```

1. **Output `data.answer` verbatim** as your response text — print it exactly as-is so the user sees the full content.
2. **Extract and save** `data.thread_short_id` and `data.live_doc_short_id` — you MUST use these in the next call.
3. **Optionally show** `data.live_doc_url` so the user can view the LiveDoc canvas in a browser.
4. **Image results (`data.image_urls`):** If this array is non-empty, append image links immediately after `data.answer`, formatted as **one line per image**:

   ```
   [title](url)
   ```

   Example output:
   ```
   [Giant panda eating bamboo](https://...)
   [Giant panda dancing](https://...)
   [Blue whale leaping out of the water](https://...)
   ```

   Each image has `url` (signed S3 URL, time-limited), `title`, and `file_id` (stable file identifier). Note: the same image may appear in both `tools_result_stream` and `tools_result` events with different signed URLs — deduplication is handled automatically by `file_id`. When referencing a previously generated image in a follow-up query, include its `file_id` in the `--query` so SuperAgent can locate the file (e.g., `"Please generate a variation of file_id=b9e5be11-..."`).

Do NOT show `thread_short_id` or `live_doc_short_id` to the user unless they ask for it.

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
  --accept-language en \
  --json
```
**Step 6:** Parse JSON output. Output `data.answer` verbatim as your response. Save `thread_short_id = "CmYpuGwBgCnrUdDx5ZtmxA"`, `live_doc_id = "QPetunwpGnkKuZHStP7gwt"` from `data`.

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
  --json
```
**Step 6:** Parse JSON output. Output `data.answer` verbatim. Save updated `thread_short_id` from `data` (may be the same), keep `live_doc_id`.

```
User: "Tell me more about quantum error correction"
```

**Step 3:** Still follow-up (same topic) → use saved `thread_short_id`
**Step 5:** Same pattern as above with new query

### Example B: Tweet Writing with Style Selection

```
User: "Help me write a tweet about AI trends"
```

**Step 2a:** Already have `live_doc_id` → reuse
**Step 3:** New conversation
**Step 4:** User intent matches "write a tweet" → `--skill-id twitter-writer`
**Step 4.5:** Fetch TWITTER styles (pass `--accept-language` matching user's language):
```bash
node felo-superAgent/scripts/run_style_library.mjs --category TWITTER --accept-language en
```
Output:
```
Style name: My Bold Voice
Style labels: bold, provocative
Style DNA: # My Bold Voice Style DNA
...（full content）

Style name: darioamodei
Style labels: Thoughtful long-form essays
Style DNA: # Dario Amodei (@DarioAmodei) Tweet Writing Style DNA
...（full content）
```
Present to user: "Which writing style would you like? 1. My Bold Voice (yours) 2. darioamodei (recommended) 3. No preference"

User selects: "1. My Bold Voice"

**Step 5:**
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "Help me write a tweet about AI trends" \
  --live-doc-id "QPetunwpGnkKuZHStP7gwt" \
  --skill-id twitter-writer \
  --ext '{"brand_style_requirement":"Style name: My Bold Voice\nStyle labels: bold, provocative\nStyle DNA: # My Bold Voice Style DNA\n...（full content）"}' \
  --accept-language en \
  --json
```
**Step 6:** Parse JSON output. Output `data.answer` verbatim. Save new `thread_short_id` from `data`, keep same `live_doc_id`.

```
User: "Make it more casual and add some emojis"
```

**Step 3:** Follow-up → use saved `thread_short_id` (do NOT pass `--ext` again)
**Step 5:**
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "Make it more casual and add some emojis" \
  --thread-id "NEW_THREAD_FROM_TWEET" \
  --live-doc-id "QPetunwpGnkKuZHStP7gwt" \
  --json
```

### Example C: Logo Design with Style Selection

```
User: "Design a logo for my coffee shop called Bean & Brew"
```

**Step 4:** Detected "design a logo" → `--skill-id logo-and-branding`
**Step 4.5:** Fetch IMAGE styles:
```bash
node felo-superAgent/scripts/run_style_library.mjs --category IMAGE --accept-language en
```
Output example:
```
Style name: Minimalist Modern
Style labels: clean, monochrome
Style DNA: ...（full content）
Cover file ID: file_333
```
Present styles to user and wait for selection. Suppose user picks "Minimalist Modern":

**Step 5:**
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "Design a logo for my coffee shop called Bean & Brew" \
  --live-doc-id "QPetunwpGnkKuZHStP7gwt" \
  --skill-id logo-and-branding \
  --ext '{"brand_style_requirement":"Style name: Minimalist Modern\nStyle labels: clean, monochrome\nStyle DNA: ...（full content）\nCover file ID: file_333"}' \
  --accept-language en \
  --json
```

### Example D: E-commerce Product Image with Style Selection

```
User: "Generate a product image for a wireless headphone on white background"
```

**Step 4:** Detected "product image" → `--skill-id ecommerce-product-image`
**Step 4.5:** Fetch IMAGE styles:
```bash
node felo-superAgent/scripts/run_style_library.mjs --category IMAGE --accept-language en
```
Present styles to user. Suppose user picks "No preference":

**Step 5:** (no `--ext` since user chose no preference)
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "Generate a product image for a wireless headphone on white background" \
  --live-doc-id "QPetunwpGnkKuZHStP7gwt" \
  --skill-id ecommerce-product-image \
  --accept-language en \
  --json
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

### Example F: User Specifies Style Directly

```
User: "Write a tweet about AI trends using the 'darioamodei' style"
```

**Step 4:** `--skill-id twitter-writer`
**Step 4.5a:** User already named the style → fetch the list to get the full block:
```bash
node felo-superAgent/scripts/run_style_library.mjs --category TWITTER --accept-language en
```
Find the entry with `Style name: darioamodei`, extract its full block verbatim. No need to ask the user again.

**Step 5:**
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "Write a tweet about AI trends" \
  --live-doc-id "QPetunwpGnkKuZHStP7gwt" \
  --skill-id twitter-writer \
  --ext '{"brand_style_requirement":"Style name: darioamodei\nStyle labels: Thoughtful long-form essays\nStyle DNA: # Dario Amodei (@DarioAmodei) Tweet Writing Style DNA\n\n## Style Overview\nDario writes like a serious intellectual...（full content, do NOT truncate）"}' \
  --accept-language en \
  --json
```

## Available Script Options

**Core parameters:**
- `--query <text>` (REQUIRED) — User question, 1-2000 characters
- `--live-doc-id <id>` (REQUIRED for new conversations) — LiveDoc ID (`live_doc_id`) to associate with
- `--thread-id <id>` — Thread ID from previous response, for follow-up conversations

**Skill parameters (new conversations only, ignored in follow-up):**
- `--skill-id <id>` — Skill ID (see Constraint #9 for available skill IDs)
- `--selected-resource-ids <ids>` — Comma-separated resource IDs to include
- `--ext <json>` — Extra parameters as JSON object. For skill-based conversations, pass brand style as:
  `--ext '{"brand_style_requirement":"Style name: <name>\nStyle labels: <labels>\nStyle DNA: <full styleDna text>\nCover file ID: <id>"}'`
  Fields present depend on category type. `Cover file ID` is omitted when null. Do NOT truncate `Style DNA`.

**Output control:**
- `--json` / `-j` — Output JSON format with full metadata (ALWAYS use this in Claude Code — stdout is captured by the Bash tool, not streamed to the user)
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

- The SSE stream has its own idle timeout: 2 hours (no data received). The stream stays open as long as data keeps flowing.
- **Bash tool timeout:** MUST be set to at least 600000ms (10 minutes) when executing the script, because the SSE stream can run for a long time.

## Important Notes

- Execute this skill immediately using the Bash tool — do not just describe what you would do
- **ALWAYS use `--json`** — in Claude Code's Bash tool, stdout is captured, not streamed. JSON mode returns the answer in a structured response that Claude outputs as text
- **ALWAYS output `data.answer` verbatim** — print it exactly as-is as your response text so the user sees the full content
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
   NO  --> Step 2b: fetch list --> got is_shared=false item?
              YES --> use data.items.find(i => !i.is_shared)?.short_id as live_doc_id
              NO  --> Step 2c: create new LiveDoc
   YES --> continue (reuse it, do NOT fetch list)
        |
        v
Have thread_short_id from previous call?
   NO  --> This is a NEW conversation
              --> Step 4: determine skill-id by analyzing user intent
              --> skill-id found (twitter-writer / logo-and-branding / ecommerce-product-image)?
                    YES --> Step 4.5: fetch style library for matching category
                              --> styles available?
                                    YES --> present to user, wait for selection
                                              --> user picked a style?
                                                    YES --> build --ext '{"brand_style_requirement":"..."}'
                                                    NO  --> no --ext
                                    NO  --> no --ext
                    NO  --> no --ext, no --skill-id
              --> Step 5: run WITHOUT --thread-id (with --skill-id and --ext if determined above)
   YES --> Does user's intent require a skill-id not matching current thread?
              YES --> NEW conversation (same live-doc-id, with --skill-id, repeat Step 4.5)
              NO  --> Is user explicitly starting a new topic?
                        YES --> NEW conversation (same live-doc-id, no --thread-id)
                        NO  --> FOLLOW-UP (pass --thread-id, NO --ext)
        |
        v
Run script (WITH --json, Bash timeout >= 600000ms) --> parse JSON, output data.answer verbatim
        |
        v
Extract thread_short_id + live_doc_id from stderr [state] line
        |
        v
Do NOT repeat or summarize the answer (already shown)
```

## Style Library Script (`run_style_library.mjs`)

Fetch the style library list for a given category. Returns user styles first, then recommended styles.

```bash
node felo-superAgent/scripts/run_style_library.mjs --category TWITTER --accept-language en
```

**Options:**
- `--category <category>` (REQUIRED) — One of: `TWITTER`, `INSTAGRAM`, `LEMON8`, `NOTECOM`, `WEBSITE`, `IMAGE`
- `--accept-language <lang>` — Language for labels/tags (e.g. `en`, `zh-Hans`, `ja`). Default: `en`. Always pass this to match the user's language.
- `--json` / `-j` — Output raw JSON
- `--timeout <seconds>` — Request timeout (default 60)

**Default text output format (one block per style, blank line between):**

For TWITTER category:
```
Style name: darioamodei
Style labels: Thoughtful long-form essays
Style DNA: # Dario Amodei (@DarioAmodei) Tweet Writing Style DNA
...（full styleDna content）
```

Fields included per entry (fields with null/empty values are omitted):
- `Style name` — always present (`name` field)
- `Style labels` — from `content.labels` (TWITTER) or `content.tags` (other categories), in the requested language, comma-separated; omitted if not present
- `Style DNA` — from `content.styleDna` (TWITTER type); omitted if not present
- `Cover file ID` — from `coverFileId`; omitted if null/empty

User-created styles appear before recommended styles.

## References

- [SuperAgent API (Felo Open Platform)](https://openapi.felo.ai/docs/api-reference/v2/superagent.html)
- [Felo Open Platform](https://openapi.felo.ai/docs/)
- [Get API Key](https://felo.ai) (Settings -> API Keys)

