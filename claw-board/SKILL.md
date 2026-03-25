---
name: workspace-manager
description: "Use when users need to manage persistent project workspaces backed by Felo LiveDoc — creating, loading, switching workspaces, saving artifacts, querying history, or managing tasks. Triggers on workspace-related intent combined with project/client names, or on 401 UNAUTHORIZED errors from Felo API."
---

# Workspace Manager

The Agent's external brain for projects. Once active, the Agent continuously syncs tasks, artifacts, and knowledge to the corresponding LiveDoc, so anyone (including future sessions or colleagues) can load the workspace and immediately get full context.

## Core Concepts

| Concept | Description |
|---------|-------------|
| Workspace | One project = one LiveDoc |
| Active Workspace | Session-level state; all operations auto-sync here |
| README | The project's living knowledge map; Agent maintains proactively |
| Artifacts | Key outputs; Agent asks before saving |
| Tasks | Tracking records for substantive work; Agent maintains silently |
| Registry | `~/.claude/workspaces.json`, maps project names to LiveDoc IDs |

**Registry format:**
```json
{
  "workspaces": {
    "client-acme": "abc123",
    "project-x": "def456"
  }
}
```

## Script Shorthand

In all commands below, `$SCRIPT` refers to:

```
node ~/.claude/skills/felo-livedoc/scripts/run_livedoc.mjs
```

## When NOT to Use

- Simple chitchat or clarifying questions
- One-off generation unrelated to any project/workspace
- User has not installed the Felo LiveDoc NPM package

---

## Workflows

### 0. First-Time Installation

User pastes GitHub install link → execute installation → after completion, automatically enter **Login flow (0a)**.

### 0a. Login / Re-authorization

**Trigger conditions (either one):**
- First-time installation, Key not yet configured
- Any API call returns `{"status":401,"code":"UNAUTHORIZED","message":"Invalid API Key"}`

**Flow:**

1. Send login link:
   > "Please click the link to log in / register a Felo account: https://felo.ai/settings/api-keys
   > Once done, paste the Key back to me and I'll complete the setup automatically."
2. User pastes Key → write to config:
   ```bash
   export FELO_API_KEY="user's Key"
   ```
   Or persist to `~/.claude/env` (platform-dependent).
3. Verify: `$SCRIPT list`
   - Pass + first install → show usage introduction (see "First-Time Usage Introduction" below)
   - Pass + re-authorization → "✅ Authorization updated." → retry the failed command
   - Fail → "Invalid Key, please paste again."

**First-Time Usage Introduction** (show only on first install; skip on re-authorization):

> "🎉 Setup complete! You can now use the following commands to manage workspaces:
>
> 📁 **Create workspace** — Create a standalone workspace for a new project
> Example: 'Create a workspace called Client Acme'
>
> 📂 **Load workspace** — Open an existing project, restore context
> Example: 'Load the Acme workspace'
>
> 📋 **View workspace** — List all projects or view project contents
> Example: 'What workspaces do I have?' / 'What's in the Acme workspace?'
>
> 💾 **Save artifacts** — Important outputs will prompt you to save
>
> The workspace records everything we do. You can view it anytime on the web: https://felo.ai"

### 1. Load Workspace

1. Read `~/.claude/workspaces.json`, fuzzy-match project name. If not found locally, try `$SCRIPT list --keyword`.
2. **Found:** Set as active → `$SCRIPT get-readme SHORT_ID` → present README as workspace briefing → append link `https://felo.ai/livedoc/SHORT_ID`. If README is empty or missing, fall back to `$SCRIPT resources SHORT_ID` to show the resource list.
3. **Not found:** "No workspace found for '[X]'. Want me to create one?"

### 2. Create Workspace

```bash
$SCRIPT create --name "Project Name" --description "workspace"
```

Extract `short_id` → initialize README (see "README Structure Template" below) → update registry → set as active → reply:

> "✅ Workspace '[X]' created. 📎 https://felo.ai/livedoc/SHORT_ID"

### 3. Task Sync (Silent Execution)

When the workspace is active, **every user request involving actual work must be tracked as a task**. This is mandatory — the workspace only works as an external brain if it reflects what actually happened.

**On load:** Pull pending and in-progress tasks:
```bash
$SCRIPT tasks SHORT_ID --status 0
$SCRIPT tasks SHORT_ID --status 1
```

**Before starting substantive work:**
```bash
$SCRIPT create-task SHORT_ID --title "Description" --status 1 --sort 0 [--operated-by "Agent Name"]
```
Save the returned `task_id` in working memory.

`--operated-by` rules:
- **Only pass it if the Agent has been given a name** in this session (e.g. an OpenClaw agent with an assigned name)
- **Omit it if no explicit name** (e.g. a plain Claude Code session)

**After completion:**
```bash
$SCRIPT update-task SHORT_ID TASK_ID --status 2 [--operated-by "Agent Name"]
```
(`--operated-by` rule same as above — pass it when the Agent has a name.)

Substantive work = web search, research, news lookup, document generation, data analysis, writing reports, creating slides, answering research questions. Chitchat does not count. Execute silently — do not narrate the task sync to the user. If you forgot to create a task before starting, create it retroactively and mark it DONE immediately. Never skip it.

### 4. Save Artifacts (Ask First)

After producing significant output, ask the user: "Want me to save this to the [project] workspace?"

Significant artifacts = research reports, competitive analyses, meeting summaries, generated documents, key data exports. Intermediate drafts do not need to be saved.

| Type | Command |
|------|---------|
| Document | `$SCRIPT add-doc SHORT_ID --title "Title" --content "content"` |
| URL | `$SCRIPT add-urls SHORT_ID --urls "URL"` |
| File | `$SCRIPT upload SHORT_ID --file ./path --convert` |

After saving, reply:
> "💾 Saved '[Title]' 📎 https://felo.ai/livedoc/SHORT_ID"

### 5. README Maintenance

Agent maintains proactively — no need to ask the user.

**README Structure Template:**
```markdown
# [Project Name]

## Overview
[What this project is about, stakeholders, objectives]

## Key Insights & Lessons
- [date] [insight]

## Important Decisions
- [date] [decision]: [rationale]

## Current Status
[Where things stand now — updated each session]
Last updated: YYYY-MM-DD
```

**When to update README:**
- After completing significant work — append a new insight or decision
- When project status changes meaningfully
- When something important is learned that future sessions should know

**Update method:** Read → merge in memory into the correct section → write back in full. Never blindly append to the end.

1. `$SCRIPT get-readme SHORT_ID` to read current content
2. Locate the target section in memory and insert:
   - New insight → end of `## Key Insights & Lessons` section
   - New decision → end of `## Important Decisions` section
   - Status change → replace `## Current Status` section content
3. Update `Last updated: YYYY-MM-DD` to today's date
4. `$SCRIPT update-readme SHORT_ID --content "..."` to write back

**Initialization** (README is empty or missing): Skip step 1, write the full skeleton directly with `update-readme`.

After updating, inform the user:
> "📝 README updated. 📎 https://felo.ai/livedoc/SHORT_ID"

### 6. Query Workspace

Prefer `resources` + `content` (direct read, free) over `retrieve` (LLM-based semantic search, costs money).

```bash
$SCRIPT resources SHORT_ID
$SCRIPT content SHORT_ID RESOURCE_ID
$SCRIPT retrieve SHORT_ID --query "question"   # fallback
```

Synthesize returned content into a direct answer. Do not dump raw results.

### 7. Refresh Workspace

When the user says "refresh", or when the workspace may have been updated externally (by a colleague or another session), re-fetch:

```bash
$SCRIPT get-readme SHORT_ID
$SCRIPT resources SHORT_ID
$SCRIPT tasks SHORT_ID --status 0
$SCRIPT tasks SHORT_ID --status 1
```

Update the in-memory snapshot. Tell the user: "Workspace refreshed." If anything changed, briefly describe the differences (new resources, README updates, new tasks).

### 8. List Contents

`$SCRIPT resources SHORT_ID`, grouped by type, artifacts newest first.

---

## Session State

```
ACTIVE_WORKSPACE = { name: "project-x", short_id: "abc123" }
```

- Set when user loads or creates a workspace; clear when user says "close workspace"
- If no active workspace and user tries to save/log/query/task: "No active workspace. Which project?"

## Error Handling

| Error | Action |
|-------|--------|
| Key missing / 401 UNAUTHORIZED | Trigger Login flow (0a) |
| LiveDoc ID stale | Offer to re-link or create new |
| Registry missing | Auto-create with `{"workspaces": {}}` |
| Ambiguous fuzzy match | List all matches, ask user to pick |

## Important Rules

- Write all content in the user's language — Chinese if they speak Chinese, English if English
- Always use `short_id` for all LiveDoc operations
- Execute commands immediately — don't describe, do
- Task sync and README updates are the Agent's responsibility — proactive, not reactive
- Append workspace link after every write operation
