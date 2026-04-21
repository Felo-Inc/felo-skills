# Browser Capture Reference

Use this guide when `doc-snapshot-agent` is capturing screenshots through the Playwright MCP server.

This is a reference document for `doc-snapshot-agent`, not a standalone skill. See `mcp-setup.md` for install instructions and `site-explorer.md` for how to build site knowledge before browsing.

## Core idea

The browser is not just a screenshot machine — it is how you reach the exact product page, workspace state, or documentation view described in the source Markdown. Bad screenshots usually come from navigating to the wrong page, not from using the wrong screenshot command.

Always:
- inspect page structure before clicking
- re-inspect after every significant interaction
- verify screenshots visually against the description, not only against DOM text

## Required tools

All browser interactions must go through the Playwright MCP server. Tool names are prefixed `mcp__playwright__` (double underscores on both sides of `playwright`).

Standard tool names used by this workflow:

- `mcp__playwright__browser_navigate`
- `mcp__playwright__browser_snapshot`
- `mcp__playwright__browser_take_screenshot`
- `mcp__playwright__browser_click`
- `mcp__playwright__browser_type`
- `mcp__playwright__browser_fill_form`
- `mcp__playwright__browser_wait_for`
- `mcp__playwright__browser_evaluate`
- `mcp__playwright__browser_console_messages`
- `mcp__playwright__browser_network_requests`
- `mcp__playwright__browser_resize`
- `mcp__playwright__browser_tabs`
- `mcp__playwright__browser_close`

**Do not substitute** direct Playwright library calls, generic browser tools, or any tool that does not start with `mcp__playwright__`. If the prefix is missing, the call is not routed through the MCP server and must not be used. If the `mcp__playwright__*` tools are absent, stop and hand the user the matching snippet from `mcp-setup.md`.

## Mental model

Playwright MCP gives you two views of the page:

- **Accessibility snapshot** — tells you what is currently interactable. Use it to decide what to click.
- **Screenshot** — tells you what the page looks like. Use it to confirm the visual result matches the article.

Snapshot for interaction, screenshot for verification. Do not click from memory, do not verify from DOM alone.

## Choosing the interaction type

Treat interaction choice as part of navigation, not as an improvisation after a failed click.

- **Single left click** is the default.
- **Double click** is for controls or rows that are clearly meant to open, drill in, rename, or enter a detail state on double click.
- **Right click** is only for opening a context menu that the workflow explicitly needs.

Rules:
- decide the click type before acting by reading the latest snapshot, site knowledge, and the screenshot requirement
- do not use double click as a generic retry for a failed single click
- do not right click "just in case" or to explore randomly
- after any double click or right click, wait for a visible state change and snapshot again before the next action
- if the required state can be reached through an explicit button or menu item, prefer that over guessing with alternate click types

Good signals for double click:
- file manager, canvas, editor, or table rows that normally open on double click
- copy or site knowledge that explicitly says "double-click", "open", "rename", or "drill into"
- the article asks for a detail view that is commonly entered from a list row rather than from a separate button

Good signals for right click:
- the article asks for a context menu, row menu, copy link menu, rename menu, or admin actions
- the UI hides actions until a context menu is opened

If the signal is weak, stop guessing:
- inspect the latest snapshot again
- check saved site knowledge
- look for an explicit overflow button, kebab menu, or action icon
- use console/network/debugging only if the page looks broken, not as a substitute for choosing the right interaction

## Standard workflow

### 1. Open the site

- navigate to the target URL
- take a fresh accessibility snapshot
- identify whether the page is logged out, logged in, marketing, app, or docs
- read the returned refs before clicking anything

### 2. Sign in if needed

Credentials come from the environment using the pattern `PLAYWRIGHT_CRED_{SERVICE}_{FIELD}` (e.g. `PLAYWRIGHT_CRED_FELO_EMAIL`, `PLAYWRIGHT_CRED_FELO_PASSWORD`).

Rules:
- read credentials from environment variables; never hardcode
- never echo passwords into the transcript
- if a credential is missing, surface the required variable name
- if the page is a sign-up, registration, invite, verification, or onboarding gate and the needed information is not already available, pause and ask the user before continuing
- do not create accounts or complete registration flows with guessed data

Login sequence:

1. navigate to the login page
2. snapshot the form
3. if credentials are missing or the gate requires user-specific decisions, pause and ask
4. fill email and password using `browser_fill_form` once refs are known
5. submit
6. wait for a visible success signal (dashboard heading, success text)
7. snapshot again to confirm the authenticated state

### 3. Navigate to the correct page state

Before capturing, confirm the visible page matches the description:

- URL pattern
- page title or heading
- important panels and controls visible
- correct organization, workspace, language, or tab selected
- correct empty vs populated state

Do not confuse:
- a marketing homepage with an app dashboard
- a list page with a detail page
- an empty state with a populated workspace
- a docs landing page with the exact section the article asks for

### 4. Wait for real state changes

Prefer explicit waits over blind sleeps:

- wait for key text to appear
- wait for loading indicators to disappear
- wait for modal, accordion, or tab transitions to settle
- wait for animations to finish

Only use a fixed time wait when no stable page signal is available.

### 5. Close visual noise

Before capture, dismiss anything that distracts from the subject:

- cookie banners
- chat widgets
- onboarding popovers
- notification toasts
- user menus left open

### 6. Capture the right kind of screenshot

Choose intentionally:

- **viewport** screenshot when composition matters
- **element** screenshot when a single panel or card is the subject
- **full-page** screenshot only when the article really needs the whole page

Naming:
- save originals to `{project-root}/output/{article-id}/raw/`
- if a marker id exists, prefix the filename: `A1_workspace-dashboard.png`
- otherwise use the requested filename

### 7. Verify the saved image

A DOM snapshot is not enough. After capture, open the image file and confirm:

- requested content is present
- no modal, toast, or loading skeleton blocks the subject
- layout is readable at the chosen size
- screenshot language matches the article language
- the exact feature or panel described is visible, not just the surrounding page

If it does not match, re-navigate and retake. Do not explain a wrong screenshot away in the README.

## Concrete tool patterns

### Navigate and snapshot

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

### Fill a login form

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

If form refs are unknown, snapshot first and use the returned refs.

### Click and wait

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

### Double click

Use only when the UI clearly requires it.

```json
{
  "tool": "mcp__playwright__browser_click",
  "arguments": {
    "ref": "workspace-row-ref",
    "element": "Workspace row",
    "doubleClick": true
  }
}
```

Then wait for the expected detail signal and snapshot again.

### Right click and open a context menu

Use only when the workflow explicitly needs a context menu.

```json
{
  "tool": "mcp__playwright__browser_click",
  "arguments": {
    "ref": "file-row-ref",
    "element": "File row",
    "button": "right"
  }
}
```

```json
{
  "tool": "mcp__playwright__browser_wait_for",
  "arguments": {"text": "Rename", "time": 5}
}
```

After the menu appears, snapshot again and click the menu item using the new ref from that snapshot.

### Take a full-page screenshot

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

### Evaluate page state

```json
{
  "tool": "mcp__playwright__browser_evaluate",
  "arguments": {
    "function": "() => ({ title: document.title, url: location.href })"
  }
}
```

## Recommended command sequences

### Open a site and inspect it

```text
1. mcp__playwright__browser_navigate({ url })
2. mcp__playwright__browser_snapshot()
3. read the returned refs before clicking anything
```

### Log in

```text
1. navigate to the login page
2. snapshot the page
3. if credentials are missing, pause and ask the user
4. fill email and password after the user provides or confirms them
5. submit the form
6. wait for success text or dashboard heading
7. snapshot again to confirm authenticated state
```

### Open a specific panel

```text
1. snapshot current page
2. click the control that opens the panel
3. wait for panel text to appear
4. snapshot again to verify the panel state
5. take screenshot only after required controls are visible
```

### Open a detail view that needs double click

```text
1. snapshot current page
2. confirm the target row or tile is the right one
3. double click only if the UI or site knowledge clearly indicates that behavior
4. wait for a strong detail-view signal such as a title, breadcrumb, or editor panel
5. snapshot again before any follow-up click
```

### Open a context menu

```text
1. snapshot current page
2. right click the exact target element
3. wait for a concrete menu item label to appear
4. snapshot again to get refs for the visible menu items
5. click the needed menu item from the new snapshot
```

### Capture a screenshot

```text
1. resize if the requested layout needs it
2. wait for UI to settle
3. take screenshot to the raw output path
4. open the image and review it before marking complete
```

## Debugging a suspicious page

Use console and network inspection when:

- the page appears blank
- a button click does nothing
- the app silently redirects
- data panels stay empty
- login succeeds visually but the expected page never appears

Checks to run:

- `mcp__playwright__browser_console_messages`
- `mcp__playwright__browser_network_requests`
- `mcp__playwright__browser_evaluate` for small state probes

These often find problems that are invisible in the screenshot alone.

## Per-screenshot automation notes

For each requested screenshot, write down a short plan before touching the browser:

```text
Target: workspace dashboard showing team members and invite controls
URL: https://example.com/app/workspace/123
Preconditions: logged in, English UI, sidebar expanded
Required visible elements: workspace title, team avatars, Invite button
Extra actions: open Share panel before capture
```

## Common failure modes

- clicking from memory instead of from the latest snapshot
- using double click as a fallback when a single click failed, instead of confirming that double click is the intended interaction
- screenshotting the wrong page because the description was mapped too loosely
- capturing before loading indicators disappear
- forgetting to re-snapshot after a modal, tab, or accordion opens
- right clicking without verifying that the context menu actually appeared
- using the wrong language version of the app
- missing an expanded panel or submenu mentioned in the article
- capturing an empty workspace instead of a populated one
- saving only a final cropped image and losing the raw original
- full-page screenshot where a focused element capture would be clearer
- ignoring console or network errors when the UI looks incomplete

## Pre-capture checklist

Before marking a screenshot complete, confirm:

- correct URL and product state
- correct login state
- correct language
- required panels and controls visible
- raw screenshot saved under `output/{article-id}/raw/`
- image file opened and reviewed visually
- no modal, toast, or loading skeleton blocks the subject
