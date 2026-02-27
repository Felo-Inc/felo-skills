# Felo Search Skill for Claude Code

A Claude Code skill that integrates [Felo Open Platform](https://felo.ai) to perform intelligent web searches with AI-generated answers and source citations.

## Features

- 🔍 Real-time web search powered by Felo AI
- 🤖 AI-generated comprehensive answers
- 📚 Source citations with links and snippets
- 🔄 Query analysis and optimization
- 🌐 Multi-language support (automatically matches query language)

## Installation

### Quick Install (Recommended)

```bash
npx @claude/skills add felo-search
```

### Manual Installation

1. Copy the `felo-search` folder to your Claude Code skills directory:
   - **Linux/macOS:** `~/.claude/skills/`
   - **Windows:** `C:\Users\<YourUsername>\.claude\skills\`

2. Get your Felo API Key:
   - Visit [felo.ai](https://felo.ai) and log in
   - Go to Settings → API Keys
   - Create a new API key

3. Configure the API key as an environment variable:

   **Linux/macOS:**
   ```bash
   export FELO_API_KEY="your-api-key-here"
   # Add to ~/.bashrc or ~/.zshrc for persistence
   ```

   **Windows (PowerShell):**
   ```powershell
   $env:FELO_API_KEY="your-api-key-here"
   # For persistence, add to system environment variables
   ```

4. Restart Claude Code

## Usage

Trigger the skill with any of these phrases:

- "Search with Felo..."
- "Felo search for..."
- "Use Felo to search..."
- `/felo-search` (command)

### Examples

```
User: Felo search for the latest AI trends in 2026
User: Search with Felo for quantum computing developments
User: /felo-search What are the best restaurants in Tokyo?
```

## Response Format

The skill returns:

1. **Answer** - AI-generated comprehensive answer
2. **Query Analysis** - Optimized search queries used
3. **Sources** - List of web sources with links and snippets

## Requirements

- Claude Code CLI
- Felo API Key (free tier available)
- Internet connection

## Troubleshooting

### "FELO_API_KEY environment variable is not set"

Make sure you've set the environment variable and restarted Claude Code.

### "INVALID_API_KEY"

Your API key may be incorrect or revoked. Generate a new one from [felo.ai](https://felo.ai).

### Chinese characters not working

The skill automatically handles Chinese characters by using JSON files. If you still encounter issues, ensure your terminal supports UTF-8 encoding.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - feel free to use and modify as needed.

## Links

- [Felo Open Platform](https://felo.ai)
- [API Documentation](https://openapi.felo.ai)
- [Claude Code](https://claude.ai/code)
