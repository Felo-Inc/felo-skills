const FELO_API = 'https://openapi.felo.ai/v2/chat';
const DEFAULT_TIMEOUT_MS = 60_000;
const MAX_RETRIES = 3;
const RETRY_BASE_MS = 1000;

const NO_KEY_MESSAGE = `
❌ Felo API Key not configured

To use Felo CLI, set the FELO_API_KEY environment variable or run:

  felo config set FELO_API_KEY <your-api-key>

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

export { getApiKey, fetchWithTimeoutAndRetry, NO_KEY_MESSAGE };

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeoutAndRetry(url, options, timeoutMs = DEFAULT_TIMEOUT_MS) {
  let lastError;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      // Retry on 5xx (server errors)
      if (res.status >= 500 && attempt < MAX_RETRIES) {
        const delay = RETRY_BASE_MS * Math.pow(2, attempt);
        await sleep(delay);
        continue;
      }
      return res;
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;
      if (err.name === 'AbortError') {
        throw new Error(`Request timed out after ${timeoutMs / 1000}s`);
      }
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_BASE_MS * Math.pow(2, attempt);
        await sleep(delay);
        continue;
      }
      throw lastError;
    }
  }
  throw lastError;
}

export async function search(query, options = {}) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    console.error(NO_KEY_MESSAGE.trim());
    return 1;
  }

  try {
    process.stderr.write('Searching...\n');

    const res = await fetchWithTimeoutAndRetry(
      FELO_API,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      },
      options.timeoutMs ?? DEFAULT_TIMEOUT_MS
    );

    const data = await res.json().catch(() => ({}));

    // API error response: { status: "error", code, message } (per doc)
    if (data.status === 'error') {
      const msg = data.message || data.code || 'Unknown error';
      console.error(`Error: ${msg}`);
      return 1;
    }

    if (!res.ok) {
      const msg = data.message || data.error || res.statusText || `HTTP ${res.status}`;
      console.error(`Error: ${msg}`);
      return 1;
    }

    // Success: { status: "ok", data: { answer, query_analysis: { queries }, resources } }
    const payload = data.data;
    if (!payload) {
      console.error('Error: Unexpected response format');
      return 1;
    }

    if (options.json) {
      console.log(JSON.stringify(data, null, 2));
      return 0;
    }

    // Default: only the answer (stdout, pipe-friendly)
    if (payload.answer) {
      console.log(payload.answer);
    }

    // Verbose: add query analysis and sources (per API doc)
    if (options.verbose) {
      const queries = payload.query_analysis?.queries;
      if (Array.isArray(queries) && queries.length) {
        process.stderr.write('\n## Query Analysis\n');
        process.stderr.write(`Optimized search terms: ${queries.join(', ')}\n`);
      }
      const resources = payload.resources;
      if (Array.isArray(resources) && resources.length) {
        process.stderr.write('\n## Sources\n');
        resources.forEach((r) => {
          process.stderr.write(`- ${r.title}: ${r.link}\n`);
        });
      }
    }

    return 0;
  } catch (err) {
    console.error('Error:', err.message || err);
    return 1;
  }
}
