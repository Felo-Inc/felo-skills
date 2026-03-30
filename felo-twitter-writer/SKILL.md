---
name: felo-twitter-writer
description: "Dual-mode Twitter/X writing tool. Mode 1: input a Twitter account, auto-fetch popular tweets and extract a writing style DNA document. Mode 2: based on style DNA and a topic, compose high-quality tweets, threads, or X long-form posts. Use when users want to analyze Twitter style, extract writing style, write tweets, write threads, imitate someone's tweet style, or ghostwrite tweets."
---

# Felo Twitter Writer Skill

## Constraints (MUST READ FIRST)

These rules are mandatory. Violating any of them will produce incorrect behavior.

1. **This skill uses SuperAgent directly.** All generation is handled by `felo-superAgent/scripts/run_superagent.mjs` with `--skill-id twitter-writer`. Do NOT attempt to generate tweet content yourself.

2. **ALWAYS use `--json` flag** when calling SuperAgent. In Claude Code's Bash tool, stdout is always captured — it never streams directly to the user. JSON mode returns the full answer in a structured response. After the script finishes, read `data.answer` from the JSON output and print it verbatim as your response text.

3. **ALWAYS output `data.answer` verbatim.** After the script finishes, print `data.answer` exactly as-is as your response text. Do NOT summarize, paraphrase, or add commentary around it.

4. **`--live-doc-id` is REQUIRED** for every SuperAgent call. Follow these rules strictly:
   - Reuse any `live_doc_id` already available in this session (from a prior SuperAgent or livedoc call)
   - If none: run `node felo-livedoc/scripts/run_livedoc.mjs list --json`, then find the **first item where `is_shared === false`** in `data.items` (list is sorted by modification time descending, so this gives the most recently modified private LiveDoc). Use its `short_id`.
   - If no `is_shared === false` item exists (or list is empty): run `node felo-livedoc/scripts/run_livedoc.mjs create --name "Twitter Writer" --json`, use `data.short_id`
   - **NEVER use a LiveDoc where `is_shared === true`** — shared LiveDocs belong to other projects and will cause a 502 error.

5. **Always persist state.** After every SuperAgent call, extract `thread_short_id` and `live_doc_short_id` from the JSON response fields `data.thread_short_id` and `data.live_doc_short_id`. Use them in subsequent calls.

6. **Output language follows the user's input language.** Default is `en`. Detect the user's language and pass the matching `--accept-language` value: `ja` for Japanese, `en` for English, `ko` for Korean, `zh` for Chinese. If unsure, use `en`.

7. **Do NOT pass `--timeout` to the SuperAgent script.** The script manages its own connection lifecycle.

8. **Brand style selection for Mode 2 new conversations only.** When starting a new conversation for content creation (Mode 2, no `thread_short_id`), you MUST attempt to fetch the TWITTER style library and offer the user a style choice BEFORE calling SuperAgent. The style is passed via `--ext '{"brand_style_requirement":"..."}'`. Full procedure in the Style Selection section below.

   - Style category is always `TWITTER` (hardcoded — this skill only writes tweets).
   - `--ext` is only valid for new conversations. Never pass it in follow-up mode (`--thread-id`).
   - If the style library returns no entries, skip silently and proceed without `--ext`.
   - Mode 1 (style DNA extraction) does NOT use this step.

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

Determine conversation mode first:
- If **no** `thread_short_id` exists in this session → new conversation (pass `--skill-id twitter-writer`)
- If `thread_short_id` **already exists** in this session → follow-up (pass `--thread-id`)

Replace `LANG` with the user's language: `en` (English), `zh` (Chinese), `ja` (Japanese), `ko` (Korean). See Constraint #6.

**New conversation (first call in session):**

```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "/twitter-writer ENRICHED_QUERY_WITH_TWEET_CONTENT" \
  --live-doc-id "LIVE_DOC_ID" \
  --skill-id twitter-writer \
  --accept-language LANG \
  --json
```

**Follow-up (thread_short_id already exists):**

```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "/twitter-writer ENRICHED_QUERY_WITH_TWEET_CONTENT" \
  --thread-id "THREAD_SHORT_ID" \
  --live-doc-id "LIVE_DOC_ID" \
  --accept-language LANG \
  --json
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

Extract `thread_short_id` and `live_doc_short_id` from the JSON response fields `data.thread_short_id` and `data.live_doc_short_id`. Save for follow-up calls.

---

### Mode 2 — Content Creation

**When:** User wants to create tweets, threads, or X long-form posts (with or without a style DNA).

**Steps:**

#### Step 1: Determine if style DNA is available

- If Mode 1 was just run in this session → style DNA is already in the LiveDoc canvas, use follow-up mode
- If user provides a style DNA directly → include it in the query
- If user provides an account name → run Mode 1 first, then continue with Mode 2
- If no style DNA → proceed to style library selection (Step 1.5)

#### Step 1.5: Brand Style Selection (new conversations only)

**Only run this step when:**
- This is a **new conversation** (no `thread_short_id` in session), AND
- Mode 1 was NOT just run (i.e., there is no existing thread carrying style DNA context)

**Skip this step entirely when:**
- `thread_short_id` already exists (follow-up) — `--ext` has no effect in follow-up mode
- Mode 1 was just run in this session — style context is already in the thread

**1.5a. Check if user already specified a style:**

If the user mentioned a style by name (e.g., "use my Bold Voice style") or pasted a style block, note it and skip to step 1.5d.

**1.5b. Fetch the TWITTER style library (names only):**

IMPORTANT: The style library output is very large (each Style DNA can be thousands of characters). Always use `--json` and extract only names/labels to avoid Bash tool output truncation. Never call `run_style_library.mjs` without `--json` for listing purposes.

```bash
node felo-superAgent/scripts/run_style_library.mjs --category TWITTER --accept-language LANG --json | node -e "
const d=require('fs').readFileSync('/dev/stdin','utf8');
const j=JSON.parse(d);
const list=j.list||[];
const user=list.filter(s=>!s.recommended);
const rec=list.filter(s=>s.recommended);
if(user.length) { console.log('[Your styles]'); user.forEach((s,i)=>{ const labels=(s.content?.labels?.LANG||s.content?.labels?.en||[]).join(', '); console.log((i+1)+'. '+s.name+(labels?' — '+labels:'')); }); }
if(rec.length) { console.log('[Recommended styles]'); rec.forEach((s,i)=>{ const labels=(s.content?.labels?.LANG||s.content?.labels?.en||[]).join(', '); console.log((user.length+i+1)+'. '+s.name+(labels?' — '+labels:'')); }); }
if(!list.length) console.log('(No styles found)');
"
```

Replace `LANG` with the user's language value (`zh`, `ja`, `ko`, `en`) in both `--accept-language` and inside the node script's `labels?.LANG` references.

Always pass `--accept-language` matching the user's language (same value used for SuperAgent).

**1.5c. Handle the result:**

**If the list is empty:** Skip silently. Proceed to Step 2 without `--ext`.

**If styles are available:** Output the COMPLETE list as plain text — every style returned by the API, grouped by type, numbered sequentially. NEVER use `AskUserQuestion` tool (it limits to 4 options and will silently drop styles). NEVER pre-select or filter styles on behalf of the user. Always append a "no preference" option as the last item. Then wait for the user's plain-text reply before proceeding.

Example presentation (adapt language to match user's language):
```
Here are the available Twitter writing styles — choosing one will make the output more accurate:

[Your styles]
1. My Bold Voice

[Recommended styles]
2. elonmusk — Shitposting provocateur
3. naval — Pithy aphorism master
...(list ALL styles, do not omit any)

0. No preference — use default style
```

**1.5d. Build `--ext` from the chosen style:**

After the user selects a style, fetch the full Style DNA for that specific style using `--json` and extract it in Node.js. Do NOT re-read the full text output — it will be truncated by the Bash tool.

```bash
node felo-superAgent/scripts/run_style_library.mjs --category TWITTER --accept-language LANG --json | node -e "
const d=require('fs').readFileSync('/dev/stdin','utf8');
const j=JSON.parse(d);
const s=(j.list||[]).find(s=>s.name==='CHOSEN_STYLE_NAME');
if(!s){process.stderr.write('Style not found\n');process.exit(1);}
const labels=(s.content?.labels?.LANG||s.content?.labels?.en||[]).join(', ');
const dna=s.content?.styleDna||'';
const block='Style name: '+s.name+'\nStyle labels: '+labels+'\nStyle DNA: '+dna;
console.log(JSON.stringify({brand_style_requirement:block}));
"
```

Replace `CHOSEN_STYLE_NAME` with the style name the user selected, and `LANG` with the language code.

Pass the output JSON directly as the `--ext` value:

```bash
--ext "$(node felo-superAgent/scripts/run_style_library.mjs --category TWITTER --accept-language LANG --json | node -e "
const d=require('fs').readFileSync('/dev/stdin','utf8');
const j=JSON.parse(d);
const s=(j.list||[]).find(s=>s.name==='CHOSEN_STYLE_NAME');
const labels=(s.content?.labels?.LANG||s.content?.labels?.en||[]).join(', ');
const dna=s.content?.styleDna||'';
const block='Style name: '+s.name+'\nStyle labels: '+labels+'\nStyle DNA: '+dna;
console.log(JSON.stringify({brand_style_requirement:block}));
")"
```

If the user chose "no preference" (option 0), do NOT pass `--ext`.

#### Step 2: Obtain live_doc_id

Follow Constraint #4. If Mode 1 was already run, reuse the same `live_doc_id`.

#### Step 3: Determine conversation mode

| Condition | Mode | What to pass |
|-----------|------|--------------|
| No `thread_short_id` in this session (truly first call) | New conversation | `--live-doc-id` + `--skill-id twitter-writer` + `--ext` (if style chosen) |
| `thread_short_id` already exists in this session (all subsequent inputs, including after Mode 1) | Follow-up | `--thread-id` + `--live-doc-id` (NO `--ext`) |
| User says "new topic" / "start over" (clear `thread_short_id`) | New conversation | `--live-doc-id` + `--skill-id twitter-writer` + `--ext` (repeat Step 1.5) |

#### Step 4: Call SuperAgent

Replace `LANG` with the user's language: `en`, `zh`, `ja`, `ko`. See Constraint #6.

**New conversation without style (no `thread_short_id`, user chose no preference or list was empty):**

```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "/twitter-writer ENRICHED_QUERY" \
  --live-doc-id "LIVE_DOC_ID" \
  --skill-id twitter-writer \
  --accept-language LANG \
  --json
```

**New conversation with brand style:**

```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "/twitter-writer ENRICHED_QUERY" \
  --live-doc-id "LIVE_DOC_ID" \
  --skill-id twitter-writer \
  --ext '{"brand_style_requirement":"Style name: darioamodei\nStyle labels: Thoughtful long-form essays\nStyle DNA: # Dario Amodei (@DarioAmodei) Tweet Writing Style DNA\n\n## Style Overview\nDario writes like a serious intellectual...（full content, do NOT truncate）"}' \
  --accept-language LANG \
  --json
```

**Follow-up (`thread_short_id` already exists in session):**

```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "/twitter-writer USER_FOLLOW_UP" \
  --thread-id "THREAD_SHORT_ID" \
  --live-doc-id "LIVE_DOC_ID" \
  --accept-language LANG \
  --json
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

Extract `thread_short_id` and `live_doc_short_id` from the JSON response fields `data.thread_short_id` and `data.live_doc_short_id`.

---

## Mode Decision Logic

```
User input
  │
  ├── Contains account name + "analyze / style / DNA / how does X write"
  │   OR: アカウント名 + "分析 / スタイル / DNA / どう書いている"
  │     → Mode 1 (Style DNA Extraction) — skip style library step
  │
  ├── Contains account name + "write / create / imitate / in the style of"
  │   OR: アカウント名 + "書いて / 作って / 風に / 真似て"
  │     → Mode 1 first → then Mode 2 (follow-up, skip style library step)
  │
  ├── Contains topic + "write / draft / tweet / thread / X post"
  │   OR: トピック + "書いて / ツイート / スレッド / Xの投稿"
  │     → Mode 2 directly
  │         └── New conversation?
  │               YES → Step 1.5: fetch TWITTER styles, present to user, wait for choice
  │               NO  → follow-up, skip style library step
  │
  └── Ambiguous (e.g., "help me with tweets" / "ツイートを手伝って")
        → Ask user: do they want to analyze an account's style, or create content?
```

---

## Complete Workflow Examples

### Example A: Analyze an account's style

```
User: "Analyze @paulg's tweet style"
```

**Step 1:** Fetch tweets:
```bash
node felo-x-search/scripts/run_x_search.mjs --id "paulg" --user --tweets --limit 30
node felo-x-search/scripts/run_x_search.mjs --id "paulg" --user
```

**Step 2:** Get `live_doc_id` (list or create)

**Step 3:** Call SuperAgent (Mode 1 — no style library step):
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "/twitter-writer Please analyze the following tweets from @paulg and extract a writing style DNA document. Cover tone, sentence structure, opening hooks, closing CTAs, frequently used words, hashtag strategy, and emoji usage.\n\nAccount bio: [BIO]\n\nTweets:\n[TWEETS]" \
  --live-doc-id "LIVE_DOC_ID" \
  --skill-id twitter-writer \
  --accept-language en \
  --json
```

**Step 4:** Save `thread_short_id` and `live_doc_short_id` from JSON response fields `data.thread_short_id` and `data.live_doc_short_id`.

---

### Example B: Create tweets with a reference style (Mode 1 → Mode 2)

```
User: "Write 3 tweets about startups in @paulg's style"
```

**Step 1:** Run Mode 1 to extract style DNA (same as Example A). Style library step is skipped because Mode 1 already establishes style context in the thread.

**Step 2:** Reuse `live_doc_id` from Mode 1.

**Step 3:** Follow-up call (continuing the same thread — `thread_short_id` from Mode 1, no `--ext`):
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "/twitter-writer Based on the @paulg style DNA extracted above, write 3 tweet variations about startups. Each should have a distinct tone and angle, within 280 characters." \
  --thread-id "THREAD_SHORT_ID" \
  --live-doc-id "LIVE_DOC_ID" \
  --accept-language en \
  --json
```

---

### Example C: Write a thread directly (Mode 2, new conversation, with style selection)

```
User: "Write a Twitter thread about why most startups fail"
```

**Step 1.5:** New conversation, no existing thread → fetch TWITTER styles (names only):
```bash
node felo-superAgent/scripts/run_style_library.mjs --category TWITTER --accept-language en --json | node -e "
const d=require('fs').readFileSync('/dev/stdin','utf8');
const j=JSON.parse(d);
const list=j.list||[];
const user=list.filter(s=>!s.recommended);
const rec=list.filter(s=>s.recommended);
if(user.length){console.log('[Your styles]');user.forEach((s,i)=>{const labels=(s.content?.labels?.en||[]).join(', ');console.log((i+1)+'. '+s.name+(labels?' — '+labels:''));});}
if(rec.length){console.log('[Recommended styles]');rec.forEach((s,i)=>{const labels=(s.content?.labels?.en||[]).join(', ');console.log((user.length+i+1)+'. '+s.name+(labels?' — '+labels:''));});}
if(!list.length)console.log('(No styles found)');
"
```

Present to user:
```
Here are the available Twitter writing styles — choosing one will make the output more accurate:

[Your styles]
1. My Bold Voice

[Recommended styles]
2. darioamodei

0. No preference — use default style
```

User replies: `1`

**Step 2:** Get `live_doc_id`.

**Step 3:** New conversation with chosen style — extract full Style DNA via `--json` and pass as `--ext`:
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "/twitter-writer Write a Twitter thread (6–8 tweets) about why most startups fail. Start with a strong hook tweet that grabs attention. Each tweet should stand alone but flow naturally into the next." \
  --live-doc-id "LIVE_DOC_ID" \
  --skill-id twitter-writer \
  --ext "$(node felo-superAgent/scripts/run_style_library.mjs --category TWITTER --accept-language en --json | node -e "
const d=require('fs').readFileSync('/dev/stdin','utf8');
const j=JSON.parse(d);
const s=(j.list||[]).find(s=>s.name==='My Bold Voice');
const labels=(s.content?.labels?.en||[]).join(', ');
const block='Style name: '+s.name+'\nStyle labels: '+labels+'\nStyle DNA: '+s.content.styleDna;
console.log(JSON.stringify({brand_style_requirement:block}));
")" \
  --accept-language en \
  --json
```

**Step 4:** Save `thread_short_id` and `live_doc_short_id` from JSON response fields `data.thread_short_id` and `data.live_doc_short_id`.

---

### Example D: Iterate on generated content (follow-up, no style step)

```
User: "Make the 2nd tweet more humorous and add some emojis"
```

Already have `thread_short_id` and `live_doc_id` from the previous call. This is a follow-up — do NOT fetch styles again, do NOT pass `--ext`.

```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "/twitter-writer Please revise the 2nd tweet generated above. Make the tone more humorous and lighthearted, and add appropriate emojis. Keep the original intent intact." \
  --thread-id "THREAD_SHORT_ID" \
  --live-doc-id "LIVE_DOC_ID" \
  --accept-language en \
  --json
```

**Save** updated `thread_short_id` and `live_doc_short_id` from JSON response fields `data.thread_short_id` and `data.live_doc_short_id`.

---

### Example E: User specifies style by name

```
User: "Write a tweet about AI trends using my 'Bold Voice' style"
```

**Step 1.5a:** User already named the style → extract full Style DNA via `--json`. No need to ask the user again.

**Step 3:** New conversation with that style:
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "/twitter-writer Write a tweet about AI trends" \
  --live-doc-id "LIVE_DOC_ID" \
  --skill-id twitter-writer \
  --ext "$(node felo-superAgent/scripts/run_style_library.mjs --category TWITTER --accept-language en --json | node -e "
const d=require('fs').readFileSync('/dev/stdin','utf8');
const j=JSON.parse(d);
const s=(j.list||[]).find(s=>s.name==='My Bold Voice');
const labels=(s.content?.labels?.en||[]).join(', ');
const block='Style name: '+s.name+'\nStyle labels: '+labels+'\nStyle DNA: '+s.content.styleDna;
console.log(JSON.stringify({brand_style_requirement:block}));
")" \
  --accept-language en \
  --json
```

---

### Example F: Style library is empty

```
User: "Write a tweet about the new product launch"
```

**Step 1.5b:** Fetch styles (names only):
```bash
node felo-superAgent/scripts/run_style_library.mjs --category TWITTER --accept-language en --json | node -e "
const d=require('fs').readFileSync('/dev/stdin','utf8');
const j=JSON.parse(d);
if(!(j.list||[]).length)console.log('(No styles found)');
else console.log((j.list||[]).map(s=>s.name).join('\n'));
"
```

Output: `(No styles found)`

**Skip silently.** Proceed directly without `--ext`:
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "/twitter-writer Write a tweet about the new product launch. Provide 3 versions with different tones." \
  --live-doc-id "LIVE_DOC_ID" \
  --skill-id twitter-writer \
  --accept-language en \
  --json
```

---

### Example G: User chooses no preference

```
User: "Write a tweet about a new product launch"
```

**Step 1.5:** Fetch styles, present list. User replies: `0` (no preference).

Proceed without `--ext`:
```bash
node felo-superAgent/scripts/run_superagent.mjs \
  --query "/twitter-writer Write 3 tweets about a new product launch, each with a slightly different tone." \
  --live-doc-id "LIVE_DOC_ID" \
  --skill-id twitter-writer \
  --accept-language en \
  --json
```

---

## Error Handling

| Scenario | Action |
|----------|--------|
| Account not found or no tweets returned | Inform user, suggest trying a different username or providing tweet samples manually |
| `FELO_API_KEY` not set | Stop and show setup instructions (same as `felo-superAgent` SKILL.md) |
| SuperAgent call fails | Check `live_doc_id` validity; retry once with the same parameters |
| Style library fetch fails | Log warning to stderr, skip silently, proceed without `--ext` |
| User asks for Mode 2 with no style DNA and no account | Proceed to Step 1.5 (style library selection) |
| User explicitly requests a new canvas | Create a new LiveDoc: `node felo-livedoc/scripts/run_livedoc.mjs create --name "Twitter Writer" --json` |
| Tweet content too long for query (>2000 chars) | Trim to the 10–15 most representative tweets; prioritize high-engagement ones |

## References

- [felo-superAgent SKILL.md](../felo-superAgent/SKILL.md) — SuperAgent calling conventions, `--ext` format, and style library script
- [felo-x-search SKILL.md](../felo-x-search/SKILL.md) — X/Twitter search commands
- [felo-livedoc SKILL.md](../felo-livedoc/SKILL.md) — LiveDoc management commands
- [Felo Open Platform](https://openapi.felo.ai/docs/)
- [Get API Key](https://felo.ai) (Settings → API Keys)
