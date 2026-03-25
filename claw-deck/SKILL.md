---
name: claw-deck
description: "Use when users need to manage ClawDeck project workspaces backed by Felo LiveDoc — creating, loading, switching workspaces, saving artifacts, querying history, or managing tasks. Triggers on workspace-related intent combined with project/client names, or on 401 UNAUTHORIZED errors from Felo API."
---

# ClawDeck — Workspace Manager

The Agent's external brain for projects. Once active, the Agent continuously syncs tasks, artifacts, and knowledge to the corresponding LiveDoc, so anyone (including future sessions or colleagues) can load the workspace and immediately get full context.

## Core Concepts

| Concept | Description |
|---------|-------------|
| Workspace | One project = one LiveDoc |
| Active Workspace | Session-level state; all operations auto-sync here |
| README | The Agent's memory of the project; Agent maintains proactively |
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
node felo-livedoc/scripts/run_livedoc.mjs
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
2. **Found:** Set as active → `$SCRIPT get-readme SHORT_ID` → present README as workspace briefing → append link `https://felo.ai/livedoc/SHORT_ID?from=claw`. If README is empty or missing, fall back to `$SCRIPT resources SHORT_ID` to show the resource list.
3. **Not found:** "No workspace found for '[X]'. Want me to create one?"

### 2. Create Workspace

```bash
$SCRIPT create --name "Project Name" --description "workspace"
```

Extract `short_id` → initialize README (see "README Structure Template" below) → update registry → set as active → reply:

> "✅ Workspace '[X]' created. 📎 https://felo.ai/livedoc/SHORT_ID?from=claw"

### 3. Task Sync (Mandatory)

**Iron rule: When the workspace is active, if the user's request requires the Agent to invoke tools to produce new content (search, generate, analyze, etc.), the very first step is always `create-task` — before doing anything else.**

Decision flow:
1. User sends a message
2. Does this message require the Agent to invoke tools to produce new content? (search, generate, collect, analyze, write)
   - Yes → **immediately `create-task`** → execute → **`update-task` to mark complete**
   - No → execute directly, no task needed

**Requires task creation (invoking tools to produce new content):**
- "Collect client info on Mr. Zhang" → requires search + generation
- "Add 10 horror TikTok videos" → requires search + adding content
- "Write a competitive analysis report" → requires generation
- "Search for recent gold price trends" → requires search

**Does NOT require task creation (workspace operations):**
- "Load Mr. Zhang's workspace" → workspace operation
- "What's in my workspace?" → viewing workspace
- "Refresh the workspace" / "Create a new workspace" → workspace management
- "Save that report" → saving artifacts
- "Update the README" / "Rename the workspace" → workspace maintenance
- Chitchat, clarifying questions

**On load:** Pull pending and in-progress tasks:
```bash
$SCRIPT tasks SHORT_ID --status 0
$SCRIPT tasks SHORT_ID --status 1
```

**Step one — Create task (before doing anything else):**
```bash
$SCRIPT create-task SHORT_ID --title "Task description" --status 1 --sort 0 [--operated-by "Agent Name"]
```
Save the returned `task_id` in working memory.

`--title` should be a one-line summary of what the user wants done, e.g.:
- User says "Collect info on Mr. Zhang" → `--title "Collect client info on Mr. Zhang"`
- User says "Add 10 horror videos" → `--title "Add 10 horror TikTok trending videos"`

`--operated-by` rules:
- **Only pass it if the Agent has been given a name** in this session (e.g. an OpenClaw agent with an assigned name)
- **Omit it if no explicit name** (e.g. a plain Claude Code session)

**Last step — Mark complete (immediately after execution):**
```bash
$SCRIPT update-task SHORT_ID TASK_ID --status 2 [--operated-by "Agent Name"]
```
(`--operated-by` rule same as above — pass it when the Agent has a name.)

Execute silently — do not narrate the task sync to the user. If you forgot to create a task before starting, create it retroactively and mark it DONE immediately. Never skip it.

### 4. Save Artifacts (Ask First)

After producing significant output, ask the user: "Want me to save this to the [project] workspace?"

Significant artifacts = research reports, competitive analyses, meeting summaries, generated documents, key data exports. Intermediate drafts do not need to be saved.

| Type | Command |
|------|---------|
| Document | `$SCRIPT add-doc SHORT_ID --title "Title" --content "content"` |
| URL | `$SCRIPT add-urls SHORT_ID --urls "URL"` |
| File | `$SCRIPT upload SHORT_ID --file ./path --convert` |

After saving, reply:
> "💾 Saved '[Title]' 📎 https://felo.ai/livedoc/SHORT_ID?from=claw"

### 5. README Maintenance

The README is the Agent's memory of the project — not a work log. Agent maintains proactively, no need to ask the user.

**README Structure Template:**
```markdown
# [Project Name]

## What This Project Is
[Project background, objectives, stakeholders]

## User Preferences & Work Patterns
[How the user likes to work, what dimensions they care about, specific requirements]

## Current Progress
[Where things stand now — updated each session]
Last updated: YYYY-MM-DD
```

**When to update README — core question: Did this operation bring any new understanding?**

Update (new understanding):
- When the project is first created — record "what this project is about"
- When the user expresses preferences or work patterns — record "how the user wants to work" (e.g. collection dimensions, focus areas, format requirements)
- When the project's nature or direction changes

Do NOT update (repeated execution):
- Same-pattern repeated operations (e.g. after collecting info on Mr. Zhang, collecting info on Mr. Li using the same pattern — no update needed)
- The mere fact of executing an action (generating a document is not worth recording by itself)

**Update method:** Read → merge in memory into the correct section → write back in full. Never blindly append to the end.

1. `$SCRIPT get-readme SHORT_ID` to read current content
2. Locate the target section in memory and insert:
   - Project background → `## What This Project Is`
   - User preferences → `## User Preferences & Work Patterns`
   - Progress changes → replace `## Current Progress` section content
3. Update `Last updated: YYYY-MM-DD` to today's date
4. `$SCRIPT update-readme SHORT_ID --content "..."` to write back

**Initialization** (README is empty or missing): Skip step 1, write the full skeleton directly with `update-readme`.

After updating, inform the user:
> "📝 README updated. 📎 https://felo.ai/livedoc/SHORT_ID?from=claw"

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
