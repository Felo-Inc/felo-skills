# Felo LiveDoc

Manage knowledge bases (LiveDocs) and their resources via the Felo API.

---

## What It Does

- Create, list, update, and delete knowledge bases (LiveDocs)
- Add resources: text documents, URLs, file uploads
- Semantic retrieval across knowledge base resources
- Full CRUD for resources within a LiveDoc

**When to use:**
- Building or managing a knowledge base
- Uploading documents or URLs for AI-powered retrieval
- Searching across your knowledge base with natural language

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
