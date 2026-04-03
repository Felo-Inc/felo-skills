# Felo AI CLI

<p align="center">
  <img src="https://felo.ai/icon.svg" alt="Felo AI" width="120">
</p>

<p align="center">
  <strong>Ask anything. Get current answers. Generate slides and mindmaps from a prompt.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/felo-ai"><img src="https://img.shields.io/npm/v/felo-ai.svg?style=for-the-badge" alt="npm version"></a>
  <a href="https://discord.gg/9W8NubHA"><img src="https://img.shields.io/discord/1078608933607976980?label=Discord&logo=discord&logoColor=white&color=5865F2&style=for-the-badge" alt="Discord"></a>
  <a href="https://x.com/felo_ai"><img src="https://img.shields.io/badge/X-@felo__ai-black?logo=x&style=for-the-badge" alt="X (Twitter)"></a>
  <a href="./felo-search/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT License"></a>
</p>

**Felo AI CLI** — Real-time search, PPT generation, mindmap creation, web fetch, YouTube subtitles, and X (Twitter) search, SuperAgent conversation, and Twitter writing from the terminal. Also works as Claude Code skills. Supports Chinese, English, Japanese, and Korean.

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
| `felo mindmap "<query>"`                 | Generate mindmap; returns link immediately            |
| `felo web-fetch --url <url>`             | Fetch webpage content (markdown/text/html)            |
| `felo youtube-subtitling -v <url-or-id>` | Fetch YouTube video subtitles                         |
| `felo x "<query>"`                       | Search X (Twitter) tweets, users, and replies         |
| `felo livedoc <subcommand>`              | Manage LiveDocs (knowledge bases) and resources       |
| `felo apple-buy-advisor "<query>"`       | Research and compare Apple products before you buy    |
| `felo superagent "<query>"`              | AI conversation with real-time streaming output       |
| `felo style-library <category>`          | List brand styles from the style library              |
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

**Mindmap**

```bash
felo mindmap "AI trends in 2024"
felo mindmap "Project timeline" --layout TIMELINE
felo mindmap "Problem analysis" --layout FISHBONE --json
felo mindmap-layouts                    # List available layouts
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

**Apple Buy Advisor** — [full options →](./apple-buy-advisor/SKILL.md)

```bash
# Use as Felo CLI command
felo apple-buy-advisor "Should I buy MacBook Pro M4?"
felo apple-buy-advisor "Compare iPhone 17 vs iPhone 17e"
felo apple-buy-advisor "Is it worth upgrading to iPad Air 13?"
```

```bash
# Use as Claude Code skill
/apple-buy-advisor Should I buy MacBook Pro M4?
/apple-buy-advisor Compare iPhone 17 vs iPhone 17e
/apple-buy-advisor Is it worth upgrading to iPad Air 13?
```

**Twitter Writer** — [full options →](./felo-twitter-writer/README.md)

```bash
# Use as Claude Code skill — Claude automatically fetches your style library
# and asks you to pick a writing style before generating
/felo-twitter-writer Analyze @paulg's tweet style and extract a style DNA
/felo-twitter-writer Write 3 tweets about AI trends
/felo-twitter-writer Write a Twitter thread about why most startups fail
/felo-twitter-writer Write a tweet about AI in the style of @darioamodei
```

```bash
# Run scripts directly
node felo-superAgent/scripts/run_style_library.mjs --category TWITTER --accept-language en
node felo-superAgent/scripts/run_superagent.mjs \
  --query "/twitter-writer Write a tweet about AI trends" \
  --live-doc-id "LIVE_DOC_ID" \
  --skill-id twitter-writer \
  --ext '{"brand_style_requirement":"Style name: darioamodei\nStyle labels: Thoughtful long-form essays\nStyle DNA: ..."}' \
  --accept-language en
```

**SuperAgent** — [full options →](./felo-superAgent/README.md)

```bash
# Use as Claude Code skill
/felo-superAgent What is the latest news about AI?
/felo-superAgent Write a tweet about quantum computing
/felo-superAgent Design a logo for my coffee shop
```

```bash
# Run script directly
node felo-superAgent/scripts/run_superagent.mjs --query "What is quantum computing?" --live-doc-id "LIVE_DOC_ID"
node felo-superAgent/scripts/run_superagent.mjs --query "Tell me more" --thread-id <thread_short_id> --live-doc-id "LIVE_DOC_ID"
```

```bash
# CLI commands
felo superagent "What is the latest news about AI?"
felo superagent "Tell me more" --thread-id <thread_short_id>
felo style-library TWITTER --accept-language en
felo style-library IMAGE --accept-language zh-Hans
```

**[See 40+ more examples →](./docs/EXAMPLES.md)**

---

## Skills Overview

10 skills across search, content generation, web scraping, social media, knowledge base, and shopping advice:

| Skill | Description | Docs |
|---|---|---|
| **felo-search** | Real-time web search with AI answers. Triggers automatically. | [→](./felo-search/) |
| **felo-slides** | Generate PPT from a prompt | [→](./felo-slides/) |
| **felo-web-fetch** | Fetch and extract webpage content | [→](./felo-web-fetch/) |
| **felo-youtube-subtitling** | Fetch YouTube video subtitles | [→](./felo-youtube-subtitling/) |
| **felo-x-search** | Search X (Twitter) tweets, users, replies | [→](./felo-x-search/SKILL.md) |
| **felo-livedoc** | Manage knowledge bases and semantic retrieval | [→](./felo-livedoc/) |
| **apple-buy-advisor** | Research and compare Apple products before you buy | [→](./apple-buy-advisor/) |
| **felo-twitter-writer** | Analyze tweet style DNA; compose tweets, threads, X posts with brand style | [→](./felo-twitter-writer/README.md) |
| **felo-superAgent** | AI conversation with real-time streaming, brand style support, continuous threads | [→](./felo-superAgent/README.md) |
| **felo-mindmap**            | Generate mindmaps with various layouts                        | [→](./felo-mindmap/)            |

---

## Using felo-twitter-writer and felo-superAgent with Claude Code

These two skills work together and share the style library. Here is how Claude uses them.

### Installation

```bash
# Via ClawHub
# felo-twitter-writer depends on felo-superAgent + felo-livedoc; felo-superAgent depends on felo-livedoc
clawhub install felo-twitter-writer
clawhub install felo-superAgent
clawhub install felo-livedoc
clawhub install felo-x-search

# Manual
cp -r felo-twitter-writer ~/.claude/skills/
cp -r felo-superAgent ~/.claude/skills/
cp -r felo-livedoc ~/.claude/skills/
cp -r felo-x-search ~/.claude/skills/
```

### felo-twitter-writer

Trigger keywords: `write a tweet`, `twitter thread`, `style DNA`, `imitate tweet style`, `tweet in the style of`, `X account analysis`, `ghostwrite tweets`

```
/felo-twitter-writer Analyze @paulg's tweet style
/felo-twitter-writer Write 3 tweets about AI trends
/felo-twitter-writer Write a Twitter thread about why most startups fail
```

**What Claude does automatically for tweet writing (Mode 2, new conversation):**

1. Calls `run_style_library.mjs --category TWITTER` to fetch your saved writing styles
2. Presents the list grouped as **[Your styles]** / **[Recommended styles]** with a "No preference" option
3. Waits for your selection, then calls SuperAgent with the full style block in `--ext`
4. Streams the result in real time — follow-ups reuse the thread without re-fetching styles

```
You:    Write a Twitter thread about why most startups fail

Claude: Here are the available Twitter writing styles — choosing one will make
        the output more accurate:

        [Your styles]
        1. My Bold Voice

        [Recommended styles]
        2. darioamodei

        0. No preference — use default style

You:    1

Claude: [streams the thread in "My Bold Voice" style]

You:    Make the hook tweet more provocative

Claude: [follow-up — no style re-selection needed]
```

If the style library is empty, Claude skips the selection step silently.

### felo-superAgent

Trigger keywords: `superagent`, `super agent`, `stream chat`, `streaming conversation`, `write a tweet`, `create a logo`, `product image`

```
/felo-superAgent What is the latest news about AI?
/felo-superAgent Write a tweet about quantum computing
/felo-superAgent Design a logo for my coffee shop
/felo-superAgent Generate a product image for wireless headphones
```

**What Claude does automatically for skill-based conversations:**

| Skill intent | Style category fetched | `--skill-id` passed |
|---|---|---|
| Write tweets | `TWITTER` | `twitter-writer` |
| Logo / branding | `IMAGE` | `logo-and-branding` |
| Product images | `IMAGE` | `ecommerce-product-image` |
| General conversation | — | — |

For skill-based new conversations, Claude fetches the matching style library, presents options, and passes the chosen style via `--ext '{"brand_style_requirement":"..."}'`. The style block includes `Style name`, `Style labels`, `Style DNA`, and optionally `Cover file ID` — passed completely, never truncated.

**Thread and LiveDoc management:**
- Claude reuses the same LiveDoc across the entire session
- Every message after the first is a follow-up (`--thread-id`) by default
- A new thread is only started when you say "new topic", "start over", or when a different skill ID is needed
- `--ext` is only passed for new conversations, never for follow-ups

---

## Skills Install

### Claude Code

```bash
# Via ClawHub (recommended)
clawhub install felo-search
clawhub install felo-slides
clawhub install felo-mindmap
clawhub install felo-web-fetch
clawhub install felo-youtube-subtitling
clawhub install felo-x-search
clawhub install felo-livedoc
clawhub install apple-buy-advisor

# felo-superAgent depends on felo-livedoc — install both:
clawhub install felo-superAgent
clawhub install felo-livedoc

# felo-twitter-writer depends on felo-superAgent and felo-livedoc — install all three:
clawhub install felo-twitter-writer
clawhub install felo-superAgent
clawhub install felo-livedoc
```

```bash
# Manual
git clone https://github.com/Felo-Inc/felo-skills.git
cd felo-skills
cp -r felo-search ~/.claude/skills/
cp -r felo-slides ~/.claude/skills/
cp -r felo-web-fetch ~/.claude/skills/
cp -r felo-youtube-subtitling ~/.claude/skills/
cp -r felo-x-search ~/.claude/skills/
cp -r felo-livedoc ~/.claude/skills/
cp -r apple-buy-advisor ~/.claude/skills/
cp -r felo-twitter-writer ~/.claude/skills/
cp -r felo-superAgent ~/.claude/skills/
```

### Gemini CLI

```bash
git clone https://github.com/Felo-Inc/felo-skills.git
cd felo-skills
cp -r felo-search ~/.gemini/skills/
cp -r felo-slides ~/.gemini/skills/
cp -r felo-web-fetch ~/.gemini/skills/
cp -r felo-youtube-subtitling ~/.gemini/skills/
cp -r felo-x-search ~/.gemini/skills/
cp -r felo-livedoc ~/.gemini/skills/
cp -r apple-buy-advisor ~/.gemini/skills/
cp -r felo-twitter-writer ~/.gemini/skills/
cp -r felo-superAgent ~/.gemini/skills/
```

### OpenAI Codex

```bash
git clone https://github.com/Felo-Inc/felo-skills.git
cd felo-skills
cp -r felo-search ~/.codex/skills/
cp -r felo-slides ~/.codex/skills/
cp -r felo-web-fetch ~/.codex/skills/
cp -r felo-youtube-subtitling ~/.codex/skills/
cp -r felo-x-search ~/.codex/skills/
cp -r felo-livedoc ~/.codex/skills/
cp -r apple-buy-advisor ~/.codex/skills/
cp -r felo-twitter-writer ~/.codex/skills/
cp -r felo-superAgent ~/.codex/skills/
```

### OpenClaw

```bash
# Installs all skills that contain a SKILL.md (includes felo-twitter-writer and felo-superAgent)
bash <(curl -s https://raw.githubusercontent.com/Felo-Inc/felo-skills/main/scripts/openclaw-install.sh)
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
