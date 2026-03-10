# Frequently Asked Questions (FAQ)

Quick answers to common questions about Felo Search skill.

**Quick Navigation:**
- [Installation Issues](#installation-issues)
- [Configuration Issues](#configuration-issues)
- [Usage Questions](#usage-questions)
- [Error Messages](#error-messages)
- [Platform-Specific](#platform-specific)
- [Rate Limits & Performance](#rate-limits--performance)

---

## Installation Issues

### Q: "npx command not found"

**A:** Install Node.js first.

Download from [nodejs.org](https://nodejs.org) and install. Then retry:
```bash
npx @claude/skills add felo-search
```

### Q: Permission denied during install

**A:** Use elevated privileges.

**Linux/macOS:**
```bash
sudo npx @claude/skills add felo-search
```

**Windows:** Run PowerShell or CMD as Administrator.

### Q: Skill not showing up after install

**A:** Restart Claude Code.

```bash
claude restart
```

Then verify:
```bash
claude skills list
```

You should see `felo-search` in the output.

### Q: Manual installation - where to copy files?

**A:** Copy to Claude Code skills directory.

**Linux/macOS:**
```bash
cp -r felo-search ~/.claude/skills/
```

**Windows (PowerShell):**
```powershell
Copy-Item -Recurse felo-search "$env:USERPROFILE\.claude\skills\"
```

### Q: How to uninstall the skill?

**A:** Remove the skill directory.

**Linux/macOS:**
```bash
rm -rf ~/.claude/skills/felo-search
```

**Windows (PowerShell):**
```powershell
Remove-Item -Recurse "$env:USERPROFILE\.claude\skills\felo-search"
```

Then restart Claude Code.

---

## Configuration Issues

### Q: Where do I get the API key?

**A:** Get it from felo.ai.

1. Visit [felo.ai](https://felo.ai)
2. Log in (or register)
3. Click your avatar (top right) → **Settings**
4. Navigate to **API Keys** tab
5. Click **Create New Key**
6. Copy your API key

### Q: Environment variable not persisting

**A:** Add to your shell profile or system environment variables.

**Linux/macOS (bash):**
```bash
echo 'export FELO_API_KEY="your-key"' >> ~/.bashrc
source ~/.bashrc
```

**Linux/macOS (zsh):**
```bash
echo 'export FELO_API_KEY="your-key"' >> ~/.zshrc
source ~/.zshrc
```

**Windows:** Add to system environment variables:
1. System Properties → Advanced → Environment Variables
2. Under "User variables", click **New**
3. Variable name: `FELO_API_KEY`
4. Variable value: your API key
5. Click **OK**, restart Claude Code

### Q: How to verify API key is set?

**A:** Check the environment variable.

**Linux/macOS:**
```bash
echo $FELO_API_KEY
```

**Windows (PowerShell):**
```powershell
echo $env:FELO_API_KEY
```

**Windows (CMD):**
```cmd
echo %FELO_API_KEY%
```

You should see your API key. If empty, it's not set.

### Q: Can I use multiple API keys?

**A:** Only one key per environment.

The skill uses the `FELO_API_KEY` environment variable. To switch keys, change the variable and restart Claude Code.

### Q: Is my API key secure?

**A:** Environment variables are reasonably secure.

- Don't commit API keys to git repositories
- Don't share your API key publicly
- Revoke and regenerate if compromised
- Use separate keys for different environments

---

## Usage Questions

### Q: When does the skill trigger automatically?

**A:** For questions needing current information.

Triggers for:
- Current events, news, weather
- Prices, reviews, comparisons
- Location info (restaurants, attractions)
- Latest documentation, tech trends
- Questions with "latest", "recent", "best", "how to"
- Chinese: "最近", "什么", "哪里", "怎么样"
- Japanese: "最近", "何", "どこ", "どう"
- Korean: "최근", "무엇", "어디", "어떻게"

### Q: How to trigger manually?

**A:** Use the skill command or trigger phrases.

**Command:**
```
/felo-search your query here
```

**Trigger phrases:**
```
Search with Felo for [query]
Felo search: [query]
Use Felo to find [query]
```

### Q: Does it work in Chinese/Japanese/Korean?

**A:** Yes! Fully supports multi-language queries.

Ask in any language, get answers in that language. Even mixed-language queries work, for example:
- "React adoption in China"
- "Hospitals in Tokyo with Chinese-speaking staff"
- "Python vs Java for beginners?"

### Q: What's the response format?

**A:** Two-part response.

1. **Answer** - AI-generated comprehensive answer
2. **Query Analysis** - Optimized search queries used

### Q: Can I use it for code questions?

**A:** Best for questions needing web search.

**Good for:**
- Latest framework documentation
- Library comparisons
- Tech trends and news
- API usage guides

**Not ideal for:**
- Questions about your local code
- Pure logic or math problems
- File-specific questions in your workspace

### Q: How accurate are the answers?

**A:** Powered by Felo AI.

Answers are AI-generated based on current web information. Accuracy depends on:
- Query clarity
- Available web information
- Information recency

### Q: Can I customize the response format?

**A:** No, format is standardized.

The skill uses a consistent format for all responses. This ensures reliability and ease of use.

---

## Error Messages

### Q: "FELO_API_KEY not set"

**A:** Environment variable not configured.

**Solution:**
```bash
# Linux/macOS
export FELO_API_KEY="your-key"

# Windows PowerShell
$env:FELO_API_KEY="your-key"

# Windows CMD
set FELO_API_KEY=your-key
```

Then restart Claude Code.

### Q: "INVALID_API_KEY"

**A:** API key is incorrect or revoked.

**Solution:**
1. Go to [felo.ai](https://felo.ai)
2. Settings → API Keys
3. Generate a new key
4. Update your environment variable
5. Restart Claude Code

### Q: "curl: command not found"

**A:** curl is not installed.

**Solution:**

**Linux (Debian/Ubuntu):**
```bash
sudo apt update
sudo apt install curl
```

**Linux (Fedora/RHEL):**
```bash
sudo dnf install curl
```

**macOS:**
```bash
brew install curl
```

**Windows:** curl is built-in on Windows 10+. If missing, download from [curl.se](https://curl.se/windows/).

### Q: "CHAT_FAILED" or "SERVICE_ERROR"

**A:** Felo service issue.

**Solution:**
1. Wait a moment and retry
2. Check [felo.ai](https://felo.ai) status
3. Verify your internet connection
4. Contact support@felo.ai if persistent

### Q: "RATE_LIMIT_EXCEEDED"

**A:** You've exceeded your API rate limit.

**Solution:**
1. Wait for the rate limit to reset (usually 1 minute)
2. Check your Felo account tier at [felo.ai](https://felo.ai)
3. Upgrade to a higher tier if needed

### Q: Response is empty or incomplete

**A:** Query may be too vague or no results found.

**Solution:**
- Be more specific in your query
- Include context (location, time, specific details)
- Try rephrasing the question
- Check if the topic has recent web information

---

## Platform-Specific

### Q: Windows PowerShell - variable not working

**A:** Use PowerShell syntax for environment variables.

**For current session:**
```powershell
$env:FELO_API_KEY="your-key"
```

**For permanent:**
1. System Properties → Advanced → Environment Variables
2. Add `FELO_API_KEY` under User variables
3. Restart PowerShell and Claude Code

### Q: Windows CMD - how to set variable?

**A:** Use CMD syntax (no quotes).

**For current session:**
```cmd
set FELO_API_KEY=your-key
```

**For permanent:** Use System Properties (same as PowerShell above).

### Q: macOS - where to add permanent env var?

**A:** Add to shell profile.

**For zsh (default on macOS):**
```bash
echo 'export FELO_API_KEY="your-key"' >> ~/.zshrc
source ~/.zshrc
```

**For bash:**
```bash
echo 'export FELO_API_KEY="your-key"' >> ~/.bash_profile
source ~/.bash_profile
```

### Q: Linux - bash vs zsh?

**A:** Check your shell, then add to the correct profile.

**Check current shell:**
```bash
echo $SHELL
```

**If bash:**
```bash
echo 'export FELO_API_KEY="your-key"' >> ~/.bashrc
source ~/.bashrc
```

**If zsh:**
```bash
echo 'export FELO_API_KEY="your-key"' >> ~/.zshrc
source ~/.zshrc
```

### Q: WSL (Windows Subsystem for Linux) setup?

**A:** Treat it like Linux.

Set environment variable in WSL shell profile (~/.bashrc or ~/.zshrc), not in Windows. Claude Code running in WSL uses WSL environment variables.

### Q: Docker container usage?

**A:** Pass environment variable to container.

```bash
docker run -e FELO_API_KEY="your-key" your-image
```

Or use docker-compose:
```yaml
environment:
  - FELO_API_KEY=your-key
```

---

## Rate Limits & Performance

### Q: Is there a rate limit?

**A:** Yes, depends on your Felo account tier.

Check your account tier and limits at [felo.ai](https://felo.ai) → Settings → Account.

**Typical limits:**
- Free tier: Limited requests per day
- Paid tiers: Higher limits based on plan

### Q: How fast are responses?

**A:** Typically 2-5 seconds.

Response time depends on:
- Query complexity
- Network latency
- Felo API load

### Q: Can I use it offline?

**A:** No, requires internet connection.

The skill needs to:
1. Connect to Felo API
2. Fetch and analyze web information
3. Generate AI answers

All require internet access.

### Q: Does it cache results?

**A:** No, each query is fresh.

Every query fetches current information from the web. This ensures you always get the latest data.

### Q: How many web sources does it use?

**A:** Varies by query.

Felo AI automatically determines the optimal approach based on query complexity and available information.

### Q: Can I increase response speed?

**A:** Limited options.

- Use specific queries (faster than vague ones)
- Good internet connection helps
- Felo API performance is out of your control

### Q: What happens if API is down?

**A:** Skill will fail gracefully.

You'll see an error message. Claude Code will continue working for other tasks. Retry when Felo API is back online.

---

## Still Have Questions?

- **Documentation**: [Main README](../README.md) | [Skill README](../felo-search/README.md)
- **Examples**: [Usage Examples](./EXAMPLES.md)
- **Issues**: [GitHub Issues](https://github.com/Felo-Inc/felo-skills/issues)
- **Email**: support@felo.ai

---

**Found this helpful?** Consider contributing to the documentation! See [CONTRIBUTING.md](../CONTRIBUTING.md).
