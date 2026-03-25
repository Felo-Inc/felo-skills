#!/usr/bin/env node

const DEFAULT_API_BASE = 'https://openapi.felo.ai';
const DEFAULT_TIMEOUT_SEC = 60;
const DEFAULT_LAYOUT = 'MIND_MAP';

const VALID_LAYOUTS = [
  'MIND_MAP',
  'LOGICAL_STRUCTURE',
  'ORGANIZATION_STRUCTURE',
  'CATALOG_ORGANIZATION',
  'TIMELINE',
  'FISHBONE',
];

function usage() {
  console.error(
    [
      'Usage:',
      '  node felo-mindmap/scripts/run_mindmap_task.mjs --query "your prompt" [options]',
      '',
      'Options:',
      '  --query <text>              Mindmap topic (required)',
      '  --layout <type>             Layout type (default: MIND_MAP)',
      '  --livedoc-short-id <id>     Add to existing LiveDoc',
      '  --timeout <seconds>         Request timeout, default 60',
      '  --json                      Print JSON output',
      '  --help                      Show this help',
      '',
      'Layout Types:',
      '  MIND_MAP              Classic mind map (default)',
      '  LOGICAL_STRUCTURE     Logical structure diagram',
      '  ORGANIZATION_STRUCTURE Organization chart',
      '  CATALOG_ORGANIZATION  Catalog organization chart',
      '  TIMELINE              Timeline diagram',
      '  FISHBONE              Fishbone diagram',
    ].join('\n')
  );
}

function parseArgs(argv) {
  const out = {
    query: '',
    layout: DEFAULT_LAYOUT,
    livedocShortId: '',
    timeoutSec: DEFAULT_TIMEOUT_SEC,
    json: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--help' || a === '-h') {
      out.help = true;
    } else if (a === '--json') {
      out.json = true;
    } else if (a === '--query') {
      out.query = argv[i + 1] ?? '';
      i += 1;
    } else if (a === '--layout') {
      out.layout = argv[i + 1] ?? '';
      i += 1;
    } else if (a === '--livedoc-short-id') {
      out.livedocShortId = argv[i + 1] ?? '';
      i += 1;
    } else if (a === '--timeout') {
      out.timeoutSec = Number.parseInt(argv[i + 1] ?? '', 10);
      i += 1;
    } else if (!a.startsWith('-') && !out.query) {
      out.query = a;
    }
  }

  if (!Number.isFinite(out.timeoutSec) || out.timeoutSec <= 0) {
    out.timeoutSec = DEFAULT_TIMEOUT_SEC;
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

function isApiError(payload) {
  const status = payload?.status;
  const code = payload?.code;
  if (typeof status === 'string' && status.toLowerCase() === 'error') return true;
  if (typeof code === 'string' && code && code.toUpperCase() !== 'OK') return true;
  return false;
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
    if (isApiError(body)) {
      throw new Error(getMessage(body));
    }
    return body;
  } finally {
    clearTimeout(timer);
  }
}

async function createMindmap(apiKey, apiBase, query, layout, livedocShortId, timeoutMs) {
  const reqBody = { query, layout };
  if (livedocShortId) {
    reqBody.livedoc_short_id = livedocShortId;
  }

  const payload = await fetchJson(
    `${apiBase}/v2/mindmap`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reqBody),
    },
    timeoutMs
  );

  const data = payload?.data ?? {};
  return data;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    process.exit(0);
  }
  if (!args.query) {
    usage();
    process.exit(1);
  }

  const apiKey = process.env.FELO_API_KEY?.trim();
  if (!apiKey) {
    console.error('ERROR: FELO_API_KEY not set');
    console.error('');
    console.error('Setup instructions:');
    console.error('1. Visit https://felo.ai');
    console.error('2. Open Settings -> API Keys');
    console.error('3. Create and copy your API key');
    console.error('4. Set environment variable: export FELO_API_KEY="your-api-key"');
    process.exit(1);
  }

  // Validate layout type
  const layoutUpper = args.layout.toUpperCase();
  if (!VALID_LAYOUTS.includes(layoutUpper)) {
    console.error(`ERROR: Invalid layout type "${args.layout}"`);
    console.error('');
    console.error('Available layout types:');
    VALID_LAYOUTS.forEach((l) => console.error(`  - ${l}`));
    process.exit(1);
  }

  const apiBase = (process.env.FELO_API_BASE?.trim() || DEFAULT_API_BASE).replace(/\/$/, '');
  const timeoutMs = args.timeoutSec * 1000;

  try {
    const data = await createMindmap(
      apiKey,
      apiBase,
      args.query,
      layoutUpper,
      args.livedocShortId,
      timeoutMs
    );

    if (args.json) {
      console.log(
        JSON.stringify(
          {
            status: 'ok',
            data: {
              resource_id: data.resource_id ?? null,
              mindmap_status: data.status ?? null,
              mindmap_url: data.mindmap_url ?? null,
              livedoc_short_id: data.livedoc_short_id ?? null,
              message: data.message ?? null,
            },
          },
          null,
          2
        )
      );
    } else {
      console.log(data.mindmap_url || data.message || 'Mindmap created successfully');
    }
  } catch (err) {
    const errMsg = err?.message || err;
    console.error(`ERROR: ${errMsg}`);

    // Provide helpful guidance for known error patterns
    if (errMsg.includes('401') || errMsg.includes('INVALID_API_KEY')) {
      console.error('');
      console.error('Your API key may be invalid or expired.');
      console.error('Please check your API key at https://felo.ai -> Settings -> API Keys');
    } else if (errMsg.includes('timeout') || errMsg.includes('AbortError')) {
      console.error('');
      console.error('Request timed out. Try increasing --timeout or retry later.');
    }

    process.exit(1);
  }
}

main();