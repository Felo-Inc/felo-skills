---
name: doc-image-agent
description: Automatically illustrate Markdown documents by turning image markers into screenshots or generated images, then writing an image-enriched Markdown output. Use this skill when a document needs screenshots, AI-generated visuals, image placement, or end-to-end document illustration automation.
version: 1.0.0
author: Felo Inc
license: MIT
metadata:
  hermes:
    tags: [documentation, markdown, screenshots, image-generation, browser-automation, agent-workflow]
    homepage: https://github.com/Felo-Inc/felo-skills
---

# Doc Image Agent

`doc-image-agent` is a single entry-point skill for automatically adding images to Markdown documents.

It supports:
- browser screenshots for product pages, dashboards, docs sites, and web apps
- AI-generated images for conceptual illustrations
- incremental reruns and partial regeneration
- semantic placement of images into the correct paragraph or section
- structured output directories for reusable assets and final Markdown

This package is intentionally published as **one main skill** plus supporting reference documents:
- `{baseDir}/references/browser-automation.md`
- `{baseDir}/references/playwright-mcp.md`
- `{baseDir}/references/site-explorer.md`
- `{baseDir}/references/image-generation.md`

Load this skill whenever the user asks to:
- add images to a Markdown article
- process a case file with image markers
- capture screenshots for documentation
- generate article visuals and insert them into a document
- rerun or fix image placement in an already processed document

## What This Skill Produces

Input:
- a Markdown document containing image markers and optionally an `Image Summary` table

Output:
- captured screenshots in a raw folder
- final image assets ready for Markdown references
- a generated README with image metadata
- an illustrated Markdown file with image markers replaced by real image references

## Project Root

All input, output, and cache paths are relative to a single project root directory (`{project-root}`).

At the very beginning of every run, **ask the user** which directory to use as the project root. If the user declines or says they have no preference, default to `/tmp/doc-image-agent`.

Once confirmed, **all subsequent paths** in this skill (cases/, output/, .cache/, etc.) resolve under `{project-root}/`.

## Recommended Directory Layout

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
- `{project-root}/cases/` stores the source Markdown file.
- `{project-root}/output/{article-id}/raw/` stores original browser screenshots and should never be overwritten by later processing.
- `{project-root}/output/{article-id}/` stores final images referenced by Markdown.
- `{project-root}/output/markdowns/` stores the final illustrated Markdown.
- `{project-root}/.cache/screenshots/` stores reusable screenshot cache entries.

If the user specifies a different layout, follow the user instruction instead.

## Credentials

Some sites require authentication before the requested screenshot can be captured.

Read website credentials from environment variables using this pattern:

```text
PLAYWRIGHT_CRED_{SERVICE}_{FIELD}
```

Examples:
- `PLAYWRIGHT_CRED_FELO_EMAIL`
- `PLAYWRIGHT_CRED_FELO_PASSWORD`

Rules:
- read credentials from the environment instead of hardcoding them
- never print secrets back to the user
- if credentials are missing, tell the user which variable names are required
- if the workflow reaches a login, signup, registration, invite, verification, or onboarding gate that needs user-specific information, stop and ask the user how to proceed
- do not create new accounts, accept invitations, solve email verification, or invent profile information without explicit user input
- after the user provides credentials or instructions, continue from the interrupted step instead of restarting the whole run unless the user asks for a fresh run

## Supported Marker Formats

This skill must support both inline markers and summary tables.

### Format A: Heading-Based Screenshot Marker

```markdown
### 📷 Screenshot: {marker-id} ({filename})
Use: {why this screenshot exists}
Processing: {post-processing instruction}
Difference: {optional distinction from similar screenshots}
```

Fields:
- `marker-id`: unique screenshot identifier such as `A1`, `B3-1`, or `D3`
- `filename`: base filename without the marker prefix
- `Use`: what the screenshot should communicate
- `Processing`: crop, resize, or other post-processing needs
- `Difference`: optional explanation for how this screenshot differs from similar ones

### Format B: HTML Comment Image Marker

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

### Image Summary Table

A document may end with a summary table listing all required images:

```markdown
## Image Summary

| # | Type | Description | Filename |
|---|------|-------------|----------|
| 1 | generated | Description... | `hero.png` |
| 2 | screenshot | Description... | `dashboard.png` |
```

Important:
- the summary table is the complete inventory of requested images
- some images may also appear as inline markers in the body
- some images may exist only in the summary table and must be placed intelligently during output generation

## Incremental Execution and Resume Behavior

Do not assume the workflow always starts from zero. Before doing any work, inspect the article state and continue from the right step.

### Check Existing Artifacts

For a given article id, inspect:
- `{project-root}/output/{article-id}/raw/*.png`
- `{project-root}/output/{article-id}/*.png`
- `{project-root}/output/{article-id}/README.md`
- `{project-root}/output/markdowns/{article-id}.md`
- `{project-root}/.cache/screenshots/{article-id}/`

### Decision Rules

- **New article**: nothing exists -> run the full workflow.
- **Screenshots exist but Markdown does not**: skip screenshot capture and rebuild only the Markdown and README.
- **Markdown exists and the user asks for fixes**: reparse the source document and rebuild image placement without recapturing images.
- **Some screenshots are missing**: capture only the missing ones, then continue.
- **The user asks to recapture specific images**: regenerate only those images, then rebuild the Markdown.
- **The user asks to start over**: ignore caches and rebuild everything from scratch.

### Core Principles

- default to incremental work
- reuse screenshots whenever possible
- treat Markdown regeneration as cheap and browser work as expensive
- tell the user what will be skipped and what will be rerun

## Workflow

### Step 0: Confirm the Project Root

Before any other work, ask the user:

> Which directory should I use as the project root for this run?

- If the user provides a path, use it as `{project-root}`.
- If the user says "no preference", skips the question, or does not answer, use `/tmp/doc-image-agent`.

Create the directory if it does not exist. All subsequent paths (`cases/`, `output/`, `.cache/`, `scripts/`, `references/`) resolve under `{project-root}/`.

### Step 1: Parse the Document and Build the Image Inventory

Read the source Markdown and merge image requirements from three sources:

1. inline heading-based screenshot markers
2. inline `<!-- IMAGE: ... -->` markers
3. the `Image Summary` table

For each image, record:
- type: `screenshot` or `generated`
- filename
- marker id if present
- description or purpose text
- source URL if present
- post-processing instruction if present
- exact location in the Markdown when there is an inline marker
- whether the image still needs semantic placement

Also detect the target website or websites mentioned by the article.

### Step 2: Prepare the Environment

- ensure output directories exist
- check screenshot cache for reusable images
- load credentials from environment variables
- confirm browser automation tooling is available
- if Playwright MCP is the active browser stack, review `{project-root}/references/playwright-mcp.md` before interacting with the site
- if Playwright MCP is required but not installed, install it and the needed browser runtime before continuing
- if the target flow requires login or registration and the required credentials or account details are not already available, pause and ask the user before taking any account-specific action

Preferred browser stack:
- use Playwright MCP when available because it gives repeatable navigation, accessible page snapshots, JS evaluation, network inspection, and reliable screenshots
- use other browser tooling only when Playwright MCP is unavailable in the current agent runtime

### Step 2.5: Understand the Target Website Before Taking Screenshots

Bad screenshots usually come from navigating to the wrong page, not from using the wrong screenshot command.

Before capturing anything:

1. Check whether site knowledge already exists under:
   - `$IMAGE_AGENT_SITE_KNOWLEDGE_DIR/`
   - `$IMAGE_AGENT_SITE_LEARNING_DIR/`

2. Derive a stable `site-key` from the domain name:
   - `memclaw.me` -> `memclaw`
   - `app.felo.ai` -> `felo`

3. If `{site-key}.md` exists and is recent, read it before browsing.

4. If site knowledge is missing or stale, perform a structured site exploration and save the findings into the site knowledge files. See `{project-root}/references/site-explorer.md`.

5. Map every screenshot description to a specific page or state.

Common mapping mistakes:
- taking a marketing homepage when the document actually asks for an authenticated workspace
- taking a broad landing page when the description clearly asks for a specific panel or feature
- ignoring keywords like `dashboard`, `session history`, `team members`, or `invite`

6. Write a screenshot navigation plan for each image:
- target URL or click path
- key elements that must be visible
- whether scrolling, expanding, or tab switching is required

7. If new knowledge is discovered while browsing, append it to the site knowledge files so future runs do not repeat the same mistakes.

### Step 3: Capture Browser Screenshots

Use the browser automation reference in `{project-root}/references/browser-automation.md`.

If Playwright MCP is available, also use `{project-root}/references/playwright-mcp.md` as the concrete execution guide for:
- opening pages
- reading the accessibility snapshot before acting
- filling login forms
- waiting for UI state changes
- taking viewport, element, or full-page screenshots
- checking console and network output when a page behaves unexpectedly

Typical flow:
- open the target website
- log in if required
- navigate to the correct page or state for each screenshot
- wait for key content to load
- resize the viewport if needed
- save screenshots to `{project-root}/output/{article-id}/raw/`

Naming rule:
- if a marker id exists, save as `{marker-id}_{filename}`
- otherwise use the original filename

Example:
- `A1_workspace-dashboard.png`

After taking each screenshot, verify that the captured image actually matches the description. Do not rely only on DOM text. Visual layout, modals, loading states, overlays, and empty panels must be checked against the real screenshot file.

### Step 4: Post-Process Screenshots

Apply the requested processing instructions if present.

Typical operations:
- crop
- resize
- aspect-ratio adjustment
- copy from `raw/` into the final output directory

Principle:
- `raw/` keeps untouched originals
- final images in `{project-root}/output/{article-id}/` are the assets referenced by Markdown

### Step 5: Generate the Illustrated Markdown

This step has two jobs:
- replace inline markers exactly where they appear
- place unanchored images from the summary table into the most relevant paragraph

#### 1. Replace Inline Markers In Place

Heading marker example:

```markdown
### 📷 Screenshot: A1 (workspace-dashboard.png)
Use: Show the authenticated workspace homepage
Processing: Full-width screenshot
```

becomes:

```markdown
![Authenticated workspace homepage](../{article-id}/A1_workspace-dashboard.png)
```

HTML comment marker example:

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

#### 2. Semantically Place Images Without Inline Markers

For images that appear only in the `Image Summary` table:
- read the image description carefully
- extract its important keywords and concepts
- search the document body paragraph by paragraph
- find the paragraph that discusses the same concept most directly
- insert the image immediately after that paragraph, not just at the end of a broad section

Common mistakes:
- appending all leftover images to the end of the article
- placing an image at the end of a high-level section instead of after the exact paragraph that discusses the feature
- using only section headings instead of reading paragraph content

Example:
- if the description says `Share panel showing team members and invite controls`, prefer the paragraph that mentions inviting teammates rather than the end of a general onboarding section

#### 3. Handle Generated Images

For `generated` images, use the image-generation reference in `{project-root}/references/image-generation.md` and the bundled script in `{project-root}/scripts/generate_image.py`.

If generation succeeds, insert the normal Markdown image reference.
If generation fails, insert a warning block:

```markdown
> Warning: AI image generation failed for {filename}
```

#### 4. Remove the Image Summary Table

The `Image Summary` block is workflow metadata and should not remain in the final illustrated Markdown.

### Step 6: Write the README Inventory

Create `{project-root}/output/{article-id}/README.md` with metadata such as:
- article id or title
- completion timestamp
- image list
- mapping from marker ids to filenames
- dimensions
- post-processing notes
- unfinished or failed items

Suggested format:

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

## Cache Policy

Use a simple file-based screenshot cache:
- cache directory: `{project-root}/.cache/screenshots/{article-id}/`
- cache key: screenshot filename
- if a matching cache file exists and the user did not ask for a refresh, reuse it
- if the user explicitly asks to recapture or refresh, ignore cache entries

## Special Cases

### Generated Images

When an image type is `generated`, do not mark it as missing by default. Generate it.

Prerequisites:
- `OPENROUTER_API_KEY` is available
- Python `requests` is installed

Default command:

```bash
python {project-root}/scripts/generate_image.py "{description}" -o "{project-root}/output/{article-id}/{filename}"
```

Use a stronger model for text-heavy images:

```bash
python {project-root}/scripts/generate_image.py "{description}" -o "{project-root}/output/{article-id}/{filename}" -m google/gemini-3-pro-image-preview
```

Generation prompt guidance:
- include the subject clearly
- include visual style if the document suggests one
- mention whether the image is for a technical article, tutorial, or product explainer
- mention visible text explicitly if the image needs readable labels

Failure handling:
- add a warning block into the output Markdown
- record the failure in the README remaining-work section
- continue the rest of the workflow

### Multilingual Documents

If the document is language-specific, make sure the captured website matches that language. If the site supports language switching, switch before taking screenshots.

### Dynamic Pages

Before taking screenshots:
- wait for key content to load
- close overlays or popups
- wait for animations to settle
- confirm the page is in the correct state

## Output Requirements

When this skill finishes, return a concise summary containing:
- article id processed
- what work was reused versus newly generated
- output Markdown path
- image output directory
- any failed or missing images

## Quick Reference

```text
Project root (ask user, default /tmp/doc-image-agent):
  {project-root}/

Input:
  {project-root}/cases/{article-id}.md

Output:
  {project-root}/output/{article-id}/raw/*.png
  {project-root}/output/{article-id}/*.png
  {project-root}/output/{article-id}/README.md
  {project-root}/output/markdowns/{article-id}.md

Credentials:
  PLAYWRIGHT_CRED_{SERVICE}_{FIELD}

Cache:
  {project-root}/.cache/screenshots/{article-id}/

References:
  {project-root}/references/browser-automation.md
  {project-root}/references/playwright-mcp.md
  {project-root}/references/site-explorer.md
  {project-root}/references/image-generation.md

Bundled script:
  {project-root}/scripts/generate_image.py
```
