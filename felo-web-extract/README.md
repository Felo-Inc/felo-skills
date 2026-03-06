# Felo Web Extract Skill

Extract webpage content from a URL using the [Felo Web Extract API](https://openapi.felo.ai/docs/api-reference/v2/web-extract.html).

## Features

- Extract content from any URL as **html**, **text**, or **markdown** (`--format`)
- **Target one element** with a CSS selector (`--target-selector`, e.g. `article.main`, `#content`)
- Optional **readability** mode for main article content only
- Crawl modes: `fast` (default) or `fine`
- Same `FELO_API_KEY` as other Felo skills

## Quick Start

### 1) Configure API key

At [felo.ai](https://felo.ai) -> Settings -> API Keys, create a key, then:

```bash
# Linux/macOS
export FELO_API_KEY="your-api-key-here"
```

```powershell
# Windows PowerShell
$env:FELO_API_KEY="your-api-key-here"
```

### 2) Run extraction

```bash
# Extract as Markdown (default)
node felo-web-extract/scripts/run_web_extract.mjs --url "https://example.com/article"

# With readability for clean article text
node felo-web-extract/scripts/run_web_extract.mjs --url "https://example.com" --readability --format markdown

# Full JSON response
node felo-web-extract/scripts/run_web_extract.mjs --url "https://example.com" --json

# Only a specific element (CSS selector) and output format
node felo-web-extract/scripts/run_web_extract.mjs --url "https://example.com" --target-selector "article.main" --format markdown
```

## Using the packaged CLI (`felo web-extract`)

After `npm install -g felo-ai`, you can run:

```bash
felo web-extract --url "https://example.com"
```

**All parameters (how to pass)**

| Parameter | Option | Example |
|-----------|--------|---------|
| URL (required) | `-u`, `--url` | `--url "https://example.com"` |
| Output format | `-f`, `--format` | `--format text`, `-f markdown`, `-f html` |
| Target element (CSS selector) | `--target-selector` | `--target-selector "article.main"` |
| Wait for selector | `--wait-for-selector` | `--wait-for-selector ".content"` |
| Readability (main content only) | `--readability` | `--readability` |
| Crawl mode | `--crawl-mode` | `--crawl-mode fine` (default: `fast`) |
| Timeout (seconds) | `-t`, `--timeout` | `--timeout 120`, `-t 90` |
| Full JSON response | `-j`, `--json` | `-j` or `--json` |

**Examples with multiple options**

```bash
felo web-extract -u "https://example.com" -f text --readability
felo web-extract --url "https://example.com" --target-selector "#content" --format markdown --timeout 90
felo web-extract --url "https://example.com" --wait-for-selector "main" --readability -j
```

## When to use (Agent)

Trigger keywords: extract webpage, scrape URL, fetch page content, url to markdown, `/felo-web-extract`.

See [SKILL.md](SKILL.md) for full agent instructions and API parameters.
