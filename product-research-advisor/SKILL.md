---
name: product-research-advisor
description: Research a single product by collecting current specs and reviews from multiple sources. Use when the user asks about product specifications, reviews, or buying advice for ONE product, such as "how is X", "X specs", "X review", "is X worth buying", "X 怎么样", "X 参数", "X 评测", "X 值得买吗".
allowed-tools: Bash(node:*) Bash(bash:*) Bash(curl:*) Fetch(*) Write(*)
metadata:
  requires:
    - felo-search
    - felo-web-fetch
    - felo-youtube-subtitling
    - felo-x-search
---

# Product Research Advisor

Research a single product using real-time web data and generate a comprehensive report covering:

- Technical specifications and parameters
- User reviews and real-world feedback
- Professional reviews and expert opinions
- Overall recommendation and conclusion

**Language Support:** Detect the user's input language and respond entirely in that language. Support English, Chinese, and other major languages.

**Scope:** This skill handles ONE product at a time. For product comparisons (X vs Y), the user should run the skill separately for each product.

## Trigger Examples

Activate this skill when users ask about a single product:

- "How is the iPhone 16 Pro?"
- "Dyson V12 specs and reviews"
- "Sony WH-1000XM5 worth buying?"
- "Xiaomi 14 Ultra 怎么样"
- "ROG Ally X review summary"
- "MacBook Air M3 评测"
- "Nintendo Switch OLED 值得买吗"

## Core Rules

### 1. Fresh Data Only

- Never rely on memory for specifications, pricing, or review conclusions.
- Always search first, then fetch and synthesize.

### 2. URL Fetching Rule

> **CRITICAL:** Every webpage URL discovered through search MUST be fetched using `felo-web-fetch`.

- Never summarize a page from URL/title alone.
- Never use built-in web fetch, curl, or remembered content as substitute.

### 3. Source Classification

Keep sources separated by type:

| Type | Sources |
|------|---------|
| **Official Specs** | Manufacturer pages, official spec sheets, official stores |
| **Professional Reviews** | Tech media, review sites, editorial publications, professional YouTubers |
| **User Feedback** | X/Twitter posts, Reddit threads, first-hand user YouTube videos |

Classification guide:
- Individual owner / first-hand user → User feedback
- Media outlet / lab / reviewer / editorial team → Professional review

### 4. No Guessing on Specs

If a specification cannot be confirmed from fetched sources, write "not confirmed" (or equivalent in user's language) instead of guessing.

## Execution Flow

> **Completion Rule:** Do not stop after collecting links. The task completes only after synthesizing the full product report.

### Step 0: Identify the Product

Normalize the product name from the user's request:

- Use the exact model name shown consistently in search results
- If multiple variants exist and the query is ambiguous, ask for clarification

### Step 1: Search for Official Specs and Professional Reviews

Use `felo-search` to find:

- **1 official source** for specifications
- **2-4 professional review sources**

Recommended queries:
- `"[product]" official specs`
- `"[product]" specifications OR specs`
- `"[product]" review`
- `"[product]" test OR benchmark`

After getting URLs:

1. Select the most authoritative pages
2. Fetch each URL with `felo-web-fetch`
3. Extract:
   - Official specifications
   - Release positioning
   - Professional review conclusions
   - Measured pros/cons

**Source priority for specs:**
1. Official manufacturer page
2. Official spec sheet / support page
3. Official store page
4. Trusted spec database (fallback only)

### Step 2: YouTube Reviews

Search for video reviews:

- `site:youtube.com "[product]" review`
- `site:youtube.com "[product]" 评测`
- `site:youtube.com "[product]" hands-on`

Then:

1. Select 2-3 relevant videos with substantive content
2. Use `felo-youtube-subtitling` on each URL
3. Extract main verdicts, praise, complaints, findings
4. Classify as: professional review OR user experience

Prefer videos that are recent, about the exact model, and detailed.

### Step 3: User Feedback from X and Reddit

Run both searches:

- `felo-x-search`: `"[product]" review OR experience OR issue`
- Web search: `site:reddit.com "[product]" review OR experience`

For Reddit URLs:
1. Fetch threads with `felo-web-fetch`
2. Extract recurring opinions

For X/Twitter:
1. Collect first-hand opinions (not marketing)
2. Prioritize posts about usage, reliability, defects, value

### Step 4: Synthesize Report

Produce an integrated report with:

1. Product overview
2. Technical specifications
3. User feedback summary
4. Professional review summary
5. Overall conclusion

## What to Extract

### Specifications

Extract decision-relevant specs by category:

| Product Type | Key Specs |
|--------------|-----------|
| Smartphone | Chip, RAM, storage, display, battery, camera, weight, price |
| Laptop | CPU, GPU, RAM, storage, display, ports, battery, weight, price |
| Headphones | Driver/ANC, codec, battery, weight, comfort, price |
| Appliance | Power, capacity, runtime, dimensions, weight, price |
| Camera | Sensor, resolution, stabilization, battery, weight, price |

Only include relevant fields for the product category.

### User Feedback

Sources: X, Reddit, user YouTube videos

Summarize:
- Common praise (with frequency: many/some/a few users)
- Common complaints
- Recurring tradeoffs
- Durability/reliability signals
- Value-for-money comments

### Professional Reviews

Sources: Review sites, professional YouTubers

Summarize:
- Each source's main verdict
- Points of agreement
- Points of disagreement
- Measured findings vs subjective impressions

## Output Template

```markdown
## [Product Name] Research Report / [产品名称] 调研报告

### Overview / 产品定位
[1-2 sentences: product type, target audience, market position]

### Key Specifications / 关键参数
| Spec / 参数 | Details / 信息 | Source / 来源 |
|-------------|----------------|---------------|
| Processor / 处理器 | ... | Official / 官方 |
| Memory / 内存 | ... | Official / 官方 |
| Storage / 存储 | ... | Official / 官方 |
| Display / 屏幕 | ... | Official / 官方 |
| Battery / 电池 | ... | Official / 官方 |
| Weight / 重量 | ... | Official / 官方 |
| Price / 价格 | ... | Official / 官方 |

### User Feedback / 用户评价

**Praise / 常见好评:**
- ...

**Complaints / 常见差评:**
- ...

**Consensus / 用户共识:**
[Summary of user sentiment]

### Professional Reviews / 专业评测
- **[Source Name]:** ...
- **[Source Name]:** ...
- **[Source Name]:** ...

**Expert Consensus / 专业共识:**
[Summary of professional opinion]

### Conclusion / 综合结论

**Best For / 适合人群:** ...
**Not For / 不适合人群:** ...
**Verdict / 一句话结论:** ...
```

## Quality Guidelines

- Cite source types when making claims
- Prefer recurring patterns over isolated opinions
- Keep user and professional views separate
- Acknowledge uncertainty when data is sparse
- Avoid affiliate-style language and SEO filler

## Edge Cases

### Very New Product
- Expect fewer long-term reports
- Rely on early hands-on reviews
- State that long-term reliability is unclear

### Older Product
- Look for durability, battery aging, maintenance discussions
- Check for firmware updates and continued support

### Conflicting Reviews
- Present both sides
- Explain potential causes (usage pattern, test method, region difference)

### Limited Specs Available
- Use best available authoritative source
- Label clearly when using non-official sources
