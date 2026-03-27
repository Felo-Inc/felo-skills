---
name: felo-livedoc
description: "Manage Felo LiveDocs (knowledge bases) and their resources. Use when users want to create, manage, or query knowledge bases, upload documents, add URLs, or perform semantic retrieval over a knowledge base. Explicit commands: /felo-livedoc."
---

# Felo LiveDoc Skill

## When to Use

Trigger this skill when users want to:

- **Create/manage knowledge bases:** Create, list, update, or delete LiveDocs
- **Add resources:** Upload documents, add URLs, or create text documents in a LiveDoc
- **Semantic retrieval:** Search across knowledge base resources using natural language queries
- **Route resources:** Find relevant resource IDs by query for targeted retrieval
- **Resource management:** List, view, or delete resources within a LiveDoc
- **README management:** Get, create, update, append, or delete a LiveDoc's README
- **Task management:** Create, update, delete tasks; add comments; view change history

**Trigger words:**
- English: knowledge base, livedoc, live doc, upload document, add URL, semantic search, retrieve, knowledge retrieval, route resources, readme, task, task management, comment
- 简体中文: 知识库, 文档库, 上传文档, 添加链接, 语义检索, 知识检索, 任务, 任务管理, 评论

**Explicit commands:** `/felo-livedoc`, "livedoc", "felo livedoc"

**Do NOT use for:**
- General web search (use felo-search)
- PPT generation (use felo-slides)
- SuperAgent conversations (use felo-superAgent)

## Setup

### 1. Get Your API Key

1. Visit [felo.ai](https://felo.ai) and log in (or register)
2. Click your avatar in the top right corner → Settings
3. Navigate to the "API Keys" tab
4. Click "Create New Key" to generate a new API Key
5. Copy and save your API Key securely

### 2. Configure API Key

Set the `FELO_API_KEY` environment variable:

**Linux/macOS:**
```bash
export FELO_API_KEY="your-api-key-here"
```

**Windows (PowerShell):**
```powershell
$env:FELO_API_KEY="your-api-key-here"
```
## How to Execute

When this skill is triggered, execute the livedoc script using the Bash tool:

### LiveDoc Management

**Create a LiveDoc:**
```bash
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs create --name "KB Name" --description "Description"
```

**List LiveDocs:**
```bash
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs list
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs list --keyword "search term"
```

**Update a LiveDoc:**
```bash
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs update SHORT_ID --name "New Name" --description "New Desc"
```

**Delete a LiveDoc:**
```bash
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs delete SHORT_ID
```

### Resource Management

**Add a text document:**
```bash
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs add-doc SHORT_ID --title "Doc Title" --content "Document content here"
```

**Add URLs (max 10, comma-separated):**
```bash
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs add-urls SHORT_ID --urls "https://example.com,https://example.org"
```

Each URL can also be passed as a `url:title` pair using the `--url-titles` option, or by providing a JSON array. The API accepts both plain strings and `{"url": "...", "title": "..."}` objects — the script passes them through as-is when using `--json` mode. To add URLs with custom titles, use the JSON flag and construct the body manually, or rely on the auto-title from the page.

**Upload a file:**
```bash
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs upload SHORT_ID --file ./document.pdf
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs upload SHORT_ID --file ./document.pdf --convert
```

**List resources:**
```bash
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs resources SHORT_ID
```

**Get a single resource:**
```bash
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs resource SHORT_ID RESOURCE_ID
```

**Delete a resource:**
```bash
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs remove-resource SHORT_ID RESOURCE_ID
```

**Update a resource (title/snippet/thumbnail):**
```bash
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs update-resource SHORT_ID RESOURCE_ID --title "New Title"
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs update-resource SHORT_ID RESOURCE_ID --snippet "New summary" --thumbnail "https://example.com/thumb.png"
```

**Update resource content (ai_doc type only — also auto-updates snippet from first 2000 bytes):**
```bash
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs update-resource-content SHORT_ID RESOURCE_ID --content "New content here"
```

### Semantic Retrieval

**Route relevant resources by query:**
```bash
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs route SHORT_ID --query "your search query"
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs route SHORT_ID --query "your search query" --max-resources 5
```

**Search across all resources (auto-routes):**
```bash
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs retrieve SHORT_ID --query "your search query"
```

**Search within specific resources:**
```bash
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs retrieve SHORT_ID --query "your search query" --resource-ids "id1,id2,id3"
```

### Resource File & Content

**Download resource source file (get presigned URL):**
```bash
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs download SHORT_ID RESOURCE_ID
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs download SHORT_ID RESOURCE_ID --expires-in 7200
```

**Get extracted text content of a resource:**
```bash
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs content SHORT_ID RESOURCE_ID
```

**PPT page deep retrieval:**
```bash
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs ppt-retrieve SHORT_ID --resource-id RESOURCE_ID --page-number 3 --query "pricing information"
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs ppt-retrieve SHORT_ID --resource-id RESOURCE_ID --page-number 3 --query "pricing information" --max-chunk 5
```

### README Management

**Get README:**
```bash
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs get-readme SHORT_ID
```

**Create or replace README:**
```bash
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs update-readme SHORT_ID --content "# My KB\n\nThis is the README."
```

**Append to README:**
```bash
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs append-readme SHORT_ID --content "\n\n## New Section\n\nAdditional content."
```

**Delete README:**
```bash
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs delete-readme SHORT_ID
```

### Task Management

**List tasks (with optional filters):**
```bash
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs tasks SHORT_ID
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs tasks SHORT_ID --status 0
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs tasks SHORT_ID --labels "docs,priority-high"
```

**Create a task:**
```bash
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs create-task SHORT_ID --title "Write docs" --status 0 --sort 0
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs create-task SHORT_ID --title "Write docs" --status 0 --sort 0 --description "API docs" --labels "docs"
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs create-task SHORT_ID --title "Write docs" --operated-by "claude-code"
```

Task status values: `0`=TODO, `1`=IN_PROGRESS, `2`=DONE

**Update a task (partial update):**
```bash
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs update-task SHORT_ID TASK_ID --status 1
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs update-task SHORT_ID TASK_ID --title "New title" --labels "docs,done"
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs update-task SHORT_ID TASK_ID --status 2 --operated-by "claude-code"
```

**Delete a task:**
```bash
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs delete-task SHORT_ID TASK_ID
```

**List task records (comments + change history):**
```bash
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs task-records SHORT_ID TASK_ID
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs task-records SHORT_ID TASK_ID --record-type comment
```

**Add a comment to a task:**
```bash
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs add-task-comment SHORT_ID TASK_ID --content "This is a comment."
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs add-task-comment SHORT_ID TASK_ID --content "This is a comment." --operated-by "claude-code"
```
### Options

All commands support:
- `--json` or `-j` — output raw JSON response
- `--timeout <ms>` or `-t <ms>` — request timeout in milliseconds (default: 60000)

### Parse and Format Response

The API returns JSON with this structure:
```json
{
  "status": "ok",
  "message": "success",
  "data": { ... }
}
```

**LiveDoc object:**
- `short_id` — unique identifier (use this for all operations)
- `name` — LiveDoc name
- `description` — LiveDoc description
- `is_shared` — `true` if this LiveDoc was shared with you (not owned by you)
- `created_at` / `modified_at` — timestamps

**Resource object:**
- `id` — resource identifier
- `title` — resource title
- `resource_type` — type (web, ai_doc, file, etc.)
- `status` — processing status
- `snippet` — content preview

**Retrieve result:**
- `id` — resource ID
- `title` — resource title
- `content` — matched content
- `score` — relevance score (0-1)

## Error Handling

### Common Error Codes

- `INVALID_API_KEY` — API Key is invalid or revoked
- `LIVEDOC_NOT_FOUND` — LiveDoc does not exist
- `LIVEDOC_RESOURCE_NOT_FOUND` — Resource does not exist
- `LIVEDOC_CREATE_FAILED` — Failed to create LiveDoc
- `LIVEDOC_RESOURCE_UPLOAD_FAILED` — File upload failed
- `LIVEDOC_RESOURCE_ADD_URLS_FAILED` — URL addition failed
- `LIVEDOC_RESOURCE_RETRIEVE_FAILED` — Semantic retrieval failed
- `LIVEDOC_README_GET_FAILED` — Failed to get README
- `LIVEDOC_README_UPDATE_FAILED` — Failed to create or update README
- `LIVEDOC_README_DELETE_FAILED` — Failed to delete README
- `LIVEDOC_TASK_LIST_FAILED` — Failed to list tasks
- `LIVEDOC_TASK_CREATE_FAILED` — Failed to create task
- `LIVEDOC_TASK_UPDATE_FAILED` — Failed to update task
- `LIVEDOC_TASK_DELETE_FAILED` — Failed to delete task
- `LIVEDOC_TASK_NOT_FOUND` — Task does not exist
- `LIVEDOC_TASK_RECORD_LIST_FAILED` — Failed to list task records
- `LIVEDOC_TASK_COMMENT_CREATE_FAILED` — Failed to add comment

### Missing API Key

If `FELO_API_KEY` is not set, display this message:

```
ERROR: FELO_API_KEY not set. Get your API key from https://felo.ai (Settings → API Keys).
Set it with: export FELO_API_KEY="your-key"
```

## Important Notes

- Always use the `short_id` returned from create/list to reference a LiveDoc
- URL resources are limited to 10 per request
- Use `--convert` with upload to convert files to searchable documents
- Semantic retrieval returns results sorted by relevance score
- Execute immediately using the Bash tool — don't just describe what you would do
