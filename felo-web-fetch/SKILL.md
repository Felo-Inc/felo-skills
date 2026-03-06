---
name: felo-web-fetch
description: "Fetch web page content from a URL using Felo Web Extract API. Use when users ask to scrape/capture/fetch webpage content, get article text from URL, convert page to markdown/text, or when explicit commands like /felo-web-fetch are used. Supports html, text, markdown output and readability mode."
---

# Felo Web Fetch Skill

## When to Use

Trigger this skill when the user wants to:

- Fetch or scrape content from a webpage URL
- Get article/main text from a link
- Convert a webpage to Markdown or plain text
- Capture readable content from a URL for summarization or processing

Trigger keywords (examples):

- fetch webpage, scrape URL, fetch page content, web fetch, url to markdown
- Explicit: `/felo-web-fetch`, "use felo web fetch"
- Same intent in other languages (e.g. 网页抓取, 提取网页内容) also triggers this skill

Do NOT use for:

- Real-time search or Q&A (use `felo-search`)
- Generating slides (use `felo-slides`)
- Local file content (read files directly)

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

### Option A: Use the bundled script or packaged CLI

**Script** (from repo):

```bash
node felo-web-fetch/scripts/run_web_fetch.mjs --url "https://example.com/article" [options]
```

**Packaged CLI** (after `npm install -g felo-ai`): same options, with short forms allowed:

```bash
felo web-fetch -u "https://example.com" [options]
# Short forms: -u (url), -f (format), -t (timeout, seconds), -j (json)
```

Options:

| Option | Default | Description |
|--------|---------|-------------|
| `--url` | (required) | Webpage URL to fetch |
| `--format` | markdown | Output format: `html`, `text`, `markdown` |
| `--target-selector` | - | CSS selector: fetch only this element (e.g. `article.main`, `#content`) |
| `--wait-for-selector` | - | Wait for this selector before fetching (e.g. dynamic content) |
| `--readability` | false | Enable readability processing (main content only) |
| `--crawl-mode` | fast | `fast` or `fine` |
| `--timeout` | 60000 (script) / 60 (CLI) | Request timeout: script uses **milliseconds**, CLI uses **seconds** (e.g. `-t 90`) |
| `--json` / `-j` | false | Print full API response as JSON |

### How to write instructions (target_selector + output_format)

When the user wants a **specific part** of the page or a **specific output format**, phrase the command like this:

- **Output format**: "Fetch as **text**" / "Get **markdown**" / "Return **html**" → use `--format text`, `--format markdown`, or `--format html`.
- **Target one element**: "Only the **main article**" / "Just the **content inside** `#main`" / "Fetch only **article.main-content**" → use `--target-selector "article.main"` or the selector they give (e.g. `#main`, `.main-content`, `article .post`).

Examples of user intents and equivalent commands:

| User intent | Command |
|-------------|---------|
| "Fetch this page as plain text" | `--url "..." --format text` |
| "Get only the main content area" | `--url "..." --target-selector "main"` or `article` |
| "Fetch the div with id=content as markdown" | `--url "..." --target-selector "#content" --format markdown` |
| "Just the article body, as HTML" | `--url "..." --target-selector "article .body" --format html` |

Examples:

```bash
# Basic: fetch as Markdown
node felo-web-fetch/scripts/run_web_fetch.mjs --url "https://example.com"

# Article-style with readability
node felo-web-fetch/scripts/run_web_fetch.mjs --url "https://example.com/article" --readability --format markdown

# Raw HTML
node felo-web-fetch/scripts/run_web_fetch.mjs --url "https://example.com" --format html --json

# Only the element matching a CSS selector (e.g. main article)
node felo-web-fetch/scripts/run_web_fetch.mjs --url "https://example.com" --target-selector "article.main" --format markdown

# Specific output format + target selector
node felo-web-fetch/scripts/run_web_fetch.mjs --url "https://example.com" --target-selector "#content" --format text
```

### Option B: Call API with curl

```bash
curl -X POST "https://openapi.felo.ai/v2/web/extract" \
  -H "Authorization: Bearer $FELO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "output_format": "markdown", "with_readability": true}'
```

## API Reference (summary)

- **Endpoint**: `POST /v2/web/extract`
- **Base URL**: `https://openapi.felo.ai`. Override with `FELO_API_BASE` env if needed.
- **Auth**: `Authorization: Bearer YOUR_API_KEY`

### Request body (JSON)

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| url | string | Yes | - | Webpage URL to fetch |
| crawl_mode | string | No | fast | `fast` or `fine` |
| output_format | string | No | html | `html`, `text`, `markdown` |
| with_readability | boolean | No | - | Use readability (main content) |
| with_links_summary | boolean | No | - | Include links summary |
| with_images_summary | boolean | No | - | Include images summary |
| target_selector | string | No | - | CSS selector for target element |
| wait_for_selector | string | No | - | Wait for selector before fetch |
| timeout | integer | No | - | Timeout in milliseconds |
| with_cache | boolean | No | true | Use cache |

### Response

Success (200):

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "content": { ... }
  }
}
```

Fetched content is in `data.content`; structure depends on `output_format`.

### Error codes

| HTTP | Code | Description |
|------|------|-------------|
| 400 | - | Parameter validation failed |
| 401 | INVALID_API_KEY | API key invalid or revoked |
| 500/502 | WEB_EXTRACT_FAILED | Fetch failed (server or page error) |

## Output Format

On success (script without `--json`):

- Print the fetched content only (for direct use or piping).

With `--json`:

- Print full API response including `code`, `message`, `data`.

Error response to user:

```markdown
## Web Fetch Failed

- Error: <code or message>
- URL: <requested url>
- Suggestion: <e.g. check URL, retry, or use --timeout>
```

## Important Notes

- Always check `FELO_API_KEY` before calling; if missing, return setup instructions.
- For long articles or slow sites, consider `--timeout` or `timeout` in request body.
- Use `output_format: "markdown"` and `with_readability: true` for clean article text.
- API may cache results; use `with_cache: false` in body only when fresh content is required (script does not expose this by default).

## References

- [Felo Web Extract API](https://openapi.felo.ai/docs/api-reference/v2/web-extract.html)
- [Felo Open Platform](https://openapi.felo.ai/docs/)
