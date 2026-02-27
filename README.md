# Felo Skills for Claude Code

A collection of powerful skills for [Claude Code](https://claude.ai/code) that integrate [Felo Open Platform](https://felo.ai) API capabilities to enhance your AI assistant with real-time web search and intelligent information retrieval.

## 🌟 Features

- **Real-time Web Search**: Access up-to-date information from the web
- **AI-Generated Answers**: Get comprehensive, well-structured responses
- **Source Citations**: Every answer includes links and references
- **Multi-language Support**: Works seamlessly in multiple languages
- **Auto-trigger Intelligence**: Automatically detects when web search is needed
- **Easy Integration**: Simple installation and configuration

## 📦 Available Skills

### felo-search

Perform intelligent web searches using Felo AI and get AI-generated answers with source citations.

**Key Capabilities:**
- 🔍 Real-time web search powered by Felo AI
- 🤖 AI-generated comprehensive answers
- 📚 Source citations with links and snippets
- 🔄 Query analysis and optimization
- 🌐 Multi-language support (automatically matches query language)
- ⚡ Auto-trigger for latest news, weather, and real-time data

[View Details →](./felo-search/)

## 🚀 Quick Start

### Installation

**Option 1: Quick Install (Recommended)**

```bash
npx @claude/skills add felo-search
```

**Option 2: Manual Installation**

1. Clone this repository or download the skill folder:
   ```bash
   git clone https://github.com/Felo-Inc/felo-skills.git
   cd felo-skills
   ```

2. Copy the skill to your Claude Code skills directory:
   - **Linux/macOS:** `~/.claude/skills/`
   - **Windows:** `C:\Users\<YourUsername>\.claude\skills\`

3. Follow each skill's documentation to configure required API keys

4. Restart Claude Code

### Configuration

Each skill requires its own API key. For `felo-search`:

1. Get your Felo API Key from [felo.ai](https://felo.ai) (Settings → API Keys)
2. Set the environment variable:
   ```bash
   export FELO_API_KEY="your-api-key-here"
   ```
3. Restart Claude Code

See individual skill documentation for detailed setup instructions.

## 💡 Usage Examples

Once installed, the skills work automatically. For example, with `felo-search`:

```
You: What's the weather in Tokyo today?
Claude: [Automatically uses Felo to search and provides current weather with sources]

You: Latest developments in quantum computing
Claude: [Searches and provides up-to-date information with citations]

You: Best restaurants in Paris
Claude: [Returns current recommendations with links and reviews]
```

## 🛠️ Development

### Project Structure

```
felo-skills/
├── README.md                 # This file
├── felo-search/             # Felo search skill
│   ├── SKILL.md            # Skill implementation
│   ├── README.md           # Skill documentation
│   └── LICENSE             # MIT License
└── .gitignore
```

### Adding New Skills

We welcome contributions! To add a new skill:

1. Fork this repository
2. Create a new folder for your skill
3. Include `SKILL.md`, `README.md`, and `LICENSE`
4. Follow the existing skill structure
5. Submit a pull request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## 📋 Requirements

- [Claude Code](https://claude.ai/code) CLI
- Felo API Key (free tier available at [felo.ai](https://felo.ai))
- Internet connection

## 🤝 Contributing

Contributions are welcome! Whether you want to:

- Add new skills
- Improve existing skills
- Fix bugs
- Enhance documentation

Please feel free to submit issues or pull requests.

## 📄 License

MIT License - see individual skill folders for details.

## 🔗 Links

- [Felo Open Platform](https://felo.ai) - Get your API key
- [Felo API Documentation](https://openapi.felo.ai) - API reference
- [Claude Code](https://claude.ai/code) - AI assistant CLI
- [GitHub Issues](https://github.com/Felo-Inc/felo-skills/issues) - Report bugs or request features

## 📞 Support

- **Documentation**: Check individual skill README files
- **Issues**: [GitHub Issues](https://github.com/Felo-Inc/felo-skills/issues)
- **Email**: support@felo.ai

---

Made with ❤️ by the Felo team
