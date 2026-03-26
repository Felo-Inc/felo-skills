---
name: felo-twitter-writer
description: "Dual-mode Twitter/X writing tool. Mode 1: input a Twitter account, auto-fetch popular tweets and extract a writing style DNA document. Mode 2: based on style DNA and a topic, compose high-quality tweets, threads, or X long-form posts. Use when users want to analyze Twitter style, extract writing style, write tweets, write threads, imitate someone's tweet style, or ghostwrite tweets."
---

# Felo Twitter Writer Skill

## Constraints (MUST READ FIRST)

These rules are mandatory. Violating any of them will produce incorrect behavior.

1. **This skill uses SuperAgent directly.** All generation is handled by `felo-superAgent/scripts/run_superagent.mjs` with `--skill-id twitter-writer`. Do NOT attempt to generate tweet content yourself.

2. **NEVER use `--json` flag** when calling SuperAgent. The script MUST run in default streaming mode. State IDs are extracted from the `[state]` line in stderr.

3. **NEVER summarize or re-output SuperAgent's stdout.** The answer is already streamed directly to the user. Only add supplementary info (LiveDoc URL) if needed.

4. **`--live-doc-id` is REQUIRED** for every SuperAgent call. Follow the livedoc reuse rules from `felo-superAgent/SKILL.md`:
   - Reuse any `live_doc_id` already available in this session
   - If none: run `node felo-livedoc/scripts/run_livedoc.mjs list --json`, use `items[0].short_id`
   - If list is empty: run `node felo-livedoc/scripts/run_livedoc.mjs create --name "Twitter Writer" --json`, use `data.short_id`

5. **Always persist state.** After every SuperAgent call, extract `thread_short_id` and `live_doc_short_id` from the stderr `[state]` line. Use them in subsequent calls.

6. **Output language follows the user's input language.** Default is `en`. Detect the user's language and pass the matching `--accept-language` value: `ja` for Japanese, `en` for English, `ko` for Korean, `zh` for Chinese. If unsure, use `en`.

7. **Do NOT pass `--timeout` to the SuperAgent script.** The script manages its own connection lifecycle.

## When to Use

Trigger this skill when the user wants to:

- Analyze a Twitter/X account's writing style
- Extract a writing style DNA document from tweets
- Write, draft, or compose tweets / X posts
- Write a Twitter thread (multi-tweet series)
- Write an X long-form article / long post
- Imitate or mimic someone's tweet style
- Ghostwrite tweets on behalf of someone
- Understand how a specific account writes

**Trigger keywords:**

- English: `analyze twitter style`, `twitter style analysis`, `extract writing style`, `style DNA`, `write a tweet`, `write tweets`, `draft a tweet`, `write a thread`, `twitter thread`, `X article`, `X long post`, `imitate tweet style`, `mimic tweet style`, `tweet in the style of`, `write like [account]`, `X account analysis`, `analyze X account`, `ghostwrite tweets`, `how does [account] write`
- 日本語: `ツイートを書く`, `ツイートスタイル分析`, `スタイルDNA`, `ツイートを模倣`, `Xアカウント分析`, `ツイートのスタイルを抽出`, `〇〇風のツイートを書く`, `ツイートを代筆`, `Xアカウントを分析`, `このアカウントはどう書いている`

**Explicit commands:** `/felo-twitter-writer`, `use felo twitter writer`

**Do NOT use for:**

- General Twitter/X search only (use `felo-x-search`)
- General SuperAgent conversation (use `felo-superAgent`)
- Web search (use `felo-search`)

## Two Modes

### Mode 1 — Style DNA Extraction

**When:** User provides a Twitter/X account name and wants to understand or extract its writing style.

**Steps:**

#### Step 1: Fetch tweets via felo-x-search

```bash
node felo-x-search/scripts/run_x_search.mjs --id "USERNAME" --user --tweets --limit 30
```

Also fetch the account profile:

```bash
node felo-x-search/scripts/run_x_search.mjs --id "USERNAME" --user
```

#### Step 2: Obtain live_doc_id

Follow Constraint #4 above.

#### Step 3: Call SuperAgent with tweet content

Construct a query that includes the fetched tweets and asks for style analysis. Pass `--skill-id twitter-writer` since this is a new conversation.

```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "ENRICHED_QUERY_WITH_TWEET_CONTENT" \
  --live-doc-id "LIVE_DOC_ID" \
  --skill-id twitter-writer \
  --accept-language LANG
```

**Query construction example:**

> Please analyze the following tweets from @USERNAME and extract a writing style DNA document. Cover dimensions such as: tone, sentence structure, opening hooks, closing calls-to-action, frequently used words, hashtag strategy, emoji usage, and any other distinctive patterns.
>
> Account bio: [BIO]
>
> Tweets:
> [TWEET_1]
> [TWEET_2]
> ...

Keep the query under 2000 characters. If tweet content is too long, include the most representative 10–15 tweets.

#### Step 4: Save state

Extract `thread_short_id` and `live_doc_short_id` from stderr `[state]` line. Save for follow-up calls.

---

### Mode 2 — Content Creation

**When:** User wants to create tweets, threads, or X long-form posts (with or without a style DNA).

**Steps:**

#### Step 1: Determine if style DNA is available

- If Mode 1 was just run in this session → style DNA is already in the LiveDoc canvas, use follow-up mode
- If user provides a style DNA directly → include it in the query
- If user provides an account name → run Mode 1 first, then continue with Mode 2
- If no style DNA → proceed with general tweet writing (SuperAgent will use its default twitter-writer behavior)

#### Step 2: Obtain live_doc_id

Follow Constraint #4. If Mode 1 was already run, reuse the same `live_doc_id`.

#### Step 3: Determine conversation mode

| Condition | Mode | What to pass |
|-----------|------|--------------|
| First call in session, or switching to twitter-writer skill | New conversation | `--live-doc-id` + `--skill-id twitter-writer` |
| Continuing from Mode 1 or a previous Mode 2 call | Follow-up | `--thread-id` + `--live-doc-id` |
| User says "new topic" / "start over" | New conversation | `--live-doc-id` + `--skill-id twitter-writer` |

#### Step 4: Call SuperAgent

**New conversation:**

```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "ENRICHED_QUERY" \
  --live-doc-id "LIVE_DOC_ID" \
  --skill-id twitter-writer \
  --accept-language LANG
```

**Follow-up (iterating on previous output):**

```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "USER_FOLLOW_UP" \
  --thread-id "THREAD_SHORT_ID" \
  --live-doc-id "LIVE_DOC_ID" \
  --accept-language LANG
```

**Query construction guidelines:**

- Specify the content type: single tweet / thread / X long-form post
- Specify the topic clearly
- Include style DNA or reference account if available
- Default to 3 versions unless the user specifies otherwise
- Preserve the user's core intent; only add context and clarity

**Query examples:**

> Please write 3 versions of a tweet about [TOPIC] in the style of @USERNAME (style DNA above). Each version should feel distinct — vary the tone, structure, or angle.

> Based on the style DNA extracted above, write a Twitter thread (5–7 tweets) about [TOPIC]. Start with a strong hook tweet.

> Write an X long-form post about [TOPIC] following the writing style we analyzed. Aim for ~500 words.

#### Step 5: Save state

Extract `thread_short_id` and `live_doc_short_id` from stderr `[state]` line.

---

## Mode Decision Logic

```
User input
  │
  ├── Contains account name + "analyze / style / DNA / how does X write"
  │   OR: アカウント名 + "分析 / スタイル / DNA / どう書いている"
  │     → Mode 1 (Style DNA Extraction)
  │
  ├── Contains account name + "write / create / imitate / in the style of"
  │   OR: アカウント名 + "書いて / 作って / 風に / 真似て"
  │     → Mode 1 first → then Mode 2 (Creation)
  │
  ├── Contains topic + "write / draft / tweet / thread / X post"
  │   OR: トピック + "書いて / ツイート / スレッド / Xの投稿"
  │     → Mode 2 directly
  │         └── If no style DNA available: ask user if they want to provide
  │             a reference account, or proceed with general twitter-writer style
  │
  └── Ambiguous (e.g., "help me with tweets" / "ツイートを手伝って")
        → Ask user: do they want to analyze an account's style, or create content?
```

---

## Complete Workflow Examples

### Example A: Analyze an account's style

```
User: "@paulg のツイートスタイルを分析して"
```

**Step 1:** Fetch tweets:
```bash
node felo-x-search/scripts/run_x_search.mjs --id "paulg" --user --tweets --limit 30
node felo-x-search/scripts/run_x_search.mjs --id "paulg" --user
```

**Step 2:** Get `live_doc_id` (list or create)

**Step 3:** Call SuperAgent:
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "@paulg のツイートを分析し、文体のスタイルDNAドキュメントを作成してください。トーン、文章構造、冒頭フック、締めのアクション、頻出ワード、ハッシュタグ戦略、絵文字の使い方などを含めてください。\n\nアカウント概要：[BIO]\n\nツイート：\n[TWEETS]" \
  --live-doc-id "LIVE_DOC_ID" \
  --skill-id twitter-writer \
  --accept-language ja
```

**Step 4:** Save `thread_short_id` and `live_doc_short_id` from stderr `[state]`.

---

### Example B: Create tweets with a reference style

```
User: "@paulg のスタイルでスタートアップについてのツイートを3つ書いて"
```

**Step 1:** Run Mode 1 to extract style DNA (same as Example A)

**Step 2:** Reuse `live_doc_id` from Mode 1

**Step 3:** Follow-up call (continuing the same thread):
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "上記で抽出した @paulg のスタイルDNAをもとに、「スタートアップ」をテーマにしたツイートを3パターン作成してください。それぞれ異なるトーンや切り口で、280文字以内に収めてください。" \
  --thread-id "THREAD_SHORT_ID" \
  --live-doc-id "LIVE_DOC_ID" \
  --accept-language ja
```

---

### Example C: Write a thread directly

```
User: "Write a Twitter thread about why most startups fail"
```

**Step 1:** No style DNA needed, proceed directly

**Step 2:** Get `live_doc_id`

**Step 3:** New conversation with `twitter-writer`:
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "Write a Twitter thread (6–8 tweets) about why most startups fail. Start with a strong hook tweet that grabs attention. Each tweet should stand alone but flow naturally into the next." \
  --live-doc-id "LIVE_DOC_ID" \
  --skill-id twitter-writer \
  --accept-language en
```

---

### Example D: Iterate on generated content

```
User: "2番目のツイートをもっとユーモラスにして、絵文字も追加して"
```

**Step 1:** Already have `thread_short_id` and `live_doc_id` from the previous call (e.g., Example B or C). No new LiveDoc lookup needed.

**Step 2:** This is a follow-up — pass `--thread-id` with the saved `thread_short_id`.

**Step 3:** Follow-up call:
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "上記で生成した2番目のツイートを修正してください。トーンをよりユーモラスで軽快にし、適切な絵文字を追加してください。内容の意図は変えないでください。" \
  --thread-id "THREAD_SHORT_ID" \
  --live-doc-id "LIVE_DOC_ID" \
  --accept-language ja
```

**Step 4:** Save updated `thread_short_id` and `live_doc_short_id` from stderr `[state]`.

---

## Error Handling

| Scenario | Action |
|----------|--------|
| Account not found or no tweets returned | Inform user, suggest trying a different username or providing tweet samples manually |
| `FELO_API_KEY` not set | Stop and show setup instructions (same as `felo-superAgent` SKILL.md) |
| SuperAgent call fails | Check `live_doc_id` validity; retry once with the same parameters |
| User asks for Mode 2 with no style DNA and no account | Ask: "Would you like to provide a reference Twitter account to base the style on, or should I write in a general engaging style?" |
| User explicitly requests a new canvas | Create a new LiveDoc: `node felo-livedoc/scripts/run_livedoc.mjs create --name "Twitter Writer" --json` |
| Tweet content too long for query (>2000 chars) | Trim to the 10–15 most representative tweets; prioritize high-engagement ones |

## References

- [felo-superAgent SKILL.md](../felo-superAgent/SKILL.md) — SuperAgent calling conventions and constraints
- [felo-x-search SKILL.md](../felo-x-search/SKILL.md) — X/Twitter search commands
- [felo-livedoc SKILL.md](../felo-livedoc/SKILL.md) — LiveDoc management commands
- [Felo Open Platform](https://openapi.felo.ai/docs/)
- [Get API Key](https://felo.ai) (Settings → API Keys)
