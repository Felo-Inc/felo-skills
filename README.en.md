# Felo AI

**Ask anything. Get current answers powered by AI.**

Felo AI provides a terminal CLI and Claude Code skill, with support for English, Chinese (Simplified & Traditional), Japanese, and Korean.

[![License](https://img.shields.io/badge/license-MIT-green)]()

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
- **Examples**: `felo slides "Felo product intro, 3 slides"`, `felo slides "Introduction to React" --poll-timeout 300`

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
| `felo config set FELO_API_KEY <key>` | Save API key |
| `felo config get/list/path/unset` | View / list / path / remove config |

---

## Claude Code Skill

Install the skill:

```bash
npx @claude/skills add felo-ai
```

After setting `FELO_API_KEY`, ask Claude things like “What’s the weather in Tokyo today?” or “React 19 new features” and search will trigger automatically. PPT generation is available only via the terminal with `felo slides`.

---

## Links

- [Felo Open Platform](https://openapi.felo.ai/docs/) — Get your API key
- [API Documentation](https://openapi.felo.ai/docs/api-reference/v2/chat.html)
- [More examples](./docs/EXAMPLES.md) | [FAQ](./docs/FAQ.md) | [GitHub Issues](https://github.com/Felo-Inc/felo-skills/issues)

---

**Other languages / 其他语言:** [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [繁體中文](README.zh-TW.md)
