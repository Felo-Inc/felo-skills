import { getApiKey, fetchWithTimeoutAndRetry, NO_KEY_MESSAGE } from './search.js';
import * as config from './config.js';

const DEFAULT_API_BASE = 'https://openapi.felo.ai';
const DEFAULT_TIMEOUT_MS = 30_000;
const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const SPINNER_INTERVAL_MS = 80;
const STATUS_PAD = 56;

function startSpinner(message) {
  const start = Date.now();
  let i = 0;
  const id = setInterval(() => {
    const elapsed = Math.floor((Date.now() - start) / 1000);
    const line = `${message} ${SPINNER_FRAMES[i % SPINNER_FRAMES.length]} ${elapsed}s`;
    process.stderr.write(`\r${line.padEnd(STATUS_PAD, ' ')}`);
    i += 1;
  }, SPINNER_INTERVAL_MS);
  return id;
}

function stopSpinner(id) {
  if (id != null) clearInterval(id);
  process.stderr.write(`\r${' '.repeat(STATUS_PAD)}\r`);
}

async function getApiBase() {
  let base = process.env.FELO_API_BASE?.trim();
  if (!base) {
    const v = await config.getConfigValue('FELO_API_BASE');
    base = typeof v === 'string' ? v.trim() : '';
  }
  return (base || DEFAULT_API_BASE).replace(/\/$/, '');
}

function getMessage(payload) {
  return payload?.message || payload?.error || payload?.msg || payload?.code || 'Unknown error';
}

async function postApi(apiBase, apiKey, path, body, timeoutMs) {
  const res = await fetchWithTimeoutAndRetry(
    `${apiBase}/v2${path}`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
    timeoutMs,
  );
  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${getMessage(data)}`);
  if (data.status === 'error') throw new Error(getMessage(data));
  return data;
}

// ── Formatting helpers ──

function formatNumber(num) {
  if (num == null) return '0';
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

function formatUser(u, headerLevel = 2) {
  if (!u) return '';
  const h = '#'.repeat(Math.min(6, headerLevel));

  let badge = '';
  if (u.blue_verified) badge = ' 🔵';
  else if (u.verified) badge = ' ✓';

  let out = `${h} @${u.username} (${u.display_name || u.username}${badge})\n`;
  out += `- User ID: \`${u.user_id}\`\n`;

  if (u.verified_type) out += `- Verification Type: ${u.verified_type}\n`;

  const status = [];
  if (u.protected) status.push('Protected (Private)');
  if (u.is_automated) status.push('Automated');
  if (status.length) out += `- Account Status: ${status.join(' | ')}\n`;

  out += `- Followers: ${formatNumber(u.followers_count)}\n`;
  out += `- Following: ${formatNumber(u.following_count)}\n`;
  out += `- Total Tweets: ${formatNumber(u.tweet_count)}\n`;

  if (u.favorites_count > 0) out += `- Likes Given: ${formatNumber(u.favorites_count)}\n`;
  if (u.media_count > 0) out += `- Media Count: ${formatNumber(u.media_count)}\n`;
  if (u.description) out += `- Bio: ${u.description}\n`;
  if (u.location) out += `- Location: ${u.location}\n`;
  if (u.url) out += `- Website: ${u.url}\n`;
  if (u.can_dm) out += `- Direct Messages: Open\n`;
  if (u.profile_image_url) out += `- Profile Image: ${u.profile_image_url}\n`;
  if (u.cover_image_url) out += `- Cover Image: ${u.cover_image_url}\n`;
  if (u.pinned_tweet_ids?.length) out += `- Pinned Tweets: ${u.pinned_tweet_ids.length} tweet(s)\n`;
  if (u.created_at) out += `- Account Created: ${u.created_at}\n`;

  out += '\n---\n\n';
  return out;
}

function formatTweet(t, indent = '', headerLevel = 3) {
  if (!t) return '';
  const h = '#'.repeat(Math.min(6, headerLevel));
  const author = t.author || {};
  const verified = author.verified ? ' ✓' : '';

  let out = `${indent}${h} @${author.username || 'unknown'}(${author.display_name || author.username || 'unknown'}${verified})\n`;

  const meta = [`Posted: ${t.created_at || 'unknown'}`, `Tweet ID: \`${t.id}\``];
  if (t.conversation_id) meta.push(`Conversation: \`${t.conversation_id}\``);
  if (t.is_reply && t.in_reply_to_username) meta.push(`Reply to @${t.in_reply_to_username}`);
  out += `${indent}- ${meta.join(' ｜ ')}\n\n`;

  const content = t.content || '';
  for (const line of content.split('\n')) {
    out += `${indent}${line}\n`;
  }
  out += '\n';

  const metrics = t.metrics || {};
  const parts = [];
  if (metrics.favorite_count) parts.push(`${formatNumber(metrics.favorite_count)} likes`);
  if (metrics.retweet_count) parts.push(`${formatNumber(metrics.retweet_count)} retweets`);
  if (metrics.reply_count) parts.push(`${formatNumber(metrics.reply_count)} replies`);
  if (parts.length) out += `${indent}Engagement: ${parts.join(' ｜ ')}\n`;

  if (Array.isArray(t.media_urls) && t.media_urls.length) {
    out += `${indent}Media (${t.media_urls.length}):\n`;
    for (const media of t.media_urls) {
      const type = media.type || 'photo';
      if (type === 'video') {
        out += `${indent}  • [video] ${media.url || ''}\n`;
      } else {
        out += `${indent}  • [photo] ${media.thumbnail || ''}\n`;
      }
    }
  }

  out += `\n${indent}---\n\n`;
  return out;
}

// ── Subcommands ──

async function userInfo(usernames, opts) {
  const apiKey = await getApiKey();
  if (!apiKey) { console.error(NO_KEY_MESSAGE.trim()); return 1; }
  if (!usernames || !usernames.length) {
    process.stderr.write('ERROR: --usernames is required.\n');
    return 1;
  }

  const apiBase = await getApiBase();
  const timeoutMs = opts.timeoutMs || DEFAULT_TIMEOUT_MS;
  const spinnerId = startSpinner('Fetching user info');

  try {
    const payload = await postApi(apiBase, apiKey, '/x/user/info', { usernames }, timeoutMs);
    if (opts.json) { console.log(JSON.stringify(payload, null, 2)); return 0; }

    const users = payload?.data?.users || [];
    if (!users.length) {
      process.stderr.write('No users found.\n');
      return 1;
    }
    for (const u of users) {
      process.stdout.write(formatUser(u));
    }
    return 0;
  } catch (err) {
    process.stderr.write(`Failed to get user info: ${err?.message || err}\n`);
    return 1;
  } finally {
    stopSpinner(spinnerId);
  }
}

async function userSearch(query, opts) {
  const apiKey = await getApiKey();
  if (!apiKey) { console.error(NO_KEY_MESSAGE.trim()); return 1; }
  if (!query) {
    process.stderr.write('ERROR: --query is required.\n');
    return 1;
  }

  const apiBase = await getApiBase();
  const timeoutMs = opts.timeoutMs || DEFAULT_TIMEOUT_MS;
  const spinnerId = startSpinner(`Searching users: ${query}`);

  try {
    const body = { query };
    if (opts.cursor) body.cursor = opts.cursor;
    const payload = await postApi(apiBase, apiKey, '/x/user/search', body, timeoutMs);
    if (opts.json) { console.log(JSON.stringify(payload, null, 2)); return 0; }

    const data = payload?.data || {};
    const users = data.users || [];
    if (!users.length) {
      process.stderr.write('No users found.\n');
      return 1;
    }
    process.stdout.write(`Found ${data.total || users.length} user(s)\n\n`);
    for (const u of users) {
      process.stdout.write(formatUser(u));
    }
    if (data.has_next && data.next_cursor) {
      process.stderr.write(`\nMore results available. Use --cursor "${data.next_cursor}" to fetch next page.\n`);
    }
    return 0;
  } catch (err) {
    process.stderr.write(`Failed to search users: ${err?.message || err}\n`);
    return 1;
  } finally {
    stopSpinner(spinnerId);
  }
}

async function userTweets(opts) {
  const apiKey = await getApiKey();
  if (!apiKey) { console.error(NO_KEY_MESSAGE.trim()); return 1; }
  if (!opts.username && !opts.xUserId) {
    process.stderr.write('ERROR: --username or --x-user-id is required.\n');
    return 1;
  }

  const apiBase = await getApiBase();
  const timeoutMs = opts.timeoutMs || DEFAULT_TIMEOUT_MS;
  const label = opts.username || opts.xUserId;
  const spinnerId = startSpinner(`Fetching tweets from ${label}`);

  try {
    const body = {};
    if (opts.username) body.username = opts.username;
    if (opts.xUserId) body.x_user_id = opts.xUserId;
    if (opts.limit) body.limit = opts.limit;
    if (opts.cursor) body.cursor = opts.cursor;
    if (opts.includeReplies) body.include_replies = true;

    const payload = await postApi(apiBase, apiKey, '/x/user/tweets', body, timeoutMs);
    if (opts.json) { console.log(JSON.stringify(payload, null, 2)); return 0; }

    const data = payload?.data || {};
    const tweets = data.tweets || [];
    if (!tweets.length) {
      process.stderr.write('No tweets found.\n');
      return 1;
    }
    process.stdout.write(`Found ${data.total || tweets.length} tweet(s)\n\n`);
    for (const t of tweets) {
      process.stdout.write(formatTweet(t));
    }
    if (data.has_next && data.next_cursor) {
      process.stderr.write(`\nMore results available. Use --cursor "${data.next_cursor}" to fetch next page.\n`);
    }
    return 0;
  } catch (err) {
    process.stderr.write(`Failed to get user tweets: ${err?.message || err}\n`);
    return 1;
  } finally {
    stopSpinner(spinnerId);
  }
}

async function tweetSearch(query, opts) {
  const apiKey = await getApiKey();
  if (!apiKey) { console.error(NO_KEY_MESSAGE.trim()); return 1; }
  if (!query) {
    process.stderr.write('ERROR: --query is required.\n');
    return 1;
  }

  const apiBase = await getApiBase();
  const timeoutMs = opts.timeoutMs || DEFAULT_TIMEOUT_MS;
  const spinnerId = startSpinner(`Searching tweets: ${query}`);

  try {
    const body = { query };
    if (opts.queryType) body.query_type = opts.queryType;
    if (opts.sinceTime) body.since_time = opts.sinceTime;
    if (opts.untilTime) body.until_time = opts.untilTime;
    if (opts.limit) body.limit = opts.limit;
    if (opts.cursor) body.cursor = opts.cursor;

    const payload = await postApi(apiBase, apiKey, '/x/tweet/search', body, timeoutMs);
    if (opts.json) { console.log(JSON.stringify(payload, null, 2)); return 0; }

    const data = payload?.data || {};
    const tweets = data.tweets || [];
    if (!tweets.length) {
      process.stderr.write('No tweets found.\n');
      return 1;
    }
    process.stdout.write(`Found ${data.total || tweets.length} tweet(s)\n\n`);
    for (const t of tweets) {
      process.stdout.write(formatTweet(t));
    }
    if (data.has_next && data.next_cursor) {
      process.stderr.write(`\nMore results available. Use --cursor "${data.next_cursor}" to fetch next page.\n`);
    }
    return 0;
  } catch (err) {
    process.stderr.write(`Failed to search tweets: ${err?.message || err}\n`);
    return 1;
  } finally {
    stopSpinner(spinnerId);
  }
}

async function tweetReplies(tweetIds, opts) {
  const apiKey = await getApiKey();
  if (!apiKey) { console.error(NO_KEY_MESSAGE.trim()); return 1; }
  if (!tweetIds || !tweetIds.length) {
    process.stderr.write('ERROR: --tweet-ids is required.\n');
    return 1;
  }

  const apiBase = await getApiBase();
  const timeoutMs = opts.timeoutMs || DEFAULT_TIMEOUT_MS;
  const spinnerId = startSpinner(`Fetching replies for ${tweetIds.length} tweet(s)`);

  try {
    const body = { tweet_ids: tweetIds };
    if (opts.cursor) body.cursor = opts.cursor;
    if (opts.sinceTime) body.since_time = opts.sinceTime;
    if (opts.untilTime) body.until_time = opts.untilTime;

    const payload = await postApi(apiBase, apiKey, '/x/tweet/replies', body, timeoutMs);
    if (opts.json) { console.log(JSON.stringify(payload, null, 2)); return 0; }

    const results = payload?.data?.results || [];
    if (!results.length) {
      process.stderr.write('No replies found.\n');
      return 1;
    }
    for (const r of results) {
      process.stdout.write(`## Replies to tweet \`${r.tweet_id}\` (${r.total || 0} total)\n\n`);
      const replies = r.replies || [];
      for (const t of replies) {
        process.stdout.write(formatTweet(t));
      }
      if (r.has_next && r.next_cursor) {
        process.stderr.write(`More replies available for ${r.tweet_id}. Use --cursor "${r.next_cursor}" to fetch next page.\n`);
      }
    }
    return 0;
  } catch (err) {
    process.stderr.write(`Failed to get tweet replies: ${err?.message || err}\n`);
    return 1;
  } finally {
    stopSpinner(spinnerId);
  }
}

export { userInfo, userSearch, userTweets, tweetSearch, tweetReplies };
export { formatNumber, formatUser, formatTweet };
