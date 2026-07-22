# Felo Slides Skill for Claude Code

Generate presentation slides with the Felo PPT Task API (asynchronous workflow).

## Features

- Generate a PPT deck from a single prompt
- Generate a PPT from a local image, PDF, or document
- Preserve an uploaded image as source material for the generated slides
- Poll task status automatically until completion/failure/timeout
- Return `ppt_url` immediately when the task is completed (fallback to `live_doc_url`)
- Return `task_id` for follow-up tracking

## Quick Start

### 1) Install the skill

**一键安装（推荐）：**

```bash
npx skills add Felo-Inc/felo-skills --skill felo-slides
```

**手动安装：** 若上述命令不可用，从本仓库复制到 Claude Code 的 skills 目录：

```bash
# Linux/macOS
cp -r felo-slides ~/.claude/skills/

# Windows (PowerShell)
Copy-Item -Recurse felo-slides "$env:USERPROFILE\.claude\skills\"
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

- Intent trigger: "Create a 10-slide product pitch deck"
- Explicit trigger: `/felo-slides your topic`

## API Workflow

Based on Felo v2 PPT Task API:

1. Create task: `POST /v2/ppts`
2. Query status (optional): `GET /v2/tasks/{task_id}/status`
3. Query historical/result: `GET /v2/tasks/{task_id}/historical`

The skill polls every 10 seconds (max wait 1800 seconds). It stops immediately on `COMPLETED`/`SUCCESS` and returns `ppt_url` (fallback `live_doc_url`).

Internal script example:

```bash
node felo-slides/scripts/run_ppt_task.mjs --query "Felo product intro, 3 slides" --interval 10 --max-wait 1800
```

Upload a local file or image as PPT context:

```bash
node felo-slides/scripts/run_ppt_task.mjs \
  --query "Create exactly 2 slides and place the original image directly in the PPT" \
  --file "/absolute/path/to/source.jpg" \
  --interval 10 \
  --max-wait 1800
```

The npm CLI supports the same workflow:

```bash
felo slides "Create 2 slides from this image" --file "/absolute/path/to/source.jpg"
```

## Troubleshooting

### `FELO_API_KEY` is missing

Set the environment variable and restart the Claude Code session.

### `INVALID_API_KEY`

The key is invalid or revoked. Generate a new key from [felo.ai](https://felo.ai).

### Task keeps running for too long

The task may still be processing. Retry later with the same context, or run the script with `--verbose`.

### Task completed but no `ppt_url` / `live_doc_url`

Use the returned `task_id` to query historical endpoint again.

## Links

- [PPT Task API](https://openapi.felo.ai/docs/api-reference/ppt-tasks)
- [Felo Open Platform](https://openapi.felo.ai/docs/)
- [Get API Key](https://felo.ai)
