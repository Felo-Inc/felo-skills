# Felo AI CLI

**Ask anything. Get current answers. Generate slides from a prompt. Chat with SuperAgent.**

[npm package: **felo-ai**](https://www.npmjs.com/package/felo-ai) - Real-time search, PPT generation, SuperAgent conversation, LiveDoc management, web fetch, YouTube subtitles, and X (Twitter) search from the terminal. Also works as Claude Code skills. Supports Chinese, English, Japanese, and Korean.

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

Get your API key from [felo.ai](https://felo.ai) (Settings > API Keys). Environment variable overrides config if both are set.

### Commands

| Command                                          | Description                                           |
| ------------------------------------------------ | ----------------------------------------------------- |
| `felo search "<query>"`                          | Search for current info (weather, news, prices, etc.) |
| `felo slides "<prompt>"`                         | Generate PPT; returns link when done                  |
| `felo superagent "<query>"`                      | SuperAgent conversation with SSE streaming            |
| `felo livedocs`                                  | List LiveDocs with pagination and keyword filtering   |
| `felo livedoc-resources <id>`                    | List resources in a specific LiveDoc                  |
| `felo web-fetch --url <url>`                     | Fetch webpage content (markdown/text/html)            |
| `felo youtube-subtitling -v <url-or-id>`         | Fetch YouTube video subtitles by video URL or ID      |
| `felo content-to-slides -u <url>` or `-v <video>` | Fetch URL/YouTube content, then generate PPT        |
| `felo x "<query>"`                               | Search X (Twitter) tweets, users, and replies         |
| `felo config set FELO_API_KEY <key>`             | Save API key to config                                |
| `felo config get FELO_API_KEY`                   | Print stored key                                      |
| `felo config list`                               | List config keys                                      |
| `felo config path`                               | Show config file path                                 |

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

**SuperAgent**

```bash
felo superagent "What is the latest news about AI?"
felo superagent "帮我搜索大熊猫的最新消息" --accept-language zh
felo superagent "Tell me more about the first one" --thread-id <thread_short_id>
felo superagent "Generate an image of a panda" --json
felo superagent "Write a report" --skill-id <id> --ext '{"style_id":"xxx"}'
```

Options: `--thread-id` (follow-up conversation), `--live-doc-id` (reuse LiveDoc), `--skill-id`, `--selected-resource-ids`, `--ext` (new conversations only), `--accept-language`, `--json`, `--verbose`, `--timeout`.

**LiveDocs**

```bash
felo livedocs
felo livedocs --page 2 --size 10
felo livedocs --keyword AI
felo livedocs --json
felo livedoc-resources <livedoc-id>
felo livedoc-resources <livedoc-id> --json
```

**Web fetch** (after `npm install -g felo-ai`)

```bash
# Packaged CLI
felo web-fetch --url "https://example.com"
felo web-fetch --url "https://example.com/article" --format markdown --readability
felo web-fetch --url "https://example.com" --target-selector "article.main" --format text
felo web-fetch --url "https://example.com" -j
npx felo-ai web-fetch --url "https://example.com" --format markdown

# From repo: run script directly (no install)
node felo-web-fetch/scripts/run_web_fetch.mjs --url "https://example.com" --format markdown
node felo-web-fetch/scripts/run_web_fetch.mjs --url "https://example.com" --readability -f text
```

**How to pass parameters**

| Parameter          | CLI option            | Example                            | Description                                            |
| ------------------ | --------------------- | ---------------------------------- | ------------------------------------------------------ |
| URL (required)     | `-u`, `--url`         | `--url "https://example.com"`      | Page to fetch                                          |
| Output format      | `-f`, `--format`      | `--format text` or `-f markdown`   | `html`, `text`, or `markdown` (default: markdown)      |
| Target element     | `--target-selector`   | `--target-selector "article.main"` | CSS selector; only this element is fetched             |
| Wait for element   | `--wait-for-selector` | `--wait-for-selector ".content"`   | Wait for selector before fetching (e.g. dynamic pages) |
| Readability        | `--readability`       | `--readability`                    | Main article content only (no nav/ads)                 |
| Crawl mode         | `--crawl-mode`        | `--crawl-mode fine`                | `fast` (default) or `fine`                             |
| Timeout (seconds)  | `-t`, `--timeout`     | `--timeout 120` or `-t 90`         | Request timeout (default: 60)                          |
| Full JSON response | `-j`, `--json`        | `-j` or `--json`                   | Print full API response instead of content only        |

Examples with multiple options:

```bash
felo web-fetch -u "https://example.com" -f text --readability -t 90
felo web-fetch --url "https://example.com" --target-selector "#main" --wait-for-selector ".loaded" --format markdown --json
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

**Content to slides (fetch URL or YouTube → PPT)**

```bash
felo content-to-slides -u "https://example.com/article" --readability
felo content-to-slides -v "https://www.youtube.com/watch?v=ID" --extra-prompt "10页以内"
npx felo-ai content-to-slides --url "https://openclaw.ai/" --readability
```

Options (YouTube): `-v/--video-code` (required: **YouTube video URL** or video ID), `-l/--language` (e.g. en, zh-CN), `--with-time`, `-j/--json`. Same `FELO_API_KEY` as other commands. See [felo-youtube-subtitling](./felo-youtube-subtitling/README.md).

**X (Twitter) search** (after `npm install -g felo-ai`)

```bash
# Search tweets
felo x "AI news"
felo x "AI news" --limit 10 --json

# Search users
felo x "OpenAI" --user

# Get user info
felo x --id "elonmusk" --user

# Get user tweets
felo x --id "elonmusk" --user --tweets
felo x --id "elonmusk" --user --tweets --include-replies --limit 20

# Get tweet replies
felo x --id "1234567890"

# From repo: run script directly (no install)
node felo-x-search/scripts/run_x_search.mjs "AI news"
```

Options: `[query]` or `-q/--query` (search keyword), `--id` (tweet IDs or usernames, comma-separated), `--user` (user mode), `--tweets` (get user tweets), `-l/--limit`, `--cursor`, `--include-replies`, `--query-type`, `--since-time`, `--until-time`, `-j/--json`, `-t/--timeout`. Same `FELO_API_KEY` as other commands. See [felo-x-search](./felo-x-search/SKILL.md).

### CLI FAQ

- **Key not found?** Run `felo config set FELO_API_KEY <key>` or set the `FELO_API_KEY` environment variable.
- **Request timeout?** Use `felo search "query" --timeout 120` (default 60 seconds). 5xx errors are retried automatically with backoff.
- **Slides taking long?** Use `felo slides "topic" --poll-timeout 300` (default 1200s) to limit wait.
- **Where is config stored?** Run `felo config path` to see the file (e.g. `~/.felo/config.json`).
- **Web fetch after install?** Use `felo web-fetch --url "<page url>"`. Other params: `--format markdown|text|html`, `--readability`, `--target-selector "selector"`, `--wait-for-selector "selector"`, `--crawl-mode fast|fine`, `--timeout 120`, `--json`. See the "How to pass parameters" table above. Same API key as other commands.
- **YouTube subtitles?** Use `felo youtube-subtitling -v "<url or video_id>"` (full YouTube link or 11-char ID). Optional: `-l/--language`, `--with-time`, `-j/--json`. See [felo-youtube-subtitling](./felo-youtube-subtitling/README.md).
- **SuperAgent?** Use `felo superagent "your question"`. Follow-up with `--thread-id`. List LiveDocs with `felo livedocs`, list resources with `felo livedoc-resources <id>`. See [felo-superAgent](./felo-superAgent/README.md).
- **Custom API base?** Use `felo config set FELO_API_BASE <url>` or set the `FELO_API_BASE` environment variable.
- **X (Twitter) search?** Use `felo x "<query>"` to search tweets, `felo x "<query>" --user` to search users, `felo x --id "<username>" --user` for user info, `felo x --id "<username>" --user --tweets` for user tweets, `felo x --id "<tweet_id>"` for tweet replies. See [felo-x-search](./felo-x-search/SKILL.md).

---

## Claude Code Skills (optional)

This repo also provides **Claude Code** skills. If you use [Claude Code](https://claude.ai/code), you can install search and/or slides as skills so Claude can run them in chat.

### Quick Start (Search skill)

**Quick Start**: Using the npm [skills](https://www.npmjs.com/package/skills) CLI:

```bash
npx skills add Felo-Inc/felo-skills --skill felo-search
```

Or manually copy to the skills directory:

**Linux/macOS:**

```bash
git clone https://github.com/Felo-Inc/felo-skills.git && cd felo-skills
cp -r felo-search ~/.claude/skills/
```

**Windows (PowerShell):**

```powershell
git clone https://github.com/Felo-Inc/felo-skills.git; cd felo-skills
Copy-Item -Recurse felo-search "$env:USERPROFILE\.claude\skills\"
```

See [Manual installation](#manual-installation) for details.

Get your API key from [felo.ai](https://felo.ai) (Settings > API Keys), then configure:

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

**Felo Slides (PPT):** In terminal run `felo slides "your topic"`. In Claude Code install with `npx skills add Felo-Inc/felo-skills --skill felo-slides`, then use `/felo-slides your topic`. See [felo-slides](./felo-slides/README.md).

**Felo Web Fetch:** In terminal run `felo web-fetch --url "https://example.com"` (see [felo-web-fetch](./felo-web-fetch/README.md)). In Claude Code you can install the skill and use it to fetch webpage content from a URL.

**Felo SuperAgent:** In terminal run `felo superagent "your question"`. Supports SSE streaming, LiveDoc, follow-up conversations (`--thread-id`), and tool invocations. See [felo-superAgent](./felo-superAgent/README.md).

**Felo LiveDocs:** In terminal run `felo livedocs` to list LiveDocs, `felo livedoc-resources <id>` to list resources in a specific LiveDoc.

**Felo YouTube Subtitling:** In terminal run `felo youtube-subtitling -v "URL_or_VIDEO_ID"` (see [felo-youtube-subtitling](./felo-youtube-subtitling/README.md)). Fetches subtitles/captions; accepts full YouTube link or video ID.

**Felo Content to Slides:** Fetch a webpage or YouTube video, then generate a PPT from that content. In terminal: `felo content-to-slides -u "https://example.com"` or `-v "youtube-url"`. In Claude Code: `npx skills add Felo-Inc/felo-skills --skill felo-content-to-slides`, then use `/felo-content-to-slides` or ask to turn a URL into slides. See [felo-content-to-slides](./felo-content-to-slides/README.md).

**Felo X Search:** In terminal run `felo x "query"` to search tweets, users, and replies on X (Twitter) (see [felo-x-search](./felo-x-search/SKILL.md)). In Claude Code install the skill and use it to search X content.

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

**[See 40+ more examples >](./docs/EXAMPLES.md)**

---

## Installation details

### Prerequisites

- [Claude Code](https://claude.ai/code) CLI installed
- Node.js (for npx)
- Internet connection

### Manual installation

If you don't want to use `npx skills add` or don't have the skills CLI, you can install it manually:

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

3. Get API key from [felo.ai](https://felo.ai) (Settings > API Keys)

4. Set environment variable (see Quick Start)

5. Restart Claude Code: `claude restart`

### Verify installation

```bash
claude skills list
```

You should see `felo-search` in the output.

Test: ask Claude _"Latest news about quantum computing"_. If you see an AI-generated answer, it's working.

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

**A:** Your API key is incorrect or revoked. Generate a new one at [felo.ai](https://felo.ai) (Settings > API Keys).

### Q: Does it work in Chinese/Japanese/Korean?

**A:** Yes. Multi-language queries are supported; ask in any language.

### Q: Rate limits?

**A:** Check your Felo account tier at [felo.ai](https://felo.ai). Free tier available.

### Q: Can I use it offline?

**A:** No, it requires an internet connection to the Felo API.

### Q: How fast are responses?

**A:** Typically 2-5 seconds depending on query complexity.

**[Full FAQ >](./docs/FAQ.md)**

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

**[View skill documentation >](./felo-search/)**

### felo-slides

Generate PPT: in terminal use `felo slides "your topic"`, in Claude Code use `/felo-slides your topic`. **[View skill documentation >](./felo-slides/)**

### felo-web-fetch

Fetch and extract webpage content: in terminal use `felo web-fetch --url "https://example.com"`, in Claude Code use `/felo-web-fetch https://example.com`. **[View skill documentation >](./felo-web-fetch/)**

### felo-content-to-slides

Fetch content from a URL (webpage or YouTube) and generate a PPT: in terminal use `felo content-to-slides -u "<url>"` or `-v "<youtube-url>"`, in Claude Code use `/felo-content-to-slides` or ask to turn a link into slides. **[View skill documentation >](./felo-content-to-slides/README.md)**

### felo-x-search

Search X (Twitter) tweets, users, and replies: in terminal use `felo x "query"`, in Claude Code use `/felo-x-search query`. **[View skill documentation >](./felo-x-search/SKILL.md)**

### felo-superAgent

SuperAgent conversation with SSE streaming and LiveDoc integration. In terminal use `felo superagent "your question"`, manage LiveDocs with `felo livedocs` and `felo livedoc-resources <id>`. **[View skill documentation →](./felo-superAgent/)**

---

## Contributing

We welcome contributions:

- Report bugs or request features
- Improve documentation
- Add new skills

Run CLI tests: `npm test`

**[Contributing guide >](./CONTRIBUTING.md)**

---

## Links

- **[npm: felo-ai](https://www.npmjs.com/package/felo-ai)** - CLI package
- **[Felo Open Platform](https://openapi.felo.ai/docs/)** - Get your API key
- **[API Documentation](https://openapi.felo.ai/docs/api-reference/v2/chat.html)** - API reference
- **[Claude Code](https://claude.ai/code)** - AI assistant CLI
- **[Full examples](./docs/EXAMPLES.md)** - 40+ usage examples
- **[FAQ](./docs/FAQ.md)** - Troubleshooting
- **[GitHub Issues](https://github.com/Felo-Inc/felo-skills/issues)** - Report bugs

---

## Publishing to npm (maintainers)

This project uses GitHub Actions to automatically publish when **pushing a tag** (referencing the [editablejs/editable](https://github.com/editablejs/editable/blob/main/.github/workflows/main.yml) publishing workflow).

1. **Configure NPM_TOKEN**
   Generate an **Automation** type Publish token in [npm Access Tokens](https://www.npmjs.com/account/tokens). Add a secret named `NPM_TOKEN` in the repository's **Settings > Secrets and variables > Actions**.

2. **Publish a new version**
   Update the `version` in `package.json`, then commit and push the tag:
   ```bash
   git tag v0.2.8
   git push origin v0.2.8
   ```
   CI will automatically run `npm publish` to publish to [npm](https://www.npmjs.com/package/felo-ai).

---

## Support

- **Documentation**: [FAQ](./docs/FAQ.md) and skill READMEs
- **Issues**: [GitHub Issues](https://github.com/Felo-Inc/felo-skills/issues)
- **Email**: support@felo.ai

---

## Version history

See [CHANGELOG.md](./CHANGELOG.md) for release notes (e.g. breaking changes such as `web-extract` -> `web-fetch` in v0.2.7).

---

## License

MIT - see [LICENSE](./felo-search/LICENSE) in the repo for details.

---

Made with ❤️ by the Felo team
