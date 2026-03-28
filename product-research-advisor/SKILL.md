---
name: product-research-advisor
description: Research a product by collecting current specs and reviews from the web. Use when the user asks about a product model, wants product parameters/specifications, wants user reviews and professional reviews, asks whether a product is good or worth buying, asks for a product summary, or compares products such as "X 怎么样", "X 参数", "X 评测", "X 值得买吗", or "X vs Y".
allowed-tools: Bash(node:*) Bash(bash:*) Bash(curl:*) Fetch(*) Write(*)
metadata:
  requires:
    - felo-search
    - felo-web-fetch
    - felo-youtube-subtitling
    - felo-x-search
---

# Product Research Advisor

Research a product with fresh web data and produce a structured report covering:

- current specs / parameters
- user feedback
- professional reviews
- a concise overall conclusion

**Language:** Detect the user's language and reply fully in that language.

## Trigger Examples

Use this skill when the user asks things like:

- "小米 14 Ultra 怎么样"
- "Dyson V12 参数和评价"
- "Sony WH-1000XM5 值得买吗"
- "ROG Ally X review summary"
- "GoPro Hero 13 vs Insta360 Ace Pro"

## Core Rules

### 1. Fresh sources only

- Do not rely on memory for specs, pricing, or current review conclusions.
- Always search first, then fetch and summarize.

### 2. URL fetching rule

> **CRITICAL:** Any webpage URL found through search must be fetched with `felo-web-fetch`.

- Never summarize a page from URL/title alone.
- Never use built-in web fetch, curl, or remembered page content as a substitute.

### 3. Source separation rule

Keep sources separated by type:

- **User feedback:** X posts, Reddit posts/comments, and clearly first-hand YouTube user experience
- **Professional reviews:** review sites, labs, editorial media, and professional reviewer YouTube channels
- **Official specs:** brand/manufacturer/product pages, official spec pages, or official store pages

If a source is ambiguous, classify it by who is speaking:

- individual owner / first-hand user -> user feedback
- media outlet / lab / reviewer / editorial team -> professional review

### 4. Do not invent missing specs

If a spec cannot be confirmed from a fetched source, write `未确认` or `not confirmed` instead of guessing.

## Execution Flow

> **Completion rule:** Do not stop after collecting links. The task is complete only after you synthesize the product report.

### Step 0. Identify the exact product

Normalize the product name from the user's request.

- Prefer the exact model name shown consistently across search results.
- If the request obviously compares two products, collect data for both.
- If search results reveal multiple materially different variants and the user's wording is too ambiguous, ask one concise clarification. Otherwise, proceed with the most likely exact model and state the assumption.

### Step 1. Use `felo-search` to find product pages, then fetch the URLs

Use the `felo-search` skill to search for:

- **1 official source** for specs
- **2-4 professional review sources**

Recommended queries:

- `"[product]" official specs`
- `"[product]" specifications OR specs`
- `"[product]" review`
- `"[product]" test OR benchmark OR hands-on`

After getting candidate URLs:

1. Choose the most authoritative pages.
2. Fetch every selected URL with `felo-web-fetch`.
3. Extract:
   - official specs / parameters
   - release positioning
   - professional review conclusions
   - measured pros/cons if available

> **Required behavior:** Step 1 discovery must use `felo-search`. Do not replace it with generic search wording or direct page fetches without searching first.

**Source preference for specs:**

1. Official manufacturer page
2. Official spec sheet / support page
3. Official store page
4. Trusted spec database or reputable review site, only if official specs are unavailable

### Step 2. Search YouTube reviews and fetch subtitles

Use web search to find YouTube reviews:

- `site:youtube.com "[product]" review`
- `site:youtube.com "[product]" 评测 OR 测评`
- `site:youtube.com "[product]" hands-on`

Then:

1. Select 2-3 relevant videos with substantive review value.
2. Use `felo-youtube-subtitling` on each YouTube URL.
3. Extract the main verdicts, praise, complaints, and any measurable findings.
4. Classify each video as:
   - professional / creator review
   - first-hand user experience

Prefer videos that are:

- recent
- clearly about the exact model
- detailed rather than short promo clips

### Step 3. Search user feedback from X and Reddit

Run both searches:

- `felo-x-search`: `"[product]" review OR experience OR issue OR worth it`
- web search: `site:reddit.com "[product]" review OR experience OR problem`

For Reddit URLs found in search:

1. Fetch the thread pages with `felo-web-fetch`.
2. Extract recurring opinions from posts and comments.

For X:

1. Collect first-hand opinions, not marketing copy.
2. Prioritize posts describing usage experience, reliability, defects, comfort, battery, quality, value, or comparisons.

### Step 4. Synthesize the product report

Produce one integrated report with four parts:

1. **Product overview**
2. **Specs / parameters**
3. **User feedback**
4. **Professional reviews**
5. **Overall conclusion**

## What to Extract

### A. Specs / parameters

Extract the most decision-relevant specs for the product category. Examples:

- phone: chip, memory, storage, display, battery, camera, weight, price
- laptop: CPU, GPU, RAM, storage, display, ports, battery, weight, price
- headphones: driver/ANC, codec, battery, weight, price
- home appliance: power, capacity, battery/runtime, dimensions, weight, price

Do not force irrelevant fields. Use only the fields that matter for that category.

### B. User feedback

Build this section from:

- X
- Reddit
- first-hand YouTube experience, when applicable

Summarize:

- common praise
- common complaints
- recurring tradeoffs
- durability / reliability signals
- value-for-money comments

Use frequency language:

- `很多用户提到 / many users report`
- `一些用户提到 / some users report`
- `少量用户提到 / a few users mention`

### C. Professional reviews

Build this section from:

- professional review sites fetched in Step 1
- professional reviewer YouTube channels from Step 2

Summarize:

- each source's main verdict
- where reviewers agree
- where reviewers disagree
- measured or tested findings vs subjective impressions

## Output Template

Use this structure for a single product:

```markdown
## [Product Name] 产品调研报告

### 产品定位
[1-2 句话说明这款产品属于什么类型、面向谁、在同类产品中的位置]

### 关键参数
| 参数 | 信息 | 来源 |
|------|------|------|
| 芯片 / 处理器 | ... | 官方页面 |
| 内存 / RAM | ... | 官方页面 |
| 存储 / 容量 | ... | 官方页面 |
| 屏幕 / 核心硬件 | ... | 官方页面 |
| 电池 / 续航 | ... | 官方页面 |
| 重量 / 尺寸 | ... | 官方页面 |
| 价格 | ... | 官方页面 |

### 用户评价
**常见好评：**
- ...

**常见差评：**
- ...

**用户共识：**
[1-2 句话总结用户真实口碑]

### 专业机构 / 专业评测总结
- **[媒体/频道名]：** ...
- **[媒体/频道名]：** ...
- **[媒体/频道名]：** ...

**专业评测共识：**
[1-2 句话总结专业观点]

### 综合结论
**适合谁：** ...
**不适合谁：** ...
**一句话结论：** ...
```

For comparison queries, use:

```markdown
## [Product A] vs [Product B]

### 关键参数对比
| 参数 | [Product A] | [Product B] | 结论 |
|------|-------------|-------------|------|
| ... | ... | ... | ... |

### 用户评价对比
**[Product A] 用户更常提到：**
- ...

**[Product B] 用户更常提到：**
- ...

### 专业评测对比
- **[来源]：** ...

### 最终建议
**选 [Product A] 如果：** ...
**选 [Product B] 如果：** ...
**结论：** ...
```

## Quality Bar

- Cite the source type in each section when making claims.
- Prefer recurring patterns over isolated opinions.
- Keep user and professional views separate before synthesizing.
- Mention uncertainty when data is sparse or conflicting.
- Avoid affiliate-style fluff and obvious SEO filler.

## Recommended Source Types

**Official / specs:**

- manufacturer product page
- official specs page
- official support page
- official store page

**Professional reviews:**

- editorial review sites
- reputable tech/media publications
- professional reviewer YouTube channels

**User feedback:**

- X posts with first-hand experience
- Reddit discussion threads and comments
- user-experience YouTube videos

## Edge Cases

### Very new product

- Expect fewer long-term user reports.
- Lean more on early hands-on reviews and first-wave user feedback.
- Explicitly say long-term reliability is still unclear.

### Older product

- Look for durability, battery aging, maintenance, and replacement-value discussion.

### Limited official specs

- Use the best available authoritative source and label it clearly.
- Do not silently merge guessed values from multiple low-quality sources.

### Conflicting reviews

- Surface both sides.
- Explain whether the disagreement comes from usage pattern, test method, region/version difference, or small sample size.
