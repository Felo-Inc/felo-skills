# Felo AI

**Ask anything. Get current answers powered by AI.**

Felo AI provides a terminal CLI and Claude Code skill, with support for English, Chinese (Simplified & Traditional), Japanese, and Korean.

[![License](https://img.shields.io/badge/license-MIT-green)]()

---

## Capabilities

Felo AI offers **Real-time Search**, **PPT Generation**, **Web Page Extraction**, and **YouTube Subtitles**. Use them via the CLI in your terminal, or in Claude Code via skills (search can trigger automatically).

### Capability 1: Real-time Search

Search the web for up-to-date information and get AI-synthesized answers. Ideal for weather, news, prices, documentation, tech updates, and any question that needs “right now” information.

- **Multi-language**: Ask in your preferred language.
- **Terminal**: `felo search "your question"`
- **Claude Code**: After installing the skill, it triggers automatically, or type `/felo-ai your question`
- **Examples**: `felo search "Tokyo weather"`, `felo search "React 19 new features" --verbose`

### Capability 2: Generate PPT (Felo Slides)

Terminal: `felo slides "your topic"`. In Claude Code: install `npx @claude/skills add felo-slides`, then `/felo-slides your topic`. You get an online document link when done. Examples: `felo slides "Felo product intro, 3 slides"`, `felo slides "Introduction to React"`.

---

## Install & Configure

### Install CLI

```bash
npm install -g felo-ai
```

Run without installing: `npx felo-ai search "Tokyo weather"`  
After install, the command is `felo`.

### Configure API Key

Recommended (persisted):

```bash
felo config set FELO_API_KEY your-api-key-here
```

Or set the environment variable: `export FELO_API_KEY="your-api-key-here"` (Linux/macOS), `$env:FELO_API_KEY="your-api-key-here"` (Windows PowerShell).

Get your API key at [felo.ai](https://felo.ai) (Settings → API Keys).

### Commands

| Command | Description |
|---------|-------------|
| `felo search "<query>"` | Real-time search |
| `felo slides "<prompt>"` | Generate PPT |
| `felo web-extract --url <url>` | Extract webpage content (markdown/text/html) |
| `felo youtube-subtitling -v <url-or-id>` | Fetch YouTube video subtitles |
| `felo config set FELO_API_KEY <key>` | Save API key |
| `felo config get/list/path/unset` | View / list / path / remove config |

### Examples

**Search**

```bash
felo search "Tokyo weather"
felo search "MacBook Air M3 price"
felo search "React 19 new features" --verbose
npx felo-ai search "Tokyo weather"
```

**Slides**

```bash
felo slides "Felo product intro, 3 slides"
felo slides "Introduction to React"
felo slides "Q4 2024 business review, 10 pages" --poll-timeout 300
npx felo-ai slides "Tokyo travel guide, 5 slides"
```

**Web extract**

```bash
felo web-extract --url "https://example.com"
felo web-extract --url "https://example.com" --format text --readability
node felo-web-extract/scripts/run_web_extract.mjs --url "https://example.com" --format markdown
```

**YouTube subtitling**

```bash
felo youtube-subtitling -v "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
felo youtube-subtitling -v "dQw4w9WgXcQ" --language en
node felo-youtube-subtitling/scripts/run_youtube_subtitling.mjs -v "dQw4w9WgXcQ" -l zh-CN
```

---

## Claude Code Skills

**Search** — Install and use real-time search:

```bash
npx @claude/skills add felo-search
```

After setting `FELO_API_KEY`, ask Claude things like “What’s the weather in Tokyo today?” or “React 19 new features”; the search skill triggers automatically (or use `/felo-search your question`).

**Slides (PPT)** — `npx @claude/skills add felo-slides`, then `/felo-slides your topic`. Same `FELO_API_KEY`. [Details →](./felo-slides/README.md)

**Web Extract** — `felo web-extract --url "https://example.com"` or run `node felo-web-extract/scripts/run_web_extract.mjs` from repo. [Details →](./felo-web-extract/README.md)

**YouTube Subtitling** — `felo youtube-subtitling -v "URL_or_VIDEO_ID"` or run `node felo-youtube-subtitling/scripts/run_youtube_subtitling.mjs` from repo. [Details →](./felo-youtube-subtitling/README.md)

---

## Links

- [Felo Open Platform](https://openapi.felo.ai/docs/) — Get your API key
- [API Documentation](https://openapi.felo.ai/docs/api-reference/v2/chat.html)
- [More examples](./docs/EXAMPLES.md) | [FAQ](./docs/FAQ.md) | [GitHub Issues](https://github.com/Felo-Inc/felo-skills/issues)

---

**Other languages:** [Chinese (Simplified)](README.zh-CN.md) | [Japanese](README.ja.md) | [Korean](README.ko.md) | [Chinese (Traditional)](README.zh-TW.md)

