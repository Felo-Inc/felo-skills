# Felo YouTube Subtitling Skill

Fetch YouTube video subtitles/captions using the [Felo YouTube Subtitling API](https://openapi.felo.ai/docs/api-reference/v2/youtube-subtitling.html).

## Features

- Get subtitles by **YouTube video URL** or **video ID** (e.g. `https://youtube.com/watch?v=ID` or `dQw4w9WgXcQ`)
- Optional **language** (e.g. `en`, `zh-CN`)
- Optional **timestamps** (`--with-time`) for each segment
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
# From repo: script (URL or video ID)
node felo-youtube-subtitling/scripts/run_youtube_subtitling.mjs --video-code "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

# After npm install -g felo-ai: CLI
felo youtube-subtitling -v "https://youtu.be/dQw4w9WgXcQ"
felo youtube-subtitling -v "dQw4w9WgXcQ"
```

## All parameters

| Parameter | Option | Example |
|-----------|--------|---------|
| Video URL or ID (required) | `-v`, `--video-code` | `--video-code "https://youtube.com/watch?v=ID"` or `"dQw4w9WgXcQ"` |
| Language | `-l`, `--language` | `--language zh-CN` |
| Include timestamps | `--with-time` | `--with-time` |
| Full JSON response | `-j`, `--json` | `-j` |

**Examples**

```bash
felo youtube-subtitling -v "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
felo youtube-subtitling -v "dQw4w9WgXcQ" --language en --with-time -j
```

## When to use (Agent)

Trigger keywords: YouTube subtitles, get captions, video transcript, extract subtitles, `/felo-youtube-subtitling`.

See [SKILL.md](SKILL.md) for full agent instructions and API parameters.
