---
name: apple-buy-advisor
description: Research and compare Apple products to help decide if they're worth buying. Use when the user asks whether to buy a Mac, iPhone, iPad, Apple Watch, or AirPods; wants to compare models; or seeks a buying recommendation.
---

# Apple Buy Advisor

Research Apple products and produce a structured buying recommendation based on official specs, professional reviews, and real user feedback.

## Steps to Execute

### 1. Fetch Official Specs
Use `felo-web-fetch` to get current specs and pricing from Apple.com:
- Mac: `https://www.apple.com/mac/compare/`
- iPhone: `https://www.apple.com/iphone/compare/`
- iPad: `https://www.apple.com/ipad/compare/`
- Apple Watch: `https://www.apple.com/watch/compare/`
- AirPods: `https://www.apple.com/airpods/compare/`

### 2. Search User Opinions
Gather real user experiences from multiple community sources:

**X (Twitter)** — Use `felo-x-search`:
- `"[product]" review experience`
- `"[product]" worth buying`
- `"[product]" problem issue`

**Reddit & Forums** — Use `felo-search`:
- `site:reddit.com/r/apple [product] review`
- `site:reddit.com/r/[product] experience`
- `site:forums.macrumors.com [product] review`
- `site:apple.stackexchange.com [product]`
- `site:news.ycombinator.com [product]`

### 3. Research Professional Reviews
Use `felo-search` with site-specific queries:

**Apple-focused:** `site:9to5mac.com [product] review`, `site:macrumors.com [product] review`
**Tech media:** `site:theverge.com [product] review`, `site:cnet.com [product] review`
**Technical:** `site:anandtech.com [product] benchmark`
**Regional:** `site:sspai.com [product] 评测`, `site:ifanr.com [product] 评测`

### 4. Produce Report

```
## [Product Name] — Worth Buying?

### Product Positioning
[One sentence: where this product sits in Apple's lineup]

### Specs Comparison
| Spec | This Product | Previous Gen | Competitor |
|------|---|---|---|
| Processor | ... | ... | ... |
| RAM | ... | ... | ... |
| Battery | ... | ... | ... |
| Price | ... | ... | ... |

### Real User Feedback

**Common Praise:**
- [Theme]: [Quote or summary from X/Reddit/forums]
- [Theme]: [Quote or summary from X/Reddit/forums]

**Common Complaints:**
- [Theme]: [Quote or summary from X/Reddit/forums]
- [Theme]: [Quote or summary from X/Reddit/forums]

**Community Consensus:**
[1-2 sentences synthesizing overall sentiment]

### Professional Review Summary

**Key Takeaways:**
- [Apple-focused perspective]
- [Tech media perspective]
- [Technical perspective]

### Buying Recommendation

**You should buy if:**
- [Specific use case or need]
- [Specific use case or need]

**You should NOT buy if:**
- [Specific use case or concern]
- [Specific use case or concern]

**Overall Rating:** ⭐⭐⭐⭐☆ (4/5)

**Conclusion:** [Clear answer to user's question]
```

## Key Principles

- **Always use fresh data** — Never rely on training knowledge for specs or prices
- **Multiple sources** — Combine personal reviews (X, Reddit, forums) and professional reviews
- **Personal reviews first** — Real user experiences are most relatable
- **Source attribution** — Always cite where feedback comes from
- **Frequency matters** — "Many users report..." vs "One user mentioned..."
- **Balanced perspective** — Include both positive and negative feedback
- **User-focused** — Tailor recommendations to their specific needs

## Trusted Review Sites

**Personal Reviews (Community):**
- X/Twitter: Real-time user reactions
- Reddit: r/apple, r/[product], detailed discussions
- MacRumors Forums: Long-form Apple enthusiast feedback
- Apple Stack Exchange: Technical Q&A
- Hacker News: Tech-savvy perspectives

**Professional Reviews:**
- Apple-focused: MacRumors, 9to5Mac, Macworld, iMore
- Tech media: The Verge, CNET, Tom's Guide, Engadget
- Technical: AnandTech, Wired
- Chinese: sspai.com, ifanr.com

## Display Strategy for Personal Reviews

### Extraction & Organization
1. **Extract themes** from X, Reddit, forums, Stack Exchange
2. **Group by sentiment** (praise vs complaints)
3. **Include specific quotes** to show real user voices
4. **Highlight frequency** — mention if complaint appears across multiple sources
5. **Note source diversity** — show feedback comes from different communities

### Presentation Order
1. **Personal Reviews First** — Real user experiences are most relatable
2. **Professional Reviews Second** — Expert analysis and benchmarks

### Quality Indicators
- ✅ Multiple sources (X, Reddit, forums, Stack Exchange)
- ✅ Specific examples and quotes from real users
- ✅ Both positive and negative perspectives
- ✅ Frequency indicators ("Many users report...", "Some users experienced...")
- ✅ Source attribution for each piece of feedback

## Common Pitfalls

- ❌ Using single source or outdated reviews
- ❌ Ignoring user feedback
- ❌ Not considering user's use case
- ❌ Assuming newer always means better
- ❌ Overlooking trade-offs
- ❌ Presenting personal reviews without source attribution
- ❌ Over-weighting edge cases or isolated complaints

## Implementation Checklist

Before delivering your recommendation, verify:

- [ ] **Specs**: Fetched current specs from Apple.com (not from memory)
- [ ] **Personal Reviews**: Gathered from at least 3 different community sources
- [ ] **Professional Reviews**: Collected from at least 3 different publication types
- [ ] **Theme Extraction**: Identified recurring themes across sources
- [ ] **Source Attribution**: Every piece of feedback is attributed to its source
- [ ] **Balance**: Included both positive and negative perspectives
- [ ] **Context**: Explained who each recommendation is best for
- [ ] **Clarity**: Provided a clear, direct answer to the user's question

## Search Query Templates

### For Personal Reviews
- `"[product name]" review experience`
- `"[product name]" worth buying 2025`
- `"[product name]" problems issues`
- `"[product name]" vs [competitor]`
- `"[product name]" battery life real world`
- `"[product name]" long term reliability`

### For Professional Reviews
- `site:[publication].com [product name] review`
- `site:[publication].com [product name] benchmark`
- `site:[publication].com [product name] verdict`

## Tips for Better Recommendations

1. **Lead with personal reviews** — Users relate more to real experiences than specs
2. **Use specific quotes** — "Battery lasts 8-10 hours" is better than "good battery"
3. **Mention frequency** — "Many users report..." vs "One user mentioned..."
4. **Provide context** — "Thermal throttling mainly affects sustained gaming"
5. **Consider the asker** — Tailor recommendation to their specific needs
6. **Be honest about trade-offs** — No product is perfect for everyone
7. **Update regularly** — Check for new reviews and user feedback

## Handling Different Product Categories

### Mac
- Focus on: Performance, thermal management, software compatibility
- Common concerns: Thermal throttling, RAM/storage upgrades, port selection

### iPhone
- Focus on: Camera quality, battery life, durability, 5G performance
- Common concerns: Battery degradation, thermal issues

### iPad
- Focus on: Display quality, performance, stylus support
- Common concerns: Software limitations, thermal throttling

### Apple Watch
- Focus on: Battery life, fitness tracking accuracy, health features
- Common concerns: Battery life claims vs reality, durability

### AirPods
- Focus on: Sound quality, noise cancellation, battery life
- Common concerns: Fit/comfort, durability, repairability

## Common User Questions

### "Is it worth the upgrade?"
- Compare specs and performance gains
- Mention user feedback on whether improvements justify the cost
- Suggest who should upgrade vs who should wait

### "Should I buy now or wait?"
- Check for upcoming releases or announcements
- Consider current pricing and deals
- Mention if current gen is mature or has known issues

### "How does it compare to [competitor]?"
- Create side-by-side comparison table
- Highlight strengths and weaknesses of each
- Include user feedback on both products

### "Is it reliable/durable?"
- Search for long-term reliability reports
- Check for common failure modes
- Include user experiences with durability

### "Is it good for [specific use case]?"
- Tailor recommendation to their specific needs
- Highlight relevant specs and features
- Include feedback from users with similar use cases

## Frequency Indicators

- "Many users report..." (widespread, 50%+)
- "Some users report..." (common, 20-50%)
- "A few users report..." (uncommon, 5-20%)
- "One user mentioned..." (rare, <5%)
- "Multiple sources report..." (verified across sources)

## Handling Conflicting Information

When sources disagree:

1. **Identify the disagreement**: What specifically are they disagreeing about?
2. **Understand the context**: What's the reviewer's use case or testing methodology?
3. **Look for patterns**: Do multiple sources agree on one side?
4. **Present both sides**: "Some users report X, while others report Y"
5. **Provide context**: "This depends on [specific factor]"

## Source Credibility Assessment

### Personal Review Credibility
- **Verified purchase**: Has user actually bought the product?
- **Experience level**: Is user experienced with similar products?
- **Specificity**: Does review provide concrete details or vague statements?
- **Recency**: Is review from recent experience or outdated?
- **Consistency**: Does review align with other similar reviews?

### Professional Review Credibility
- **Methodology**: Do they explain testing process?
- **Benchmarks**: Do they use standardized tests?
- **Transparency**: Do they disclose conflicts of interest?
- **Depth**: Do they cover all important aspects?
- **Consistency**: Do their conclusions align with other reviewers?

## Identifying Emerging Issues

Watch for patterns that indicate emerging problems:
- **Multiple reports of same issue**: Indicates widespread problem
- **Increasing frequency over time**: Indicates issue is getting worse
- **Specific trigger conditions**: Indicates edge case or specific scenario
- **Workarounds mentioned**: Indicates known issue with solutions

## Handling Edge Cases

### New Product (< 1 month old)
- Limited long-term reliability data
- Focus on early adopter feedback
- Compare to previous generation
- Mention that long-term reliability unknown

### Mature Product (> 1 year old)
- Abundant long-term reliability data
- Look for retrospective reviews
- Check for known issues and solutions
- Consider upcoming replacements

### Discontinued Product
- Limited current availability
- Focus on retrospective reviews
- Compare to current alternatives
- Mention support and repair considerations

## Best Practices

### Do's ✅
- Always fetch fresh specs from Apple.com
- Search multiple community sources for personal reviews
- Include both positive and negative feedback
- Attribute every piece of information to its source
- Distinguish between widespread issues and edge cases
- Tailor recommendations to user's specific needs
- Mention relevant alternatives
- Be transparent about limitations

### Don'ts ❌
- Don't rely on training knowledge for specs or prices
- Don't use single source for recommendations
- Don't ignore negative feedback
- Don't assume newer always means better
- Don't present opinions as facts
- Don't overlook trade-offs
- Don't mix verified information with speculation
- Don't over-weight isolated complaints

## Final Checklist Before Delivery

- [ ] All specs verified from Apple.com (current, not from memory)
- [ ] Personal reviews from at least 3 different sources
- [ ] Professional reviews from at least 3 different publications
- [ ] Themes extracted and organized by sentiment
- [ ] Source attribution for every piece of feedback
- [ ] Both positive and negative perspectives included
- [ ] Frequency indicators used appropriately
- [ ] User's specific needs considered
- [ ] Alternatives mentioned if relevant
- [ ] Clear, direct answer to user's question
- [ ] Recommendation is balanced and fair
- [ ] No speculation presented as fact
- [ ] All information is current and relevant

## Key Success Factors

1. **Fresh data always** — Never use training knowledge for specs/prices
2. **Multiple sources** — Minimum 3 personal + 3 professional sources
3. **Personal first** — Real experiences are most relatable
4. **Source attribution** — Every claim needs a source
5. **Frequency matters** — Distinguish widespread vs isolated issues
6. **User-focused** — Tailor to their specific needs and use case
7. **Balanced** — Include both pros and cons
8. **Clear answer** — Direct, actionable recommendation

By following this guide, you'll help users make informed decisions about Apple products that align with their needs, budget, and use cases.
