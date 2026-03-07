# Felo AI CLI

**Ask anything. Get current answers. Generate slides from a prompt.**

[npm package: **felo-ai**](https://www.npmjs.com/package/felo-ai) — Real-time search, PPT generation, web page extraction, and YouTube subtitles from the terminal. Also works as Claude Code skills. Supports Chinese, English, Japanese, and Korean.

[![npm version](https://img.shields.io/npm/v/felo-ai.svg)](https://www.npmjs.com/package/felo-ai) [![License](https://img.shields.io/badge/license-MIT-green)]()

---

## Install (CLI)

```bash
npm install -g felo-ai
```

Run without installing:

```bash
npx felo-ai search "Tokyo weather"
npx felo-ai slides "Introduction to React, 5 slides"
```

After install, the command is `felo` (package name: **felo-ai**).

### Configure API key

**Option 1: Persist with config (recommended)**

```bash
felo config set FELO_API_KEY your-api-key-here
```

The key is stored in `~/.felo/config.json` (Windows: `%USERPROFILE%\.felo\config.json`). You only need to set it once.

**Option 2: Environment variable**

```bash
# Linux/macOS
export FELO_API_KEY="your-api-key-here"

# Windows (PowerShell)
$env:FELO_API_KEY="your-api-key-here"
```

Get your API key from [felo.ai](https://felo.ai) (Settings → API Keys). Environment variable overrides config if both are set.

### Commands

| Command                              | Description                                           |
| ------------------------------------ | ----------------------------------------------------- |
| `felo search "<query>"`              | Search for current info (weather, news, prices, etc.) |
| `felo slides "<prompt>"`             | Generate PPT; returns link when done                 |
| `felo web-extract --url <url>`       | Extract webpage content (markdown/text/html)          |
| `felo youtube-subtitling -v <url-or-id>` | Fetch YouTube video subtitles by video URL or ID   |
| `felo config set FELO_API_KEY <key>` | Save API key to config                                |
| `felo config get FELO_API_KEY`       | Print stored key                                      |
| `felo config list`                   | List config keys                                      |
| `felo config path`                   | Show config file path                                 |

### Examples

**Search**

```bash
felo search "Tokyo weather"
felo search "MacBook Air M3 price"
felo search "React 19 new features" --verbose
felo search "Hangzhou tomorrow weather" --json
npx felo-ai search "Tokyo weather"
```

**Slides**

```bash
felo slides "Felo product intro, 3 slides"
felo slides "Introduction to React"
felo slides "Q4 2024 business review, 10 pages" --poll-timeout 300
npx felo-ai slides "Tokyo travel guide, 5 slides"
```

**Web extract** (after `npm install -g felo-ai`)

```bash
# Packaged CLI
felo web-extract --url "https://example.com"
felo web-extract --url "https://example.com/article" --format markdown --readability
felo web-extract --url "https://example.com" --target-selector "article.main" --format text
felo web-extract --url "https://example.com" -j
npx felo-ai web-extract --url "https://example.com" --format markdown

# From repo: run script directly (no install)
node felo-web-extract/scripts/run_web_extract.mjs --url "https://example.com" --format markdown
node felo-web-extract/scripts/run_web_extract.mjs --url "https://example.com" --readability -f text
```

**How to pass parameters**

| Parameter | CLI option | Example | Description |
|-----------|------------|---------|--------------|
| URL (required) | `-u`, `--url` | `--url "https://example.com"` | Page to extract |
| Output format | `-f`, `--format` | `--format text` or `-f markdown` | `html`, `text`, or `markdown` (default: markdown) |
| Target element | `--target-selector` | `--target-selector "article.main"` | CSS selector; only this element is extracted |
| Wait for element | `--wait-for-selector` | `--wait-for-selector ".content"` | Wait for selector before extracting (e.g. dynamic pages) |
| Readability | `--readability` | `--readability` | Main article content only (no nav/ads) |
| Crawl mode | `--crawl-mode` | `--crawl-mode fine` | `fast` (default) or `fine` |
| Timeout (seconds) | `-t`, `--timeout` | `--timeout 120` or `-t 90` | Request timeout (default: 60) |
| Full JSON response | `-j`, `--json` | `-j` or `--json` | Print full API response instead of content only |

Examples with multiple options:

```bash
felo web-extract -u "https://example.com" -f text --readability -t 90
felo web-extract --url "https://example.com" --target-selector "#main" --wait-for-selector ".loaded" --format markdown --json
```

Same `FELO_API_KEY` as search/slides.

**YouTube subtitling** (after `npm install -g felo-ai`)

```bash
# Packaged CLI
felo youtube-subtitling -v "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
felo youtube-subtitling -v "dQw4w9WgXcQ" --language zh-CN
felo youtube-subtitling -v "https://youtu.be/dQw4w9WgXcQ" --with-time -j
npx felo-ai youtube-subtitling -v "dQw4w9WgXcQ"

# From repo: run script directly (no install)
node felo-youtube-subtitling/scripts/run_youtube_subtitling.mjs --video-code "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
node felo-youtube-subtitling/scripts/run_youtube_subtitling.mjs -v "dQw4w9WgXcQ" -l zh-CN --with-time
```

Options: `-v/--video-code` (required: **YouTube video URL** or video ID), `-l/--language` (e.g. en, zh-CN), `--with-time`, `-j/--json`. Same `FELO_API_KEY` as other commands. See [felo-youtube-subtitling](./felo-youtube-subtitling/README.md).

### CLI FAQ

- **Key not found?** Run `felo config set FELO_API_KEY <key>` or set the `FELO_API_KEY` environment variable.
- **Request timeout?** Use `felo search "query" --timeout 120` (default 60 seconds). 5xx errors are retried automatically with backoff.
- **Slides taking long?** Use `felo slides "topic" --poll-timeout 300` (default 1200s) to limit wait.
- **Where is config stored?** Run `felo config path` to see the file (e.g. `~/.felo/config.json`).
- **Web extract after install?** Use `felo web-extract --url "<page url>"`. Other params: `--format markdown|text|html`, `--readability`, `--target-selector "selector"`, `--wait-for-selector "selector"`, `--crawl-mode fast|fine`, `--timeout 120`, `--json`. See the "How to pass parameters" table above. Same API key as other commands.
- **YouTube subtitles?** Use `felo youtube-subtitling -v "<url or video_id>"` (full YouTube link or 11-char ID). Optional: `-l/--language`, `--with-time`, `-j/--json`. See [felo-youtube-subtitling](./felo-youtube-subtitling/README.md).

---

## Claude Code Skills (optional)

This repo also provides **Claude Code** skills. If you use [Claude Code](https://claude.ai/code), you can install search and/or slides as skills so Claude can run them in chat.

### Quick Start (Search skill)

Install the skill:

```bash
npx @claude/skills add felo-search
```

Get your API key from [felo.ai](https://felo.ai) (Settings → API Keys), then configure:

**Linux/macOS:**

```bash
export FELO_API_KEY="your-api-key-here"
# Add to ~/.bashrc or ~/.zshrc for persistence
```

**Windows (PowerShell):**

```powershell
$env:FELO_API_KEY="your-api-key-here"
# For persistence, add to system environment variables
```

Test it:

```
Ask Claude: "What's the weather in Tokyo today?"
```

**You're done!** The skill triggers automatically for any question needing current information.

**Felo Slides (PPT):** In terminal run `felo slides "your topic"`. In Claude Code install with `npx @claude/skills add felo-slides`, then use `/felo-slides your topic`. See [felo-slides](./felo-slides/README.md).

**Felo Web Extract:** In terminal run `felo web-extract --url "https://example.com"` (see [felo-web-extract](./felo-web-extract/README.md)). In Claude Code you can install the skill and use it to extract webpage content from a URL.

**Felo YouTube Subtitling:** In terminal run `felo youtube-subtitling -v "URL_or_VIDEO_ID"` (see [felo-youtube-subtitling](./felo-youtube-subtitling/README.md)). Fetches subtitles/captions; accepts full YouTube link or video ID.

---

## Usage Examples

### Daily life

**Weather**

```
You: What's the weather in Tokyo today?
Claude: [Current temperature, conditions, forecast]
```

**Restaurants & food**

```
You: Best ramen in Osaka
Claude: [Top-rated ramen shops with addresses, ratings, reviews]
```

**Shopping & prices**

```
You: iPhone 15 Pro price comparison
Claude: [Prices from different retailers with links]
```

**Travel**

```
You: Things to do in Kyoto this weekend
Claude: [Events, attractions, seasonal activities]
```

### Developer scenarios

**Latest documentation**

```
You: React 19 new features
Claude: [Latest React 19 features with official docs links]
```

**Library comparison**

```
You: Vite vs Webpack 2024 comparison
Claude: [Performance, features, use cases comparison]
```

**Tech trends**

```
You: Latest AI developments January 2026
Claude: [Recent AI breakthroughs, company announcements]
```

### Multi-language queries

Works in Chinese (Simplified & Traditional), Japanese, Korean, and English. Ask in any language, get answers in that language.

**[See 40+ more examples →](./docs/EXAMPLES.md)**

---

## Installation details

### Prerequisites

- [Claude Code](https://claude.ai/code) CLI installed
- Node.js (for npx)
- Internet connection

### Manual installation

If quick install doesn’t work:

1. Clone this repository:

   ```bash
   git clone https://github.com/Felo-Inc/felo-skills.git
   cd felo-skills
   ```

2. Copy to Claude Code skills directory:

   - **Linux/macOS:** `~/.claude/skills/`
   - **Windows:** `C:\Users\<YourUsername>\.claude\skills\`

   ```bash
   # Linux/macOS
   cp -r felo-search ~/.claude/skills/

   # Windows (PowerShell)
   Copy-Item -Recurse felo-search "$env:USERPROFILE\.claude\skills\"
   ```

3. Get API key from [felo.ai](https://felo.ai) (Settings → API Keys)

4. Set environment variable (see Quick Start)

5. Restart Claude Code: `claude restart`

### Verify installation

```bash
claude skills list
```

You should see `felo-search` in the output.

Test: ask Claude _"Latest news about quantum computing"_. If you see an AI-generated answer, it’s working.

---

## FAQ

### Q: Skill not triggering automatically?

**A:** The skill triggers for questions needing current info (weather, news, prices, etc.). For manual trigger, use:

```
/felo-search your query here
```

### Q: "FELO_API_KEY not set" error?

**A:** Set the environment variable (see Quick Start), then restart Claude Code.

### Q: Environment variable not persisting?

**A:** Add to your shell profile: **bash** `~/.bashrc`, **zsh** `~/.zshrc`, **Windows** system environment variables.

### Q: "INVALID_API_KEY" error?

**A:** Your API key is incorrect or revoked. Generate a new one at [felo.ai](https://felo.ai) (Settings → API Keys).

### Q: Does it work in Chinese/Japanese/Korean?

**A:** Yes. Multi-language queries are supported; ask in any language.

### Q: Rate limits?

**A:** Check your Felo account tier at [felo.ai](https://felo.ai). Free tier available.

### Q: Can I use it offline?

**A:** No, it requires an internet connection to the Felo API.

### Q: How fast are responses?

**A:** Typically 2–5 seconds depending on query complexity.

**[Full FAQ →](./docs/FAQ.md)**

---

## Available Skills

### felo-search

Real-time web search with AI-generated answers.

**Triggers automatically for:**

- Current events & news
- Weather, prices, reviews
- Location info (restaurants, attractions)
- Latest documentation & tech trends
- Product comparisons
- Any question with "latest", "recent", "best", "how to"

**[View skill documentation →](./felo-search/)**

### felo-slides

Generate PPT: in terminal use `felo slides "your topic"`, in Claude Code use `/felo-slides your topic`. **[View skill documentation →](./felo-slides/)**

### felo-web-fetch

Fetch and extract webpage content: in terminal use `felo web-fetch --url "https://example.com"`, in Claude Code use `/felo-web-fetch https://example.com`. **[View skill documentation →](./felo-web-fetch/)**

### felo-youtube-subtitling

Fetch YouTube subtitles by video URL or ID: in terminal use `felo youtube-subtitling -v "URL_or_VIDEO_ID"`, in Claude Code use `/felo-youtube-subtitling URL_or_VIDEO_ID`. **[View skill documentation →](./felo-youtube-subtitling/)**

---

## Contributing

We welcome contributions:

- Report bugs or request features
- Improve documentation
- Add new skills

Run CLI tests: `npm test`

**[Contributing guide →](./CONTRIBUTING.md)**

---

## Links

- **[npm: felo-ai](https://www.npmjs.com/package/felo-ai)** — CLI package
- **[Felo Open Platform](https://openapi.felo.ai/docs/)** — Get your API key
- **[API Documentation](https://openapi.felo.ai/docs/api-reference/v2/chat.html)** — API reference
- **[Claude Code](https://claude.ai/code)** — AI assistant CLI
- **[Full examples](./docs/EXAMPLES.md)** — 40+ usage examples
- **[FAQ](./docs/FAQ.md)** — Troubleshooting
- **[GitHub Issues](https://github.com/Felo-Inc/felo-skills/issues)** — Report bugs

---

## Support

- **Documentation**: [FAQ](./docs/FAQ.md) and skill READMEs
- **Issues**: [GitHub Issues](https://github.com/Felo-Inc/felo-skills/issues)
- **Email**: support@felo.ai

---

## License

MIT — see [LICENSE](./felo-search/LICENSE) in the repo for details.

---

Made with ❤️ by the Felo team
