# Playwright MCP Reference

Use this guide when `doc-snapshot-agent` is running with Playwright MCP browser tools.

This is a reference document for `doc-snapshot-agent`, not a standalone skill.

## Installation

Playwright MCP is installed as an MCP server in the client, not as a standalone npm package. The installation method depends on the client environment.

**Claude Code**
```bash
claude mcp add playwright -- npx @playwright/mcp@latest
```

**Codex**
```bash
codex mcp add playwright -- npx @playwright/mcp@latest
```

**VS Code / Cursor / Kiro (IDE with MCP settings UI)**

Add to the MCP settings JSON (e.g. `.vscode/mcp.json`, `.cursor/mcp.json`, `.kiro/settings/mcp.json`):
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

**Claude Desktop**

Add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

**Standalone MCP Server (headless environments or worker processes)**
```bash
npx @playwright/mcp@latest --port 8931
```
Then point the client config to:
```json
{
  "mcpServers": {
    "playwright": {
      "url": "http://localhost:8931/mcp"
    }
  }
}
```

Install the browser runtime the first time:

```bash
npx playwright install chromium
```

## How The MCP Server Works

When configured correctly, the Playwright MCP server runs automatically when the client starts. The client communicates with the server through the MCP protocol, and the server manages the browser lifecycle.

You do NOT need to manually start the server with `npx @playwright/mcp` — the client handles this automatically based on the configuration.

## Browser Options

The MCP server supports various browser options that can be configured through environment variables or passed when the server starts (in standalone mode):

**Standalone mode options:**
```bash
# Headless mode
npx @playwright/mcp@latest --headless

# Use Firefox instead of Chromium
npx @playwright/mcp@latest --browser firefox

# Set a larger viewport
npx @playwright/mcp@latest --viewport-size 1440x960

# Ignore HTTPS errors for problematic staging sites
npx @playwright/mcp@latest --ignore-https-errors
```

**Integrated mode (via client config):**

Most clients do not expose browser options directly in the MCP config. For integrated mode, the server uses sensible defaults:
- Browser: Chromium
- Headless: false (headed mode)
- Viewport: 1280x720

If you need custom browser options in integrated mode, use environment variables or switch to standalone mode.

Useful notes:
- use Chromium by default unless the target site clearly needs another browser
- use a desktop-sized viewport for most documentation screenshots
- keep startup options stable across one article run so screenshots stay visually consistent

## How `doc-snapshot-agent` Uses It

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

## Required Tool Names

All browser tools in this skill MUST use the Playwright MCP server. The tool name prefix is `mcp__playwright__` (double underscores on both sides of `playwright`).

Standard tool names:
- `mcp__playwright__browser_navigate`
- `mcp__playwright__browser_snapshot`
- `mcp__playwright__browser_click`
- `mcp__playwright__browser_type`
- `mcp__playwright__browser_fill_form`
- `mcp__playwright__browser_wait_for`
- `mcp__playwright__browser_take_screenshot`
- `mcp__playwright__browser_evaluate`
- `mcp__playwright__browser_console_messages`
- `mcp__playwright__browser_network_requests`
- `mcp__playwright__browser_resize`
- `mcp__playwright__browser_tabs`
- `mcp__playwright__browser_close`

**CRITICAL:** Do NOT use any browser tool that does not start with `mcp__playwright__`. Generic or built-in browser tools (e.g. `playwright - Navigate to a URL`, `browser_navigate` without the MCP prefix) are NOT the same as Playwright MCP tools and must NOT be used. Only `mcp__playwright__*` tools route through the Playwright MCP server.

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
1. mcp__playwright__browser_navigate({ url })
2. mcp__playwright__browser_snapshot()
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
  "tool": "mcp__playwright__browser_navigate",
  "arguments": {"url": "https://example.com/app"}
}
```

```json
{
  "tool": "mcp__playwright__browser_snapshot",
  "arguments": {}
}
```

### Fill A Login Form

```json
{
  "tool": "mcp__playwright__browser_fill_form",
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
  "tool": "mcp__playwright__browser_click",
  "arguments": {"ref": "open-share-panel-ref", "element": "Share button"}
}
```

```json
{
  "tool": "mcp__playwright__browser_wait_for",
  "arguments": {"text": "Invite members", "time": 5}
}
```

### Take A Full-Page Screenshot

```json
{
  "tool": "mcp__playwright__browser_take_screenshot",
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
  "tool": "mcp__playwright__browser_evaluate",
  "arguments": {
    "function": "() => ({ title: document.title, url: location.href })"
  }
}
```

## Practical Rules For `doc-snapshot-agent`

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
- `mcp__playwright__browser_console_messages`
- `mcp__playwright__browser_network_requests`
- `mcp__playwright__browser_evaluate` for small state probes

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
