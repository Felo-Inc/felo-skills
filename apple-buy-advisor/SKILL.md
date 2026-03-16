---
name: apple-buy-advisor
description: Research and compare Apple products to help decide if they're worth buying. Use when the user asks whether to buy a Mac, iPhone, iPad, Apple Watch, or AirPods; wants to compare models; or seeks a buying recommendation.
---

# Apple Buy Advisor

Research Apple products and produce a structured buying recommendation based on official specs, professional reviews, and real user feedback.

**Language:** Detect the user's input language and respond entirely in that language. If the user writes in Chinese, respond in Chinese. If in English, respond in English. Apply this to all sections of the report.

## Steps to Execute

### 1. Fetch Official Specs

Use `felo-web-fetch` to get current specs and pricing from Apple.com:

- Mac: `https://www.apple.com/mac/compare/`
- iPhone: `https://www.apple.com/iphone/compare/`
- iPad: `https://www.apple.com/ipad/compare/`
- Apple Watch: `https://www.apple.com/watch/compare/`
- AirPods: `https://www.apple.com/airpods/compare/`

Parse the page to extract: model names, processor, RAM, storage options, battery life, display specs, and pricing. Also fetch the product's dedicated page (e.g. `https://www.apple.com/iphone-16-pro/`) for full spec details.

### 2. Search Personal User Reviews

Gather real individual user experiences — **not press or media**. These sources must be personal opinions from real users.

**X (Twitter)** — Use `felo-x-search` (3 queries):

- `"[product]" review experience`
- `"[product]" worth buying`
- `"[product]" problem issue`

**Reddit & Community Forums** — Use `felo-search` (run as separate queries):

- `site:reddit.com "[product]" review`
- `site:reddit.com "[product]" experience`
- `site:forums.macrumors.com "[product]" review`
- `site:apple.stackexchange.com "[product]"`
- `site:news.ycombinator.com "[product]"`

> **Source filter:** Only extract content written by individual users (posts, comments, threads). Discard any results that are articles from media outlets or press publications.

### 3. Search Professional Reviews

Use `felo-search` to find structured reviews from tech media and professional publications — **not user posts**.

**Apple-focused media:**

- `site:9to5mac.com "[product]" review`
- `site:macrumors.com "[product]" review`

**Mainstream tech media:**

- `site:theverge.com "[product]" review`
- `site:cnet.com "[product]" review`

**Technical/benchmark:**

- `site:anandtech.com "[product]" benchmark`

**Chinese tech media:**

- `site:sspai.com "[product]" 评测`
- `site:ifanr.com "[product]" 评测`

> **Source filter:** Only extract content from editorial staff or professional reviewers. Discard user comments or forum posts found on these sites.

### 4. Generate User Feedback Section (from Steps 2 sources only)

Using **only** data from Step 2 (X, Reddit, MacRumors forums, Stack Exchange, HN):

- Extract recurring themes from individual user posts and comments
- Group by sentiment: praise vs. complaints
- Quote specific user language where possible
- Apply frequency indicators based on how often a theme appears across sources
- Attribute each point to its source platform

### 5. Generate Professional Review Section (from Step 3 sources only)

Using **only** data from Step 3 (9to5Mac, The Verge, CNET, AnandTech, sspai, etc.):

- Summarize each publication's key findings
- Note where professional assessments agree or diverge
- Highlight benchmark data or lab-tested metrics separately from subjective opinions

### 6. Produce Report

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
| Battery | ... | ... | ... |
| Price | ... | ... | ... |

### Real User Feedback
(Data source: X, Reddit, MacRumors forums, Stack Exchange, HN — Step 2 only)

**Common Praise:**
- [Theme]: [Specific quote or paraphrase — source: X / Reddit r/apple / MacRumors forums]

**Common Complaints:**
- [Theme]: [Specific quote or paraphrase — source: X / Reddit r/[product] / HN]

**Community Consensus:**
[1-2 sentences synthesizing overall user sentiment, based on frequency across sources]

### Professional Review Summary
(Data source: 9to5Mac, The Verge, CNET, AnandTech, sspai, ifanr — Step 3 only)

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
- Apple Stack Exchange: technical Q&A

**Professional reviews:**

- Apple-focused: 9to5Mac, MacRumors, Macworld, iMore
- Tech media: The Verge, CNET, Tom's Guide, Engadget
- Technical: AnandTech, Wired

## Display Strategy for Personal Reviews

1. **Extract themes** from X, Reddit, forums, Stack Exchange
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

- [ ] Step 1: Specs fetched from Apple.com (not from memory)
- [ ] Step 2: Personal user reviews collected from X + 3+ community forum sources
- [ ] Step 3: Professional reviews collected from 3+ media publications
- [ ] Step 4: User feedback section built exclusively from Step 2 sources — no media mixed in
- [ ] Step 5: Professional review section built exclusively from Step 3 sources — no user posts mixed in
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
