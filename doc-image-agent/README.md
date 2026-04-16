# doc-image-agent

`doc-image-agent` is a skill package for automatically adding screenshots and generated images to Markdown documents.

It is designed for agent workflows that need to:
- parse Markdown image markers
- capture product or website screenshots
- generate conceptual illustrations
- place images back into the most relevant paragraph
- produce a clean illustrated Markdown output

## Package Structure

```text
doc-image-agent/
├── SKILL.md
├── references/
│   ├── browser-automation.md
│   ├── playwright-mcp.md
│   ├── site-explorer.md
│   └── image-generation.md
├── scripts/
│   └── generate_image.py
├── README.md
└── LICENSE
```

## Design Principles

- one main skill entry point
- supporting guidance stored as references instead of extra skills
- Playwright MCP as the preferred browser automation path
- incremental execution instead of full reruns by default
- strict separation between raw screenshots and final output assets
- environment-based credentials and API keys

## What the Skill Expects

Typical input:
- a Markdown document under `cases/{article-id}.md`
- inline image markers or an `Image Summary` table
- environment variables for any website credentials or image-generation provider keys

Typical output:
- `output/{article-id}/raw/*.png`
- `output/{article-id}/*.png`
- `output/{article-id}/README.md`
- `output/markdowns/{article-id}.md`

## Marker Formats

The skill supports:
- heading-based screenshot markers
- HTML comment image markers for screenshots and generated images
- end-of-document `Image Summary` tables

See `SKILL.md` for the full workflow.

## Environment Variables

Examples:

```bash
export PLAYWRIGHT_CRED_FELO_EMAIL="user@example.com"
export PLAYWRIGHT_CRED_FELO_PASSWORD="secret"
export OPENROUTER_API_KEY="..."
```

## Included Script

Generate images with:

```bash
python scripts/generate_image.py "Editorial illustration of a collaborative AI workflow" -o output/hero.png
```

## Publishing Notes

This repository is intentionally packaged for skill systems that prefer:
- a single top-level skill
- linked references
- bundled scripts for reusable automation

## License

MIT
