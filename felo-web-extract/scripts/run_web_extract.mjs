#!/usr/bin/env node

const DEFAULT_API_BASE = 'https://openapi.felo.ai';
const DEFAULT_FORMAT = 'markdown';
const DEFAULT_TIMEOUT_MS = 60_000;
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

function usage() {
  console.error(
    [
      'Usage:',
      '  node felo-web-extract/scripts/run_web_extract.mjs --url <url> [options]',
      '',
      'Options:',
      '  --url <url>           Page URL to extract (required)',
      '  --format <format>     Output format: html, text, markdown (default: markdown)',
      '  --target-selector <s> CSS selector for target element only',
      '  --wait-for-selector <s> Wait for selector before extract',
      '  --readability         Enable readability (main content only)',
      '  --crawl-mode <mode>   fast or fine (default: fast)',
      '  --timeout <ms>        Request timeout in ms (default: 60000)',
      '  --json                Print full API response as JSON',
      '  --help                Show this help',
    ].join('\n')
  );
}

function parseArgs(argv) {
  const out = {
    url: '',
    format: DEFAULT_FORMAT,
    targetSelector: '',
    waitForSelector: '',
    readability: false,
    crawlMode: 'fast',
    timeoutMs: DEFAULT_TIMEOUT_MS,
    json: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--help' || a === '-h') {
      out.help = true;
    } else if (a === '--json') {
      out.json = true;
    } else if (a === '--readability') {
      out.readability = true;
    } else if (a === '--url') {
      const next = argv[i + 1];
      if (next === undefined || next === null || String(next).trim() === '' || String(next).startsWith('-')) {
        out.url = '';
      } else {
        out.url = String(next).trim();
      }
      i += 1;
    } else if (a === '--format') {
      const f = (argv[i + 1] ?? '').toLowerCase();
      out.format = ['html', 'text', 'markdown'].includes(f) ? f : DEFAULT_FORMAT;
      i += 1;
    } else if (a === '--target-selector') {
      out.targetSelector = (argv[i + 1] ?? '').trim();
      i += 1;
    } else if (a === '--wait-for-selector') {
      out.waitForSelector = (argv[i + 1] ?? '').trim();
      i += 1;
    } else if (a === '--crawl-mode') {
      const m = (argv[i + 1] ?? '').toLowerCase();
      out.crawlMode = ['fast', 'fine'].includes(m) ? m : 'fast';
      i += 1;
    } else if (a === '--timeout') {
      const n = Number.parseInt(argv[i + 1] ?? '', 10);
      if (Number.isFinite(n) && n > 0) out.timeoutMs = n;
      i += 1;
    }
  }

  return out;
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

async function fetchJson(url, init, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    let body = {};
    try {
      body = await res.json();
    } catch {
      body = {};
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${getMessage(body)}`);
    }
    const code = body.code;
    const hasData = body?.data != null;
    const successCodes = [0, 200];
    const hasSuccessCode =
      successCodes.includes(Number(code)) ||
      code === undefined ||
      code === null ||
      (hasData && res.ok);
    if (!hasSuccessCode) {
      throw new Error(getMessage(body));
    }
    return body;
  } finally {
    clearTimeout(timer);
  }
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

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    process.exit(0);
  }
  if (!args.url) {
    usage();
    process.exit(1);
  }

  const apiKey = process.env.FELO_API_KEY?.trim();
  if (!apiKey) {
    console.error('ERROR: FELO_API_KEY not set');
    process.exit(1);
  }

  const apiBase = (process.env.FELO_API_BASE?.trim() || DEFAULT_API_BASE).replace(/\/$/, '');

  const shortUrl = args.url.length > 45 ? args.url.slice(0, 42) + '...' : args.url;
  const spinnerId = startSpinner(`Fetching ${shortUrl}`);

  try {
    const body = {
      url: args.url,
      output_format: args.format,
      crawl_mode: args.crawlMode,
      with_readability: args.readability,
      timeout: args.timeoutMs,
    };
    if (args.targetSelector) body.target_selector = args.targetSelector;
    if (args.waitForSelector) body.wait_for_selector = args.waitForSelector;

    const payload = await fetchJson(
      `${apiBase}/v2/web/extract`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
      args.timeoutMs
    );

    const data = payload?.data ?? {};
    const content = data?.content;

    if (args.json) {
      console.log(JSON.stringify(payload, null, 2));
      return;
    }

    const out = stringifyContent(content);
    const isEmpty = out == null || String(out).trim() === '';
    if (isEmpty) {
      stopSpinner(spinnerId);
      process.stderr.write(
        `No content extracted from ${args.url}. The page may be empty, blocked, or the selector did not match.\n`
      );
      process.exit(1);
    }
    console.log(out);
  } finally {
    stopSpinner(spinnerId);
  }
}

main().catch((err) => {
  let url = '';
  const argv = process.argv.slice(2);
  const i = argv.findIndex((a) => a === '--url' || a === '-u');
  if (i >= 0 && argv[i + 1]) url = argv[i + 1];
  process.stderr.write(
    `Web extract failed${url ? ` for ${url}` : ''}: ${err?.message || err}\n`
  );
  process.exit(1);
});
