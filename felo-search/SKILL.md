---
name: felo-search
description: Use Felo AI to perform intelligent web searches and get AI-generated answers with source citations
---

# Felo Search Skill

This skill integrates Felo Open Platform's Chat API to perform intelligent web searches and retrieve AI-generated answers with source citations.

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

**Windows (CMD):**
```cmd
set FELO_API_KEY=your-api-key-here
```

For permanent configuration, add it to your shell profile (~/.bashrc, ~/.zshrc) or system environment variables.

## When to Use

**Automatically trigger this skill when the user:**

- Asks about current events, news, or recent developments (e.g., "What's happening with AI?", "Latest news about...")
- Requests real-time information like weather, stock prices, or sports scores
- Asks "what is..." or "tell me about..." questions that may require up-to-date information
- Needs information about recent products, technologies, or trends
- Asks location-based questions (e.g., "best restaurants in...", "things to do in...")
- Requests comparisons or reviews that benefit from current data
- Explicitly mentions searching or looking up information

**Also trigger with explicit commands:**
- "Search with Felo..."
- "Felo search for..."
- "Use Felo to search..."
- `/felo-search`

**Key indicators to use this skill:**
- Questions about "latest", "recent", "current", "today", "now"
- Questions requiring web sources and citations
- Questions where Claude's knowledge cutoff may be outdated
- User explicitly asks for sources or references

**When NOT to use:**
- Questions about general knowledge that doesn't require current data
- Code-related questions that can be answered without web search
- Questions about the user's local files or codebase
- Mathematical calculations or logical reasoning tasks

## API Configuration

**Endpoint:** `https://openapi.felo.ai/v2/chat`

**Authentication:** Bearer token in Authorization header (from `FELO_API_KEY` environment variable)

## How to Use

When invoked, this skill will:

1. Check if `FELO_API_KEY` environment variable is set
2. Accept a search query from the user
3. Call Felo Chat API with the query
4. Return a formatted response including:
   - AI-generated comprehensive answer
   - Query analysis (optimized search queries)
   - Source citations with links, titles, and snippets

## Implementation

### Step 1: Check API Key

First, verify that the API key is configured:

```bash
if [ -z "$FELO_API_KEY" ]; then
  echo "Error: FELO_API_KEY environment variable is not set"
  echo "Please configure your API key following the Setup instructions"
  exit 1
fi
```

If the API key is not set, inform the user with clear instructions on how to configure it.

### Step 2: Make API Request

Create a temporary JSON file with the query (to handle special characters and encoding):

```bash
# Create query JSON file
echo '{"query": "USER_QUERY_HERE"}' > /tmp/felo_query.json

# Make API request
curl -X POST https://openapi.felo.ai/v2/chat \
  -H "Authorization: Bearer $FELO_API_KEY" \
  -H "Content-Type: application/json" \
  -d @/tmp/felo_query.json

# Clean up
rm /tmp/felo_query.json
```

**Note:** Using a JSON file instead of inline JSON helps handle Chinese characters and special characters correctly.

## Response Format

Present the results to the user in this format:

```
## Answer
[AI-generated answer]

## Query Analysis
Optimized queries: [list of queries]

## Sources
1. [Title](link)
   Snippet: [snippet text]
2. [Title](link)
   Snippet: [snippet text]
...
```

## Error Handling

### Common Error Codes

- `INVALID_API_KEY` - API Key is invalid or revoked
  - Solution: Check if your API key is correct and hasn't been revoked
- `MISSING_PARAMETER` - Required parameter is missing
  - Solution: Ensure the query parameter is provided
- `INVALID_PARAMETER` - Parameter value is invalid
  - Solution: Check the query format
- `CHAT_FAILED` - Internal service error
  - Solution: Retry the request or contact Felo support

### Missing API Key

If `FELO_API_KEY` is not set, display this message:

```
❌ Felo API Key not configured

To use this skill, you need to set up your Felo API Key:

1. Get your API key from https://felo.ai (Settings → API Keys)
2. Set the environment variable:

   Linux/macOS:
   export FELO_API_KEY="your-api-key-here"

   Windows (PowerShell):
   $env:FELO_API_KEY="your-api-key-here"

3. Restart Claude Code or reload the environment
```

## Examples

**User:** "Felo search for the latest developments in quantum computing"

**Action:** Call Felo API with the query and format the response with answer, query analysis, and sources.

**User:** "Search with Felo for AI trends in 2026"

**Action:** Call Felo API with the query and present formatted results.

## Notes

- API key is read from `FELO_API_KEY` environment variable for security
- The API returns results in the same language as the query when possible
- Include all source citations to give users transparency about information sources
- Keep responses concise but comprehensive
- Use JSON files for queries to properly handle special characters and encoding

## Additional Resources

- [Felo Open Platform Documentation](https://openapi.felo.ai)
- [Get API Key](https://felo.ai) (Settings → API Keys)
- [API Reference](https://openapi.felo.ai/docs)
