# Felo AI

**Ask anything. Get current answers powered by AI.**

Felo AI provides a terminal CLI and Claude Code skill, with support for English, Chinese (Simplified & Traditional), Japanese, and Korean.

[![Setup Time](https://img.shields.io/badge/setup-2%20minutes-blue)]() [![License](https://img.shields.io/badge/license-MIT-green)]()

**Other languages:** [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [繁體中文](README.zh-TW.md)

---

## Two Core Capabilities

Felo AI offers two main features: **Real-time Search** and **PPT Generation**. Use them via the CLI in your terminal, or in Claude Code via the skill (search can trigger automatically).

### Capability 1: Real-time Search

Search the web for up-to-date information and get AI-synthesized answers. Ideal for weather, news, prices, documentation, tech updates, and any question that needs “right now” information.

- **Multi-language**: Ask in your preferred language.
- **Terminal**: `felo search "your question"`
- **Claude Code**: After installing the skill, it triggers automatically, or type `/felo-ai your question`
- **Examples**: `felo search "Tokyo weather"`, `felo search "React 19 new features" --verbose`

### Capability 2: Generate PPT

Describe a topic in one sentence and Felo generates a slideshow. The job runs in the cloud; when done, you get an **online document link** to open in your browser.

- **Terminal**: `felo slides "your topic or description"`
- **Options**: `--verbose` for polling status, `--json` for raw JSON (`task_id`, `live_doc_url`).
- **Examples**: `felo slides "Felo product intro, 3 slides"`, `felo slides "Introduction to React"`, `felo slides "Quarterly review" --poll-timeout 300`

---

## Felo CLI (Terminal)

Use Felo from the terminal without opening Claude Code.

### Install

```bash
npm install -g felo-ai
```

Run without installing (latest published version):

```bash
npx felo-ai search "Tokyo weather"
```

After install, the command is `felo` (from package name `felo-ai`).

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

| Command | Description |
|---------|-------------|
| `felo search "<query>"` | **Real-time search** — weather, news, prices, docs, etc. |
| `felo slides "<prompt>"` | **Generate PPT** — outputs online doc link when done |
| `felo config set FELO_API_KEY <key>` | Save API key (recommended before first use) |
| `felo config get/list/path/unset` | View, list, path, or remove config |

### Examples

```bash
felo search "Tokyo weather"
felo search "MacBook Air M3 price"
felo search "React 19 new features" --verbose
felo search "Hangzhou tomorrow weather" --json
npx felo-ai search "Tokyo weather"
```

### CLI FAQ

- **Key not found?** Run `felo config set FELO_API_KEY <key>` or set the `FELO_API_KEY` environment variable.
- **Request timeout?** Use `felo search "query" --timeout 120` (default 60 seconds). 5xx errors are retried automatically with backoff.
- **Where is config stored?** Run `felo config path` to see the file (e.g. `~/.felo/config.json`).
- **Streaming?** Not yet; when the Felo API supports streaming, the CLI can be updated to stream output.

---

## Quick Start (Claude Code Skill)

Install the skill:

```bash
npx @claude/skills add felo-ai
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

You should see `felo-ai` or `felo-search` in the output.

Test: ask Claude *"Latest news about quantum computing"*. If you see an AI-generated answer, it’s working.

---

## FAQ

### Q: Skill not triggering automatically?

**A:** The skill triggers for questions needing current info (weather, news, prices, etc.). For manual trigger, use `/felo-ai your query here`.

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

## Claude Code skill (summary)

With `felo-ai` installed, **real-time search** runs as a skill: when you ask about weather, news, prices, or latest docs, Felo search is triggered and returns an answer. You can also type `/felo-ai your question` to trigger it manually.

**Typical triggers:** current events, weather/prices/reviews, places (restaurants, attractions), latest tech docs and trends, product comparisons, and questions with words like “latest”, “recent”, “best”, “how to”.

PPT generation is only available in the terminal via `felo slides`.

**[Search skill details →](./felo-search/)**

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

MIT License — see [LICENSE](./felo-search/LICENSE) for details.

---

Made with ❤️ by the Felo team
