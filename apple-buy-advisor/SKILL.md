---
name: apple-buy-advisor
description: Research and compare Apple products to help decide if they're worth buying. Use when the user: (1) asks whether to buy a Mac, iPhone, iPad, Apple Watch, or AirPods; (2) wants to compare models; (3) seeks a buying recommendation; (4) mentions an Apple product model name or number (e.g. "iPhone 17", "MacBook Pro M4", "iPad Air 13"); (5) uses a comparison pattern like "X vs Y" where X or Y is an Apple product (e.g. "iPhone 17 vs iPhone 17e", "MacBook Air vs MacBook Pro"); (6) asks about upgrading, waiting, or which model to choose.
---

# Apple Buy Advisor

Research Apple products and produce a structured buying recommendation based on official specs, professional reviews, and real user feedback.

**Language:** Detect the user's input language and respond entirely in that language. If the user writes in Chinese, respond in Chinese. If in English, respond in English. Apply this to all sections of the report.

**Input Detection:** This skill activates when the user:
- Mentions an Apple product model by name or number (e.g. "iPhone 17", "M4 MacBook Pro", "Apple Watch Series 10")
- Uses a comparison pattern: `[Model A] vs [Model B]` (e.g. "iPhone 17 vs iPhone 17e")
- Asks about buying, upgrading, or choosing between Apple products

## Steps to Execute

### 0. Tool Usage Rule

> **CRITICAL: Always use `felo-web-fetch` to retrieve any URL content.** Never use built-in WebFetch, curl, or any other tool to fetch web pages. All HTTP requests to external URLs — Apple specs pages, review sites, or any other URL — must go through `felo-web-fetch`.

### 1. Fetch Official Specs

Use `felo-web-fetch` in two steps:

**Step 1a — Get model names from compare page** (to identify which models exist):

- Mac: `https://www.apple.com/mac/compare/`
- iPhone: `https://www.apple.com/iphone/compare/`
- iPad: `https://www.apple.com/ipad/compare/`
- Apple Watch: `https://www.apple.com/watch/compare/`
- AirPods: `https://www.apple.com/airpods/compare/`

Use this page only to identify the current model lineup. Do not extract specs from here.

**Step 1b — Get full specs from the product specs page** (required for all spec values):

- `https://www.apple.com/[product-model]/specs/`
- Example: `https://www.apple.com/iphone-17e/specs/`, `https://www.apple.com/macbook-pro/specs/`

Extract all specs exclusively from this page: processor, RAM, storage options (starting capacity), battery life, display specs, and pricing.

> **CRITICAL:** Storage, RAM, and all other specs must come from the `/specs/` page only. Never use the compare page or training knowledge for spec values. If the specs page fails to load, explicitly state: "Unable to fetch current specs from Apple.com — specs may be inaccurate." Do not silently substitute any remembered values. **Always fetch via `felo-web-fetch`.**

> **REQUIRED FIELDS for Mac / iPad / iPhone:** RAM (unified memory / memory) is a mandatory spec. It must always appear in the Specs Comparison table. If the `/specs/` page does not list RAM explicitly, state "RAM: not listed on specs page" — never omit the field or leave it blank.

### 2. Search Personal User Reviews & Professional Reviews (run in parallel)

Run all queries simultaneously to save time.

**Personal user reviews** — `felo-x-search` (1 query):

- `"[product]" review OR experience OR problem`

**Personal user reviews** — `felo-search` (2 queries, run in parallel):

- `site:reddit.com "[product]" review OR experience`
- `site:forums.macrumors.com "[product]" review`

**Professional reviews** — `felo-search` (1 query):

- `site:9to5mac.com OR site:theverge.com OR site:cnet.com "[product]" review`

> **Source filter — personal:** Only extract content from individual users (posts, comments, threads). Discard media articles.
> **Source filter — professional:** Only extract editorial content. Discard user comments.

### 3. Generate User Feedback Section (from personal sources in Step 2 only)

Using **only** the personal user data from Step 2 (X, Reddit, MacRumors forums):

- Extract recurring themes from individual user posts and comments
- Group by sentiment: praise vs. complaints
- Quote specific user language where possible
- Apply frequency indicators based on how often a theme appears across sources
- Attribute each point to its source platform

### 4. Generate Professional Review Section (from professional sources in Step 2 only)

Using **only** the professional review data from Step 2 (9to5Mac, The Verge, CNET):

- Summarize each publication's key findings
- Note where professional assessments agree or diverge
- Highlight benchmark data or lab-tested metrics separately from subjective opinions

### 5. Produce Report

**If single product query:**

```
## [Product Name] — Worth Buying?

### Product Positioning
[One sentence: where this product sits in Apple's lineup]

### Specs Comparison
(Data source: Apple.com — Step 1)
| Spec | This Product | Previous Gen | Competitor |
|------|---|---|---|
| Processor | ... | ... | ... |
| RAM | ... | ... | ... |
| Capacity | ... | ... | ... |
| Battery | ... | ... | ... |
| Price | ... | ... | ... |

### Real User Feedback
(Data source: X, Reddit, MacRumors forums — personal sources from Step 2)

**Common Praise:**
- [Theme]: [Specific quote or paraphrase — source: X / Reddit r/apple / MacRumors forums]

**Common Complaints:**
- [Theme]: [Specific quote or paraphrase — source: X / Reddit r/[product] / MacRumors forums]

**Community Consensus:**
[1-2 sentences synthesizing overall user sentiment, based on frequency across sources]

### Professional Review Summary
(Data source: 9to5Mac, The Verge, CNET — professional sources from Step 2)

- **[Publication name]:** [Key finding or verdict]
- **[Publication name]:** [Key finding or verdict]
- **[Publication name]:** [Benchmark result or lab-tested metric]

**Where pros agree:** [Common conclusion across publications]
**Where pros diverge:** [Any notable disagreements, e.g. battery life estimates]

### Buying Recommendation

**Buy if:** [specific use case]
**Skip if:** [specific concern]

**Overall Rating:** ⭐⭐⭐⭐☆ (4/5)

**Conclusion:** [Clear answer to user's question]
```

**If comparison query (A vs B):**

```
## [Product A] vs [Product B] — Which Should You Buy?

### Head-to-Head Specs
(Data source: Apple.com — Step 1)
| Spec | [Product A] | [Product B] | Winner |
|------|---|---|---|
| Processor | ... | ... | ... |
| RAM | ... | ... | ... |
| Capacity | ... | ... | ... |
| Battery | ... | ... | ... |
| Price | ... | ... | ... |

### Real User Feedback
**[Product A] users say:**
- Praise: ...
- Complaints: ...

**[Product B] users say:**
- Praise: ...
- Complaints: ...

### Professional Review Summary
- **[Publication]:** [Verdict on A vs B]

### Who Should Buy Which

**Choose [Product A] if:** [specific use case]
**Choose [Product B] if:** [specific use case]

**Overall Verdict:** [Clear recommendation with reasoning]
```

## Key Principles

- **Fresh data only** — Never rely on training knowledge for specs or prices
- **Personal reviews first** — Show community feedback before professional reviews
- **Source attribution** — Always cite where feedback comes from
- **Frequency matters** — "Many users report..." vs "One user mentioned..."
- **Balanced** — Include both praise and complaints
- **User-focused** — Tailor to their specific needs

## Trusted Sources

**Community (personal reviews):**

- X/Twitter: Real-time reactions
- Reddit: r/apple, r/[product]
- MacRumors Forums: enthusiast depth

**Professional reviews:**

- Apple-focused: 9to5Mac, MacRumors
- Tech media: The Verge, CNET, Tom's Guide, Engadget

## Display Strategy for Personal Reviews

1. **Extract themes** from X, Reddit, MacRumors forums
2. **Group by sentiment** — praise vs complaints
3. **Quote specifically** — "Battery lasts 8-10 hours" beats "battery is good"
4. **Show frequency** — note if an issue appears across multiple sources
5. **Attribute sources** — "(Reddit, MacRumors forums)"

Frequency language:

- "Many users report..." (50%+)
- "Some users report..." (20–50%)
- "A few users report..." (5–20%)
- "One user mentioned..." (<5%)

## Product Category Focus

| Product     | Key Focus                            | Common Concerns                       |
| ----------- | ------------------------------------ | ------------------------------------- |
| Mac         | Performance, thermals, compatibility | Throttling, RAM/storage limits, ports |
| iPhone      | Camera, battery, durability          | Battery degradation, heat             |
| iPad        | Display, stylus, keyboard            | Software limits, value vs MacBook     |
| Apple Watch | Battery, health tracking             | Battery claims vs reality             |
| AirPods     | Sound, ANC, battery                  | Fit, durability, repairability        |

## Common User Questions

**"Worth the upgrade?"** — Compare gains, cite user feedback on value, suggest who should/shouldn't upgrade.

**"Buy now or wait?"** — Check upcoming releases, current deals, known issues with current gen.

**"vs [competitor]?"** — Side-by-side table, user feedback on both, ecosystem considerations.

**"Reliable/durable?"** — Search long-term reports, failure modes, user durability experiences.

**"Good for [use case]?"** — Find users with same use case, highlight relevant specs and limitations.

## Handling Edge Cases

**New product (<1 month):** Limited data — focus on early adopters, compare to previous gen, flag unknown long-term reliability.

**Mature product (>1 year):** Rich data — look for retrospective reviews, known issues, upcoming replacements.

**Discontinued:** Focus on retrospectives, compare to current alternatives, note support/repair considerations.

**Conflicting sources:** Identify what they disagree on, look for patterns, present both sides with context (e.g. "Pro reviews show 12h; real-world Reddit reports 8–10h under typical load").

## Checklist Before Delivery

- [ ] Step 1: Specs fetched from Apple.com specs page (not from memory)
- [ ] Step 1: RAM field included in Specs Comparison table for Mac / iPad / iPhone (mandatory)
- [ ] Step 2: Personal user reviews collected from X + Reddit + forums (parallel queries)
- [ ] Step 2: Professional reviews collected from 3+ media publications (parallel queries)
- [ ] Step 3: User feedback section built exclusively from personal sources — no media mixed in
- [ ] Step 4: Professional review section built exclusively from media sources — no user posts mixed in
- [ ] Recurring themes identified and grouped by sentiment
- [ ] Every claim attributed to its source
- [ ] Frequency indicators used appropriately
- [ ] User's specific needs addressed
- [ ] Clear, direct answer to their question

## Do's and Don'ts

✅ Always fetch fresh specs | ❌ Never use training knowledge for specs/prices
✅ Multiple sources | ❌ Never rely on a single source
✅ Cite sources | ❌ Never present opinions as facts
✅ Show both sides | ❌ Never ignore negative feedback
✅ Mention alternatives | ❌ Never over-weight isolated complaints
