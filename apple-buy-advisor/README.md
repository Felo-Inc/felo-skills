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

## Version

- **Version:** 4.0
- **Status:** Production Ready
- **Last Updated:** March 2026
