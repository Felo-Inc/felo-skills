# Felo Content to Slides Skill

Fetch content from a webpage or YouTube video, then generate a PPT from that content. Combines this repo's web-fetch, youtube-subtitling, and slides capabilities.

## Install Skill (Claude Code)

**One-line install:**

```bash
npx skills add Felo-Inc/felo-skills --skill felo-content-to-slides
```

**Manual install:** Copy this directory into Claude Code's skills folder:

```bash
# Linux/macOS
cp -r felo-content-to-slides ~/.claude/skills/

# Windows (PowerShell)
Copy-Item -Recurse felo-content-to-slides "$env:USERPROFILE\.claude\skills\"
```

## Notes

- **Generation time:** PPT generation usually takes **3–5 minutes** or more; please wait. Default max wait is 20 minutes (adjust with `--poll-timeout`).

## Configuration

Same as other Felo commands: set `FELO_API_KEY` (and optionally `FELO_API_BASE`).

```bash
felo config set FELO_API_KEY your-api-key-here
# or
export FELO_API_KEY="your-api-key-here"   # Linux/macOS
$env:FELO_API_KEY="your-api-key-here"     # Windows PowerShell
```

## Trigger

- Intent: "fetch page/video and make PPT", "turn URL into slides", "generate presentation from link"
- Explicit: `/felo-content-to-slides`

## Using the CLI

After installing **felo-ai**:

```bash
npm install -g felo-ai
felo content-to-slides -u "https://example.com/article" --readability
felo content-to-slides -v "https://www.youtube.com/watch?v=ID" --extra-prompt "max 10 slides"
```

From this repo root (no global install):

```bash
node src/cli.js content-to-slides --url "https://openclaw.ai/" --readability
node src/cli.js content-to-slides --video "https://www.youtube.com/watch?v=xxx" -l zh-CN
```

### Options

| Option | Flag | Description |
|--------|------|-------------|
| Web page URL | `-u`, `--url` | URL to fetch and turn into slides |
| Video URL/ID | `-v`, `--video` | YouTube link or video ID (uses subtitles as content) |
| Extra instructions | `--extra-prompt` | e.g. "max 10 slides", "focus on conclusions" |
| Readability | `--readability` | For `--url` only: extract main body only |
| Subtitle language | `-l`, `--language` | For `--video` only: e.g. zh-CN, en |
| Fetch timeout | `-t`, `--timeout` | Seconds (default 60) |
| Poll timeout | `--poll-timeout` | Max seconds to wait for PPT (default 1200) |
| JSON output | `-j`, `--json` | Output task_id, ppt_url, live_doc_url |
| Verbose | `--verbose` | Print polling status |

## Links

- [SKILL.md](SKILL.md) – Full agent instructions
- [Felo Open Platform](https://openapi.felo.ai/docs/)
- [felo-web-fetch](../felo-web-fetch/) | [felo-youtube-subtitling](../felo-youtube-subtitling/) | [felo-slides](../felo-slides/)
