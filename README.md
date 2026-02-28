# Felo Skills for Claude Code

**Ask anything. Get current answers powered by AI.**

Real-time web search powered by Felo AI. Works in Chinese, English, Japanese, and Korean.

[![Setup Time](https://img.shields.io/badge/setup-2%20minutes-blue)]() [![License](https://img.shields.io/badge/license-MIT-green)]()

---

## Quick Start

Install the skill:
```bash
npx @claude/skills add felo-search
```

Get your API key from [felo.ai](https://felo.ai) (Settings → API Keys), then configure:

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

Test it works:
```
Ask Claude: "What's the weather in Tokyo today?"
```

**You're done!** The skill triggers automatically for any question needing current information.

---

## Usage Examples

### Daily Life

**Weather**
```
You: What's the weather in Tokyo today?
Claude: [Current temperature, conditions, forecast]

You: 杭州明天天气怎么样？
Claude: [明天杭州天气预报，温度范围，降水概率]
```

**Restaurants & Food**
```
You: Best ramen in Osaka
Claude: [Top-rated ramen shops with addresses, ratings, reviews]

You: 上海哪里有好吃的小笼包？
Claude: [推荐餐厅列表，地址，特色菜品]
```

**Shopping & Prices**
```
You: iPhone 15 Pro price comparison
Claude: [Prices from different retailers with links]

You: MacBook Air M3 多少钱？
Claude: [各渠道价格对比，优惠信息]
```

**Travel**
```
You: Things to do in Kyoto this weekend
Claude: [Events, attractions, seasonal activities]

You: 台北有什么好玩的地方？
Claude: [景点推荐，开放时间，交通方式]
```

### Developer Scenarios

**Latest Documentation**
```
You: React 19 new features
Claude: [Latest React 19 features with official docs links]

You: Next.js 15 有什么新功能？
Claude: [Next.js 15 新特性总结，文档链接]
```

**Library Comparison**
```
You: Vite vs Webpack 2024 comparison
Claude: [Performance, features, use cases comparison]

You: Vue 3 和 React 哪个更适合新项目？
Claude: [对比分析，适用场景，社区生态]
```

**Tech Trends**
```
You: Latest AI developments January 2026
Claude: [Recent AI breakthroughs, company announcements]

You: 最近有什么重要的技术新闻？
Claude: [近期科技动态，行业趋势]
```

### Multi-language Queries

Works seamlessly in:
- **Chinese (Simplified)**: "人工智能最新进展"
- **Chinese (Traditional)**: "台北最近有什麼新鮮事？"
- **Japanese**: "東京で今人気のレストランは？"
- **Korean**: "서울 맛집 추천"
- **Mixed**: "React 在中国的使用情况"

### Complex Queries

**Research & Analysis**
```
You: Impact of AI on software development 2024-2026
Claude: [Comprehensive analysis with statistics, trends, expert opinions]

You: 量子计算对密码学的影响
Claude: [深度分析，技术挑战，未来展望]
```

**Comparisons**
```
You: Cloud providers comparison: AWS vs Azure vs GCP
Claude: [Detailed comparison table, pricing, use cases]

You: 编程语言性能对比：Python vs Go vs Rust
Claude: [性能测试数据，适用场景，学习曲线]
```

**[See 40+ more examples →](./docs/EXAMPLES.md)**

---

## Installation Details

### Prerequisites

- [Claude Code](https://claude.ai/code) CLI installed
- Node.js (for npx command)
- Internet connection

### Manual Installation

If quick install doesn't work, install manually:

1. Clone this repository:
   ```bash
   git clone https://github.com/Felo-Inc/felo-skills.git
   cd felo-skills
   ```

2. Copy to Claude Code skills directory:
   - **Linux/macOS:** `~/.claude/skills/`
   - **Windows:** `C:\Users\<YourUsername>\.claude\skills\`

   ```bash
   # Linux/macOS
   cp -r felo-search ~/.claude/skills/

   # Windows (PowerShell)
   Copy-Item -Recurse felo-search "$env:USERPROFILE\.claude\skills\"
   ```

3. Get API key from [felo.ai](https://felo.ai) (Settings → API Keys)

4. Set environment variable (see Quick Start section)

5. Restart Claude Code:
   ```bash
   claude restart
   ```

### Verify Installation

Check the skill is loaded:
```bash
claude skills list
```

You should see `felo-search` in the output.

Test with a query:
```
Ask Claude: "Latest news about quantum computing"
```

If you see an AI-generated answer, it's working!

---

## FAQ

### Q: Skill not triggering automatically?

**A:** The skill triggers for questions needing current info (weather, news, prices, etc.). For manual trigger, use:
```
/felo-search your query here
```

### Q: "FELO_API_KEY not set" error?

**A:** Set the environment variable:
```bash
# Linux/macOS
export FELO_API_KEY="your-key"

# Windows PowerShell
$env:FELO_API_KEY="your-key"
```

Then restart Claude Code.

### Q: Environment variable not persisting?

**A:** Add to your shell profile:
- **bash**: Add to `~/.bashrc`
- **zsh**: Add to `~/.zshrc`
- **Windows**: Add to system environment variables (System Properties → Environment Variables)

### Q: "INVALID_API_KEY" error?

**A:** Your API key is incorrect or revoked. Generate a new one at [felo.ai](https://felo.ai) (Settings → API Keys).

### Q: Does it work in Chinese/Japanese/Korean?

**A:** Yes! Fully supports multi-language queries. Ask in any language, get answers in that language.

### Q: What's the response format?

**A:** Each response includes:
1. **AI-generated answer** - Comprehensive, well-structured
2. **Query analysis** - Optimized search queries used

### Q: "curl: command not found" error?

**A:** Install curl:
```bash
# Linux (Debian/Ubuntu)
sudo apt install curl

# macOS
brew install curl

# Windows
# curl is built-in on Windows 10+
```

### Q: Rate limits?

**A:** Check your Felo account tier at [felo.ai](https://felo.ai). Free tier available.

### Q: Can I use it offline?

**A:** No, requires internet connection to Felo API.

### Q: How fast are responses?

**A:** Typically 2-5 seconds depending on query complexity.

**[See full FAQ →](./docs/FAQ.md)**

---

## Available Skills

### felo-search

Real-time web search with AI-generated answers.

**Triggers automatically for:**
- Current events & news
- Weather, prices, reviews
- Location info (restaurants, attractions)
- Latest documentation & tech trends
- Product comparisons
- Any question with "latest", "recent", "best", "how to"

**[View skill documentation →](./felo-search/)**

---

## Contributing

We welcome contributions! Whether you want to:
- Report bugs or request features
- Improve documentation
- Add new skills

**[See contributing guide →](./CONTRIBUTING.md)**

---

## Links

- **[Felo Open Platform](https://openapi.felo.ai/docs/)** - Get your API key
- **[API Documentation](https://openapi.felo.ai/docs/api-reference/v2/chat.html)** - API reference
- **[Claude Code](https://claude.ai/code)** - AI assistant CLI
- **[Full Examples](./docs/EXAMPLES.md)** - 40+ usage examples
- **[FAQ](./docs/FAQ.md)** - Troubleshooting guide
- **[GitHub Issues](https://github.com/Felo-Inc/felo-skills/issues)** - Report bugs

---

## Support

- **Documentation**: Check [FAQ](./docs/FAQ.md) and skill README files
- **Issues**: [GitHub Issues](https://github.com/Felo-Inc/felo-skills/issues)
- **Email**: support@felo.ai

---

## License

MIT License - see [LICENSE](./felo-search/LICENSE) for details.

---

Made with ❤️ by the Felo team
