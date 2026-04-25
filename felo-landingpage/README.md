# Felo Landing Page Skill for Claude Code

Generate landing pages with the Felo Landing Page Task API (asynchronous workflow).

## Features

- Generate a hosted landing page/webpage from a single prompt
- Poll task history automatically until completion/failure/timeout
- Return `ai_page_html` when the task is completed
- Return `task_id` for follow-up tracking or resume

## Quick Start

### 1) Install the skill

**One-command install (recommended):**

```bash
npx skills add Felo-Inc/felo-skills --skill felo-landingpage
```

**Manual install:** copy this folder to your skills directory:

```bash
# Linux/macOS
cp -r felo-landingpage ~/.claude/skills/

# Windows (PowerShell)
Copy-Item -Recurse felo-landingpage "$env:USERPROFILE\.claude\skills\"
```

(Clone the repo first if needed: `git clone https://github.com/Felo-Inc/felo-skills.git`.)

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

- Intent trigger: "Create a SaaS landing page for an AI meeting assistant"
- Explicit trigger: `/felo-landingpage your topic`

## Open API Workflow

Based on Felo v2 Landing Page Task API:

1. Create task: `POST /v2/landing_page`
2. Query historical/result: `GET /v2/tasks/{task_id}/historical`
3. Read `ai_page_html` from the completed historical response

Authentication uses the user's Felo API key:

```http
Authorization: Bearer <user_api_key>
```

The skill polls every 10 seconds (max wait 1800 seconds). It stops immediately on `COMPLETED`/`SUCCESS` and returns `ai_page_html`.

Script example:

```bash
node felo-landingpage/scripts/run_landingpage_task.mjs \
  --query "Generate a landing page for a modern AI notes app. In all cases, generate the webpage directly and do not ask any follow-up questions." \
  --interval 10 \
  --max-wait 1800
```

Resume an existing task:

```bash
node felo-landingpage/scripts/run_landingpage_task.mjs --task-id "TASK_ID_HERE"
```

## Troubleshooting

### `FELO_API_KEY` is missing

Set the environment variable and restart the Claude Code session.

### `INVALID_API_KEY`

The key is invalid or revoked. Generate a new key from [felo.ai](https://felo.ai).

### Task keeps running for too long

The task may still be processing. Retry later with the same `task_id`, or run the script with `--verbose`.

### Task completed but no `ai_page_html`

Use the returned `task_id` to query the historical endpoint again. If it still has no `ai_page_html`, report the task ID.

## Links

- [Felo Open Platform](https://openapi.felo.ai/docs/)
- [Get API Key](https://felo.ai)
