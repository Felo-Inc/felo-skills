---
name: felo-content-to-slides
description: "Fetch content from a webpage or YouTube video, then generate a PPT from that content using Felo APIs. Use when the user wants to turn a URL (article/page or YouTube) into a presentation, or explicit /felo-content-to-slides."
---

# Felo Content to Slides Skill

## When to Use

Trigger this skill when the user wants to:

- Turn a **webpage URL** or **article link** into a presentation
- Turn **YouTube video** (subtitles/transcript) into a PPT
- Fetch page/video content and generate slides from it

Trigger keywords (examples):

- Turn URL into slides, fetch page and make presentation, video transcript to PPT
- Explicit: `/felo-content-to-slides`, "use felo content to slides"

Do NOT use for:

- Only fetching content without PPT (use `felo-web-fetch` or `felo-youtube-subtitling`)
- Only generating PPT from a topic/outline (use `felo-slides`)
- Real-time search (use `felo-search`)

## Setup

Same as other Felo skills: set `FELO_API_KEY` (and optionally `FELO_API_BASE`). No extra setup.

## How to Execute

Use the **CLI** from this repo. From the **felo-skills repo root**:

```bash
node src/cli.js content-to-slides --url "https://example.com/article" [options]
# or for YouTube:
node src/cli.js content-to-slides --video "https://www.youtube.com/watch?v=ID" [options]
```

If **felo-ai** is installed globally (`npm install -g felo-ai`):

```bash
felo content-to-slides -u "https://example.com/article" [options]
felo content-to-slides -v "https://www.youtube.com/watch?v=ID" [options]
```

### Options

| Option | Description |
|--------|-------------|
| `-u, --url <url>` | Web page URL to fetch and turn into slides |
| `-v, --video <url-or-id>` | YouTube video URL or ID (use subtitles as content) |
| `--extra-prompt <text>` | Extra instructions for PPT (e.g. max 10 slides) |
| `--readability` | For --url: use readability (main content only) |
| `-l, --language <code>` | For --video: subtitle language (e.g. en, zh-CN) |
| `-t, --timeout <seconds>` | Fetch timeout (default 60) |
| `--poll-timeout <seconds>` | Max seconds to wait for PPT task (default 1200) |
| `-j, --json` | Output JSON with task_id and ppt/live_doc URL |
| `--verbose` | Show polling status |

Provide **either** `--url` or `--video`, not both.

### Examples

```bash
# Web page → PPT (with readability)
node src/cli.js content-to-slides --url "https://openclaw.ai/" --readability

# YouTube → PPT, with extra instruction
node src/cli.js content-to-slides -v "https://www.youtube.com/watch?v=xxx" --extra-prompt "max 10 slides"

# With JSON output
felo content-to-slides -u "https://example.com/article" --readability -j
```

## Output Format

On success:

```markdown
## Content to Slides Done

- Source: <webpage URL or YouTube video>
- Task ID: <task_id>
- PPT URL: <ppt_url>
- Live Doc: <live_doc_url or N/A>
```

On failure: state which step failed (fetch / PPT generation) and the error message; suggest checking URL, network, or API key.

## Important Notes

- Always check `FELO_API_KEY` before running (or prompt user to run `felo config set FELO_API_KEY <key>`).
- For long articles or transcripts, content is truncated; if PPT create fails with size error, the user may retry with a shorter page or different URL.
- Web fetch may need `--timeout` for slow sites; YouTube may have no subtitles for some videos—report clearly.

## References

- Content fetch: felo-web-fetch, felo-youtube-subtitling (same repo)
- PPT generation: felo-slides (same repo)
- [Felo Open Platform](https://openapi.felo.ai/docs/)
