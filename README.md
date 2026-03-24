# Felo AI CLI

<p align="center">
  <img src="https://felo.ai/icon.svg" alt="Felo AI" width="120">
</p>

<p align="center">
  <strong>Ask anything. Get current answers. Generate slides from a prompt.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/felo-ai"><img src="https://img.shields.io/npm/v/felo-ai.svg?style=for-the-badge" alt="npm version"></a>
  <a href="https://discord.gg/9W8NubHA"><img src="https://img.shields.io/discord/1078608933607976980?label=Discord&logo=discord&logoColor=white&color=5865F2&style=for-the-badge" alt="Discord"></a>
  <a href="https://x.com/felo_ai"><img src="https://img.shields.io/badge/X-@felo__ai-black?logo=x&style=for-the-badge" alt="X (Twitter)"></a>
  <a href="./felo-search/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT License"></a>
</p>

**Felo AI CLI** — Real-time search, PPT generation, web fetch, YouTube subtitles, and X (Twitter) search from the terminal. Also works as Claude Code skills. Supports Chinese, English, Japanese, and Korean.

<p align="center">
  <a href="https://felo.ai">Felo AI</a> · <a href="https://openapi.felo.ai/docs/">Docs</a> · <a href="https://openapi.felo.ai/docs/api-reference/v2/chat.html">API Reference</a> · <a href="./docs/EXAMPLES.md">Examples</a> · <a href="./docs/FAQ.md">FAQ</a> · <a href="https://clawhub.ai/u/wangzhiming1999">ClawHub</a> · <a href="https://discord.gg/9W8NubHA">Discord</a> · <a href="https://x.com/felo_ai">X (Twitter)</a>
</p>

---

## Install

```bash
npm install -g felo-ai
```

Get your API key from [Felo AI](https://felo.ai) (Settings → API Keys), then:

```bash
felo config set FELO_API_KEY your-api-key-here
```

That's it. The key is persisted in `~/.felo/config.json`. You can also use environment variables as an alternative:

```bash
export FELO_API_KEY="..."           # Linux/macOS
$env:FELO_API_KEY="..."             # Windows (PowerShell)
```

---

## Commands

| Command                                  | Description                                           |
| ---------------------------------------- | ----------------------------------------------------- |
| `felo search "<query>"`                  | Search for current info (weather, news, prices, etc.) |
| `felo slides "<prompt>"`                 | Generate PPT; returns link when done                  |
| `felo web-fetch --url <url>`             | Fetch webpage content (markdown/text/html)            |
| `felo youtube-subtitling -v <url-or-id>` | Fetch YouTube video subtitles                         |
| `felo x "<query>"`                       | Search X (Twitter) tweets, users, and replies         |
| `felo livedoc <subcommand>`              | Manage LiveDocs (knowledge bases) and resources       |
| `felo config <set\|get\|list\|path>`     | Manage API key and config                             |

---

## Examples

**Search**

```bash
felo search "Tokyo weather"
felo search "React 19 new features" --verbose
felo search "MacBook Air M3 price" --json
```

**Slides**

```bash
felo slides "Felo product intro, 3 slides"
felo slides "Q4 2024 business review, 10 pages" --poll-timeout 300
```

**Web Fetch** — [full options →](./felo-web-fetch/README.md)

```bash
felo web-fetch --url "https://example.com"
felo web-fetch --url "https://example.com" --format markdown --readability
```

**YouTube Subtitling** — [full options →](./felo-youtube-subtitling/README.md)

```bash
felo youtube-subtitling -v "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
felo youtube-subtitling -v "dQw4w9WgXcQ" --language zh-CN --with-time
```

**X (Twitter) Search** — [full options →](./felo-x-search/SKILL.md)

```bash
felo x "AI news"                                    # Search tweets
felo x "OpenAI" --user                              # Search users
felo x --id "elonmusk" --user                       # Get user info
felo x --id "elonmusk" --user --tweets              # Get user tweets
felo x --id "1234567890"                            # Get tweet replies
```

**LiveDoc (Knowledge Base)** — [full options →](./felo-livedoc/README.md)

```bash
felo livedoc create --name "My KB" --description "Project docs"
felo livedoc list
felo livedoc add-doc SHORT_ID --content "Hello" --title "Test"
felo livedoc add-urls SHORT_ID --urls "https://example.com"
felo livedoc upload SHORT_ID --file ./doc.pdf
felo livedoc retrieve SHORT_ID --query "search query"
```

**[See 40+ more examples →](./docs/EXAMPLES.md)**

---

## Skills Overview

5 skills across search, content generation, web scraping, and social media:

| Skill                       | Description                                                   | Docs                            |
| --------------------------- | ------------------------------------------------------------- | ------------------------------- |
| **felo-search**             | Real-time web search with AI answers. Triggers automatically. | [→](./felo-search/)             |
| **felo-slides**             | Generate PPT from a prompt                                    | [→](./felo-slides/)             |
| **felo-web-fetch**          | Fetch and extract webpage content                             | [→](./felo-web-fetch/)          |
| **felo-youtube-subtitling** | Fetch YouTube video subtitles                                 | [→](./felo-youtube-subtitling/) |
| **felo-x-search**           | Search X (Twitter) tweets, users, replies                     | [→](./felo-x-search/SKILL.md)   |
| **felo-livedoc**            | Manage knowledge bases and semantic retrieval                 | [→](./felo-livedoc/)            |

---

## Skills Install

### Claude Code (Recommended)

```bash
# Add the marketplace
/plugin marketplace add Felo-Inc/felo-skills

# Install individual skills
/plugin install felo-search@felo-ai
/plugin install felo-slides@felo-ai
/plugin install felo-web-fetch@felo-ai
/plugin install felo-youtube-subtitling@felo-ai
/plugin install felo-x-search@felo-ai
/plugin install felo-livedoc@felo-ai
```

### ClawHub

[ClawHub](https://clawhub.ai) is a public skill registry for AI coding agents. Browse all Felo skills on [ClawHub](https://clawhub.ai/u/wangzhiming1999).

```bash
clawhub install felo-search
clawhub install felo-slides
clawhub install felo-web-fetch
clawhub install felo-youtube-subtitling
clawhub install felo-x-search
clawhub install felo-livedoc
```

### Gemini CLI

```bash
git clone https://github.com/Felo-Inc/felo-skills.git
cd felo-skills

# Copy skill folders to Gemini CLI skills directory
cp -r felo-search ~/.gemini/skills/
cp -r felo-slides ~/.gemini/skills/
```

### OpenAI Codex

```bash
git clone https://github.com/Felo-Inc/felo-skills.git
# Copy any skill folder to ~/.codex/skills/
cp -r felo-search ~/.codex/skills/
```

### OpenClaw

```bash
bash <(curl -s https://raw.githubusercontent.com/Felo-Inc/felo-skills/main/scripts/openclaw-install.sh)
```

### Manual Installation

```bash
git clone https://github.com/Felo-Inc/felo-skills.git
# Copy any skill folder to the skills directory of your AI coding agent
# Claude Code: ~/.claude/skills/
# Gemini CLI:  ~/.gemini/skills/
# Codex:       ~/.codex/skills/
cp -r felo-search ~/.claude/skills/
```

---

## FAQ

- **Key not found?** Run `felo config set FELO_API_KEY <key>` or set the `FELO_API_KEY` environment variable.
- **Request timeout?** Use `--timeout 120` (default 60s). 5xx errors are retried automatically.
- **Slides taking long?** Use `--poll-timeout 300` (default 1200s) to limit wait.
- **Skill not triggering?** Use `/felo-search your query` to trigger manually.
- **Multi-language?** Yes — Chinese, English, Japanese, and Korean are supported.

**[Full FAQ →](./docs/FAQ.md)**

---

## Contributing

We welcome contributions — report bugs, improve docs, or add new skills. Run tests with `npm test`.

**[Contributing guide →](./CONTRIBUTING.md)**

---

## License

MIT — see [LICENSE](./felo-search/LICENSE) for details.

---

<p align="center">Made with ❤️ by the <a href="https://felo.ai">Felo</a> team</p>
