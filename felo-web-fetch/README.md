# Felo Web Fetch Skill for Claude Code

Extract structured webpage content from URLs with the Felo Web Extract API.

## Features

- URL content extraction (required)
- Output format: `html`, `markdown`, `text`
- Crawl mode: `fast`, `fine`
- CSS selector extraction (`target_selector`)
- Advanced options: cookies, user-agent, timeout, readability and link/image summary flags

## Quick Start

### 1) Install the skill

```bash
npx @claude/skills add felo-web-fetch
```

Or install manually from this repository:

```bash
# Linux/macOS
cp -r felo-web-fetch ~/.claude/skills/

# Windows (PowerShell)
Copy-Item -Recurse felo-web-fetch "$env:USERPROFILE\.claude\skills\"
```

### 2) Configure API key

Create API key at [felo.ai](https://felo.ai) -> Settings -> API Keys, then set:

```bash
# Linux/macOS
export FELO_API_KEY="your-api-key-here"
```

```powershell
# Windows PowerShell
$env:FELO_API_KEY="your-api-key-here"
```

### 3) Trigger the skill

- Intent trigger: "Extract this article as markdown"
- Explicit trigger: `/felo-web-fetch https://example.com/article`

## Script Usage

The skill uses:

```bash
node felo-web-fetch/scripts/run_web_fetch.mjs --url "https://example.com"
```

Common examples:

```bash
node felo-web-fetch/scripts/run_web_fetch.mjs \
  --url "https://example.com/post" \
  --output-format markdown \
  --crawl-mode fine
```

```bash
node felo-web-fetch/scripts/run_web_fetch.mjs \
  --url "https://example.com" \
  --target-selector "article.main" \
  --output-format text \
  --user-agent "Mozilla/5.0" \
  --request-timeout-ms 20000
```

```bash
node felo-web-fetch/scripts/run_web_fetch.mjs \
  --url "https://example.com/private" \
  --cookie "session_id=abc123" \
  --with-readability true \
  --json
```

## Error Handling

- Missing key: `FELO_API_KEY not set`
- Invalid key: `INVALID_API_KEY`
- Invalid params / URL: `HTTP 400`
- Upstream extraction failure: `WEB_EXTRACT_FAILED` (`HTTP 500/502`)

## Links

- [Web Extract API](https://openapi.felo.ai/docs/api-reference/v2/web-extract.html)
- [Felo Open Platform](https://openapi.felo.ai/docs/)
- [Get API Key](https://felo.ai)
