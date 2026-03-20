# Felo LiveDoc

Manage knowledge bases (LiveDocs) and their resources via the Felo API.

---

## What It Does

- Create, list, update, and delete knowledge bases (LiveDocs)
- Add resources: text documents, URLs, file uploads
- Semantic retrieval across knowledge base resources
- Route relevant resources by query for targeted retrieval
- Full CRUD for resources within a LiveDoc
- Manage README content for each LiveDoc
- Task management: create, update, delete tasks with comments and change history

**When to use:**
- Building or managing a knowledge base
- Uploading documents or URLs for AI-powered retrieval
- Searching across your knowledge base with natural language
- Routing relevant resources before targeted retrieval

**When NOT to use:**
- General web search (use `felo-search`)
- PPT generation (use `felo-slides`)

---

## Quick Setup

### Step 1: Install

```bash
claude install Felo-Inc/felo-skills/felo-livedoc
```

### Step 2: Configure API Key

Get your API key from [felo.ai](https://felo.ai) (Settings → API Keys), then:

```bash
export FELO_API_KEY="your-api-key-here"
```

### Step 3: Test

```bash
felo livedoc list
```

---

## Usage Examples

```bash
# Create a knowledge base
felo livedoc create --name "My KB" --description "Project docs"

# Add a URL resource
felo livedoc add-urls SHORT_ID --urls "https://example.com"

# Upload a file
felo livedoc upload SHORT_ID --file ./report.pdf

# Semantic retrieval across all resources (auto-routes)
felo livedoc retrieve SHORT_ID --query "latest AI research"

# Retrieve within specific resources
felo livedoc retrieve SHORT_ID --query "latest AI research" --resource-ids "id1,id2"

# Route relevant resources by query
felo livedoc route SHORT_ID --query "latest AI research"
felo livedoc route SHORT_ID --query "latest AI research" --max-resources 5
```

---

## Commands

| Command | Description |
|---------|-------------|
| `create` | Create a new LiveDoc |
| `list` | List all LiveDocs |
| `update <short_id>` | Update a LiveDoc |
| `delete <short_id>` | Delete a LiveDoc |
| `resources <short_id>` | List resources in a LiveDoc |
| `resource <short_id> <resource_id>` | Get a single resource |
| `add-doc <short_id>` | Create a text document resource |
| `add-urls <short_id>` | Add URL resources (max 10) |
| `upload <short_id>` | Upload a file resource |
| `remove-resource <short_id> <resource_id>` | Delete a resource |
| `update-resource <short_id> <resource_id>` | Update resource title, snippet, or thumbnail |
| `retrieve <short_id>` | Semantic retrieval (auto-routes if no `--resource-ids`) |
| `route <short_id>` | Route relevant resource IDs by query |
| `get-readme <short_id>` | Get README content |
| `update-readme <short_id>` | Create or replace README |
| `append-readme <short_id>` | Append content to README |
| `delete-readme <short_id>` | Delete README |
| `tasks <short_id>` | List tasks (filter by `--status`, `--labels`) |
| `create-task <short_id>` | Create a task |
| `update-task <short_id> <task_id>` | Partially update a task |
| `delete-task <short_id> <task_id>` | Delete a task |
| `task-records <short_id> <task_id>` | List task records (comments + change history) |
| `add-task-comment <short_id> <task_id>` | Add a comment to a task |

---

## License

MIT
