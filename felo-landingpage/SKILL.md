---
name: felo-landingpage
description: "Generate landing pages/webpages with the Felo Landing Page Task API in Claude Code. Use when users ask to create/make/generate a landing page, marketing page, single-page website, AI webpage, HTML page result, or when explicit commands like /felo-landingpage are used. Handles API key check, task creation, polling shared task history, and final ai_page_html output."
---

# Felo Landing Page Skill

## When to Use

Trigger this skill for requests about creating generated webpages:

- Create/generate a landing page from a topic, product, feature, or campaign brief
- Turn a marketing description into a shareable single-page website
- Build an AI webpage and return the final hosted HTML result URL
- Generate a web page directly without follow-up questions when the user asks for immediate output

Trigger keywords:

- Chinese prompts about landing pages or webpages: 着陆页, 落地页, 官网页, 单页网站, 网页, HTML 页面
- English: landing page, marketing page, single-page website, webpage, AI page, HTML page
- Explicit commands: `/felo-landingpage`, "use felo landing page"

Do NOT use this skill for:

- Presentation/PPT generation (use `felo-slides`)
- Mindmap generation (use `felo-mindmap`)
- Real-time information lookup only (use `felo-search`)
- Editing local website source files unless the user explicitly asks for local code changes

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

If the key is missing, stop and return setup instructions.

### Step 2: Run Node Script (create + poll)

Use the bundled script (no `jq` dependency):

```bash
node felo-landingpage/scripts/run_landingpage_task.mjs \
  --query "USER_PROMPT_HERE" \
  --interval 10 \
  --max-wait 1800 \
  --timeout 60
```

For best results, include a direct-generation instruction in the query when the user has not provided one:

```text
In all cases, generate the webpage directly and do not ask any follow-up questions.
```

To resume polling an existing task without creating a duplicate landing page:

```bash
node felo-landingpage/scripts/run_landingpage_task.mjs \
  --task-id "TASK_ID_HERE" \
  --interval 10 \
  --max-wait 1800
```

Script behavior:

- Creates task via `POST https://openapi.felo.ai/v2/landing_page`
- Polls via `GET https://openapi.felo.ai/v2/tasks/{task_id}/historical`
- Treats `COMPLETED`/`SUCCESS` as success terminal (case-insensitive)
- Treats `FAILED`/`ERROR`/`EXPIRED`/`CANCELED`/`CANCELLED` as failure terminal
- Stops polling immediately on terminal status
- Prints `ai_page_html` on success
- Keeps `ppt_biz_id` and `ppt_url` in JSON output because the historical response currently reuses the PPT history structure

Optional debug output:

```bash
node felo-landingpage/scripts/run_landingpage_task.mjs \
  --query "USER_PROMPT_HERE" \
  --interval 10 \
  --max-wait 1800 \
  --json \
  --verbose
```

This outputs structured JSON including:

- `task_id`
- `task_status`
- `ai_page_html`
- `ppt_biz_id`
- `ppt_url`
- `error_message`

### Step 3: Return structured result

On success, return:

- `ai_page_html` immediately (script default output)
- if `--json` is used, also include `task_id`, terminal status, and optional metadata

## Output Format

Use this response structure:

```markdown
## Landing Page Generation Result

- Task ID: <task_id>
- Status: <status>
- HTML URL: <ai_page_html>
- PPT Biz ID: <ppt_biz_id or N/A>
- PPT URL: <ppt_url or N/A>
```

Error format:

```markdown
## Landing Page Generation Failed

- Error Type: <error code or category>
- Message: <readable message>
- Suggested Action: <next step>
```

## Open API Workflow

Use only the public Open API endpoints:

1. Create task: `POST /v2/landing_page`
2. Read `data.task_id`
3. Poll result: `GET /v2/tasks/{task_id}/historical`
4. Continue polling while `task_status == RUNNING` or another non-terminal status
5. When `task_status == COMPLETED`, use `data.ai_page_html` as the final webpage result URL

Authentication uses the user's Felo API key:

```http
Authorization: Bearer <user_api_key>
```

Historical lookup currently reuses the shared task history shape, so `ppt_biz_id` and `ppt_url` may still appear alongside `ai_page_html`.

## Error Handling

Known/expected failures:

- `INVALID_API_KEY` or HTTP 401: key invalid or revoked
- Create task response missing `task_id`: API shape changed or task creation failed
- Completed task missing `ai_page_html`: query history again with `--task-id`, or report the task ID
- Timeout reached: return last known status and the `task_id` so the user can resume later

Timeout handling:

- If timeout is reached, return the last known status and instruct the user to retry later
- Include `task_id` so the user can query again
- To resume a timed-out task, use `--task-id` instead of `--query` to avoid creating a duplicate landing page

## Important Notes

- Always execute this skill when user intent is landing page or generated webpage creation.
- Always return `task_id` so follow-up queries can continue from the same task.
- Do not claim completion without a terminal status.
- Use `ai_page_html` as the final result; `ppt_url` is legacy/shared history metadata, not the landing page output.
- Keep API calls minimal: create once, then poll.

## References

- [Felo Open Platform](https://openapi.felo.ai/docs/)
