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

```bash
npx @claude/skills add felo-search
```

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

You: 杭州明天天气怎么样？
Claude: 杭州明天多云转晴，气温 8-16°C，东北风 3-4 级。
```

**Restaurants & Food**
```
You: Best ramen in Osaka
Claude: Top 3 ramen shops in Osaka:
        1. Ichiran Dotonbori - Famous tonkotsu ramen, open 24/7
        2. Kamukura - Rich chicken broth, Michelin Bib Gourmand
        3. Menya Joroku - Tsukemen specialist

You: 上海哪里有好吃的小笼包？
Claude: 上海小笼包推荐：
        1. 南翔馒头店 - 豫园老字号，皮薄汁多
        2. 佳家汤包 - 黄河路网红店，性价比高
        3. 鼎泰丰 - 台湾品牌，品质稳定
```

**Shopping & Prices**
```
You: iPhone 15 Pro price comparison
Claude: iPhone 15 Pro (128GB) prices:
        - Apple Store: $999
        - Amazon: $979 (save $20)
        - Best Buy: $999 (with trade-in deals)

You: MacBook Air M3 多少钱？
Claude: MacBook Air M3 (13 英寸) 价格：
        - 官网: ¥9,499 (256GB)
        - 京东: ¥9,299 (有优惠券)
        - 天猫: ¥9,399 (赠品多)
```

**Travel**
```
You: Things to do in Kyoto this weekend
Claude: Kyoto weekend highlights:
        - Cherry blossom viewing at Maruyama Park (peak season)
        - Fushimi Inari Shrine (open 24/7, less crowded early morning)
        - Nishiki Market food tour (closes 6pm)
        - Gion district evening walk (geisha spotting)

You: 台北有什么好玩的地方？
Claude: 台北必去景点：
        - 台北 101 - 观景台看夜景
        - 故宫博物院 - 中华文物精品
        - 士林夜市 - 美食天堂
        - 九份老街 - 怀旧山城
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

You: Next.js 15 有什么新功能？
Claude: Next.js 15 主要更新：
        - Turbopack 稳定版（构建速度提升 5x）
        - 部分预渲染（PPR）
        - 改进的缓存控制
        - React 19 支持
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

You: Vue 3 和 React 哪个更适合新项目？
Claude: Vue 3 vs React 对比：

        学习曲线: Vue 更平缓，React 需要 JSX
        性能: 两者相当，Vue 略优
        生态: React 更丰富，Vue 够用
        就业: React 岗位更多

        建议: 团队熟悉 React 选 React，新手选 Vue
```

**Tech Trends**
```
You: Latest AI developments January 2026
Claude: AI developments (Jan 2026):
        - OpenAI GPT-5 preview released
        - Google Gemini 2.0 with multimodal reasoning
        - Anthropic Claude 4 with extended context
        - Meta's open-source LLaMA 4

You: 最近有什么重要的技术新闻？
Claude: 近期科技动态（2026年2月）：
        - 苹果发布 Vision Pro 2 代
        - 英伟达 B100 GPU 开始量产
        - 特斯拉 FSD v13 正式推送
        - 微软 Windows 12 预览版发布
```

### Multi-language Queries

**Chinese (Simplified)**
```
You: 人工智能最新进展
Claude: AI 最新进展（2026年）：
        - 大模型参数突破 10 万亿
        - 多模态理解接近人类水平
        - AI 编程助手普及率超 60%
        - 具身智能机器人商业化
        [来源: 机器之心, 量子位]

You: 深圳有什么好玩的地方
Claude: 深圳旅游推荐：
        - 世界之窗 - 微缩景观
        - 欢乐谷 - 主题乐园
        - 大梅沙海滨公园 - 免费沙滩
        - 华侨城创意园 - 文艺打卡
        [来源: 深圳文旅局, 马蜂窝]
```

**Chinese (Traditional - Taiwan)**
```
You: 台北最近有什麼新鮮事？
Claude: 台北近期新聞：
        - 捷運環狀線北環段動工
        - 大巨蛋正式啟用
        - 台北燈節 2 月登場
        - 米其林指南台北版更新
        [來源: 聯合新聞網, 自由時報]

You: 高雄美食推薦
Claude: 高雄必吃美食：
        - 六合夜市 - 木瓜牛奶、海產粥
        - 瑞豐夜市 - 炸雞排、臭豆腐
        - 旗津海產街 - 新鮮海鮮
        - 鹽埕區 - 老字號小吃
        [來源: 愛食記, 痞客邦]
```

**Japanese**
```
You: 東京で今人気のレストランは？
Claude: 東京の人気レストラン（2026年）：
        - Narisawa - モダン日本料理、ミシュラン2つ星
        - Den - 革新的和食、世界のベストレストラン
        - Florilège - フレンチ、予約困難
        - Sushi Saito - 江戸前寿司の最高峰
        [出典: 食べログ, ミシュランガイド]

You: 最新のAI技術について教えて
Claude: 最新AI技術（2026年）：
        - GPT-5の登場で自然言語処理が進化
        - マルチモーダルAIが主流に
        - エッジAIの普及が加速
        - AI規制法が各国で施行
        [出典: ITmedia, 日経新聞]
```

**Korean**
```
You: 서울 맛집 추천
Claude: 서울 맛집 추천：
        - 광장시장 - 전통 한식, 마약김밥
        - 명동 - 길거리 음식, 쇼핑
        - 강남 - 고급 레스토랑, 카페
        - 이태원 - 세계 각국 요리
        [출처: 망고플레이트, 네이버 블로그]

You: 최신 프로그래밍 트렌드
Claude: 최신 프로그래밍 트렌드 (2026):
        - AI 코딩 어시스턴트 보편화
        - Rust 인기 급상승
        - 서버리스 아키텍처 확산
        - WebAssembly 생태계 성장
        [출처: Stack Overflow, GitHub Trends]
```

**Mixed Language**
```
You: React 在中国的使用情况
Claude: React 在中国的使用情况：
        - 市场份额: 约 45%（仅次于 Vue）
        - 主要用户: 大厂（阿里、字节、腾讯）
        - 生态: 完善，Ant Design、Taro 等
        - 趋势: 持续增长，Next.js 受欢迎
        [来源: State of JS China, 掘金]

You: 日本のAI企業について
Claude: 日本の主要AI企業：
        - Preferred Networks - 深層学習フレームワーク
        - ABEJA - エッジAIプラットフォーム
        - PKSHA Technology - 自然言語処理
        - Nextremer - 対話AI
        [出典: 日経ビジネス, TechCrunch Japan]
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

You: 量子计算对密码学的影响
Claude: 量子计算对密码学的影响：

        威胁: RSA、ECC 等传统加密算法将被破解
        时间线: 预计 2030-2035 年实现
        应对: 后量子密码学（PQC）标准化
        进展: NIST 已发布 PQC 算法标准

        建议: 企业应提前规划密码学迁移
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

You: 编程语言性能对比：Python vs Go vs Rust
Claude: Python vs Go vs Rust 性能对比：

        执行速度: Rust > Go > Python (100x 差距)
        内存占用: Rust 最小，Python 最大
        开发效率: Python > Go > Rust
        学习曲线: Python 最平缓，Rust 最陡

        适用场景:
        - Python: 数据科学、脚本、快速原型
        - Go: 微服务、云原生、并发
        - Rust: 系统编程、性能关键、安全
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
