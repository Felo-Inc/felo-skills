---
name: felo-mindmap
description: "Generate mindmaps with Felo Mindmap API in Claude Code. Use when users ask to create/make/generate mindmaps, mind maps, or thinking maps, or when explicit commands like /felo-mindmap are used. Handles API key check, mindmap creation with various layouts, and final mindmap_url output."
---

# Felo Mindmap Skill

## When to Use

Trigger this skill for requests about creating mindmap files:

- Create/generate mindmaps from a topic or question
- Turn ideas into a structured mindmap
- Build a mindmap with different layout types (timeline, fishbone, etc.)
- Export mindmap content into a shareable link

Trigger keywords:

- Chinese prompts about making mindmaps (思维导图, 脑图)
- English: mindmap, mind map, thinking map, generate mindmap
- Explicit commands: `/felo-mindmap`, "use felo mindmap"

Do NOT use this skill for:

- Real-time information lookup (use `felo-search`)
- Questions about local codebase files
- Pure text tasks that do not require mindmap generation

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

### Step 2: Run Node Script

Use the bundled script:

```bash
node felo-mindmap/scripts/run_mindmap_task.mjs \
  --query "USER_PROMPT_HERE" \
  --timeout 60
```

To specify a layout type:

```bash
node felo-mindmap/scripts/run_mindmap_task.mjs \
  --query "USER_PROMPT_HERE" \
  --layout "TIMELINE" \
  --timeout 60
```

Available layout types:
- `MIND_MAP` (default) - Classic mind map
- `LOGICAL_STRUCTURE` - Logical structure diagram
- `ORGANIZATION_STRUCTURE` - Organization chart
- `CATALOG_ORGANIZATION` - Catalog organization chart
- `TIMELINE` - Timeline diagram
- `FISHBONE` - Fishbone diagram

To add mindmap to an existing LiveDoc:

```bash
node felo-mindmap/scripts/run_mindmap_task.mjs \
  --query "USER_PROMPT_HERE" \
  --livedoc-short-id "EXISTING_LIVEDOC_ID"
```

Script behavior:

- Creates mindmap via `POST https://openapi.felo.ai/v2/mindmap`
- Returns immediately (synchronous API, no polling needed)
- Prints `mindmap_url` on success

Optional debug output:

```bash
node felo-mindmap/scripts/run_mindmap_task.mjs \
  --query "USER_PROMPT_HERE" \
  --json
```

This outputs structured JSON including:

- `resource_id`
- `status`
- `mindmap_url`
- `livedoc_short_id`

### Step 3: Return structured result

On success, return:

- `mindmap_url` immediately
- if `--json` is used, also include `resource_id`, `livedoc_short_id`

## Output Format

Use this response structure:

```markdown
## Mindmap Generation Result

- Resource ID: <resource_id>
- Status: <status>
- Mindmap URL: <mindmap_url>
- LiveDoc Short ID: <livedoc_short_id>
```

Error format:

```markdown
## Mindmap Generation Failed

- Error Type: <error code or category>
- Message: <readable message>
- Suggested Action: <next step>
```

## Error Handling

Known API error codes:

- `INVALID_API_KEY` (401): key invalid or revoked
- `MINDMAP_CREATE_FAILED` (502): mindmap creation failed
- `LIVEDOC_CREATE_FAILED` (502): failed to create LiveDoc
- `LIVEDOC_NOT_FOUND` (404): specified LiveDoc not found
- `LLM_SERVICE_UNAVAILABLE` (503): LLM service is unavailable
- `LLM_REQUEST_TIMEOUT` (504): LLM request timed out

## Important Notes

- Always execute this skill when user intent is mindmap generation.
- The API is synchronous - no polling required.
- Keep API calls minimal: one request per mindmap.

## References

- [Felo Mindmap API](https://openapi.felo.ai/docs/api-reference/v2/mindmap.html)
- [Felo Open Platform](https://openapi.felo.ai/docs/)