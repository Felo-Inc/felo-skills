# Apple Buy Advisor Skill

Research and compare Apple products to help users make informed buying decisions.

## Directory Structure

```
apple-buy-advisor/
├── SKILL.md          # Main skill definition
└── README.md         # This file
```

## What It Does

When a user asks about buying or comparing Apple products, this skill:

1. **Fetches official specs** from Apple.com via `felo-web-fetch`
2. **Searches user opinions** on X (Twitter) via `felo-x-search`
3. **Researches community & professional reviews** via `felo-search`
4. **Produces a structured report** — single product or head-to-head comparison

## Trigger Conditions

Activates when users:
- Mention an Apple product model by name (e.g. "iPhone 17", "MacBook Pro M4", "iPad Air 13")
- Use a comparison pattern: `[Model A] vs [Model B]` (e.g. "iPhone 17 vs iPhone 17e")
- Ask about buying, upgrading, or choosing between Apple products
- Ask "Should I buy a MacBook Pro?", "Is iPhone 16 Pro worth it?", "Which Apple Watch should I get?"

## Key Features

✅ **Fresh data** — All specs fetched live from Apple.com via `felo-web-fetch`; never from training knowledge
✅ **felo-web-fetch enforced** — All URL content retrieval goes through `felo-web-fetch` exclusively
✅ **Multiple sources** — X, Reddit, MacRumors forums (personal) + 9to5Mac, The Verge, CNET (professional)
✅ **Two report modes** — Single product analysis or A vs B head-to-head comparison
✅ **Balanced** — Separates personal user feedback from professional reviews
✅ **Clear recommendations** — Specific buying conditions with overall rating
✅ **Multilingual** — Responds in the user's input language

## Report Formats

**Single product:** Product Positioning → Specs Comparison → Real User Feedback → Professional Reviews → Buying Recommendation

**A vs B comparison:** Head-to-Head Specs → User Feedback per product → Professional Verdict → Who Should Buy Which

## Tools Used

| Tool | Purpose |
|------|---------|
| `felo-web-fetch` | Fetch all URLs (Apple specs pages, review sites) |
| `felo-x-search` | Real-time user reactions on X/Twitter |
| `felo-search` | Reddit, MacRumors forums, professional review sites |

## Trusted Sources

| Category | Sources |
|----------|---------|
| Personal reviews | X/Twitter, Reddit (r/apple, r/[product]), MacRumors Forums |
| Professional reviews | 9to5Mac, The Verge, CNET, Tom's Guide, Engadget |

## Quick Setup

### Step 1: Install

```bash
npx skills add Felo-Inc/felo-skills --skill apple-buy-advisor
```

Or manually copy to your skills directory:

```bash
# Linux/macOS
cp -r apple-buy-advisor ~/.claude/skills/

# Windows (PowerShell)
Copy-Item -Recurse apple-buy-advisor "$env:USERPROFILE\.claude\skills\"
```

### Step 2: Install required skills

This skill depends on three other Felo skills. Install them all:

```bash
npx skills add Felo-Inc/felo-skills --skill felo-web-fetch
npx skills add Felo-Inc/felo-skills --skill felo-search
npx skills add Felo-Inc/felo-skills --skill felo-x-search
```

### Step 3: Get API Key

1. Visit [felo.ai](https://felo.ai) and log in
2. Click your avatar → **Settings** → **API Keys**
3. Click **Create New Key** and copy it

### Step 4: Configure

```bash
# Linux/macOS
export FELO_API_KEY="your-api-key-here"

# Make it permanent
echo 'export FELO_API_KEY="your-api-key-here"' >> ~/.zshrc
```

```powershell
# Windows PowerShell
$env:FELO_API_KEY="your-api-key-here"
```

Restart Claude Code to load the environment variable.

### Step 5: Test

```
Should I buy the iPhone 17?
```

If you get a structured report with specs and reviews, you're all set.

---

## Usage Examples

### Single Product

**Is it worth buying?**
```
You: Is the iPhone 17e worth buying?
Claude: ## iPhone 17e — Worth Buying?

        ### Product Positioning
        Apple's most affordable iPhone with A16 chip, targeting budget-conscious users.

        ### Specs Comparison
        | Spec       | iPhone 17e | iPhone 16  | Samsung S24 |
        |------------|------------|------------|-------------|
        | Processor  | A16 Bionic | A16 Bionic | Snapdragon 8 Gen 3 |
        | RAM        | 6GB        | 6GB        | 12GB        |
        | Capacity   | 128GB      | 128GB      | 128GB       |
        | Battery    | 26h video  | 22h video  | 27h video   |
        | Price      | $599       | $699       | $799        |

        ### Real User Feedback
        **Common Praise:**
        - Performance: "Handles everything I throw at it" (Reddit r/apple)
        - Value: "Best bang for buck in the iPhone lineup" (MacRumors forums)

        **Common Complaints:**
        - No ProMotion display: "60Hz feels dated at this price" (Reddit)
        - Single camera: "Miss the ultrawide from my old phone" (X)

        ### Buying Recommendation
        **Buy if:** You want iPhone reliability without the Pro price tag
        **Skip if:** You care about camera versatility or high refresh rate

        **Overall Rating:** ⭐⭐⭐⭐☆ (4/5)
```

**Upgrade decision**
```
You: Should I upgrade from iPhone 14 to iPhone 17?
Claude: For iPhone 14 → 17 upgrade:

        Key gains: A18 chip (40% faster), 48MP camera, Action Button
        Battery: +4h video playback
        Price difference: ~$200 with trade-in

        Worth it if: You use the camera heavily or notice slowdowns
        Skip if: Your 14 still feels fast and camera is good enough

        Verdict: Meaningful upgrade, but not urgent unless camera matters to you.
```

### Comparison (A vs B)

**Model comparison**
```
You: iPhone 17 vs iPhone 17e
Claude: ## iPhone 17 vs iPhone 17e — Which Should You Buy?

        ### Head-to-Head Specs
        | Spec      | iPhone 17   | iPhone 17e  | Winner     |
        |-----------|-------------|-------------|------------|
        | Processor | A18         | A16 Bionic  | iPhone 17  |
        | RAM       | 8GB         | 6GB         | iPhone 17  |
        | Display   | 6.1" OLED 60Hz | 6.1" OLED 60Hz | Tie   |
        | Camera    | 48MP + 12MP | 48MP        | iPhone 17  |
        | Battery   | 22h video   | 26h video   | iPhone 17e |
        | Price     | $799        | $599        | iPhone 17e |

        ### Who Should Buy Which
        **Choose iPhone 17 if:** You want the latest chip and dual cameras
        **Choose iPhone 17e if:** Budget is the priority and you don't need ultrawide

        **Overall Verdict:** Pay the extra $200 for iPhone 17 if you use the camera daily.
        Otherwise, 17e is excellent value.
```

**Mac comparison**
```
You: MacBook Air M3 vs MacBook Pro M4
Claude: ## MacBook Air M3 vs MacBook Pro M4 — Which Should You Buy?

        | Spec        | MacBook Air M3 | MacBook Pro M4 |
        |-------------|----------------|----------------|
        | Chip        | M3             | M4             |
        | RAM (base)  | 8GB            | 16GB           |
        | Display     | 13.6" Liquid Retina | 14.2" Liquid Retina XDR |
        | Fan         | Fanless        | Active cooling |
        | Battery     | 18h            | 24h            |
        | Price       | $1,099         | $1,599         |

        **Choose Air M3 if:** Light tasks, portability, budget-conscious
        **Choose Pro M4 if:** Video editing, sustained workloads, need more RAM headroom
```

### Chinese input

```
You: iPhone 17 值得买吗？
Claude: ## iPhone 17 — 值得购买吗？

        ### 产品定位
        苹果主力旗舰，搭载 A18 芯片，面向追求性能与相机体验的用户。

        ### 规格对比
        | 规格   | iPhone 17 | iPhone 16 | 三星 S25 |
        |--------|-----------|-----------|---------|
        | 处理器 | A18       | A16       | 骁龙 8 Elite |
        | 内存   | 8GB       | 6GB       | 12GB    |
        | 起售价 | ¥5,999    | ¥4,999    | ¥5,499  |

        ### 购买建议
        **适合购买：** 重度相机用户、从 iPhone 14 及更早机型升级
        **不建议购买：** 已有 iPhone 16，提升有限

        **综合评分：** ⭐⭐⭐⭐☆ (4/5)
```

### Common questions

```
You: Buy now or wait for iPhone 18?
Claude: iPhone 18 is expected September 2026 (~6 months away.
        Current deals on iPhone 17 are strong.

        Buy now if: You need a phone today or find a good trade-in deal
        Wait if: You can hold out 6 months and want the latest

You: Is AirPods Pro 2 worth it over regular AirPods?
Claude: AirPods Pro 2 vs AirPods 4:

        ANC: Pro 2 significantly better (industry-leading)
        Sound: Pro 2 wins, especially bass
        Fit: Pro 2 with ear tips seals better
        Price gap: ~$80

        Worth it if: You commute, travel, or work in noisy environments
        Skip if: You mostly use them at home or don't need ANC
```

---

## Version

- **Version:** 4.0
- **Status:** Production Ready
- **Last Updated:** March 2026
