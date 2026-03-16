# Apple Buy Advisor Skill

Research and compare Apple products to help users make informed buying decisions.

## Directory Structure

```
apple-buy-advisor/
├── SKILL.md          # Main skill definition (113 lines)
└── README.md         # This file
```

## What It Does

When a user asks about buying an Apple product, this skill:

1. **Fetches official specs** from Apple.com
2. **Searches user opinions** on X (Twitter)
3. **Researches professional reviews** from trusted tech sites
4. **Produces a structured recommendation** with specs comparison, user feedback, and buying guidance

## Trigger Conditions

Activates when users ask:
- "Should I buy a MacBook Pro?"
- "Is iPhone 16 Pro worth it?"
- "Compare iPad Air vs iPad Pro"
- "Which Apple Watch should I get?"
- "Is AirPods Pro worth the price?"

## Key Features

✅ **Fresh data** — Always uses current specs from Apple.com
✅ **Multiple sources** — Combines Apple-focused, tech media, and technical sites
✅ **Balanced** — Includes positive and negative feedback
✅ **Clear recommendations** — Specific buying conditions and alternatives
✅ **Concise** — 113 lines, easy to understand

## Report Format

Every recommendation includes:
- Product positioning
- Specs comparison table
- Real user feedback (positive & negative)
- Professional review synthesis
- Clear buying conditions
- Overall rating (1-5 stars)
- Direct conclusion

## Trusted Review Sites

| Category | Sites |
|----------|-------|
| Apple-focused | MacRumors, 9to5Mac, Macworld, iMore |
| Tech media | The Verge, CNET, Tom's Guide, Engadget |
| Technical | AnandTech, Wired |
| Chinese | sspai.com, ifanr.com |

## Optimization Notes

This skill follows Agent Skills best practices:

- ✅ **Concise description** (219 chars, under 1024 limit)
- ✅ **Clear trigger conditions** (specific user intents)
- ✅ **Progressive disclosure** (main SKILL.md is 113 lines)
- ✅ **Actionable steps** (4 clear steps to execute)
- ✅ **Focused scope** (Apple products only)
- ✅ **No bloat** (removed unnecessary reference files)

## Version

- **Version:** 3.0
- **Status:** Production Ready
- **Last Updated:** March 2026
