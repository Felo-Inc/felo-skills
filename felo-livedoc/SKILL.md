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
- **Resource management:** List, view, or delete resources within a LiveDoc

**Trigger words:**
- English: knowledge base, livedoc, live doc, upload document, add URL, semantic search, retrieve, knowledge retrieval
- 简体中文: 知识库, 文档库, 上传文档, 添加链接, 语义检索, 知识检索

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

### Semantic Retrieval

**Search across resources:**
```bash
node ~/.agents/skills/felo-livedoc/scripts/run_livedoc.mjs retrieve SHORT_ID --query "your search query"
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
