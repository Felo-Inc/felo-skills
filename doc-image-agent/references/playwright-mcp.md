# Playwright MCP Reference

Use this guide when `doc-image-agent` is running with Playwright MCP browser tools.

This is a reference document for `doc-image-agent`, not a standalone skill.

## Installation

Install Playwright MCP:

```bash
npm install -g @playwright/mcp
```

Or run it without a global install:

```bash
npx @playwright/mcp
```

Install the browser runtime the first time:

```bash
npx playwright install chromium
```

Optional verification:

```bash
npx @playwright/mcp --help
```

## How To Start It

Start the MCP server in stdio mode:

```bash
npx @playwright/mcp
```

Common startup options:

```bash
# Headless mode
npx @playwright/mcp --headless

# Use Firefox instead of Chromium
npx @playwright/mcp --browser firefox

# Set a larger viewport
npx @playwright/mcp --viewport-size 1440x960

# Ignore HTTPS errors for problematic staging sites
npx @playwright/mcp --ignore-https-errors
```

Useful notes:
- use Chromium by default unless the target site clearly needs another browser
- use a desktop-sized viewport for most documentation screenshots
- keep startup options stable across one article run so screenshots stay visually consistent

## How `doc-image-agent` Uses It

Within this package, Playwright MCP is used to:
- open the target website
- inspect page structure before clicking
- log in only when the user has already provided the necessary credentials or instructions
- navigate to the exact page or UI state requested by the article
- capture raw screenshots under `output/{article-id}/raw/`
- inspect console and network activity when page behavior is suspicious

If the site presents a login, signup, registration, invite, two-factor, email verification, or similar user gate and the needed information is not already available, pause the workflow and ask the user how to proceed.

## When To Use It

Prefer Playwright MCP when you need to:
- sign in to a product before taking screenshots
- navigate complex app state with repeatable actions
- inspect page structure before clicking
- capture viewport, element, or full-page screenshots
- debug silent page failures through console or network output

## Mental Model

Playwright MCP gives you two different views of the page:
- the accessibility snapshot tells you what is currently interactable
- the screenshot tells you what the page looks like

Use the snapshot to decide what to click.
Use the screenshot to confirm that the visual result matches the article.

## Typical Tool Names

In many runtimes, Playwright MCP tools are exposed with names like:
- `mcp_playwright_browser_navigate`
- `mcp_playwright_browser_snapshot`
- `mcp_playwright_browser_click`
- `mcp_playwright_browser_type`
- `mcp_playwright_browser_fill_form`
- `mcp_playwright_browser_wait_for`
- `mcp_playwright_browser_take_screenshot`
- `mcp_playwright_browser_evaluate`
- `mcp_playwright_browser_console_messages`
- `mcp_playwright_browser_network_requests`
- `mcp_playwright_browser_resize`
- `mcp_playwright_browser_tabs`
- `mcp_playwright_browser_close`

If your runtime uses different names, keep the same workflow and map them accordingly.

## Standard Execution Pattern

### 1. Navigate First

Start by opening the page you expect to inspect.

Example flow:
```text
1. navigate to the target URL
2. capture a fresh accessibility snapshot
3. identify the refs for the next interaction
```

Rules:
- do not guess selectors when refs are available from the snapshot
- after every navigation or significant UI change, snapshot again before the next click

### 2. Inspect Before Acting

The snapshot is the safe way to understand the current page state.

Use it to confirm:
- whether you are on a login page, app page, docs page, or modal
- which controls are actually visible and interactable
- whether the page changed after an earlier action

### 3. Fill Forms Carefully

For login and search forms:
- prefer `fill_form` when several fields can be filled in one step
- use `type` when you need slow typing, custom submission behavior, or field-by-field control
- never paste secrets into user-facing summaries
- if the form is for signup, registration, invite acceptance, profile creation, or verification and the required values are not already supplied by the user, stop and ask before filling anything

Credential pattern:
```text
PLAYWRIGHT_CRED_{SERVICE}_{FIELD}
```

Examples:
- `PLAYWRIGHT_CRED_FELO_EMAIL`
- `PLAYWRIGHT_CRED_FELO_PASSWORD`

### 4. Wait For Real State Changes

Prefer explicit waits over blind sleeps.

Use waits for:
- success text appearing
- a loading message disappearing
- a modal opening or closing
- a dashboard heading becoming visible

Only use a fixed time wait when no stable page signal exists.

### 5. Capture The Right Kind Of Screenshot

Choose intentionally:
- viewport screenshot when composition matters
- element screenshot when a single panel or card is the subject
- full-page screenshot only when the article really needs the whole page

Save raw captures first, then crop or resize into final assets later.

### 6. Debug When The Page Looks Wrong

If a page fails to load or behaves differently than expected:
- inspect console messages
- inspect network requests
- evaluate small JavaScript expressions to confirm page state

This often finds problems that are invisible in the screenshot alone.

## Recommended Commands By Task

### Open A Site And Inspect It

```text
1. mcp_playwright_browser_navigate({ url })
2. mcp_playwright_browser_snapshot()
3. read the returned refs before clicking anything
```

### Log In

```text
1. navigate to login page
2. snapshot the page
3. if credentials are missing, pause and ask the user
4. fill email and password after the user provides or confirms them
5. submit the form
6. wait for success text or dashboard heading
7. snapshot again to confirm authenticated state
```

### Open A Specific Panel

```text
1. snapshot current page
2. click the control that opens the panel
3. wait for panel text to appear
4. snapshot again to verify the panel state
5. take screenshot only after required controls are visible
```

### Capture A Screenshot

```text
1. resize if the requested layout needs it
2. wait for UI to settle
3. take screenshot to the raw output path
4. review the image itself before marking it complete
```

## Concrete Patterns

### Navigate And Snapshot

```json
{
  "tool": "mcp_playwright_browser_navigate",
  "arguments": {"url": "https://example.com/app"}
}
```

```json
{
  "tool": "mcp_playwright_browser_snapshot",
  "arguments": {}
}
```

### Fill A Login Form

```json
{
  "tool": "mcp_playwright_browser_fill_form",
  "arguments": {
    "fields": [
      {"name": "email", "type": "textbox", "ref": "email-ref", "value": "${PLAYWRIGHT_CRED_FELO_EMAIL}"},
      {"name": "password", "type": "textbox", "ref": "password-ref", "value": "${PLAYWRIGHT_CRED_FELO_PASSWORD}"}
    ]
  }
}
```

If form refs are not known yet, snapshot first and use the returned refs.

### Click And Wait

```json
{
  "tool": "mcp_playwright_browser_click",
  "arguments": {"ref": "open-share-panel-ref", "element": "Share button"}
}
```

```json
{
  "tool": "mcp_playwright_browser_wait_for",
  "arguments": {"text": "Invite members", "time": 5}
}
```

### Take A Full-Page Screenshot

```json
{
  "tool": "mcp_playwright_browser_take_screenshot",
  "arguments": {
    "type": "png",
    "filename": "output/article-123/raw/A1_workspace-dashboard.png",
    "fullPage": true
  }
}
```

### Evaluate Page State

```json
{
  "tool": "mcp_playwright_browser_evaluate",
  "arguments": {
    "function": "() => ({ title: document.title, url: location.href })"
  }
}
```

## Practical Rules For `doc-image-agent`

- snapshot before every important click sequence
- snapshot again after navigation, modal open, tab switch, accordion expansion, or login
- store raw screenshots under `output/{article-id}/raw/`
- use meaningful filenames and prefix marker ids when available
- if the screenshot description asks for a specific panel, verify that panel is visible in both the snapshot and the saved image
- if a screenshot is wrong, retake it instead of trying to explain it away in the README

## Console And Network Checks

Use console and network inspection when:
- a page appears blank
- a button click does nothing
- the app silently redirects
- data panels stay empty
- login succeeds visually but the expected page never appears

Checks to run:
- `mcp_playwright_browser_console_messages`
- `mcp_playwright_browser_network_requests`
- `mcp_playwright_browser_evaluate` for small state probes

## Common Mistakes

- clicking from memory instead of from the latest snapshot
- taking a screenshot before loading indicators disappear
- forgetting to re-snapshot after a modal or tab opens
- saving only a final cropped image and losing the raw original
- using full-page screenshots where a focused element capture would be clearer
- ignoring console or network errors when the UI looks incomplete

## Minimal Checklist

Before you mark a screenshot done, confirm:
- correct URL or product state
- correct login state
- correct language
- required panels and controls visible
- raw screenshot saved
- actual image reviewed visually
- no modal, toast, or loading skeleton blocks the subject
