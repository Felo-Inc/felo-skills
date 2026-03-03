# Felo AI

**Ask anything. Get current answers powered by AI.**

Felo AI 提供终端 CLI 与 Claude Code 技能，支持多语言（中/英/日/韩）。

[![Setup Time](https://img.shields.io/badge/setup-2%20minutes-blue)]() [![License](https://img.shields.io/badge/license-MIT-green)]()

---

## 两大能力

Felo AI 提供两个核心能力：**实时搜索** 与 **PPT 生成**。可在终端用 CLI 使用，也可在 Claude Code 中通过技能使用（搜索支持自动触发）。

---

### 能力一：实时搜索

联网搜索最新信息，由 AI 整合成可直接使用的回答。适合查天气、新闻、价格、文档、技术动态等一切需要「当下」信息的场景。

- **支持多语言**：中文、英文、日文、韩文等，用你习惯的语言提问即可。
- **使用方式**：
  - **终端**：`felo search "你的问题"`
  - **Claude Code**：安装技能后，问「东京今天天气」「React 19 新特性」等会自动触发搜索并返回结果；也可手动输入 `/felo-ai 你的问题`。
- **示例**：`felo search "杭州明天天气"`、`felo search "MacBook Air M3 多少钱"`、`felo search "React 19 new features" --verbose`

---

### 能力二：生成 PPT

根据一句描述或主题，自动生成一份 PPT。任务在云端执行，完成后返回**在线文档链接**，可直接在浏览器打开查看/编辑。

- **异步生成**：提交提示后 CLI 会轮询任务状态，完成后输出 `live_doc_url`，无需本地 Office。
- **使用方式**：
  - **终端**：`felo slides "你的主题或描述"`
  - 可选 `--verbose` 查看轮询进度，`--json` 输出原始 JSON（含 `task_id`、`live_doc_url`）。
- **示例**：`felo slides "Felo 产品介绍，3 页"`、`felo slides "Introduction to React"`、`felo slides "季度复盘总结" --poll-timeout 300`

---

## Felo CLI（终端）

在终端直接使用 Felo，无需打开 Claude Code。

### 安装

```bash
npm install -g felo-ai
```

不安装直接运行（使用最新发布版本）：

```bash
npx felo-ai search "东京天气"
```

安装后命令为 `felo`（来自包名 `felo-ai`）。

### Configure API key

**Option 1: Persist with config (recommended)**

```bash
felo config set FELO_API_KEY your-api-key-here
```

The key is stored in `~/.felo/config.json` (Windows: `%USERPROFILE%\.felo\config.json`). You only need to set it once.

**Option 2: Environment variable**

```bash
# Linux/macOS
export FELO_API_KEY="your-api-key-here"

# Windows (PowerShell)
$env:FELO_API_KEY="your-api-key-here"
```

Get your API key from [felo.ai](https://felo.ai) (Settings → API Keys). Environment variable overrides config if both are set.

### 命令一览

| 命令 | 说明 |
|------|------|
| `felo search "<query>"` | **能力一：实时搜索** — 查天气、新闻、价格、文档等，AI 整合回答 |
| `felo slides "<prompt>"` | **能力二：生成 PPT** — 按描述生成 PPT，完成后输出在线文档链接 |
| `felo config set FELO_API_KEY <key>` | 保存 API Key（推荐首次使用前配置） |
| `felo config get/list/path/unset` | 查看、列出、定位或删除配置 |

### Examples

```bash
felo search "东京天气"
felo search "MacBook Air M3 多少钱"
felo search "React 19 new features" --verbose
felo search "杭州明天天气" --json
npx felo-ai search "Tokyo weather"
```

### CLI FAQ

- **Key not found?** Run `felo config set FELO_API_KEY <key>` or set the `FELO_API_KEY` environment variable.
- **Request timeout?** Use `felo search "query" --timeout 120` (default 60 seconds). 5xx errors are retried automatically with backoff.
- **Where is config stored?** Run `felo config path` to see the file (e.g. `~/.felo/config.json`).
- **Streaming?** Not yet; when the Felo API supports streaming, the CLI can be updated to stream output.

---

## Quick Start（Claude Code 技能）

安装技能：
```bash
npx @claude/skills add felo-ai
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
   # 注：技能目录名可能为 felo-search，以仓库内文件夹为准
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

You should see `felo-ai` 或 `felo-search` in the output（取决于技能注册名）.

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
/felo-ai your query here
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

## Claude Code 技能说明

在 Claude Code 中安装 `felo-ai` 后，**实时搜索**会作为技能自动生效：当问题涉及天气、新闻、价格、最新文档等需要联网的信息时，会自动调用 Felo 搜索并返回回答。也可手动输入 `/felo-ai 你的问题` 触发。

**典型触发场景**：时事新闻、天气/价格/点评、地点（餐厅/景点）、最新技术文档与动态、产品对比，以及含「最新」「最近」「最好」「怎么」等的提问。

PPT 生成目前仅支持在终端通过 `felo slides` 使用。

**[搜索技能详细文档 →](./felo-search/)**

---

## Contributing

We welcome contributions! Whether you want to:
- Report bugs or request features
- Improve documentation
- Add new skills

Run CLI tests: `npm test`

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
