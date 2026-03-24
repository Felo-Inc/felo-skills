---
name: workspace-manager
description: "Manage persistent project workspaces backed by Felo LiveDoc. Use when users want to load, create, or switch workspaces, save artifacts to a project, log work done, query workspace history, manage tasks/todos, or when users mention a project name followed by 'workspace'. Trigger on phrases like 'load workspace', 'open workspace', 'create workspace', 'save to workspace', 'what's in my workspace', 'add task to workspace', 'show workspace tasks', or any project-specific context retrieval request. If a user mentions a client or project name alongside workspace-related intent, always use this skill."
---

# Workspace Manager

This workspace is the Agent's external brain for a project. When active, the Agent continuously syncs its work into the workspace — tasks, artifacts, and accumulated knowledge — so that anyone (including a future session or a colleague) can load the workspace and immediately understand the project's history, current state, and key insights.

## Core Concepts

- **One workspace = one LiveDoc** — each project gets its own LiveDoc
- **Active workspace** — set at session start; all Agent actions sync here automatically
- **README** — the living knowledge map of the workspace (see below)
- **Artifacts** — key outputs (reports, slides, analyses); Agent asks before saving
- **Tasks** — current session's sub-tasks; Agent writes and updates these automatically, no confirmation needed
- **Registry** — `~/.claude/workspaces.json` maps project names to LiveDoc IDs

## Registry Format

```json
{
  "workspaces": {
    "mitsubishi-bank": "abc123",
    "project-x": "def456"
  }
}
```

## Script Path

```
node ~/.claude/skills/felo-livedoc/scripts/run_livedoc.mjs
```

---

## Workflows

### 1. Loading a Workspace

1. Read `~/.claude/workspaces.json`
2. Find by name — fuzzy/partial match (e.g. "mitsubishi" matches "mitsubishi-bank"). If not found locally, try `list --keyword`.
3. **If found:** set as active workspace, then show the README:
   ```bash
   node ~/.claude/skills/felo-livedoc/scripts/run_livedoc.mjs get-readme SHORT_ID
   ```
   Present the README content to the user as the workspace briefing. If no README exists yet, fall back to listing resources. After presenting the README, show the workspace link: `Workspace: https://felo.ai/livedoc/SHORT_ID`
4. **If not found:** "No workspace found for '[X]'. Want me to create one?" — wait for confirmation.

### 2. Creating a Workspace

1. Create the LiveDoc:
   ```bash
   node ~/.claude/skills/felo-livedoc/scripts/run_livedoc.mjs create --name "Project Name" --description "workspace"
   ```
2. Extract `short_id` from response.
3. Initialize README (see README structure below).
4. Update `~/.claude/workspaces.json` (create with `{"workspaces": {}}` if missing).
5. Set as active workspace.
6. Confirm: "Workspace '[X]' created. View: https://felo.ai/livedoc/SHORT_ID"

### 3. Task Sync (Automatic — No User Confirmation Needed)

When the workspace is active, **every user request that involves actual work must be tracked as a task**. This is non-negotiable — the workspace is only useful as an external brain if it reflects what actually happened.

**At session start / when loading workspace:**
- List existing tasks to see what's in progress or pending:
  ```bash
  node ~/.claude/skills/felo-livedoc/scripts/run_livedoc.mjs tasks SHORT_ID --status 0
  node ~/.claude/skills/felo-livedoc/scripts/run_livedoc.mjs tasks SHORT_ID --status 1
  ```

**Before starting any substantive task** — search, research, analysis, generation, writing — create the task first, then do the work:
```bash
node ~/.claude/skills/felo-livedoc/scripts/run_livedoc.mjs create-task SHORT_ID \
  --title "Task description" --status 1 --sort 0 [--operated-by "Agent Name"]
```
Save the returned `task_id` in working memory.

`--operated-by` rules:
- Pass it **only if you have been given a name** in this session (e.g. an OpenClaw agent with an assigned name)
- **Omit it** if you have no explicit name (e.g. a plain Claude Code session)

What counts as a substantive task: web search, news lookup, document generation, data analysis, writing a report, making a PPT, answering a research question. Simple clarifying questions or chitchat do not need a task.

**Immediately after completing the task:**
```bash
node ~/.claude/skills/felo-livedoc/scripts/run_livedoc.mjs update-task SHORT_ID TASK_ID --status 2
```
(Same `--operated-by` rule applies to `update-task` if you have a name.)

Do this silently — don't narrate the task sync to the user. If you forgot to create a task before starting, create it retroactively and mark it DONE immediately. Never skip it.

### 4. Artifact Handling (Ask Before Saving)

When the Agent produces a significant output (report, analysis, slide deck, structured data), ask:
> "Want me to save this to the [project] workspace?"

If yes:
- **Text/document:**
  ```bash
  node ~/.claude/skills/felo-livedoc/scripts/run_livedoc.mjs add-doc SHORT_ID \
    --title "Artifact title" --content "content"
  ```
- **URL:**
  ```bash
  node ~/.claude/skills/felo-livedoc/scripts/run_livedoc.mjs add-urls SHORT_ID \
    --urls "https://example.com"
  ```
- **File:**
  ```bash
  node ~/.claude/skills/felo-livedoc/scripts/run_livedoc.mjs upload SHORT_ID \
    --file ./path/to/file --convert
  ```

Confirm after: "Saved to '[workspace]': [title] — https://felo.ai/livedoc/SHORT_ID"

What counts as a significant artifact: research reports, competitive analyses, meeting summaries, generated documents, key data exports. Intermediate scratch work does not need to be saved.

### 5. README Maintenance (The Knowledge Map)

The README is the most important part of the workspace. It's what a colleague sees when they first load the workspace, and what gives a future session instant context. Keep it current and useful.

**README structure:**
```markdown
# [Project Name]

## Overview
[What this project is about, who the stakeholders are, what we're trying to achieve]

## Key Insights & Lessons
[Accumulated learnings, things that worked, things that didn't, patterns noticed]
- [date] [insight]

## Important Decisions
[Decisions made and why — so future sessions don't re-litigate them]
- [date] [decision]: [rationale]

## Current Status
[Where things stand right now — updated each session]
Last updated: YYYY-MM-DD
```

**When to update the README:**
- After completing a significant piece of work — append a new insight or decision
- When the project status changes meaningfully
- When something important is learned that future sessions should know

**How to update (read → merge → write):**

Every README update follows this pattern — never append blindly to the end:

1. Read current content:
   ```bash
   node ~/.claude/skills/felo-livedoc/scripts/run_livedoc.mjs get-readme SHORT_ID
   ```
2. In memory, locate the target section and insert the new content there:
   - New insight → find `## Key Insights & Lessons`, append entry at end of that section
   - New decision → find `## Important Decisions`, append entry at end of that section
   - Status change → replace `## Current Status` section content
3. Update `Last updated: YYYY-MM-DD` to today's date
4. Write the full merged content back:
   ```bash
   node ~/.claude/skills/felo-livedoc/scripts/run_livedoc.mjs update-readme SHORT_ID \
     --content "..."
   ```

**Initialization** (README is empty or missing): skip step 1, write the full skeleton directly with `update-readme`.

Don't ask the user before updating the README — this is the Agent's job. But do tell the user when something significant has been added: "I've noted that in the workspace README."

### 6. Querying the Workspace

Prefer `content` over `retrieve` — `retrieve` uses LLM-based semantic search which costs money, while `content` is a direct read.

**Preferred flow:**
1. Run `resources SHORT_ID` to get the full resource list with IDs and titles
2. Identify the relevant resource(s) by title
3. Read with `content SHORT_ID RESOURCE_ID`

```bash
node ~/.claude/skills/felo-livedoc/scripts/run_livedoc.mjs resources SHORT_ID
node ~/.claude/skills/felo-livedoc/scripts/run_livedoc.mjs content SHORT_ID RESOURCE_ID
```

Only fall back to `retrieve` when you genuinely can't identify the right resource from titles alone — i.e., the answer could be scattered across multiple resources and you have no idea which ones:

```bash
node ~/.claude/skills/felo-livedoc/scripts/run_livedoc.mjs retrieve SHORT_ID \
  --query "user's question"
```

Synthesize the returned content into a direct answer. Don't dump raw results.

### 7. Refreshing the Workspace

When the user says "refresh workspace" or suspects the workspace has been updated externally (by a colleague or another session), re-fetch everything:

```bash
node ~/.claude/skills/felo-livedoc/scripts/run_livedoc.mjs get-readme SHORT_ID
node ~/.claude/skills/felo-livedoc/scripts/run_livedoc.mjs resources SHORT_ID
node ~/.claude/skills/felo-livedoc/scripts/run_livedoc.mjs tasks SHORT_ID --status 0
node ~/.claude/skills/felo-livedoc/scripts/run_livedoc.mjs tasks SHORT_ID --status 1
```

Update the in-memory snapshot and tell the user: "Workspace refreshed." Show a brief diff if anything changed (new resources, updated README, new tasks).

### 8. Listing Workspace Contents

```bash
node ~/.claude/skills/felo-livedoc/scripts/run_livedoc.mjs resources SHORT_ID
```

Group by type: artifacts (newest first), URLs.

---

## Session State

```
ACTIVE_WORKSPACE = { name: "mitsubishi-bank", short_id: "abc123" }
```

- Set when user loads or creates a workspace
- Clear when user says "close workspace"
- If no active workspace and user tries to save/log/query/task: "No active workspace. Which project?"

---

## Error Handling

- **API key missing:** "Please set FELO_API_KEY. See felo-livedoc skill setup."
- **LiveDoc not found (stale ID):** Offer to re-link or create new
- **Registry missing:** Create automatically with `{"workspaces": {}}`
- **Ambiguous fuzzy match:** List all matches, ask user to pick

---

## Important Notes

- Write all content in the user's language — Chinese if they speak Chinese, English if English
- Always use `short_id` for all LiveDoc operations
- Execute commands immediately with Bash — don't describe, do
- Task sync and README updates are the Agent's responsibility — do them proactively, not reactively
- The workspace should feel like it's always up to date, not something the user has to manually maintain
