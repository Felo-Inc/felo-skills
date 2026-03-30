# Felo Twitter Writer Skill

Dual-mode Twitter/X writing tool powered by [Felo SuperAgent](https://openapi.felo.ai/docs/api-reference/v2/superagent.html).

**Mode 1** — Fetch tweets from any X account and extract a writing style DNA document.
**Mode 2** — Compose tweets, threads, or X long-form posts, optionally guided by a brand style from your style library.

## Features

- **Style DNA extraction** — analyze an account's tone, sentence structure, hooks, hashtag strategy, emoji usage, and more
- **Brand style selection** — before writing, fetches your TWITTER style library and lets you pick a style; the chosen style is passed to SuperAgent via `--ext` for more accurate output
- **Tweet creation** — single tweets, threads, or X long-form posts, default 3 versions
- **Style imitation** — write in the voice of any public X account
- **Iterative editing** — refine generated content via follow-up conversation
- Powered by SuperAgent with `twitter-writer` skill, real-time SSE streaming
- Same `FELO_API_KEY` as other Felo skills

## Prerequisites

- [`felo-superAgent`](../felo-superAgent/) skill available (provides `run_superagent.mjs` and `run_style_library.mjs`)
- [`felo-x-search`](../felo-x-search/) skill available
- [`felo-livedoc`](../felo-livedoc/) skill available

## Quick Start

### 1) Configure API key

At [felo.ai](https://felo.ai) → Settings → API Keys, create a key, then:

```bash
# Linux/macOS
export FELO_API_KEY="your-api-key-here"
```

```powershell
# Windows PowerShell
$env:FELO_API_KEY="your-api-key-here"
```

```cmd
:: Windows CMD
set FELO_API_KEY=your-api-key-here
```

### 2) Mode 1 — Extract style DNA

```bash
# Step 1: Fetch tweets from an account
node felo-x-search/scripts/run_x_search.mjs --id "elonmusk" --user --tweets --limit 30
node felo-x-search/scripts/run_x_search.mjs --id "elonmusk" --user

# Step 2: Get your live_doc_id
node felo-livedoc/scripts/run_livedoc.mjs list --json
# node felo-livedoc/scripts/run_livedoc.mjs create --name "Twitter Writer" --json

# Step 3: Pass tweets to SuperAgent for style analysis
node felo-superAgent/scripts/run_superagent.mjs \
  --query "/twitter-writer Analyze the following tweets from @elonmusk and extract a writing style DNA document covering tone, sentence structure, opening hooks, hashtag strategy, and emoji usage.\n\nBio: [BIO]\n\nTweets:\n[TWEETS]" \
  --live-doc-id "LIVE_DOC_ID" \
  --skill-id twitter-writer \
  --accept-language en
```

### 3) Mode 2 — Create content with brand style

```bash
# Step 1: Fetch your TWITTER style library
node felo-superAgent/scripts/run_style_library.mjs --category TWITTER --accept-language en
# Output example:
#   Style name: darioamodei
#   Style labels: Thoughtful long-form essays
#   Style DNA: # Dario Amodei (@DarioAmodei) Tweet Writing Style DNA
#   ...

# Step 2: Pass the chosen style via --ext (full Style DNA, do NOT truncate)
node felo-superAgent/scripts/run_superagent.mjs \
  --query "/twitter-writer Write 3 versions of a tweet about AI trends." \
  --live-doc-id "LIVE_DOC_ID" \
  --skill-id twitter-writer \
  --ext '{"brand_style_requirement":"Style name: darioamodei\nStyle labels: Thoughtful long-form essays\nStyle DNA: # Dario Amodei...(full content)"}' \
  --accept-language en

# Follow-up (thread already exists — no --ext needed)
node felo-superAgent/scripts/run_superagent.mjs \
  --query "/twitter-writer Make the second version more concise." \
  --thread-id "THREAD_SHORT_ID" \
  --live-doc-id "LIVE_DOC_ID" \
  --accept-language en
```

## Style Library

The style library (`run_style_library.mjs`) returns your saved TWITTER writing styles. Each entry contains:

| Field | Source | Notes |
|---|---|---|
| `Style name` | `name` | Always present |
| `Style labels` | `content.labels[lang]` | Language-aware, comma-separated; omitted if absent |
| `Style DNA` | `content.styleDna` | Full text — pass completely, never truncate |
| `Cover file ID` | `coverFileId` | Omitted if null |

User-created styles appear before recommended styles.

```bash
# List styles in English
node felo-superAgent/scripts/run_style_library.mjs --category TWITTER --accept-language en

# List styles in Chinese
node felo-superAgent/scripts/run_style_library.mjs --category TWITTER --accept-language zh-Hans

# Raw JSON output
node felo-superAgent/scripts/run_style_library.mjs --category TWITTER --json
```

## Using with Claude Code

### Installation

```bash
# Via ClawHub
clawhub install felo-twitter-writer

# Manual
cp -r felo-twitter-writer ~/.claude/skills/
cp -r felo-superAgent ~/.claude/skills/
cp -r felo-x-search ~/.claude/skills/
cp -r felo-livedoc ~/.claude/skills/
```

### Triggering the skill

Claude Code automatically triggers this skill when it detects tweet-writing or style-analysis intent. You can also invoke it explicitly:

```
/felo-twitter-writer Analyze @paulg's tweet style and extract a style DNA document
/felo-twitter-writer Write 3 tweets about AI trends
/felo-twitter-writer Write a Twitter thread about why most startups fail
/felo-twitter-writer Write a tweet about AI in the style of @darioamodei
```

### What Claude does automatically

When you ask Claude to write tweets (Mode 2, new conversation):

1. **Fetches your TWITTER style library** — runs `run_style_library.mjs --category TWITTER`
2. **Presents style options** — shows names grouped as "Your styles" / "Recommended styles" plus a "No preference" option
3. **Waits for your choice** — then calls SuperAgent with the full style block in `--ext`
4. **Streams the result** — answer appears in real time; follow-ups reuse the thread without re-fetching styles

If the style library is empty, Claude skips the selection step silently and proceeds without `--ext`.

### Example conversation

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

Claude: [streams the thread in "My Bold Voice" style in real time]

You:    Make the hook tweet more provocative

Claude: [follow-up — no style re-selection needed]
```

## Trigger keywords

English: `write a tweet`, `draft a tweet`, `twitter thread`, `X article`, `style DNA`, `imitate tweet style`, `tweet in the style of`, `write like [account]`, `X account analysis`, `ghostwrite tweets`, `how does [account] write`

Japanese: `ツイートを書く`, `ツイートスタイル分析`, `スタイルDNA`, `ツイートを模倣`, `Xアカウント分析`, `〇〇風のツイートを書く`, `ツイートを代筆`

Explicit command: `/felo-twitter-writer`

## References

- [SKILL.md](SKILL.md) — full agent instructions and decision logic
- [felo-superAgent README](../felo-superAgent/README.md) — SuperAgent usage and style library script
- [Felo Open Platform](https://openapi.felo.ai/docs/)
- [Get API Key](https://felo.ai) (Settings → API Keys)
