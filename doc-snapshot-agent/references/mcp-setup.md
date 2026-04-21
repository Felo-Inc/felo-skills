# Playwright MCP Setup

This is a reference document for `doc-snapshot-agent`, not a standalone skill.

Use this guide when Step 0 of the workflow detects that the `mcp__playwright__*` tools are not available. Pick the block that matches the user's current client.

## How to verify

The workflow uses Playwright MCP for every browser interaction. "Available" means the runtime exposes tools starting with `mcp__playwright__` (double underscores on each side), for example:

- `mcp__playwright__browser_navigate`
- `mcp__playwright__browser_snapshot`
- `mcp__playwright__browser_take_screenshot`

If these are missing, stop and send the user the matching install snippet below. Do not substitute direct Playwright library calls or any non-MCP browser tool.

## Install recipes

### Claude Code

```bash
claude mcp add playwright -- npx @playwright/mcp@latest
```

### Codex

```bash
codex mcp add playwright -- npx @playwright/mcp@latest
```

### VS Code / Cursor / Kiro

Add to the MCP settings JSON (for example `.vscode/mcp.json`, `.cursor/mcp.json`, `.kiro/settings/mcp.json`):

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

### Claude Desktop

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

### Standalone server (headless hosts, workers)

```bash
npx @playwright/mcp@latest --port 8931
```

Then point the client config at the running server:

```json
{
  "mcpServers": {
    "playwright": {
      "url": "http://localhost:8931/mcp"
    }
  }
}
```

## Grant tool permissions

Some clients block MCP tool use until the tool prefix is explicitly allowed. For Claude Code and Codex, add to the settings file:

```json
{
  "permissions": {
    "allow": ["mcp__playwright__*"]
  }
}
```

## Install the Chromium runtime

The first time Playwright MCP runs on a machine it needs a browser binary:

```bash
npx playwright install chromium
```

Run this once before the first screenshot capture. Later runs reuse the installed binary.

## Standalone launch options

When running the standalone server, common flags for the workflow:

```bash
# Headless (CI, servers, worker processes)
npx @playwright/mcp@latest --headless

# Use Firefox instead of Chromium
npx @playwright/mcp@latest --browser firefox

# Larger viewport for desktop-layout screenshots
npx @playwright/mcp@latest --viewport-size 1440x960

# Accept staging-site certificates
npx @playwright/mcp@latest --ignore-https-errors
```

Most integrated clients do not surface browser options in the MCP config and will use the defaults: Chromium, headed, viewport 1280x720. Switch to standalone mode if the workflow needs customised browser options.

## After install

1. Restart the client or reload the session so the MCP config takes effect.
2. Rerun Step 0 of the workflow — the `mcp__playwright__*` tools should now be available.
3. Continue from the interrupted step instead of restarting the run, unless the user asks for a fresh run.
