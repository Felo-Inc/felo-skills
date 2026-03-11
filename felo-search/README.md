# Felo Search Skill for Claude Code

**Real-time web search with AI-generated answers.**

Get current information on anything - weather, news, tech docs, reviews, prices. Works in Chinese, English, Japanese, and Korean.

---

## What It Does

Felo Search integrates [Felo AI](https://felo.ai) into Claude Code, enabling:
- Real-time web search for current information
- AI-generated comprehensive answers
- Multi-language support (auto-detects query language)
- Automatic triggering for questions needing current data

**When to use:**
- Current events, news, weather
- Product reviews, prices, comparisons
- Latest documentation, tech trends
- Location info (restaurants, attractions)
- Any question with "latest", "recent", "best", "how to"

**When NOT to use:**
- Code questions about your local project
- Pure math or logic problems
- Questions about files in your workspace

---

## Quick Setup

### Step 1: Install

**一键安装（推荐）：**

```bash
npx skills add Felo-Inc/felo-skills --skill felo-search
```

**手动安装：** 若上述命令不可用，可克隆本仓库后将 `felo-search` 复制到 Claude Code 的 skills 目录：

**Linux/macOS:**
```bash
cp -r felo-search ~/.claude/skills/
```

**Windows (PowerShell):**
```powershell
Copy-Item -Recurse felo-search "$env:USERPROFILE\.claude\skills\"
```

(Clone this repo first if needed: `git clone https://github.com/Felo-Inc/felo-skills.git`.)

**Verify:** Restart Claude Code and run:
```bash
claude skills list
```

You should see `felo-search` in the output.

### Step 2: Get API Key

1. Visit [felo.ai](https://felo.ai) and log in (or register)
2. Click your avatar (top right) → **Settings**
3. Navigate to **API Keys** tab
4. Click **Create New Key**
5. Copy your API key

![API Key Location](https://felo.ai/assets/api-key-guide.png)

### Step 3: Configure

Set the `FELO_API_KEY` environment variable:

**Linux/macOS:**
```bash
export FELO_API_KEY="your-api-key-here"

# Make it permanent (add to shell profile)
echo 'export FELO_API_KEY="your-api-key-here"' >> ~/.bashrc  # or ~/.zshrc
```

**Windows (PowerShell):**
```powershell
$env:FELO_API_KEY="your-api-key-here"

# Make it permanent (system environment variables)
# System Properties → Advanced → Environment Variables → New
```

**Windows (CMD):**
```cmd
set FELO_API_KEY=your-api-key-here
```

**Verify:** Check the variable is set:
```bash
# Linux/macOS
echo $FELO_API_KEY

# Windows PowerShell
echo $env:FELO_API_KEY
```

You should see your API key.

**Restart Claude Code** to load the environment variable.

### Step 4: Test

Ask Claude a question requiring current information:
```
What's the weather in Tokyo today?
```

If you see an AI-generated answer, **you're all set!**

---

## Usage Examples

### Daily Life

**Weather**
```
You: What's the weather in Tokyo today?
Claude: Currently 15°C in Tokyo with partly cloudy skies. High of 18°C,
        low of 12°C. 20% chance of rain.

You: What's the weather in Hangzhou tomorrow?
Claude: Hangzhou tomorrow: partly cloudy to clear, 8-16°C, NE wind 3-4.
```

**Restaurants & Food**
```
You: Best ramen in Osaka
Claude: Top 3 ramen shops in Osaka:
        1. Ichiran Dotonbori - Famous tonkotsu ramen, open 24/7
        2. Kamukura - Rich chicken broth, Michelin Bib Gourmand
        3. Menya Joroku - Tsukemen specialist

You: Where to find the best xiaolongbao in Shanghai?
Claude: Shanghai xiaolongbao recommendations:
        1. Nanxiang Steamed Bun - Old brand near Yuyuan, thin skin, juicy
        2. Jiajia Soup Dumplings - Popular on Huanghe Road, good value
        3. Din Tai Fung - Taiwan brand, consistent quality
```

**Shopping & Prices**
```
You: iPhone 15 Pro price comparison
Claude: iPhone 15 Pro (128GB) prices:
        - Apple Store: $999
        - Amazon: $979 (save $20)
        - Best Buy: $999 (with trade-in deals)

You: MacBook Air M3 price
Claude: MacBook Air M3 (13") prices:
        - Apple: $1,099 (256GB)
        - Amazon: $1,049 (with coupons)
        - Best Buy: $1,079 (with perks)
```

**Travel**
```
You: Things to do in Kyoto this weekend
Claude: Kyoto weekend highlights:
        - Cherry blossom viewing at Maruyama Park (peak season)
        - Fushimi Inari Shrine (open 24/7, less crowded early morning)
        - Nishiki Market food tour (closes 6pm)
        - Gion district evening walk (geisha spotting)

You: What to do in Taipei?
Claude: Taipei must-sees:
        - Taipei 101 - Observatory for night views
        - National Palace Museum - Chinese art and artifacts
        - Shilin Night Market - Food and snacks
        - Jiufen Old Street - Nostalgic mountain town
```

### Developer Scenarios

**Latest Documentation**
```
You: React 19 new features
Claude: React 19 key features (released Dec 2024):
        - React Compiler (auto-optimization)
        - Server Components stable
        - Actions for form handling
        - use() hook for async data

You: Next.js 15 new features
Claude: Next.js 15 main updates:
        - Turbopack stable (5x faster builds)
        - Partial Prerendering (PPR)
        - Improved cache control
        - React 19 support
```

**Library Comparison**
```
You: Vite vs Webpack 2024 comparison
Claude: Vite vs Webpack (2024):

        Build Speed: Vite 10x faster (dev), 3x faster (prod)
        Config: Vite simpler, Webpack more flexible
        Ecosystem: Webpack mature, Vite growing fast

        Use Vite for: New projects, fast iteration
        Use Webpack for: Complex builds, legacy support

You: Vue 3 vs React for new projects
Claude: Vue 3 vs React:

        Learning curve: Vue gentler, React needs JSX
        Performance: Similar, Vue slightly ahead
        Ecosystem: React larger, Vue sufficient
        Jobs: More React positions

        Suggestion: React if team knows it, Vue for newcomers
```

**Tech Trends**
```
You: Latest AI developments January 2026
Claude: AI developments (Jan 2026):
        - OpenAI GPT-5 preview released
        - Google Gemini 2.0 with multimodal reasoning
        - Anthropic Claude 4 with extended context
        - Meta's open-source LLaMA 4

You: Important tech news recently
Claude: Recent tech (Feb 2026):
        - Apple Vision Pro 2 announced
        - NVIDIA B100 GPU in production
        - Tesla FSD v13 rollout
        - Microsoft Windows 12 preview
```

### Multi-language Queries

Felo supports Chinese, Japanese, Korean, and English. Ask in any language and get answers in that language. Example in English:

**Latest AI & places**
```
You: Latest developments in AI
Claude: AI developments (2026):
        - LLM parameters exceed 10 trillion
        - Multimodal understanding near human level
        - AI coding assistants used by 60%+ developers
        - Embodied AI robots commercialized
        [Sources: industry reports]

You: What to do in Shenzhen
Claude: Shenzhen recommendations:
        - Window of the World - Miniature landmarks
        - Happy Valley - Theme park
        - Dameisha Beach - Free beach
        - OCT-LOFT - Arts and culture
        [Sources: travel guides]
```

**React adoption & comparisons**
```
You: React adoption in China
Claude: React in China:
        - Market share: ~45% (second to Vue)
        - Major users: Alibaba, ByteDance, Tencent
        - Ecosystem: Ant Design, Taro, etc.
        - Trend: Growing, Next.js popular
        [Sources: State of JS China]

You: Python vs Java for beginners
Claude: Python vs Java:
        - Learning: Python easier to start
        - Jobs: Both strong, Java more enterprise
        - Use Python for: Data, scripting, prototyping
        - Use Java for: Enterprise, Android, backend
        [Sources: Stack Overflow, job boards]
```

### Complex Queries

**Research & Analysis**
```
You: Impact of AI on software development 2024-2026
Claude: AI's impact on software development (2024-2026):

        Productivity: 40% faster coding with AI assistants
        Job Market: Shift from coding to architecture/design
        Tools: GitHub Copilot, Cursor, Claude Code dominant
        Challenges: Code quality, security, over-reliance

        Future: AI pair programming becomes standard practice

You: Impact of quantum computing on cryptography
Claude: Quantum computing and cryptography:

        Threat: RSA, ECC and similar algorithms could be broken
        Timeline: Estimated 2030-2035
        Response: Post-quantum cryptography (PQC) standardization
        Progress: NIST has published PQC algorithm standards

        Advice: Plan crypto migration in advance
```

**Comparisons**
```
You: Cloud providers comparison: AWS vs Azure vs GCP
Claude: AWS vs Azure vs GCP (2026):

        Market Share: AWS 32%, Azure 23%, GCP 10%
        Pricing: GCP cheapest, AWS most expensive
        Services: AWS most comprehensive, Azure best for Microsoft stack
        Performance: Similar, regional differences
        Support: Azure best for enterprise, AWS most docs

        Choose AWS: Mature ecosystem, most services
        Choose Azure: Microsoft integration, hybrid cloud
        Choose GCP: Data/ML workloads, cost-sensitive

You: Programming language performance: Python vs Go vs Rust
Claude: Python vs Go vs Rust:

        Speed: Rust > Go > Python (up to 100x)
        Memory: Rust lowest, Python highest
        Productivity: Python > Go > Rust
        Learning curve: Python gentlest, Rust steepest

        Use cases:
        - Python: Data science, scripting, rapid prototyping
        - Go: Microservices, cloud-native, concurrency
        - Rust: Systems programming, performance-critical, safety
```

**[See 40+ more examples →](../docs/EXAMPLES.md)**

---

## How It Works

### Auto-trigger

The skill automatically triggers for questions containing:
- **Time-sensitive**: "latest", "recent", "today", "now", "2026"
- **Information**: "what is", "tell me about", "how to"
- **Comparison**: "best", "top", "vs", "compare"
- **Location**: "where", "in [city]", "near me"
- **Chinese**: "最近", "什么", "哪里", "怎么样"
- **Japanese**: "最近", "何", "どこ", "どう"
- **Korean**: "최근", "무엇", "어디", "어떻게"

### Manual Trigger

Force the skill to run:
```
/felo-search your query here
```

Or use trigger phrases:
```
Search with Felo for [query]
Felo search: [query]
Use Felo to find [query]
```

### Response Format

Each response includes:

1. **Answer** - AI-generated comprehensive answer
2. **Query Analysis** - Optimized search queries used by Felo

Example:
```
## Answer
[Comprehensive AI-generated answer]

## Query Analysis
Optimized queries: ["query 1", "query 2"]
```

---

## Troubleshooting

### "FELO_API_KEY not set" error

**Problem:** Environment variable not configured.

**Solution:**
```bash
# Linux/macOS
export FELO_API_KEY="your-key"

# Windows PowerShell
$env:FELO_API_KEY="your-key"
```

Then restart Claude Code.

### "INVALID_API_KEY" error

**Problem:** API key is incorrect or revoked.

**Solution:** Generate a new key at [felo.ai](https://felo.ai) (Settings → API Keys).

### "curl: command not found" error

**Problem:** curl is not installed.

**Solution:**
```bash
# Linux (Debian/Ubuntu)
sudo apt install curl

# macOS
brew install curl

# Windows
# curl is built-in on Windows 10+
```

### Skill not triggering automatically

**Problem:** Query doesn't match trigger keywords.

**Solution:** Use manual trigger:
```
/felo-search your query
```

### Character encoding issues (Chinese/Japanese)

**Problem:** Special characters not displaying correctly.

**Solution:** Ensure your terminal supports UTF-8 encoding. The skill uses heredoc to handle special characters properly.

**[See full FAQ →](../docs/FAQ.md)**

---

## Links

- **[Get API Key](https://felo.ai)** - Settings → API Keys
- **[API Documentation](https://openapi.felo.ai)** - Full API reference
- **[Usage Examples](../docs/EXAMPLES.md)** - 40+ real-world examples
- **[FAQ](../docs/FAQ.md)** - Common issues and solutions
- **[Report Issues](https://github.com/Felo-Inc/felo-skills/issues)** - Bug reports and feature requests

---

## License

MIT License - see [LICENSE](./LICENSE) for details.
