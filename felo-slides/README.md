# Felo Slides Skill for Claude Code

Generate presentation slides with the Felo PPT Task API (asynchronous workflow).

## Features

- Generate a PPT deck from a single prompt
- Poll task status automatically until completion/failure/timeout
- Return `live_doc_url` immediately when the task is completed
- Return `task_id` for follow-up tracking

## Quick Start

### 1) Install the skill

```bash
npx @claude/skills add felo-slides
```

Or install manually from this repository:

```bash
# Linux/macOS
cp -r felo-slides ~/.claude/skills/

# Windows (PowerShell)
Copy-Item -Recurse felo-slides "$env:USERPROFILE\.claude\skills\"
```

### 2) Configure API key

Create an API key at [felo.ai](https://felo.ai) -> Settings -> API Keys, then set:

```bash
# Linux/macOS
export FELO_API_KEY="your-api-key-here"
```

```powershell
# Windows PowerShell
$env:FELO_API_KEY="your-api-key-here"
```

### 3) Trigger the skill

- Intent trigger: "Create a 10-slide product pitch deck"
- Explicit trigger: `/felo-slides your topic`

## API Workflow

Based on Felo v2 PPT Task API:

1. Create task: `POST /v2/ppts`
2. Query status (optional): `GET /v2/tasks/{task_id}/status`
3. Query historical/result: `GET /v2/tasks/{task_id}/historical`

The skill polls every 10 seconds (max wait 600 seconds). It stops immediately on `COMPLETED`/`SUCCESS` and returns `live_doc_url`.

Internal script example:

```bash
node felo-slides/scripts/run_ppt_task.mjs --query "Felo product intro, 3 slides" --interval 10 --max-wait 600
```

## Troubleshooting

### `FELO_API_KEY` is missing

Set the environment variable and restart the Claude Code session.

### `INVALID_API_KEY`

The key is invalid or revoked. Generate a new key from [felo.ai](https://felo.ai).

### Task keeps running for too long

The task may still be processing. Retry later with the same context, or run the script with `--verbose`.

### Task completed but no `live_doc_url`

Use the returned `task_id` to query historical endpoint again.

## Links

- [PPT Task API](https://openapi.felo.ai/docs/api-reference/v2/ppt-tasks.html)
- [Felo Open Platform](https://openapi.felo.ai/docs/)
- [Get API Key](https://felo.ai)
