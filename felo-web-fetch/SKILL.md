---
name: felo-web-fetch
description: "Extract webpage content with Felo Web Extract API. Use for turning URLs into html/markdown/text, selecting specific page areas with CSS selectors, and controlling extraction options like crawl mode, cookies, user-agent, and timeout."
---

# Felo Web Fetch Skill

## When to Use

Trigger this skill when users want to extract or convert webpage content from a URL:

- Extract article/page content from a given URL
- Convert webpage content to `html`, `markdown`, or `text`
- Extract specific blocks using CSS selector
- Tune extraction behavior with crawl mode (`fast`/`fine`)
- Pass request details such as cookies, user-agent, timeout

Explicit commands:
- `/felo-web-fetch`
- "use felo web fetch"
- "extract this URL with felo"

Do NOT use this skill for:
- Real-time Q&A search summaries (use `felo-search`)
- Slide generation tasks (use `felo-slides`)
- Local file parsing in current workspace

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

Use Bash tool commands and this workflow.

### Step 1: Check API key

```bash
if [ -z "$FELO_API_KEY" ]; then
  echo "ERROR: FELO_API_KEY not set"
  exit 1
fi
```

If key is missing, stop and return setup instructions.

### Step 2: Run extractor script

Use the bundled Node script:

```bash
node felo-web-fetch/scripts/run_web_fetch.mjs \
  --url "https://example.com/article" \
  --output-format markdown \
  --crawl-mode fine \
  --timeout 60
```

Required parameter:
- `--url`

Core optional parameters:
- `--output-format html|markdown|text`
- `--crawl-mode fast|fine`
- `--target-selector "article.main-content"`
- `--wait-for-selector ".content-ready"`

Other key optional parameters:
- `--cookie "session_id=xxx"` (repeatable)
- `--set-cookies-json '[{"name":"sid","value":"xxx","domain":"example.com"}]'`
- `--user-agent "Mozilla/5.0 ..."`
- `--timeout 60` (HTTP request timeout in seconds)
- `--request-timeout-ms 15000` (API payload `timeout` in ms)
- `--with-readability true`
- `--with-links-summary true`
- `--with-images-summary true`
- `--with-images-readability true`
- `--with-images true`
- `--with-links true`
- `--ignore-empty-text-image true`
- `--with-cache false`
- `--with-stypes true`

Need full response JSON:

```bash
node felo-web-fetch/scripts/run_web_fetch.mjs \
  --url "https://example.com" \
  --output-format text \
  --json
```

### Step 3: Return result

- Default output is extracted content only.
- If response content is not a string, script prints JSON.
- Use `--json` when user needs metadata and full response object.

## Output Format

For normal extraction requests, return:

```markdown
## Web Fetch Result
- URL: <url>
- Output Format: <html|markdown|text>
- Crawl Mode: <fast|fine>

## Content
<extracted content>
```

For API/debug requests, return:

~~~markdown
## Web Fetch Result (JSON)

```json
<full response>
```
~~~

## Error Handling

Known error cases:
- Missing API key -> `FELO_API_KEY not set`
- `INVALID_API_KEY` -> key invalid/revoked
- Invalid parameters -> `HTTP 400`
- Upstream extract failure -> `WEB_EXTRACT_FAILED` (`HTTP 500/502`)

Error response format:

```markdown
## Web Fetch Failed
- Message: <error message>
- Suggested Action: verify URL/parameters and retry
```

## Important Notes

- Always require URL before running.
- Validate enum values:
  - `output_format`: `html`, `markdown`, `text`
  - `crawl_mode`: `fast`, `fine`
- Use `--target-selector` when users only want a specific part of the page.
- Use `--request-timeout-ms` for page rendering/extraction wait, and `--timeout` for local HTTP timeout.

## References

- [Web Extract API](https://openapi.felo.ai/docs/api-reference/v2/web-extract.html)
- [Felo Open Platform](https://openapi.felo.ai/docs/)
