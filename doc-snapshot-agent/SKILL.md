---
name: doc-snapshot-agent
description: "Automatically illustrate Markdown documents by turning image markers into browser screenshots or AI-generated images, then writing an image-enriched Markdown output. Use when a document needs screenshots, generated visuals, semantic image placement, or end-to-end document illustration automation."
license: MIT
metadata:
  slug: doc-snapshot-agent
  version: 1.1.0
  author: Felo Inc
  changelog: Restructured SKILL.md (decision-first layout, Core Rules, Traps, Security sections); merged browser-automation and playwright-mcp references into browser-capture; moved install commands into mcp-setup.
  hermes:
    tags: [documentation, markdown, screenshots, image-generation, browser-automation, agent-workflow]
    homepage: https://github.com/Felo-Inc/felo-skills
    requires:
      bins: [node, npx, python]
      mcp: [playwright]
      env:
        - name: OPENROUTER_API_KEY
          required_for: generated-image markers
        - name: PLAYWRIGHT_CRED_{SERVICE}_{FIELD}
          required_for: sites that need authentication
---

## When to Use

Load this skill when a Markdown document needs real images — screenshots of live web pages, AI-generated editorial illustrations, or a rerun that only fixes image placement in an already-processed file.

Use it when the user asks to:

- add images to a Markdown article
- process a case file with image markers
- capture screenshots for documentation
- generate article visuals and insert them into a document
- rerun or fix image placement in an already processed document

Do not use it for pure text editing, proofreading, or translation — those tasks do not benefit from browser automation or image generation and should be handled directly.

## Architecture

This skill has a single entry point (this file) plus four sibling references for depth. It does not create hidden memory folders, does not persist browser state, and does not send any data beyond what the target workflow requires.

All paths (input cases, output images, illustrated Markdown, cache) resolve under one `{project-root}` the user names at the start of the run. Browser work routes exclusively through the Playwright MCP server; generated images route through a bundled Python script that calls OpenRouter.

## Quick Start

1. **Check Playwright MCP tools** — confirm `mcp__playwright__browser_navigate` and other `mcp__playwright__*` tools are available. If missing, send the user the install snippet from `references/mcp-setup.md` and stop.
2. **Confirm the project root** — ask once; default to `/tmp/doc-snapshot-agent` if the user has no preference.
3. **Inspect existing artifacts** — reuse anything already on disk (see Incremental Execution).
4. **Parse the case file** — merge markers from heading form, HTML-comment form, and the Image Summary table.
5. **Capture, generate, place, write README** — follow the Workflow section.

## Quick Reference

| Topic | File |
|-------|------|
| Install Playwright MCP for each client, grant permissions, runtime setup | `references/mcp-setup.md` |
| Navigate, snapshot, login, capture, verify — full browser loop and tool patterns | `references/browser-capture.md` |
| Build and maintain site-specific navigation knowledge | `references/site-explorer.md` |
| Prompt construction and script usage for generated images | `references/image-generation.md` |
| Image generation CLI | `scripts/generate_image.py` |

## Approach Selection

| Situation | Best path | Why |
|-----------|-----------|-----|
| Article already has screenshots in `output/{article-id}/raw/` and the user only wants the Markdown rebuilt | Skip capture, rerun Step 5 (Illustrated Markdown) | Browser work is expensive; Markdown regeneration is cheap |
| Marker type is `screenshot` and the page is publicly reachable | Playwright MCP navigate → snapshot → capture | Reliable, inspectable, handles JS rendering |
| Marker type is `screenshot` and the page is behind auth | Playwright MCP with `PLAYWRIGHT_CRED_*` env vars | Keeps secrets out of prompts and the transcript |
| Marker type is `generated` (editorial, hero, conceptual) | `scripts/generate_image.py` via OpenRouter | Screenshots cannot render conceptual imagery |
| Marker landed on the wrong paragraph | Reparse case file, reapply semantic placement | Re-capturing won't fix placement bugs |
| Required MCP tools are missing in the runtime | Stop, point user to `references/mcp-setup.md` | Workflow cannot proceed without MCP |

## Workflow

### Step 0: Verify Playwright MCP

Run this check at the start of **every** execution, not just the first time.

1. Detect tools whose name starts with `mcp__playwright__`. Required: `browser_navigate`, `browser_snapshot`, `browser_take_screenshot`.
2. If they are missing, stop and hand the user the matching install snippet from `references/mcp-setup.md` (Claude Code, Codex, VS Code/Cursor/Kiro, Claude Desktop, or standalone). Include the `permissions.allow: ["mcp__playwright__*"]` note for Claude Code and Codex.
3. After the user installs and restarts the client, resume from here rather than restarting the run.

Do **not** substitute direct Playwright library calls or any browser tool that lacks the `mcp__playwright__` prefix. If the prefix is missing, the call does not go through the MCP server.

### Step 0.5: Confirm the project root

Ask once:

> Which directory should I use as the project root for this run?

- If the user provides a path, use it as `{project-root}`.
- If the user says "no preference", skips, or does not answer, default to `/tmp/doc-snapshot-agent`.
- Create the directory if it does not exist.

All subsequent paths (`cases/`, `output/`, `.cache/`, `scripts/`, `references/`) resolve under `{project-root}/`.

Recommended layout inside `{project-root}/`:

```text
{project-root}/
├── cases/
│   └── {article-id}.md
├── output/
│   ├── {article-id}/
│   │   ├── raw/
│   │   │   ├── A1_example.png
│   │   │   └── A2_example.png
│   │   ├── A1_example.png
│   │   ├── A2_example.png
│   │   └── README.md
│   └── markdowns/
│       └── {article-id}.md
└── .cache/
    └── screenshots/
        └── {article-id}/
```

Conventions:
- `cases/` holds the source Markdown.
- `output/{article-id}/raw/` holds original browser screenshots — **never overwrite** files here.
- `output/{article-id}/` holds post-processed assets that the final Markdown references.
- `output/markdowns/` holds the final illustrated Markdown.
- `.cache/screenshots/` holds reusable screenshot cache entries.

If the user specifies a different layout, follow their instruction.

### Step 1: Parse the case file

Merge image requirements from three sources:

1. inline heading-based screenshot markers
2. inline `<!-- IMAGE: ... -->` markers
3. the `Image Summary` table

For each image, record: type (`screenshot` or `generated`), filename, marker id if present, description or purpose, source URL if present, post-processing instruction if present, exact inline location if present, and whether semantic placement is still required. Also detect the target websites referenced by the article.

### Step 2: Prepare the environment

- create output directories
- check the screenshot cache for reusable entries
- load credentials from environment variables (pattern: `PLAYWRIGHT_CRED_{SERVICE}_{FIELD}`)
- re-confirm Playwright MCP tools are present
- if the Chromium runtime is missing, run `npx playwright install chromium` (see `references/mcp-setup.md`)
- if the target flow needs login/signup/invite/verification and the required information is not already supplied, pause and ask the user before taking any account-specific action

### Step 2.5: Understand the target site

Bad screenshots usually come from landing on the wrong page, not from the wrong capture command. Before capturing:

1. Check for existing site knowledge under `$IMAGE_AGENT_SITE_KNOWLEDGE_DIR/` and `$IMAGE_AGENT_SITE_LEARNING_DIR/`.
2. Derive a stable `site-key` from the domain (`memclaw.me` → `memclaw`, `app.felo.ai` → `felo`).
3. If `{site-key}.md` exists and is recent, read it before browsing.
4. If knowledge is missing or stale, run a structured site exploration — see `references/site-explorer.md` — and save findings for reuse.
5. Map every screenshot description to a specific page or UI state: target URL or click path, required visible elements, scroll/tab/expand actions needed.
6. Append new knowledge to the site knowledge files whenever browsing discovers something worth remembering.

### Step 3: Capture browser screenshots

Follow `references/browser-capture.md` for the full navigate → snapshot → act → wait → capture → verify loop and the concrete tool patterns.

Typical flow:
- open the target website
- log in if required (credentials from env)
- navigate to the correct page or UI state
- wait for key content to load
- resize the viewport if the requested layout needs it
- save screenshots to `{project-root}/output/{article-id}/raw/`

Naming rule:
- if a marker id exists, save as `{marker-id}_{filename}` (e.g. `A1_workspace-dashboard.png`)
- otherwise use the original filename

After each capture, open the image file and confirm it matches the description. DOM inspection is not a substitute for looking at the saved PNG.

### Step 4: Post-process screenshots

Apply the `Processing:` instruction if present (crop, resize, aspect-ratio adjustment). Copy from `raw/` into the final output directory — never edit `raw/` in place.

- `raw/` keeps untouched originals.
- `output/{article-id}/` holds the assets the Markdown references.

### Step 5: Generate the illustrated Markdown

#### 5.1 Replace inline markers in place

Heading marker:

```markdown
### 📷 Screenshot: A1 (workspace-dashboard.png)
Use: Show the authenticated workspace homepage
Processing: Full-width screenshot
```

becomes:

```markdown
![Authenticated workspace homepage](../{article-id}/A1_workspace-dashboard.png)
```

HTML comment marker:

```markdown
<!-- IMAGE: screenshot (https://example.com/app)
Description: Workspace dashboard showing Architecture Decisions
Filename: architecture-decisions.png
-->
```

becomes:

```markdown
![Workspace dashboard showing Architecture Decisions](../{article-id}/architecture-decisions.png)
```

#### 5.2 Semantically place images that have no inline marker

For images that appear only in the `Image Summary` table:

- read the description carefully
- extract its key concepts
- search the document paragraph by paragraph
- find the paragraph that discusses the same concept most directly
- insert the image immediately after that paragraph — not at the end of the section, not at the end of the article

Example: a description of `Share panel showing team members and invite controls` belongs next to the paragraph that mentions inviting teammates, not at the end of a general onboarding section.

#### 5.3 Handle generated images

For `generated` markers, follow `references/image-generation.md` and call the bundled script:

```bash
python {project-root}/scripts/generate_image.py "{description}" -o "{project-root}/output/{article-id}/{filename}"
```

For text-heavy images, use the stronger model:

```bash
python {project-root}/scripts/generate_image.py "{description}" -o "{project-root}/output/{article-id}/{filename}" -m google/gemini-3-pro-image-preview
```

If generation succeeds, insert the normal Markdown image reference. If it fails, insert a warning block and record the failure in the README:

```markdown
> Warning: AI image generation failed for {filename}
```

Generation prompt guidance: include the subject clearly, mention visual style if the article implies one, flag whether the image is for a technical article or tutorial, and state any required visible text explicitly.

#### 5.4 Remove the Image Summary table

The `Image Summary` block is workflow metadata. Strip it from the final illustrated Markdown.

### Step 6: Write the README inventory

Create `{project-root}/output/{article-id}/README.md`:

```markdown
# {article-id} Illustration Output

Article: {title}
Completed: {timestamp}

## Image Inventory

| Filename | Marker | Description | Size | Processing |
|----------|--------|-------------|------|------------|
| A1_example.png | A1 | Workspace dashboard | 1200x800 | resized |

## Notes

- Credentials source: environment variables
- Additional comments

## Remaining Work

- [ ] Any missing screenshot or failed generated image
```

Return a concise run summary containing: article id, what was reused vs newly generated, output Markdown path, image output directory, and any failed or missing images.

## Marker Formats

The skill supports three marker formats. A single document may mix them.

### A. Heading-based screenshot marker

```markdown
### 📷 Screenshot: {marker-id} ({filename})
Use: {why this screenshot exists}
Processing: {post-processing instruction}
Difference: {optional distinction from similar screenshots}
```

Fields: `marker-id` is a unique id like `A1`, `B3-1`, `D3`; `filename` is the base filename without the marker prefix; `Use` describes what the screenshot should communicate; `Processing` covers crop/resize; `Difference` disambiguates similar shots.

### B. HTML comment marker

Screenshot:

```markdown
<!-- IMAGE: screenshot (https://example.com/app)
Description: Workspace dashboard showing project activity and team sidebar
Filename: workspace-dashboard.png
-->
```

Generated image:

```markdown
<!-- IMAGE: generated
Description: Editorial illustration of a collaborative AI workflow with folders and browser windows
Filename: ai-workflow-hero.png
-->
```

### C. Image Summary table

A document may end with a summary table listing every required image:

```markdown
## Image Summary

| # | Type | Description | Filename |
|---|------|-------------|----------|
| 1 | generated | Description... | `hero.png` |
| 2 | screenshot | Description... | `dashboard.png` |
```

Important:
- the summary table is the complete inventory
- some images also appear as inline markers in the body
- some images exist only in the summary table and must be placed semantically during Step 5.2

## Incremental Execution

Do not assume the workflow starts from zero. Inspect state first, then continue from the right step.

### Check existing artifacts

For a given article id, inspect:

- `{project-root}/output/{article-id}/raw/*.png`
- `{project-root}/output/{article-id}/*.png`
- `{project-root}/output/{article-id}/README.md`
- `{project-root}/output/markdowns/{article-id}.md`
- `{project-root}/.cache/screenshots/{article-id}/`

### Decision rules

- **New article** — nothing exists → run the full workflow.
- **Screenshots exist but Markdown does not** — skip capture, rebuild Markdown and README.
- **Markdown exists and user asks for fixes** — reparse case file, rebuild placement without recapturing.
- **Some screenshots are missing** — capture only the missing ones, then continue.
- **User asks to recapture specific images** — regenerate only those, then rebuild Markdown.
- **User asks to start over** — ignore caches and rebuild everything.

Core principles: default to incremental work, reuse screenshots whenever possible, treat Markdown regeneration as cheap and browser work as expensive, and tell the user what will be skipped vs rerun.

### Cache policy

Simple file-based cache:

- directory: `{project-root}/.cache/screenshots/{article-id}/`
- cache key: screenshot filename
- if a matching cache file exists and the user did not ask for a refresh, reuse it
- if the user explicitly asks to recapture or refresh, ignore cache entries

## Core Rules

### 1. MCP or nothing

Every browser interaction routes through `mcp__playwright__*` tools. If those tools are absent, stop and ask the user to install (see `references/mcp-setup.md`). Do not fall back to direct Playwright or generic browser tools — they bypass the contract this skill relies on.

### 2. Snapshot before click, re-snapshot after change

Clicks must reference refs from the latest accessibility snapshot, not memory. After navigation, modal open, tab switch, or accordion expand, snapshot again before the next action.

### 3. Choose the interaction type deliberately

Single left click is the default. Use double click only when the page semantics, site knowledge, or visible UI cues clearly indicate "open", "rename", "drill into", or another double-click-specific behavior. Use right click only when you explicitly need a context menu. Do not use double click as a retry for a failed single click, and do not right click just to "see what happens". After any double click or right click, wait for the visible state change and snapshot again before the next action.

### 4. `raw/` is write-once

Original screenshots land in `output/{article-id}/raw/` and stay untouched. Crop, resize, and processing all happen into the parent `output/{article-id}/` directory. Never overwrite a `raw/` file.

### 5. Reuse before recapturing

Browser work is the expensive step. Default to reusing existing screenshots and cache entries; only recapture when the user asks, the image is missing, or it visibly fails verification.

### 6. Credentials live in the environment

Read them from `PLAYWRIGHT_CRED_{SERVICE}_{FIELD}` env vars. Never hardcode, never echo secrets back to the user, and if a required variable is missing, surface its exact name.

### 7. Gated flows pause and ask

If the page is a sign-up, registration, invite, email verification, 2FA, or onboarding gate and the required user-specific information is not already supplied, stop and ask. Do not create accounts, accept invitations, or invent profile data without explicit user input. When the user answers, continue from the interrupted step rather than restarting.

### 8. Verify the actual image

A DOM snapshot is not enough. After each capture, open the saved PNG and confirm the described content is visible, no modal or loading skeleton blocks it, and the language matches the article. If the image does not match, retake — do not paper over it in the README.

### 9. Semantic placement over end-of-section dumping

For images from the summary table, read the paragraph content and insert the image next to the paragraph that discusses the same concept. Do not append leftover images to the end of the article or the end of a broad section.

## Traps

- substituting a non-MCP browser tool because it is "faster" — breaks reproducibility and the MCP snapshot flow
- clicking from memory instead of from the latest snapshot — works once, then flakes
- using double click as a generic retry when a single click did nothing — usually opens the wrong state or hides the real issue
- right clicking without a clear goal or without waiting for a context menu signal — often leaves the page in an ambiguous state
- screenshotting before loading indicators clear — captures skeletons
- forgetting to re-snapshot after a modal or tab opens — next click targets a stale ref
- saving only the cropped asset and losing the `raw/` original — recovery requires a full recapture
- appending all unanchored images to the end of the article instead of placing them semantically
- hardcoding credentials or echoing them in prompts or the transcript
- treating every run as a fresh start — recapturing images that already exist on disk
- assuming a DOM assertion means the screenshot is correct — always review the PNG
- capturing the wrong language version of the site for a language-specific article

## External Endpoints

| Endpoint | Data sent | Purpose |
|----------|-----------|---------|
| User-requested websites | Browser requests, form input, cookies, and interactions needed for the task | Screenshot capture and authenticated navigation |
| `https://openrouter.ai/api/v1/chat/completions` | Image generation prompt text and requested model id | Generated-image markers via `scripts/generate_image.py` |
| `https://registry.npmjs.org` | Package metadata and tarballs during optional installation | Installing `@playwright/mcp` and the Chromium runtime |

No other data is sent externally.

## Security & Privacy

Data that leaves your machine:

- requests sent to the websites the user asked to capture
- prompt text sent to OpenRouter when generating images
- optional npm traffic when installing Playwright MCP or the Chromium runtime

Data that stays local:

- the source Markdown, generated screenshots, generated images, the illustrated Markdown, and the run README
- the screenshot cache under `{project-root}/.cache/`
- environment variables (credentials and API keys) — this skill reads them but never writes them into files or transcripts

This skill does NOT:

- create hidden memory files or persistent profile folders
- persist browser session state across runs by default
- upload screenshots, generated images, or source Markdown anywhere
- create accounts, accept invitations, or complete verification flows on behalf of the user
- hardcode or echo credentials, API keys, or personal data

## Trust

By running this skill, browser traffic goes to the websites you asked to capture, generation prompts go to OpenRouter, and optional package downloads go through npm. Only run it against sites and generation providers you trust. For destructive, financial, medical, or production flows, prefer staging environments and confirm with the user before proceeding.

## Feedback

Issues and improvements: https://github.com/Felo-Inc/felo-skills/issues
