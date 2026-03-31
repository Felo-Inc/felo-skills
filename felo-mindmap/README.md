# Felo Mindmap

Generate mindmaps with Felo Mindmap API in Claude Code.

## Features

- Create mindmaps from any topic or question
- Support for 6 layout types: MIND_MAP, TIMELINE, FISHBONE, etc.
- Add mindmaps to existing LiveDoc
- Simple synchronous API (no waiting)

## Setup

1. Get your API key from [felo.ai](https://felo.ai) -> Settings -> API Keys
2. Set environment variable:

```bash
export FELO_API_KEY="your-api-key-here"
```

## Usage

### Basic Usage

```bash
node felo-mindmap/scripts/run_mindmap_task.mjs --query "Artificial Intelligence trends in 2024"
```

### With Layout Type

```bash
node felo-mindmap/scripts/run_mindmap_task.mjs --query "Project timeline" --layout TIMELINE
```

### With Existing LiveDoc

```bash
node felo-mindmap/scripts/run_mindmap_task.mjs --query "Meeting notes" --livedoc-short-id "abc123"
```

### JSON Output

```bash
node felo-mindmap/scripts/run_mindmap_task.mjs --query "Topic" --json
```

## Layout Types

| Layout | Description |
|--------|-------------|
| `MIND_MAP` | Classic mind map (default) |
| `LOGICAL_STRUCTURE` | Logical structure diagram |
| `ORGANIZATION_STRUCTURE` | Organization chart |
| `CATALOG_ORGANIZATION` | Catalog organization chart |
| `TIMELINE` | Timeline diagram |
| `FISHBONE` | Fishbone diagram |

## CLI Options

| Option | Description |
|--------|-------------|
| `--query <text>` | Mindmap topic (required) |
| `--layout <type>` | Layout type (default: MIND_MAP) |
| `--livedoc-short-id <id>` | Add to existing LiveDoc |
| `--timeout <seconds>` | Request timeout (default: 60) |
| `--json` | Output as JSON |
| `--help` | Show help |

## License

MIT