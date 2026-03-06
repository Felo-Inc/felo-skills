import { getApiKey, NO_KEY_MESSAGE } from './search.js';
import * as config from './config.js';

const DEFAULT_API_BASE = 'https://openapi.felo.ai';
const DEFAULT_TIMEOUT_MS = 60_000;

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

function stringifyContent(content) {
  if (content == null) return '';
  if (typeof content === 'string') return content;
  if (typeof content === 'object') {
    if (content.markdown) return content.markdown;
    if (content.text) return content.text;
    if (content.html) return content.html;
    return JSON.stringify(content, null, 2);
  }
  return String(content);
}

async function fetchExtract(apiBase, apiKey, body, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${apiBase}/v2/web/extract`, {
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
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${getMessage(data)}`);
    const code = data.code;
    const hasData = data?.data != null;
    const successCodes = [0, 200];
    const ok =
      successCodes.includes(Number(code)) ||
      code === undefined ||
      code === null ||
      (hasData && res.ok);
    if (!ok) throw new Error(getMessage(data));
    return data;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Run web extract and print result. Returns exit code (0 or 1).
 * @param {Object} opts - { url, format, targetSelector, waitForSelector, readability, timeoutMs, json }
 */
export async function webExtract(opts) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    console.error(NO_KEY_MESSAGE.trim());
    return 1;
  }
  if (!opts?.url || typeof opts.url !== 'string' || !opts.url.trim()) {
    process.stderr.write('ERROR: URL is required and must be a non-empty string.\n');
    return 1;
  }

  const apiBase = await getApiBase();
  const timeoutMs = Number.isFinite(opts.timeoutMs) && opts.timeoutMs > 0
    ? opts.timeoutMs
    : DEFAULT_TIMEOUT_MS;

  process.stderr.write(`Fetching ${opts.url} ...\n`);

  const body = {
    url: opts.url,
    output_format: opts.format || 'markdown',
    crawl_mode: opts.crawlMode || 'fast',
    with_readability: Boolean(opts.readability),
    timeout: timeoutMs,
  };
  if (opts.targetSelector) body.target_selector = opts.targetSelector;
  if (opts.waitForSelector) body.wait_for_selector = opts.waitForSelector;

  try {
    const payload = await fetchExtract(apiBase, apiKey, body, timeoutMs);
    const content = payload?.data?.content;

    if (opts.json) {
      console.log(JSON.stringify(payload, null, 2));
      return 0;
    }

    const out = stringifyContent(content);
    const isEmpty = out == null || String(out).trim() === '';
    if (isEmpty) {
      process.stderr.write(
        `No content extracted from ${opts.url}. The page may be empty, blocked, or the selector did not match.\n`
      );
      return 1;
    }
    console.log(out);
    return 0;
  } catch (err) {
    process.stderr.write(
      `Web extract failed for ${opts.url}: ${err?.message || err}\n`
    );
    return 1;
  }
}
