# Felo Twitter Writer Skill

Dual-mode Twitter/X writing tool powered by [Felo SuperAgent](https://openapi.felo.ai/docs/api-reference/v2/superagent.html).

**Mode 1** — Fetch tweets from any X account and extract a writing style DNA document.
**Mode 2** — Compose tweets, threads, or X long-form posts based on a style DNA and topic.

## Features

- **Style DNA extraction** — analyze an account's tone, sentence structure, hooks, hashtag strategy, and more
- **Tweet creation** — single tweets, threads, or X long-form posts, default 3 versions
- **Style imitation** — write in the voice of any public X account
- **Iterative editing** — refine generated content via follow-up conversation
- Powered by SuperAgent with `twitter-writer` skill, real-time SSE streaming
- Same `FELO_API_KEY` as other Felo skills

## Prerequisites

- [`felo-superAgent`](../felo-superAgent/) skill available
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

# Step 2: Get your live_doc_id (list existing, or create one if empty)
node felo-livedoc/scripts/run_livedoc.mjs list --json
# node felo-livedoc/scripts/run_livedoc.mjs create --name "Twitter Writer" --json

# Step 3: Pass tweets to SuperAgent for style analysis
# First call in session (no thread_short_id yet):
node felo-superAgent/scripts/run_superagent.mjs \
  --query "/twitter-writer Analyze the following tweets from @elonmusk and extract a writing style DNA document covering tone, sentence structure, opening hooks, hashtag strategy, and emoji usage.\n\nBio: [BIO]\n\nTweets:\n[TWEETS]" \
  --live-doc-id "LIVE_DOC_ID" \
  --skill-id twitter-writer \
  --accept-language en
```

### 3) Mode 2 — Create content

```bash
# New conversation (no thread_short_id in session)
node felo-superAgent/scripts/run_superagent.mjs \
  --query "/twitter-writer Write 3 versions of a tweet about AI trends in an engaging, punchy style." \
  --live-doc-id "LIVE_DOC_ID" \
  --skill-id twitter-writer \
  --accept-language en

# Follow-up after Mode 1 (thread_short_id already exists — pass --thread-id from previous [state] output)
node felo-superAgent/scripts/run_superagent.mjs \
  --query "/twitter-writer Based on the style DNA above, write 3 tweets about startups. Keep each under 280 characters." \
  --thread-id "THREAD_SHORT_ID" \
  --live-doc-id "LIVE_DOC_ID" \
  --accept-language en
```

## When to use (Agent)

Trigger keywords: `write a tweet`, `twitter thread`, `style DNA`, `imitate tweet style`, `tweet in the style of`, `X account analysis`, `ghostwrite tweets`, `how does [account] write`, `ツイートを書く`, `ツイートスタイル分析`, `スタイルDNA`, `ツイートを模倣`, `〇〇風のツイートを書く`, `ツイートを代筆`, `Xアカウント分析`, `/felo-twitter-writer`.

See [SKILL.md](SKILL.md) for full agent instructions.
