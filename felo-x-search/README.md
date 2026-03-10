# Felo X Search Skill

Search X (Twitter) tweets, users, and replies using the [Felo X Search API](https://openapi.felo.ai/docs/api-reference/v2/x-search.html).

## Features

- **Search tweets** by keyword with advanced query support
- **Search users** by keyword
- **Get user info** by username (batch supported)
- **Get user tweets** by username, with optional replies
- **Get tweet replies** by tweet ID
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

### 2) Run

```bash
# From repo: script
node felo-x-search/scripts/run_x_search.mjs "AI news"

# After npm install -g felo-ai: CLI
felo x "AI news"
```

## All parameters

| Parameter | Option | Example |
|-----------|--------|---------|
| Search keyword | `[query]` or `-q, --query` | `felo x "AI news"` or `-q "AI news"` |
| Tweet IDs or usernames | `--id` | `--id "elonmusk"` or `--id "123,456"` |
| User mode | `--user` | `--user` |
| Get user tweets | `--tweets` | `--tweets` (with `--id --user`) |
| Result limit | `-l, --limit` | `--limit 20` |
| Pagination cursor | `--cursor` | `--cursor "abc123"` |
| Include replies | `--include-replies` | `--include-replies` (with `--tweets`) |
| Query type filter | `--query-type` | `--query-type "Latest"` |
| Start time filter | `--since-time` | `--since-time "2026-01-01"` |
| End time filter | `--until-time` | `--until-time "2026-03-01"` |
| Full JSON response | `-j, --json` | `-j` |
| Timeout (seconds) | `-t, --timeout` | `-t 60` |

## Usage patterns

**Search mode** (with query):

```bash
felo x "AI news"                    # Search tweets (default)
felo x "OpenAI" --user              # Search users
felo x "AI" --limit 10 --json      # Search with limit, raw JSON output
```

**Lookup mode** (with --id):

```bash
felo x --id "elonmusk" --user                       # Get user info
felo x --id "elonmusk,OpenAI" --user                # Batch user info
felo x --id "elonmusk" --user --tweets              # Get user tweets
felo x --id "elonmusk" --user --tweets --limit 20   # With limit
felo x --id "1234567890"                            # Get tweet replies
```

## When to use (Agent)

Trigger keywords: twitter, tweet, X user, X search, tweets from, replies to, trending on X, 推特, 推文, `/felo-x-search`.

See [SKILL.md](SKILL.md) for full agent instructions and API parameters.
