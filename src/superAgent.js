const DEFAULT_API_BASE = 'https://openapi.felo.ai';
const DEFAULT_TIMEOUT_MS = 60_000;
/** 流式读取空闲超时：连续这么久未收到任何数据则断开，默认 5 分钟（生图等长任务需较久） */
const STREAM_IDLE_TIMEOUT_MS = 2 * 60 * 60 * 1000;
/** Tools whose params and results should be silently ignored. */
const HIDDEN_TOOLS = new Set(['manage_outline']);
const RECONNECT_DELAY_MS = 2000;

const NO_KEY_MESSAGE = `
❌ Felo API Key not configured

To use SuperAgent, set FELO_API_KEY (env or: felo config set FELO_API_KEY <key>).
Get your API key from https://felo.ai (Settings → API Keys).
`;

async function getApiKey() {
  if (process.env.FELO_API_KEY?.trim()) {
    return process.env.FELO_API_KEY.trim();
  }
  const { getConfigValue } = await import('./config.js');
  const fromConfig = await getConfigValue('FELO_API_KEY');
  return typeof fromConfig === 'string' ? fromConfig.trim() : '';
}

async function getApiBase() {
  if (process.env.FELO_API_BASE?.trim()) {
    return process.env.FELO_API_BASE.trim().replace(/\/$/, '');
  }
  const { getConfigValue } = await import('./config.js');
  const fromConfig = await getConfigValue('FELO_API_BASE');
  if (typeof fromConfig === 'string' && fromConfig.trim()) {
    return fromConfig.trim().replace(/\/$/, '');
  }
  return DEFAULT_API_BASE;
}

function getMessage(payload) {
  return (
    payload?.message ||
    payload?.error ||
    payload?.msg ||
    payload?.code ||
    'Unknown error'
  );
}

function isApiError(payload) {
  const status = payload?.status;
  const code = payload?.code;
  if (typeof status === 'string' && status.toLowerCase() === 'error') return true;
  if (typeof code === 'string' && code && code.toUpperCase() !== 'OK') return true;
  return false;
}

async function createConversation(apiKey, apiBase, body, timeoutMs, threadId) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const url = threadId
      ? `${apiBase}/v2/conversations/${encodeURIComponent(threadId)}/follow_up`
      : `${apiBase}/v2/conversations`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    let data = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${getMessage(data)}`);
    }
    if (isApiError(data)) {
      throw new Error(getMessage(data));
    }

    const payload = data?.data ?? {};
    if (!payload.stream_key) {
      throw new Error('Unexpected response: missing stream_key');
    }
    return payload;
  } finally {
    clearTimeout(timer);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Read a single SSE connection until it ends or encounters an error event.
 * Returns { maxOffset, streamDone, streamError } so the caller can decide
 * whether to reconnect.
 */
async function readSSE(url, apiKey, startOffset, callbacks) {
  const { onMessage, onError, onDone, onEvent, onToolCall, onToolResult, onStatusMessage } = callbacks;
  const controller = new AbortController();
  let idleTimer = null;
  const resetIdleTimer = () => {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => controller.abort(), STREAM_IDLE_TIMEOUT_MS);
  };

  const connectUrl = startOffset >= 0 ? `${url}?offset=${startOffset}` : url;
  let maxOffset = startOffset;
  let streamDone = false;
  let streamError = null;

  try {
    const res = await fetch(connectUrl, {
      method: 'GET',
      headers: {
        Accept: 'text/event-stream',
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text();
      let msg = text;
      try {
        const j = JSON.parse(text);
        msg = getMessage(j) || text;
      } catch {}
      throw new Error(`HTTP ${res.status}: ${msg}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';
    let currentEvent = '';
    let currentData = undefined;

    const processEvent = (evt, data) => {
      if (!evt || data === undefined) return;
      // Track offset and skip already-processed events on reconnect
      let eventOffset = -1;
      try {
        const parsed = JSON.parse(data);
        if (typeof parsed?.offset === 'number') {
          eventOffset = parsed.offset;
          if (parsed.offset > maxOffset) {
            maxOffset = parsed.offset;
          }
        }
      } catch {}

      // Skip events we've already seen (replay after reconnect)
      if (eventOffset >= 0 && eventOffset <= startOffset) {
        return;
      }

      if (onEvent) onEvent(evt, data);

      if (evt === 'error') {
        // Server sends event:error as a "not ready yet" signal during long tasks
        // (e.g. image generation). This does NOT mean the connection is broken.
        // Just ignore it and keep reading.
        return;
      }
      if (evt === 'done' || evt === 'completed' || evt === 'complete') {
        streamDone = true;
        onDone();
        return;
      }
      // Delegate other events (message, stream, heartbeat, etc.) to dispatch
      dispatch(evt, data, onMessage, onError, onDone, onEvent, onToolCall, onToolResult, onStatusMessage);
    };

    resetIdleTimer();
    while (true) {
      const { done, value } = await reader.read();
      resetIdleTimer();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (line.startsWith('event:')) {
          processEvent(currentEvent, currentData);
          currentEvent = line.slice(6).trim();
          currentData = undefined;
        } else if (line.startsWith('data:')) {
          currentData = line.slice(5).trim();
        } else if (line === '') {
          processEvent(currentEvent, currentData);
          currentEvent = '';
          currentData = undefined;
        }
      }
    }

    if (idleTimer) clearTimeout(idleTimer);
    processEvent(currentEvent, currentData);
  } catch (err) {
    if (idleTimer) clearTimeout(idleTimer);
    if (err?.name === 'AbortError') {
      streamError = `Stream idle timeout (no data for ${STREAM_IDLE_TIMEOUT_MS / 1000}s)`;
    } else {
      throw err;
    }
  }

  return { maxOffset, streamDone, streamError };
}

/**
 * Consume SSE stream with automatic reconnection.
 * Server may push event:error and close the connection when waiting for
 * long-running tasks (e.g. image generation). We reconnect with ?offset=N
 * to resume from where we left off, and keep retrying until we receive
 * a done/complete event or hit the 2-hour total timeout.
 */
async function consumeStream(apiKey, apiBase, streamKey, onMessage, onError, onDone, onEvent, toolCallbacks, onStatusMessage) {
  const url = `${apiBase}/v2/conversations/stream/${encodeURIComponent(streamKey)}`;
  const { onToolCall, onToolResult } = toolCallbacks;
  const callbacks = { onMessage, onError, onDone, onEvent, onToolCall, onToolResult, onStatusMessage };

  let lastOffset = -1;
  const startTime = Date.now();

  while (true) {
    if (Date.now() - startTime > STREAM_IDLE_TIMEOUT_MS) {
      onError('Stream timeout: no completion after ' + (STREAM_IDLE_TIMEOUT_MS / 1000) + 's');
      return;
    }

    const result = await readSSE(url, apiKey, lastOffset, callbacks);

    if (result.streamDone) return;

    if (result.maxOffset > lastOffset) {
      lastOffset = result.maxOffset;
    }

    // Connection closed (error or unexpected) — reconnect
    await sleep(RECONNECT_DELAY_MS);
  }
}

function extractToolResults(data) {
  const out = [];
  const tools = data?.tools;
  if (!Array.isArray(tools)) return out;
  for (const t of tools) {
    if (HIDDEN_TOOLS.has(t?.name) || HIDDEN_TOOLS.has(t?.tool_name)) continue;
    const callResult = t?.call_result;
    // Image tool results
    if (t?.tool_name === 'generate_images' || t?.name === 'generate_images') {
      if (!callResult) continue;
      if (Array.isArray(callResult)) {
        for (const item of callResult) {
          if (item?.image_url) out.push({ type: 'image', title: item?.title || '', image_url: item.image_url });
        }
      } else if (callResult?.images && Array.isArray(callResult.images)) {
        for (const img of callResult.images) {
          if (img?.image_url) out.push({ type: 'image', title: img?.title || '', image_url: img.image_url });
        }
      } else if (callResult?.image_url) {
        out.push({ type: 'image', title: callResult?.title || '', image_url: callResult.image_url });
      }
    }
    // Discovery (research report) tool results
    if (t?.name === 'generate_discovery' && callResult?.status === 'success') {
      out.push({ type: 'discovery', title: callResult?.title || t?.params?.title || '研究报告' });
    }
    // Document generation tool results
    if (t?.name === 'generate_document' && callResult?.status === 'success') {
      out.push({ type: 'document', title: callResult?.title || t?.params?.title || '文档' });
    }
    // PPT generation tool results
    if (t?.name === 'generate_ppt' && callResult?.status === 'success') {
      out.push({ type: 'ppt', title: callResult?.title || t?.params?.title || 'PPT' });
    }
    // HTML generation tool results
    if (t?.name === 'generate_html' && callResult?.status === 'success') {
      out.push({ type: 'html', title: callResult?.title || t?.params?.title || 'HTML' });
    }
    // Twitter search tool results
    if (t?.name === 'search_x' && callResult?.tweets && Array.isArray(callResult.tweets)) {
      out.push({ type: 'search_x', status: callResult.status, tweets: callResult.tweets });
    }
  }
  return out;
}

/**
 * Extract tool invocation params from type=tools events for immediate display.
 */
function extractToolParams(data) {
  const out = [];
  const tools = data?.tools;
  if (!Array.isArray(tools)) return out;
  for (const t of tools) {
    if (HIDDEN_TOOLS.has(t?.name) || HIDDEN_TOOLS.has(t?.tool_name)) continue;
    if (t?.name && t?.params) {
      out.push({ name: t.name, params: t.params });
    }
  }
  return out;
}

/**
 * Format a single tweet for CLI output.
 */
function formatTweet(tweet) {
  const info = tweet?.other_info || {};
  const author = info.author || {};
  const metrics = info.metrics || {};
  const name = author.display_name || author.username || 'Unknown';
  const handle = author.username ? `@${author.username}` : '';
  const text = tweet?.snippet || tweet?.title || '';
  const link = tweet?.link || info.url || '';
  const stats = [];
  if (metrics.favorite_count) stats.push(`❤ ${metrics.favorite_count}`);
  if (metrics.retweet_count) stats.push(`🔁 ${metrics.retweet_count}`);
  if (metrics.view_count) stats.push(`👁 ${metrics.view_count}`);
  const statsStr = stats.length > 0 ? `  [${stats.join(' | ')}]` : '';
  return `  ${name} (${handle})${statsStr}\n  ${text}\n  ${link}`;
}

function dispatch(eventType, dataStr, onMessage, onError, onDone, onEvent, onToolCall, onToolResult, onStatusMessage) {
  let payload = {};
  if (dataStr) {
    try {
      payload = JSON.parse(dataStr);
    } catch {
      payload = { content: dataStr };
    }
  }

  switch (eventType) {
    case 'message':
      if (typeof payload.content === 'string') {
        onMessage(payload.content);
      }
      break;
    case 'stream': {
      const content = payload?.content;
      if (typeof content === 'string') {
        try {
          const inner = JSON.parse(content);
          const type = inner?.type;
          const data = inner?.data;
          if (type === 'content' || type === 'text' || type === 'delta' || type === 'answer') {
            const text = data?.content ?? data?.text ?? data?.delta;
            if (typeof text === 'string') onMessage(text);
          } else if (type === 'message' && onStatusMessage && data?.query) {
            onStatusMessage(`已收到: ${data.query}`);
          } else if (type === 'processing') {
            // Silently ignore processing events
          } else if (type === 'tools' && onToolCall) {
            const params = extractToolParams(data);
            for (const item of params) onToolCall(item);
          } else if (
            (type === 'tools_result_stream' || type === 'tools_result') &&
            onToolResult
          ) {
            const results = extractToolResults(data);
            for (const item of results) onToolResult(item);
          } else if (type !== 'processing' && type !== 'tools' && data?.message && typeof data.message === 'string') {
            onMessage(data.message);
          }
        } catch {
          onMessage(content);
        }
      }
      break;
    }
    case 'heartbeat':
    case 'connected':
      break;
    default:
      break;
  }
}

/**
 * List LiveDocs with pagination and optional keyword filtering.
 * @param {Object} [options]
 * @param {number} [options.page] - Page number (default 1).
 * @param {number} [options.size] - Page size (default 20).
 * @param {string} [options.keyword] - Keyword filter.
 * @param {boolean} [options.json] - Output raw JSON.
 * @param {number} [options.timeoutMs] - Request timeout in ms.
 * @returns {Promise<number>} Exit code 0 or 1.
 */
export async function listLiveDocs(options = {}) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    process.stderr.write(NO_KEY_MESSAGE.trim() + '\n');
    return 1;
  }

  const apiBase = await getApiBase();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const page = options.page ?? 1;
  const size = options.size ?? 20;

  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('size', String(size));
  if (options.keyword) params.set('keyword', options.keyword);

  const url = `${apiBase}/v2/livedocs?${params.toString()}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
    });

    let data = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${getMessage(data)}`);
    }
    if (isApiError(data)) {
      throw new Error(getMessage(data));
    }

    const payload = data?.data ?? {};
    const total = payload.total ?? 0;
    const items = payload.items ?? [];

    if (options.json) {
      console.log(JSON.stringify(payload, null, 2));
    } else {
      const isDev = apiBase.includes('-dev');
      const webHost = isDev ? 'https://dev.felo.ai' : 'https://felo.ai';
      const totalPages = Math.ceil(total / size);
      console.log(`LiveDocs (total: ${total}, page ${page}/${totalPages})\n`);
      for (const item of items) {
        const shortId = item.short_id || '(no ID)';
        console.log(`${webHost}/livedoc/${shortId}`);
      }
    }

    return 0;
  } catch (err) {
    const msg = err?.message || err;
    process.stderr.write(`Error: ${msg}\n`);
    return 1;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * List resources in a specific LiveDoc.
 * @param {string} liveDocId - LiveDoc short_id.
 * @param {Object} [options]
 * @param {boolean} [options.json] - Output raw JSON.
 * @param {number} [options.timeoutMs] - Request timeout in ms.
 * @returns {Promise<number>} Exit code 0 or 1.
 */
export async function listLiveDocResources(liveDocId, options = {}) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    process.stderr.write(NO_KEY_MESSAGE.trim() + '\n');
    return 1;
  }

  const apiBase = await getApiBase();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const url = `${apiBase}/v2/livedocs/${encodeURIComponent(liveDocId)}/resources`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
    });

    let data = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${getMessage(data)}`);
    }
    if (isApiError(data)) {
      throw new Error(getMessage(data));
    }

    const payload = data?.data ?? {};
    const total = payload.total ?? 0;
    const items = payload.items ?? [];

    if (options.json) {
      console.log(JSON.stringify(payload, null, 2));
    } else {
      console.log(`Resources (total: ${total})\n`);
      for (const item of items) {
        const title = item.title || '(no title)';
        const id = item.id || '(no ID)';
        console.log(`[${title}] ${id}`);
      }
    }

    return 0;
  } catch (err) {
    const msg = err?.message || err;
    process.stderr.write(`Error: ${msg}\n`);
    return 1;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Run SuperAgent: create conversation, consume SSE stream, output answer.
 * @param {string} query - User query (1–2000 chars).
 * @param {Object} [options]
 * @param {boolean} [options.json] - Output JSON with answer, thread_short_id, live_doc_short_id.
 * @param {boolean} [options.verbose] - Log stream key / thread / livedoc to stderr.
 * @param {number} [options.timeoutMs] - Request/stream timeout in ms.
 * @param {string} [options.liveDocId] - Reuse existing LiveDoc short_id.
 * @param {string} [options.threadId] - Existing thread/conversation ID for follow-up.
 * @param {string} [options.skillId] - Skill ID (only for new conversations).
 * @param {string[]} [options.selectedResourceIds] - Resource IDs (only for new conversations).
 * @param {Object} [options.ext] - Extra params object (only for new conversations).
 * @param {string} [options.acceptLanguage] - e.g. zh, en.
 * @returns {Promise<number>} Exit code 0 or 1.
 */
export async function superAgent(query, options = {}) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    process.stderr.write(NO_KEY_MESSAGE.trim() + '\n');
    return 1;
  }

  const apiBase = await getApiBase();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const body = {
    query: String(query).trim().slice(0, 2000),
  };
  if (options.liveDocId) body.live_doc_short_id = options.liveDocId;
  if (options.acceptLanguage) body.accept_language = options.acceptLanguage;

  try {
    const threadId = options.threadId;

    // skill_id, selected_resource_ids, ext only supported for new conversations
    const createOnlyParams = ['skillId', 'selectedResourceIds', 'ext'];
    const hasCreateOnlyParams = createOnlyParams.some(k => options[k] !== undefined);
    if (threadId && hasCreateOnlyParams) {
      process.stderr.write('Warning: --skill-id, --selected-resource-ids, --ext are only supported for new conversations, ignored in follow-up mode.\n');
    }
    if (!threadId) {
      if (options.skillId) body.skill_id = options.skillId;
      if (options.selectedResourceIds) body.selected_resource_ids = options.selectedResourceIds;
      if (options.ext) body.ext = options.ext;
    }

    process.stderr.write(threadId ? 'SuperAgent: following up...\n' : 'SuperAgent: creating conversation...\n');

    const createData = await createConversation(apiKey, apiBase, body, timeoutMs, threadId);
    const { stream_key, thread_short_id, live_doc_short_id } = createData;

    if (options.verbose) {
      process.stderr.write(`Stream key: ${stream_key}\n`);
      process.stderr.write(`Thread ID: ${thread_short_id}\n`);
      process.stderr.write(`LiveDoc ID: ${live_doc_short_id}\n`);
    }

    const feloBase = (process.env.FELO_WEB_BASE?.trim() || apiBase.replace(/\/\/openapi-/, '//').replace(/\/\/openapi\./, '//')).replace(/\/$/, '');
    const liveDocUrl = live_doc_short_id ? `${feloBase}/zh-Hans/livedoc/${live_doc_short_id}` : '';

    const chunks = [];
    const toolResults = [];
    const seenKeys = new Set();
    const isJson = options.json;

    // Immediate output for tool invocations (params)
    const onToolCall = (item) => {
      if (isJson) return;
      const { name, params } = item;
      console.log(`\n[Tool: ${name}]`);
      if (name === 'search_x') {
        console.log(`  Query: ${params.query || ''}`);
        if (params.query_type) console.log(`  Type: ${params.query_type}`);
        if (params.limit) console.log(`  Limit: ${params.limit}`);
      } else if (name === 'generate_images') {
        const images = params?.images;
        if (Array.isArray(images)) {
          for (const img of images) {
            console.log(`  Image: ${img.title || '(untitled)'}`);
          }
        }
      } else if (name === 'generate_discovery') {
        console.log(`  Title: ${params.title || params.query || ''}`);
      } else if (name === 'generate_document') {
        console.log(`  Title: ${params.title || ''}`);
      } else if (name === 'generate_ppt') {
        console.log(`  Title: ${params.title || ''}`);
      } else if (name === 'generate_html') {
        console.log(`  Title: ${params.title || ''}`);
      } else {
        console.log(`  Params: ${JSON.stringify(params)}`);
      }
    };

    // Immediate output for tool results
    const onToolResult = (item) => {
      // For types that link to the same livedoc URL, deduplicate by type only
      const LIVEDOC_TYPES = new Set(['document', 'ppt', 'html', 'discovery']);
      const key = item?.image_url || (LIVEDOC_TYPES.has(item?.type) ? item.type : `${item?.type}:${item?.title}`);
      if (seenKeys.has(key)) return;
      seenKeys.add(key);
      toolResults.push(item);

      if (isJson) return;
      if (item.type === 'image') {
        if (liveDocUrl) {
          console.log(`[${item.title || '图片'}](${liveDocUrl})`);
        } else {
          console.log(item.image_url);
        }
      } else if (item.type === 'discovery') {
        if (liveDocUrl) {
          console.log(`[${item.title}](${liveDocUrl})`);
        } else {
          console.log(item.title);
        }
      } else if (item.type === 'document') {
        if (liveDocUrl) {
          console.log(`[${item.title || '文档'}](${liveDocUrl})`);
        } else {
          console.log(item.title || '文档');
        }
      } else if (item.type === 'ppt') {
        if (liveDocUrl) {
          console.log(`[${item.title || 'PPT'}](${liveDocUrl})`);
        } else {
          console.log(item.title || 'PPT');
        }
      } else if (item.type === 'html') {
        if (liveDocUrl) {
          console.log(`[${item.title || 'HTML'}](${liveDocUrl})`);
        } else {
          console.log(item.title || 'HTML');
        }
      } else if (item.type === 'search_x') {
        console.log(`\n[Twitter Search Results] (${item.tweets.length} tweets)`);
        for (const tweet of item.tweets) {
          console.log(formatTweet(tweet));
          console.log('');
        }
      }
    };

    let streamError = null;
    const onEvent = options.verbose
      ? (eventType, dataStr) => {
          process.stderr.write(`[stream] event=${eventType}\n`);
          process.stderr.write(`[stream] data=${dataStr || ''}\n`);
        }
      : undefined;

    const onStatusMessage = (msg) => {
      process.stderr.write(msg + '\n');
    };

    await consumeStream(
      apiKey,
      apiBase,
      stream_key,
      (content) => {
        chunks.push(content);
        if (!isJson) process.stdout.write(content);
      },
      (err) => {
        streamError = err;
      },
      () => {},
      onEvent,
      { onToolCall, onToolResult },
      onStatusMessage
    );

    if (streamError) {
      throw new Error(streamError);
    }

    const answer = chunks.join('').trim();

    if (options.json) {
      const images = toolResults.filter((r) => r.type === 'image');
      const discoveries = toolResults.filter((r) => r.type === 'discovery');
      const documents = toolResults.filter((r) => r.type === 'document');
      const ppts = toolResults.filter((r) => r.type === 'ppt');
      const htmls = toolResults.filter((r) => r.type === 'html');
      const searches = toolResults.filter((r) => r.type === 'search_x');
      console.log(
        JSON.stringify(
          {
            status: 'ok',
            data: {
              answer: answer || null,
              thread_short_id: thread_short_id ?? null,
              live_doc_short_id: live_doc_short_id ?? null,
              image_urls:
                images.length > 0
                  ? images.map((r) => ({ url: r.image_url, title: r.title }))
                  : undefined,
              discoveries:
                discoveries.length > 0
                  ? discoveries.map((r) => ({ title: r.title }))
                  : undefined,
              documents:
                documents.length > 0
                  ? documents.map((r) => ({ title: r.title }))
                  : undefined,
              ppts:
                ppts.length > 0
                  ? ppts.map((r) => ({ title: r.title }))
                  : undefined,
              htmls:
                htmls.length > 0
                  ? htmls.map((r) => ({ title: r.title }))
                  : undefined,
              search_x:
                searches.length > 0
                  ? searches.map((r) => ({ tweets: r.tweets }))
                  : undefined,
              live_doc_url: liveDocUrl || undefined,
            },
          },
          null,
          2
        )
      );
    } else {
      // Text and tool results already printed in real-time via process.stdout.write / onToolResult
      // Just add a trailing newline if there was streaming text
      if (answer) console.log('');
      if (!answer && toolResults.length === 0) {
        console.log('(No content in stream)');
      }
    }

    return 0;
  } catch (err) {
    const msg = err?.message || err;
    process.stderr.write(`Error: ${msg}\n`);
    if (String(msg).toLowerCase().includes('stream error')) {
      process.stderr.write(
        '（流式无客户端超时；若内部接口能拿到完整流，多为代理/防火墙在等待生图等长任务时空闲断连，可直连或调大代理空闲超时后重试）\n'
      );
    }
    return 1;
  }
}
