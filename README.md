# Felo AI CLI

**Ask anything. Get current answers. Generate slides from a prompt.**

[npm package: **felo-ai**](https://www.npmjs.com/package/felo-ai) — Real-time search and PPT generation from the terminal. Also works as Claude Code skills. Supports Chinese, English, Japanese, and Korean.

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

### CLI FAQ

- **Key not found?** Run `felo config set FELO_API_KEY <key>` or set the `FELO_API_KEY` environment variable.
- **Request timeout?** Use `felo search "query" --timeout 120` (default 60 seconds). 5xx errors are retried automatically with backoff.
- **Slides taking long?** Use `felo slides "topic" --poll-timeout 300` (default 1200s) to limit wait.
- **Where is config stored?** Run `felo config path` to see the file (e.g. `~/.felo/config.json`).

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
