import { getApiKey, fetchWithTimeoutAndRetry, NO_KEY_MESSAGE } from './search.js';

const DEFAULT_API_BASE = 'https://openapi.felo.ai';
const DEFAULT_REQUEST_TIMEOUT_MS = 60_000;
const POLL_INTERVAL_MS = 10_000;
const MAX_POLL_TIMEOUT_MS = 1_200_000; // 20 minutes max wait

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const STATUS_LINE_PAD = 50;

/** API base URL (default https://openapi.felo.ai). Override via FELO_API_BASE env or config if needed. */
async function getApiBase() {
  let base = process.env.FELO_API_BASE?.trim();
  if (!base) {
    const { getConfigValue } = await import('./config.js');
    const v = await getConfigValue('FELO_API_BASE');
    base = typeof v === 'string' ? v.trim() : '';
  }
  const normalized = (base || DEFAULT_API_BASE).replace(/\/$/, '');
  return normalized;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Write a single overwritable status line: spinner + elapsed. Call clearStatusLine() before next stdout. */
function writeStatusLine(spinnerFrame, elapsedSec) {
  const s = `Generating slides... ${spinnerFrame} ${elapsedSec}s`;
  const padded = s.padEnd(STATUS_LINE_PAD, ' ');
  process.stderr.write(`\r${padded}`);
}

function clearStatusLine() {
  process.stderr.write(`\r${' '.repeat(STATUS_LINE_PAD)}\r`);
}

function normalizeTaskStatus(status) {
  return String(status || '').trim().toUpperCase();
}

/**
 * Create a PPT task. Returns { task_id, livedoc_short_id, ppt_business_id } or throws.
 * Uses fetchWithTimeoutAndRetry for 5xx retry (per PPT Task API error codes).
 */
async function createPptTask(apiKey, query, timeoutMs, apiBase) {
  const url = `${apiBase}/v2/ppts`;
  const res = await fetchWithTimeoutAndRetry(
    url,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: query.trim() }),
    },
    timeoutMs
  );

  const data = await res.json().catch(() => ({}));

  if (data.status === 'error') {
    const msg = data.message || data.code || 'Unknown error';
    throw new Error(msg);
  }

  if (!res.ok) {
    const msg = data.message || data.error || res.statusText || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  const payload = data.data;
  if (!payload || !payload.task_id) {
    throw new Error('Unexpected response: missing task_id');
  }

  return payload;
}

/**
 * Get task historical info. Returns { task_status, live_doc_url?, live_doc_short_id? } or throws.
 * Uses fetchWithTimeoutAndRetry for 5xx retry (per PPT Task API error codes).
 */
async function getTaskHistorical(apiKey, taskId, timeoutMs, apiBase) {
  const url = `${apiBase}/v2/tasks/${encodeURIComponent(taskId)}/historical`;
  const res = await fetchWithTimeoutAndRetry(
    url,
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    },
    timeoutMs
  );

  const data = await res.json().catch(() => ({}));

  if (data.status === 'error') {
    const msg = data.message || data.code || 'Unknown error';
    throw new Error(msg);
  }

  if (!res.ok) {
    const msg = data.message || data.error || res.statusText || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  const payload = data.data;
  if (!payload) {
    throw new Error('Unexpected response: missing data');
  }

  return {
    task_status: payload.task_status ?? payload.status,
    live_doc_url: payload.live_doc_url,
    live_doc_short_id: payload.live_doc_short_id ?? payload.livedoc_short_id,
  };
}

/**
 * Run slides: create PPT task, poll until terminal state, output URL or error.
 * @returns {Promise<number>} exit code (0 success, 1 failure)
 */
export async function slides(query, options = {}) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    console.error(NO_KEY_MESSAGE.trim());
    return 1;
  }

  const requestTimeoutMs = options.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;
  const pollTimeoutMs = options.pollTimeoutMs ?? MAX_POLL_TIMEOUT_MS;
  const pollIntervalMs = options.pollIntervalMs ?? POLL_INTERVAL_MS;

  try {
    const apiBase = await getApiBase();

    process.stderr.write('Creating PPT task...\n');

    const createResult = await createPptTask(apiKey, query, requestTimeoutMs, apiBase);
    const taskId = createResult.task_id;

    if (options.json && options.verbose) {
      process.stderr.write(`Task ID: ${taskId}\n`);
    }

    const useLiveStatus =
      process.stderr.isTTY && !options.verbose && !options.json;
    if (!useLiveStatus) {
      process.stderr.write('Generating slides (this may take a minute)...\n');
    }

    const startTime = Date.now();
    let lastStatus;
    let spinIndex = 0;
    if (useLiveStatus) writeStatusLine(SPINNER_FRAMES[0], 0);

    while (Date.now() - startTime < pollTimeoutMs) {
      await sleep(pollIntervalMs);

      const historical = await getTaskHistorical(apiKey, taskId, requestTimeoutMs, apiBase);
      const normalizedStatus = normalizeTaskStatus(historical.task_status);
      lastStatus = normalizedStatus || historical.task_status;

      if (useLiveStatus) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        spinIndex = (spinIndex + 1) % SPINNER_FRAMES.length;
        writeStatusLine(SPINNER_FRAMES[spinIndex], elapsed);
      }

      const done = normalizedStatus === 'COMPLETED' || normalizedStatus === 'SUCCESS';
      if (done) {
        if (useLiveStatus) clearStatusLine();
        const url =
          historical.live_doc_url ||
          (historical.live_doc_short_id ? `https://felo.ai/livedoc/${historical.live_doc_short_id}` : null) ||
          (createResult.livedoc_short_id ? `https://felo.ai/livedoc/${createResult.livedoc_short_id}` : null);
        if (options.json) {
          console.log(
            JSON.stringify(
              {
                status: 'ok',
                data: {
                  task_id: taskId,
                  task_status: normalizedStatus || historical.task_status,
                  live_doc_url: url,
                  livedoc_short_id: createResult.livedoc_short_id,
                  ppt_business_id: createResult.ppt_business_id,
                },
              },
              null,
              2
            )
          );
        } else {
          if (url) {
            console.log(url);
          } else {
            if (useLiveStatus) clearStatusLine();
            console.error('Error: Completed but no live_doc_url in response');
            return 1;
          }
        }
        return 0;
      }

      if (
        normalizedStatus === 'FAILED' ||
        normalizedStatus === 'ERROR'
      ) {
        if (useLiveStatus) clearStatusLine();
        console.error(`Error: Task finished with status: ${normalizedStatus || historical.task_status}`);
        return 1;
      }

      if (options.verbose) {
        process.stderr.write(`  Status: ${normalizedStatus || historical.task_status || 'UNKNOWN'}\n`);
      }
    }

    if (useLiveStatus) clearStatusLine();
    console.error(
      `Error: Timed out after ${pollTimeoutMs / 1000}s. Last status: ${lastStatus ?? 'unknown'}`
    );
    return 1;
  } catch (err) {
    if (process.stderr.isTTY && !options.verbose && !options.json) clearStatusLine();
    console.error('Error:', err.message || err);
    return 1;
  }
}
