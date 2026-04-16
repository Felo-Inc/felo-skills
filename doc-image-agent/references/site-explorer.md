# Site Explorer Reference

Use this reference when the document requires screenshots from a website that has not yet been mapped clearly.

This is a reference document for `doc-image-agent`, not a standalone skill.

## Purpose

The goal of site exploration is not casual browsing. The goal is to build reusable operational knowledge about how to reliably reach the right pages for future screenshot work.

Good site knowledge records:
- stable entry points
- correct page mappings
- successful navigation paths
- failed attempts and why they failed
- screenshot-specific caveats

## Knowledge Storage

Store persistent site knowledge outside the skill package, using environment-provided directories:

```text
$IMAGE_AGENT_SITE_KNOWLEDGE_DIR/{site-key}.md
$IMAGE_AGENT_SITE_LEARNING_DIR/{site-key}.md
```

Suggested split:
- `sites/` or the knowledge directory stores stable navigation knowledge
- `learnings/` stores failures, corrections, recent discoveries, and user-specific preferences

Do not keep runtime site memories inside the skill directory.

## Site Key Rules

Derive a stable key from the domain:
- remove protocol
- remove `www.`
- remove low-value subdomain noise when appropriate

Examples:
- `memclaw.me` -> `memclaw`
- `app.felo.ai` -> `felo`
- `www.notion.so` -> `notion`
- `linear.app` -> `linear`
- `docs.example.com` -> `example-docs`
- `app.example.com` -> `example-app`

## What to Record

A useful site knowledge file should contain:
- primary domain
- first explored date
- last updated date
- last verified date
- login method
- page map
- stable navigation paths
- known pitfalls
- screenshot notes
- failures and corrections

Suggested structure:

```markdown
# Example Site - Site Knowledge

- Primary domain: example.com
- Site key: example
- First explored: 2026-01-01
- Last updated: 2026-01-01
- Last verified: 2026-01-01
- Login method: PLAYWRIGHT_CRED_EXAMPLE_EMAIL / PLAYWRIGHT_CRED_EXAMPLE_PASSWORD

## Current Conclusions
- Best path into the app is through /login.
- The marketing homepage and product dashboard are different states.
- Team screenshots require the Share panel to be open.

## Verified Paths
| Goal | Start | Path | Success Signal | Last Verified | Confidence |
|------|-------|------|----------------|---------------|------------|
| Open dashboard | Homepage | Open /login -> submit credentials | URL becomes /dashboard | 2026-01-01 | high |

## Page Map
| Page Type | URL Pattern | Description | Key Visible Elements | Difference From Similar Pages |
|-----------|-------------|-------------|----------------------|-------------------------------|
| Marketing homepage | / | Logged-out landing page | Hero, CTA | No user data |
| User dashboard | /dashboard | Authenticated app home | Sidebar, project list | Requires login |

## Login Flow
1. Open /login.
2. Fill email and password.
3. Submit.
4. Confirm the dashboard URL and user avatar.

## Navigation Patterns
- Use the sidebar to reach projects.
- Project details open from the project title, not the whole card.

## Failures and Corrections
| Date | Task | Wrong Move | Failure Signal | Correct Move | Lesson |
|------|------|------------|----------------|--------------|--------|
| 2026-01-01 | Capture workspace dashboard | Used homepage | No project list visible | Log in and open /dashboard | Description referred to the app, not marketing |

## Screenshot Notes
- Wait for async panels to finish loading.
- Force English if the article is English.
- Close onboarding popovers before capture.
```

## Exploration Workflow

### 1. Read Existing Knowledge First

If a site knowledge file already exists, read it before opening the site.

Extract:
- verified paths
- common page confusions
- known login quirks
- language behavior
- screenshot caveats
- unresolved questions

Do not rediscover everything from scratch unless the knowledge is stale or obviously wrong.

### 2. Define the Exploration Goal

Before browsing, answer:
- which page types need to be identified
- which screenshot descriptions need real page mappings
- which old assumptions need rechecking
- which states need confirmation with real browser interaction

### 3. Explore and Validate

As you browse, classify each finding as one of three states:
- verified
- corrected
- still uncertain

Useful things to validate:
- homepage versus dashboard
- list page versus detail page
- how to reach settings, share dialogs, history views, or team panels
- whether language is controlled by URL or by a UI preference
- whether deep links are stable

### 4. Update Knowledge Immediately

After each meaningful discovery, update the site knowledge file with:
- successful path
- failure and correction
- preconditions
- visible success signal
- verification date

## Exploration Priorities

### Distinguish Public and Authenticated States

This is the most common source of screenshot mistakes.

Always determine:
- what the logged-out homepage looks like
- what the logged-in landing page looks like
- what visible elements distinguish them quickly

### Map Descriptions to Real Pages

Words like these should always be validated against the actual product:
- homepage
- workspace
- dashboard
- settings
- project
- history
- decisions
- invite
- team
- panel

Do not trust your first guess. Confirm with the page itself.

### Record Preconditions

Some pages only make sense when:
- a project is selected
- the correct organization is active
- a panel is expanded
- a language is switched
- a populated account is used instead of an empty one

Knowledge without preconditions is incomplete.

## What Makes Site Knowledge High Quality

High-quality notes emphasize paths, not impressions.

Weak:
- `This page looks like a dashboard.`

Strong:
- `Open /login, sign in, wait for /dashboard, confirm sidebar plus project list.`

Also:
- keep old mistakes in the failure log instead of silently deleting them
- mark uncertain claims as unverified
- prefer recently verified shorter paths over older brittle paths

## Output Back to the Caller

When exploration ends, report:
- which site was explored
- where the knowledge file was written
- what new verified paths were found
- which old assumptions were corrected
- what still needs validation
