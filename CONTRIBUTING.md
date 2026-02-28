# Contributing to Felo Skills

We welcome contributions! Whether you want to report bugs, suggest features, improve documentation, or add new skills.

---

## How to Contribute

### 1. Report Bugs

Found a bug? [Open an issue](https://github.com/Felo-Inc/felo-skills/issues/new) with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment (OS, Claude Code version, skill version)
- Error messages or logs

### 2. Suggest Features

Have an idea? [Start a discussion](https://github.com/Felo-Inc/felo-skills/discussions) or open an issue with:
- Use case description
- Why this feature is useful
- Proposed implementation (optional)

### 3. Submit Code

Ready to code? Follow the pull request process below.

---

## Development Setup

### Prerequisites

- Git
- Claude Code CLI
- Node.js (for testing npx installation)
- Text editor

### Clone the Repository

```bash
git clone https://github.com/Felo-Inc/felo-skills.git
cd felo-skills
```

### Test Locally

Copy a skill to your Claude Code skills directory:

```bash
# Linux/macOS
cp -r felo-search ~/.claude/skills/

# Windows (PowerShell)
Copy-Item -Recurse felo-search "$env:USERPROFILE\.claude\skills\"
```

Restart Claude Code:
```bash
claude restart
```

Test the skill:
```
Ask Claude: "What's the weather today?"
```

---

## Adding a New Skill

### Folder Structure

Create a new folder for your skill:

```
your-skill-name/
├── SKILL.md          # Skill implementation (required)
├── README.md         # User documentation (required)
└── LICENSE           # MIT License (required)
```

### SKILL.md Format

The `SKILL.md` file defines how the skill works. Use this template:

```markdown
---
name: your-skill-name
description: "Brief description of when to use this skill. Include trigger keywords and use cases."
---

# Your Skill Name

## When to Use

List specific scenarios when this skill should trigger:
- Scenario 1
- Scenario 2
- Trigger keywords: "keyword1", "keyword2"

## Setup

Step-by-step setup instructions:
1. Get API key from [service]
2. Set environment variable
3. Test the skill

## How to Execute

Detailed instructions for Claude Code on how to execute this skill:

### Step 1: Check Prerequisites
[Bash commands to verify setup]

### Step 2: Execute Main Logic
[Bash commands or tool calls to perform the skill's function]

### Step 3: Format Response
[How to present results to the user]

## Examples

### Example 1: [Scenario]
**User asks:** "example query"
**You MUST do:** [step-by-step execution]

## Error Handling

Common errors and solutions:
- Error 1: Solution
- Error 2: Solution

## Important Notes

- Key implementation details
- Best practices
- Limitations
```

### README.md Format

User-facing documentation. Use this structure:

```markdown
# Your Skill Name

**One-line description**

Brief overview of what the skill does.

---

## What It Does

- Feature 1
- Feature 2
- Feature 3

**When to use:**
- Use case 1
- Use case 2

**When NOT to use:**
- Anti-pattern 1
- Anti-pattern 2

---

## Quick Setup

### Step 1: Install
[Installation command]

### Step 2: Configure
[Configuration steps with verification]

### Step 3: Test
[Test command]

---

## Usage Examples

[Real-world examples with input/output]

---

## Troubleshooting

[Common issues and solutions]

---

## Links

- [Service website]
- [API documentation]
- [Report issues]
```

### Testing Checklist

Before submitting, verify:

- [ ] Skill triggers correctly for intended scenarios
- [ ] Error handling works (missing API key, network errors, etc.)
- [ ] Multi-language support (if applicable)
- [ ] Documentation is clear and complete
- [ ] Examples are realistic and helpful
- [ ] All commands are copy-paste ready
- [ ] Links work
- [ ] Tested on Windows, macOS, or Linux

---

## Pull Request Guidelines

### Branch Naming

Use descriptive branch names:
- `feature/add-xyz-skill` - New skill
- `fix/felo-search-encoding` - Bug fix
- `docs/improve-readme` - Documentation
- `refactor/skill-structure` - Code refactoring

### Commit Messages

Follow this format:
```
type: brief description

Detailed explanation (if needed)
```

Types:
- `feat`: New feature or skill
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Testing improvements
- `chore`: Maintenance tasks

Examples:
```
feat: add weather-skill for real-time weather data

Integrates OpenWeatherMap API to provide current weather,
forecasts, and alerts. Supports multi-language queries.

fix: handle Chinese characters in felo-search

Use heredoc for JSON files to properly encode Chinese,
Japanese, and Korean characters.

docs: improve installation guide in README

Add verification steps after each installation step
to help users confirm setup is correct.
```

### Pull Request Description

Include:

1. **What**: What does this PR do?
2. **Why**: Why is this change needed?
3. **How**: How does it work?
4. **Testing**: How did you test this?
5. **Screenshots**: (if applicable)

Example:
```markdown
## What
Adds a new skill for real-time weather information using OpenWeatherMap API.

## Why
Users frequently ask about weather, and current web search is slow.
Direct API integration provides faster, more accurate results.

## How
- Integrates OpenWeatherMap API
- Auto-triggers for weather-related queries
- Supports location detection and multi-language

## Testing
- Tested on Windows 11, macOS 14, Ubuntu 22.04
- Verified with English, Chinese, Japanese queries
- Tested error handling (invalid API key, network errors)

## Screenshots
[Screenshot of weather query result]
```

### Review Process

1. Submit PR
2. Automated checks run (if configured)
3. Maintainers review code and documentation
4. Address feedback
5. PR merged

---

## Code of Conduct

### Be Respectful

- Use welcoming and inclusive language
- Respect differing viewpoints
- Accept constructive criticism gracefully
- Focus on what's best for the community

### Be Professional

- Keep discussions on-topic
- Avoid personal attacks
- Don't spam or self-promote
- Follow GitHub's terms of service

### Be Helpful

- Help newcomers get started
- Share knowledge and experience
- Provide constructive feedback
- Celebrate others' contributions

---

## Questions?

- **Documentation**: Check [README](./README.md) and skill docs
- **Discussions**: [GitHub Discussions](https://github.com/Felo-Inc/felo-skills/discussions)
- **Issues**: [GitHub Issues](https://github.com/Felo-Inc/felo-skills/issues)
- **Email**: support@felo.ai

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Felo Skills! 🎉
