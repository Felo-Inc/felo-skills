---
name: felo-slides
description: "Generate PPT/slides with Felo PPT Task API in Claude Code. Use when users ask to create/make/generate/export presentations or slide decks, or when explicit commands like /felo-slides are used. Handles API key check, task creation, polling, and final ppt_url output."
---

# Felo Slides Skill

## When to Use

Trigger this skill for requests about creating presentation files:

- Create/generate slides from a topic or outline
- Turn notes into a PPT deck
- Build a presentation with a page count requirement
- Export presentation content into a shareable slide link

Trigger keywords:

- Chinese prompts about making slides or presentations
- English: slides, PPT, presentation deck, generate presentation
- Explicit commands: `/felo-slides`, "use felo slides"

Do NOT use this skill for:

- Real-time information lookup (use `felo-search`)
- Questions about local codebase files
- Pure text tasks that do not require slide generation

## Setup

### 1. Get API key

1. Visit [felo.ai](https://felo.ai)
2. Open Settings -> API Keys
3. Create and copy your API key

### 2. Configure environment variable

Linux/macOS:

```bash
export FELO_API_KEY="your-api-key-here"
```

Windows PowerShell:

```powershell
$env:FELO_API_KEY="your-api-key-here"
```

## How to Execute

Use Bash tool commands and follow this workflow exactly.

### Step 1: Precheck API key

```bash
if [ -z "$FELO_API_KEY" ]; then
  echo "ERROR: FELO_API_KEY not set"
  exit 1
fi
```

If key is missing, stop and return setup instructions.

### Step 2: Run Node Script (create + poll)

Use the bundled script (no `jq` dependency):

```bash
node felo-slides/scripts/run_ppt_task.mjs \
  --query "USER_PROMPT_HERE" \
  --interval 10 \
  --max-wait 1800 \
  --timeout 60
```

To apply a specific theme, first list available themes with `felo ppt-themes`, then pass the theme ID:

```bash
node felo-slides/scripts/run_ppt_task.mjs \
  --query "USER_PROMPT_HERE" \
  --theme "THEME_ID_HERE" \
  --interval 10 \
  --max-wait 1800 \
  --timeout 60
```

Script behavior:

- Creates task via `POST https://openapi.felo.ai/v2/ppts`
- Supports optional `--theme <id>` to apply a PPT theme (sends `ppt_config.ai_theme_id`)
- Supports optional `--livedoc-id <id>` to reuse an existing LiveDoc instead of auto-creating a new one
- Supports optional `--task-id <id>` to resume polling an existing task (skips creation)
- Polls via `GET https://openapi.felo.ai/v2/tasks/{task_id}/historical`
- Treats `COMPLETED`/`SUCCESS` as success terminal (case-insensitive)
- Treats `FAILED`/`ERROR` as failure terminal
- Stops polling immediately on terminal status
- Prints `ppt_url` on success (fallback: `live_doc_url`)

Optional debug output:

```bash
node felo-slides/scripts/run_ppt_task.mjs \
  --query "USER_PROMPT_HERE" \
  --interval 10 \
  --max-wait 1800 \
  --json \
  --verbose
```

This outputs structured JSON including:

- `task_id`
- `task_status`
- `ppt_url`
- `live_doc_url`
- `livedoc_short_id`
- `ppt_business_id`
- `error_message`

### Step 3: Confirm terminal status

The script polls the historical endpoint automatically. Wait for it to exit
before responding:

- Success: terminal status is `COMPLETED` or `SUCCESS`, and the script prints
  `ppt_url` (fallback: `live_doc_url`)
- Failure: terminal status is `FAILED` or `ERROR`; return the error format below
- Timeout: include the `task_id` and tell the user to resume with `--task-id`
  instead of creating a duplicate PPT task

### Step 4: Return structured result

On success, return:

- `ppt_url` immediately (script default output, fallback `live_doc_url`)
- if `--json` is used, also include `task_id`, terminal status, and optional metadata

## Output Format

Use this response structure:

```markdown
## PPT Generation Result

- Task ID: <task_id>
- Status: <status>
- PPT URL: <ppt_url>
- Live Doc URL: <live_doc_url or N/A>

## Notes

- livedoc_short_id: <value or N/A>
- ppt_business_id: <value or N/A>
```

Error format:

```markdown
## PPT Generation Failed

- Error Type: <error code or category>
- Message: <readable message>
- Suggested Action: <next step>
```

## Error Handling

Known API error codes:

- `INVALID_API_KEY` (401): key invalid or revoked
- `PPT_TASK_CREATE_FAILED` (502): create task downstream failed
- `PPT_TASK_QUERY_FAILED` (502): query task downstream failed

Timeout handling:

- If timeout reached, return last known status and instruct user to retry later
- Include `task_id` so user can query again
- **IMPORTANT**: To resume a timed-out task, use `--task-id` instead of `--query` to avoid creating a duplicate PPT:

```bash
node felo-slides/scripts/run_ppt_task.mjs \
  --task-id "TASK_ID_HERE" \
  --interval 10 \
  --max-wait 1800
```

## Important Notes

- Always execute this skill when user intent is slide generation.
- Always return `task_id` so follow-up queries can continue from the same task.
- Do not claim completion without a terminal status.
- Keep API calls minimal: create once, then poll.

## References

- [Felo PPT Task API](https://openapi.felo.ai/docs/api-reference/v2/ppt-tasks.html)
- [Felo Open Platform](https://openapi.felo.ai/docs/)
