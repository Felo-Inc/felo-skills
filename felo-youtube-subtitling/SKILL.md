---
name: felo-youtube-subtitling
description: "Fetch YouTube video subtitles/captions using Felo YouTube Subtitling API. Use when users ask to get YouTube subtitles, extract captions from a video, fetch transcript by video ID or URL, or when explicit commands like /felo-youtube-subtitling are used. Supports language and optional timestamps."
---

# Felo YouTube Subtitling Skill

## When to Use

Trigger this skill when the user wants to:

- Get subtitles or captions from a YouTube video
- Extract transcript by video ID or video URL
- Fetch subtitles in a specific language (e.g. en, zh-CN)
- Get subtitles with timestamps for analysis or translation

Trigger keywords (examples):

- YouTube subtitles, get captions, video transcript, extract subtitles, YouTube 字幕
- Explicit: `/felo-youtube-subtitling`, "use felo youtube subtitling"

Do NOT use for:

- Real-time search (use `felo-search`)
- Web page content (use `felo-web-extract`)
- Generating slides (use `felo-slides`)

## Setup

### 1. Get API key

1. Visit [felo.ai](https://felo.ai)
2. Open Settings -> API Keys
3. Create and copy your API key

### 2. Configure environment variable

Linux/macOS:

```bash
export FELO_API_KEY="your-api-key-here"
```

Windows PowerShell:

```powershell
$env:FELO_API_KEY="your-api-key-here"
```

## How to Execute

### Option A: Use the bundled script or packaged CLI

**Script** (from repo):

```bash
node felo-youtube-subtitling/scripts/run_youtube_subtitling.mjs --video-code "dQw4w9WgXcQ" [options]
```

**Packaged CLI** (after `npm install -g felo-ai`):

```bash
felo youtube-subtitling -v "dQw4w9WgXcQ" [options]
# Short forms: -v (video-code), -l (language), -j (json)
```

Options:

| Option | Default | Description |
|--------|---------|-------------|
| `--video-code` / `-v` | (required) | YouTube **video URL** or **video ID** (e.g. `https://youtube.com/watch?v=ID` or `dQw4w9WgXcQ`) |
| `--language` / `-l` | - | Subtitle language code (e.g. `en`, `zh-CN`) |
| `--with-time` | false | Include start/duration timestamps in each segment |
| `--json` / `-j` | false | Print full API response as JSON |

You can pass either a **full YouTube link** or the **11-character video ID**:

- Supported URLs: `https://www.youtube.com/watch?v=ID`, `https://youtu.be/ID`, `https://youtube.com/embed/ID`
- Or plain ID: `dQw4w9WgXcQ`

Examples:

```bash
# With video URL
node felo-youtube-subtitling/scripts/run_youtube_subtitling.mjs --video-code "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
felo youtube-subtitling -v "https://youtu.be/dQw4w9WgXcQ"

# With video ID
node felo-youtube-subtitling/scripts/run_youtube_subtitling.mjs -v "dQw4w9WgXcQ" --language zh-CN

# With timestamps
node felo-youtube-subtitling/scripts/run_youtube_subtitling.mjs -v "dQw4w9WgXcQ" --with-time --json
```

### Option B: Call API with curl

```bash
curl -X GET "https://openapi.felo.ai/v2/youtube/subtitling?video_code=dQw4w9WgXcQ" \
  -H "Authorization: Bearer $FELO_API_KEY"
```

## API Reference (summary)

- **Endpoint**: `GET /v2/youtube/subtitling`
- **Base URL**: `https://openapi.felo.ai`. Override with `FELO_API_BASE` env if needed.
- **Auth**: `Authorization: Bearer YOUR_API_KEY`

### Query parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| video_code | string | Yes | - | YouTube video ID (e.g. dQw4w9WgXcQ) |
| language | string | No | - | Language code (e.g. en, zh-CN) |
| with_time | boolean | No | false | Include start/duration per segment |

### Response (200)

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "title": "Video title",
    "contents": [
      { "start": 0.32, "duration": 14.26, "text": "Subtitle text" }
    ]
  }
}
```

With `with_time=false`, `start`/`duration` may be absent or zero. `contents[].text` is always present.

### Error codes

| HTTP | Code | Description |
|------|------|-------------|
| 400 | - | Parameter validation failed (e.g. missing video_code) |
| 401 | INVALID_API_KEY | API key invalid or revoked |
| 500/502 | YOUTUBE_SUBTITLING_FAILED | Service error or subtitles unavailable for video |

## Output Format

- Without `--json`: print title and then each segment's text (one per line or concatenated). If `--with-time`, output includes timestamps.
- With `--json`: print full API response.

On failure (no subtitles, API error): stderr message and exit 1. Example:

```
YouTube subtitling failed for video dQw4w9WgXcQ: YOUTUBE_SUBTITLING_FAILED
```

## Important Notes

- Not all videos have subtitles; the API may return an error for some videos.
- Language code must match a subtitle track available for the video.
- Same `FELO_API_KEY` as other Felo skills.

## References

- [Felo YouTube Subtitling API](https://openapi.felo.ai/docs/api-reference/v2/youtube-subtitling.html)
- [Felo Open Platform](https://openapi.felo.ai/docs/)
