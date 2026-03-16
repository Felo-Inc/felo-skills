---
name: apple-buy-advisor
description: "Research and compare Apple products to help decide if they're worth buying. Use when user asks about buying an Apple product, whether a Mac/iPhone/iPad/AirPods is worth it, or wants to compare Apple products. Triggers on: 'should I buy', 'worth buying', 'compare macbook', 'macbook neo review', 'is [apple product] worth it', '/apple-buy-advisor'"
---

# Apple Buy Advisor

When this skill is triggered, you will research an Apple product and produce a structured buying recommendation.

## Steps to Execute

Given the product name (e.g. "MacBook Neo", "iPhone 16 Pro", "iPad Air M2"):

### 1. Fetch Official Specs

Use the `felo-web-fetch` skill to fetch the Apple product page. Try these URLs in order:

- `https://www.apple.com/shop/buy-mac` for Mac products
- `https://www.apple.com/macbook-pro/` or similar product-specific pages
- `https://www.apple.com/mac/compare/` for Mac comparison

Also fetch the Apple compare page to get side-by-side specs with competing models in the same lineup:

- Mac: `https://www.apple.com/mac/compare/`
- iPhone: `https://www.apple.com/iphone/compare/`
- iPad: `https://www.apple.com/ipad/compare/`
- AirPods: `https://www.apple.com/airpods/compare/`

### 2. Search Real User Opinions on X

Use the `felo-x-search` skill to search for real user experiences. Run these searches:

- `"[product name]" review experience` — general impressions
- `"[product name]" worth buying` — purchase decisions
- `"[product name]" problem issue` — common complaints
- `"[product name]" vs [competitor]` — direct comparisons
- `"[product name]" regret` — buyer's remorse and disappointments
- `"[product name]" recommend` — recommendations and endorsements
- `"[product name]" performance` — real-world performance feedback
- `"[product name]" battery life` — battery/endurance experiences

Use `--limit 10` for each search to keep results focused.

### 3. Search for Expert Reviews

Use the `felo-search` skill to find recent professional reviews:

- `[product name] review 2024 2025`
- `[product name] vs [competing model] comparison`

### 4. Produce the Report

Output a structured report in the following format:

---

## [Product Name] — Worth Buying?

### Product Positioning

One-sentence summary of where this product sits in Apple's product lineup.

### Specs Comparison

| Spec | [This Product] | [Previous Gen/Competitor 1] | [Competitor 2] |
| ---- | -------------- | --------------------------- | --------------- |
| Chip | ...            | ...                         | ...             |
| RAM  | ...            | ...                         | ...             |
| Storage | ...         | ...                         | ...             |
| Battery Life | ...    | ...                         | ...             |
| Price | ...           | ...                         | ...             |
| ...  | ...            | ...                         | ...             |

### Upgrades vs Previous Generation

- List main improvements

### Real User Feedback (from X)

**Positive:**

- Quote real user perspectives

**Negative / Pain Points:**

- Quote real user perspectives

### Professional Review Summary

- Key conclusions from professional media

### Buying Recommendation

**You should buy if:**

- Condition 1
- Condition 2

**You should not buy if:**

- Condition 1
- Condition 2

**Overall Rating:** ⭐⭐⭐⭐☆ (X/5)

**Conclusion:** A concise final recommendation.

---

## Notes

- Always fetch data fresh — do not rely on training knowledge for specs or prices
- If a product doesn't exist yet (e.g. rumored product), say so clearly and research leaks/rumors instead
- Output the report in the same language the user used to ask the question
- If FELO_API_KEY is not set, instruct the user to set it before proceeding
