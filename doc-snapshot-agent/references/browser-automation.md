# Browser Automation Reference

Use browser automation to visit sites, sign in, navigate to the correct page state, and capture screenshots that match the document requirements.

This is a reference document for `doc-snapshot-agent`, not a standalone skill.

## Core Idea

The browser is not just a screenshot machine. It is how you reach the exact product page, workspace state, or documentation view described in the source Markdown.

Always:
- inspect page structure before clicking
- re-check the page after every significant interaction
- verify screenshots visually instead of assuming the page is correct

## Required Tooling

This skill uses **Playwright MCP** as the only browser automation stack. All browser interactions must go through Playwright MCP tools (prefixed `mcp__playwright__*`).

Do NOT use:
- direct Playwright library calls (e.g. `playwright - Navigate to a URL`)
- generic browser navigation tools that are not part of the Playwright MCP server
- any browser tool that does not have the `mcp__playwright__` prefix

Why Playwright MCP:
- it provides structured browser control through MCP tools
- it exposes accessibility snapshots that are safer than clicking from visual guesses
- it supports typed form filling, JS evaluation, console logs, network inspection, and screenshots in one workflow
- it makes the screenshot workflow easier to document and reproduce across runs

See `playwright-mcp.md` for the concrete command and tool patterns.

If Playwright MCP tools are not available in the current runtime, **stop and ask the user to configure the MCP server** before proceeding with any browser work.

## Standard Workflow

### 1. Open the Site

- navigate to the target URL
- inspect the page before acting
- identify whether the page is logged out, logged in, marketing, app, or docs

### 2. Sign In If Needed

Credential pattern:

```text
PLAYWRIGHT_CRED_{SERVICE}_{FIELD}
```

Examples:
- `PLAYWRIGHT_CRED_FELO_EMAIL`
- `PLAYWRIGHT_CRED_FELO_PASSWORD`

Rules:
- read credentials from environment variables
- never echo passwords into the transcript
- if a credential is missing, surface the required variable name
- if the page is a sign-in, sign-up, registration, invite, or verification gate and the needed information is not already available, stop and ask the user before continuing
- do not create accounts or complete registration flows with guessed data

Login sequence:
- navigate to login page if needed
- inspect the form
- if the required login details are unavailable, pause and ask the user
- type email and password only after the user has provided or confirmed them
- submit the form
- wait for a visible success signal
- inspect again to confirm the authenticated state

### 3. Navigate to the Correct Page State

Before taking a screenshot, make sure the visible page matches the requested description.

Check:
- URL pattern
- page title or heading
- important panels and controls
- whether the user is logged in
- whether the correct organization, workspace, language, or tab is selected

Do not confuse:
- a marketing homepage with an app dashboard
- a list page with a detail page
- an empty state with a populated workspace
- a docs landing page with the exact section requested by the article

### 4. Wait for the Right Moment

Use explicit waits where possible:
- wait for key text
- wait for loading indicators to disappear
- wait for async content to finish rendering
- wait for animation overlays or popups to settle

If you must use a fixed sleep, keep it short and only after a more reliable strategy is not available.

### 5. Capture the Screenshot

Decide whether you need:
- the viewport
- a specific element
- the full page

Naming guidance:
- prefer meaningful filenames
- if a marker id exists, prefix the output filename with that marker id

Example:
- `A1_workspace-dashboard.png`

Save original screenshots to the `raw/` directory first.

### 6. Verify the Actual Image

A DOM snapshot is not enough.

After capture, review the image itself and confirm:
- the requested content is present
- no modal or tooltip blocks the content
- no loading skeleton is still visible
- the layout is readable at the chosen size
- the screenshot language matches the article language

If the screenshot does not match the description, navigate again and retake it.

## Important Practices

### Snapshot vs Screenshot

These serve different purposes:
- page inspection helps you understand structure and locate controls
- screenshots record the visual state of the page

With Playwright MCP, treat the accessibility snapshot as the default source of truth for interaction and the saved screenshot as the source of truth for visual verification.

Use page inspection for interaction and screenshots for verification.

### Reinspect After Changes

Whenever the page changes because of navigation, tab switches, dynamic loads, or modal openings, inspect again before clicking more controls.

### Choose Stable Entry Paths

If a deep page can be opened directly through a stable URL, prefer that over brittle click chains.

### Resize Intentionally

Adjust the viewport if the requested screenshot needs:
- desktop layout
- cleaner spacing
- a specific aspect ratio
- expanded sidebar or panel states

### Close Visual Noise

Before capture, close anything that blocks or distracts from the subject:
- cookie banners
- chat widgets
- onboarding popovers
- notification toasts
- user menus

## Common Failure Modes

- screenshotting the wrong page because the description was mapped too loosely
- clicking stale elements after the page changed
- capturing before async content finished loading
- using the wrong language version of the app
- missing an expanded panel or submenu mentioned in the article
- taking a screenshot of an empty workspace instead of a populated one

## What Good Automation Notes Look Like

For each requested screenshot, write down:
- target URL or navigation path
- exact visible elements required
- login status required
- language required
- any expand, scroll, or toggle actions required

Example:

```text
Target: workspace dashboard showing team members and invite controls
URL: https://example.com/app/workspace/123
Preconditions: logged in, English UI, sidebar expanded
Required visible elements: workspace title, team avatars, Invite button
Extra actions: open Share panel before capture
```

## Minimal Output Checklist

Before considering a screenshot complete, confirm:
- correct page
- correct language
- correct user state
- key elements visible
- file saved to raw output
- image reviewed visually
