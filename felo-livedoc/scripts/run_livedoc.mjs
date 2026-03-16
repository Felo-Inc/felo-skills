#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

const DEFAULT_API_BASE = 'https://openapi.felo.ai';
const DEFAULT_TIMEOUT_MS = 60_000;
const MAX_RETRIES = 3;
const RETRY_BASE_MS = 1000;
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

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function getMessage(p) {
  return p?.message || p?.error || p?.msg || p?.code || 'Unknown error';
}

async function fetchWithRetry(url, init, timeoutMs) {
  let lastError;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      if (res.status >= 500 && attempt < MAX_RETRIES) {
        await sleep(RETRY_BASE_MS * Math.pow(2, attempt));
        continue;
      }
      return res;
    } catch (err) {
      lastError = err;
      if (err.name === 'AbortError') throw new Error(`Request timed out after ${timeoutMs / 1000}s`);
      if (attempt < MAX_RETRIES) { await sleep(RETRY_BASE_MS * Math.pow(2, attempt)); continue; }
      throw lastError;
    } finally { clearTimeout(timer); }
  }
  throw lastError;
}

async function apiRequest(method, apiPath, body, apiKey, apiBase, timeoutMs) {
  const url = `${apiBase}/v2${apiPath}`;
  const headers = { Accept: 'application/json', Authorization: `Bearer ${apiKey}` };
  const init = { method, headers };
  if (body !== undefined && body !== null) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }
  const res = await fetchWithRetry(url, init, timeoutMs);
  let data = {};
  try { data = await res.json(); } catch { data = {}; }
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${getMessage(data)}`);
  if (data.status === 'error') throw new Error(getMessage(data));
  return data;
}

async function uploadFormData(apiPath, formData, apiKey, apiBase, timeoutMs) {
  const url = `${apiBase}/v2${apiPath}`;
  const res = await fetchWithRetry(
    url,
    { method: 'POST', headers: { Accept: 'application/json', Authorization: `Bearer ${apiKey}` }, body: formData },
    timeoutMs,
  );
  let data = {};
  try { data = await res.json(); } catch { data = {}; }
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${getMessage(data)}`);
  if (data.status === 'error') throw new Error(getMessage(data));
  return data;
}

// ── Formatting ──

function formatLiveDoc(doc) {
  if (!doc) return '';
  let out = `## ${doc.name || '(untitled)'}\n`;
  out += `- ID: \`${doc.short_id}\`\n`;
  if (doc.description) out += `- Description: ${doc.description}\n`;
  if (doc.icon) out += `- Icon: ${doc.icon}\n`;
  if (doc.created_at) out += `- Created: ${doc.created_at}\n`;
  if (doc.modified_at) out += `- Modified: ${doc.modified_at}\n`;
  out += '\n';
  return out;
}

function formatResource(r) {
  if (!r) return '';
  let out = `### ${r.title || '(untitled)'}\n`;
  out += `- Resource ID: \`${r.id}\`\n`;
  if (r.resource_type) out += `- Type: ${r.resource_type}\n`;
  if (r.status) out += `- Status: ${r.status}\n`;
  if (r.source) out += `- Source: ${r.source}\n`;
  if (r.link) out += `- Link: ${r.link}\n`;
  if (r.snippet) out += `- Snippet: ${r.snippet}\n`;
  if (r.created_at) out += `- Created: ${r.created_at}\n`;
  out += '\n';
  return out;
}
function formatRetrieveResult(r) {
  if (!r) return '';
  const score = r.score != null ? `${(r.score * 100).toFixed(1)}%` : 'N/A';
  let out = `### ${r.title || '(untitled)'} (score: ${score})\n`;
  out += `- ID: \`${r.id}\`\n`;
  if (r.content) {
    const preview = r.content.length > 300 ? r.content.slice(0, 300) + '...' : r.content;
    out += `- Content: ${preview}\n`;
  }
  out += '\n';
  return out;
}

// ── CLI ──

function usage() {
  console.error([
    'Usage: node run_livedoc.mjs <action> [args] [options]',
    '',
    'Actions:',
    '  create                Create a LiveDoc (--name required)',
    '  list                  List LiveDocs',
    '  update <short_id>     Update a LiveDoc',
    '  delete <short_id>     Delete a LiveDoc',
    '  resources <short_id>  List resources',
    '  resource <short_id> <resource_id>  Get a resource',
    '  add-doc <short_id>    Create text document (--content required)',
    '  add-urls <short_id>   Add URLs (--urls required, comma-separated, max 10)',
    '  upload <short_id>     Upload file (--file required, --convert optional)',
    '  remove-resource <short_id> <resource_id>  Delete a resource',
    '  retrieve <short_id>   Semantic search (--query required, --resource-ids optional)',
    '  route <short_id>      Route relevant resources by query (--query required)',
    '  download <short_id> <resource_id>  Get download URL for source file',
    '  content <short_id> <resource_id>   Get text content of a resource',
    '  ppt-retrieve <short_id>  PPT page deep retrieval (--resource-id, --page-number, --query required)',
    '',
    'Options:',
    '  --name <name>         LiveDoc name',
    '  --description <desc>  LiveDoc description',
    '  --icon <icon>         LiveDoc icon',
    '  --keyword <kw>        Search keyword (list)',
    '  --page <n>            Page number',
    '  --size <n>            Page size',
    '  --type <type>         Resource type filter',
    '  --content <text>      Document content',
    '  --title <title>       Document title',
    '  --urls <urls>         Comma-separated URLs',
    '  --file <path>         File path to upload',
    '  --convert             Convert uploaded file to document',
    '  --query <text>        Retrieval/route query',
    '  --resource-ids <ids>  Comma-separated resource IDs to search within (retrieve)',
    '  --max-resources <n>   Max resources to return (route)',
    '  --resource-id <id>    PPT resource ID (ppt-retrieve)',
    '  --page-number <n>     PPT page number, starts from 1 (ppt-retrieve)',
    '  --max-chunk <n>       Max chunks to return (ppt-retrieve, default 3)',
    '  --expires-in <s>      Presigned URL expiry in seconds (download, default 3600)',
    '  -j, --json            Output raw JSON',
    '  -t, --timeout <ms>    Timeout in ms (default: 60000)',
    '  --help                Show this help',
  ].join('\n'));
}
function parseArgs(argv) {
  const out = {
    action: '', positional: [], name: '', description: '', icon: '',
    keyword: '', page: '', size: '', type: '', content: '', title: '',
    urls: '', file: '', convert: false, query: '', resourceIds: '', maxResources: '',
    resourceId: '', pageNumber: '', maxChunk: '', expiresIn: '',
    json: false, timeoutMs: DEFAULT_TIMEOUT_MS, help: false,
  };
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') out.help = true;
    else if (a === '--json' || a === '-j') out.json = true;
    else if (a === '--convert') out.convert = true;
    else if (a === '--name') out.name = argv[++i] || '';
    else if (a === '--description') out.description = argv[++i] || '';
    else if (a === '--icon') out.icon = argv[++i] || '';
    else if (a === '--keyword') out.keyword = argv[++i] || '';
    else if (a === '--page') out.page = argv[++i] || '';
    else if (a === '--size') out.size = argv[++i] || '';
    else if (a === '--type') out.type = argv[++i] || '';
    else if (a === '--content') out.content = argv[++i] || '';
    else if (a === '--title') out.title = argv[++i] || '';
    else if (a === '--urls') out.urls = argv[++i] || '';
    else if (a === '--file') out.file = argv[++i] || '';
    else if (a === '--query') out.query = argv[++i] || '';
    else if (a === '--resource-ids') out.resourceIds = argv[++i] || '';
    else if (a === '--max-resources') out.maxResources = argv[++i] || '';
    else if (a === '--resource-id') out.resourceId = argv[++i] || '';
    else if (a === '--page-number') out.pageNumber = argv[++i] || '';
    else if (a === '--max-chunk') out.maxChunk = argv[++i] || '';
    else if (a === '--expires-in') out.expiresIn = argv[++i] || '';
    else if (a === '-t' || a === '--timeout') {
      const n = parseInt(argv[++i] || '', 10);
      if (Number.isFinite(n) && n > 0) out.timeoutMs = n;
    }
    else if (!a.startsWith('-')) positional.push(a);
  }
  out.action = positional[0] || '';
  out.positional = positional.slice(1);
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.action) { usage(); process.exit(args.help ? 0 : 1); }

  const apiKey = process.env.FELO_API_KEY?.trim();
  if (!apiKey) { console.error('ERROR: FELO_API_KEY not set'); process.exit(1); }

  const apiBase = (process.env.FELO_API_BASE?.trim() || DEFAULT_API_BASE).replace(/\/$/, '');
  const { action, positional, json, timeoutMs } = args;
  const shortId = positional[0] || '';
  const resourceId = positional[1] || '';

  let code = 1;
  let spinnerId;
  try {
    switch (action) {
      case 'create': {
        if (!args.name) { console.error('ERROR: --name is required'); break; }
        spinnerId = startSpinner('Creating LiveDoc');
        const body = { name: args.name };
        if (args.description) body.description = args.description;
        if (args.icon) body.icon = args.icon;
        const payload = await apiRequest('POST', '/livedocs', body, apiKey, apiBase, timeoutMs);
        if (json) { console.log(JSON.stringify(payload, null, 2)); }
        else { process.stdout.write('LiveDoc created!\n\n'); process.stdout.write(formatLiveDoc(payload?.data)); }
        code = 0;
        break;
      }
      case 'list': {
        spinnerId = startSpinner('Listing LiveDocs');
        const params = new URLSearchParams();
        if (args.keyword) params.set('keyword', args.keyword);
        if (args.page) params.set('page', args.page);
        if (args.size) params.set('size', args.size);
        const qs = params.toString();
        const payload = await apiRequest('GET', `/livedocs${qs ? `?${qs}` : ''}`, null, apiKey, apiBase, timeoutMs);
        if (json) { console.log(JSON.stringify(payload, null, 2)); }
        else {
          const items = payload?.data?.items || [];
          if (!items.length) { process.stderr.write('No LiveDocs found.\n'); }
          else {
            process.stdout.write(`Found ${payload.data.total || items.length} LiveDoc(s)\n\n`);
            for (const doc of items) process.stdout.write(formatLiveDoc(doc));
          }
        }
        code = 0;
        break;
      }
      case 'update': {
        if (!shortId) { console.error('ERROR: short_id is required'); break; }
        spinnerId = startSpinner('Updating LiveDoc');
        const body = {};
        if (args.name) body.name = args.name;
        if (args.description) body.description = args.description;
        const payload = await apiRequest('PUT', `/livedocs/${shortId}`, body, apiKey, apiBase, timeoutMs);
        if (json) { console.log(JSON.stringify(payload, null, 2)); }
        else { process.stdout.write('LiveDoc updated!\n\n'); process.stdout.write(formatLiveDoc(payload?.data)); }
        code = 0;
        break;
      }
      case 'delete': {
        if (!shortId) { console.error('ERROR: short_id is required'); break; }
        spinnerId = startSpinner('Deleting LiveDoc');
        await apiRequest('DELETE', `/livedocs/${shortId}`, null, apiKey, apiBase, timeoutMs);
        if (json) { console.log(JSON.stringify({ status: 'ok' }, null, 2)); }
        else { process.stdout.write(`LiveDoc \`${shortId}\` deleted.\n`); }
        code = 0;
        break;
      }
      case 'resources': {
        if (!shortId) { console.error('ERROR: short_id is required'); break; }
        spinnerId = startSpinner('Listing resources');
        const params = new URLSearchParams();
        if (args.type) params.set('resource_types', args.type);
        if (args.page) params.set('page', args.page);
        if (args.size) params.set('size', args.size);
        const qs = params.toString();
        const payload = await apiRequest('GET', `/livedocs/${shortId}/resources${qs ? `?${qs}` : ''}`, null, apiKey, apiBase, timeoutMs);
        if (json) { console.log(JSON.stringify(payload, null, 2)); }
        else {
          const items = payload?.data?.items || [];
          if (!items.length) { process.stderr.write('No resources found.\n'); }
          else {
            process.stdout.write(`Found ${payload.data.total || items.length} resource(s)\n\n`);
            for (const r of items) process.stdout.write(formatResource(r));
          }
        }
        code = 0;
        break;
      }
      case 'resource': {
        if (!shortId || !resourceId) { console.error('ERROR: short_id and resource_id are required'); break; }
        spinnerId = startSpinner('Fetching resource');
        const payload = await apiRequest('GET', `/livedocs/${shortId}/resources/${resourceId}`, null, apiKey, apiBase, timeoutMs);
        if (json) { console.log(JSON.stringify(payload, null, 2)); }
        else { process.stdout.write(formatResource(payload?.data)); }
        code = 0;
        break;
      }
      case 'add-doc': {
        if (!shortId) { console.error('ERROR: short_id is required'); break; }
        if (!args.content) { console.error('ERROR: --content is required'); break; }
        spinnerId = startSpinner('Creating document');
        const body = { content: args.content };
        if (args.title) body.title = args.title;
        const payload = await apiRequest('POST', `/livedocs/${shortId}/resources/doc`, body, apiKey, apiBase, timeoutMs);
        if (json) { console.log(JSON.stringify(payload, null, 2)); }
        else { process.stdout.write('Document created!\n\n'); process.stdout.write(formatResource(payload?.data)); }
        code = 0;
        break;
      }
      case 'add-urls': {
        if (!shortId) { console.error('ERROR: short_id is required'); break; }
        if (!args.urls) { console.error('ERROR: --urls is required'); break; }
        const urls = args.urls.split(',').map(u => u.trim()).filter(Boolean);
        if (urls.length > 10) { console.error('ERROR: maximum 10 URLs allowed'); break; }
        spinnerId = startSpinner(`Adding ${urls.length} URL(s)`);
        const payload = await apiRequest('POST', `/livedocs/${shortId}/resources/urls`, { urls }, apiKey, apiBase, timeoutMs);
        if (json) { console.log(JSON.stringify(payload, null, 2)); }
        else {
          for (const r of (payload?.data || [])) {
            const icon = r.status === 'success' ? '✓' : r.status === 'existed' ? '~' : '✗';
            let line = `${icon} ${r.url} → ${r.status}`;
            if (r.resource_id) line += ` (id: ${r.resource_id})`;
            if (r.fail_reason) line += ` (${r.fail_reason})`;
            process.stdout.write(line + '\n');
          }
        }
        code = 0;
        break;
      }
      case 'upload': {
        if (!shortId) { console.error('ERROR: short_id is required'); break; }
        if (!args.file) { console.error('ERROR: --file is required'); break; }
        const endpoint = args.convert ? 'upload-doc' : 'upload';
        spinnerId = startSpinner(`Uploading file (${endpoint})`);
        const fileBuffer = await fs.readFile(args.file);
        const blob = new Blob([fileBuffer]);
        const formData = new FormData();
        formData.append('file', blob, path.basename(args.file));
        const payload = await uploadFormData(`/livedocs/${shortId}/resources/${endpoint}`, formData, apiKey, apiBase, timeoutMs);
        if (json) { console.log(JSON.stringify(payload, null, 2)); }
        else { process.stdout.write('File uploaded!\n\n'); process.stdout.write(formatResource(payload?.data)); }
        code = 0;
        break;
      }
      case 'remove-resource': {
        if (!shortId || !resourceId) { console.error('ERROR: short_id and resource_id are required'); break; }
        spinnerId = startSpinner('Deleting resource');
        await apiRequest('DELETE', `/livedocs/${shortId}/resources/${resourceId}`, null, apiKey, apiBase, timeoutMs);
        if (json) { console.log(JSON.stringify({ status: 'ok' }, null, 2)); }
        else { process.stdout.write(`Resource \`${resourceId}\` deleted.\n`); }
        code = 0;
        break;
      }
      case 'retrieve': {
        if (!shortId) { console.error('ERROR: short_id is required'); break; }
        if (!args.query) { console.error('ERROR: --query is required'); break; }
        spinnerId = startSpinner('Retrieving from knowledge base');
        const body = { query: args.query };
        if (args.resourceIds) {
          body.resource_ids = args.resourceIds.split(',').map(id => id.trim()).filter(Boolean);
        }
        const payload = await apiRequest('POST', `/livedocs/${shortId}/resources/retrieve`, body, apiKey, apiBase, timeoutMs);
        if (json) { console.log(JSON.stringify(payload, null, 2)); }
        else {
          const results = payload?.data || [];
          if (!results.length) { process.stderr.write('No results found.\n'); }
          else {
            process.stdout.write(`Found ${results.length} result(s)\n\n`);
            for (const r of results) process.stdout.write(formatRetrieveResult(r));
          }
        }
        code = 0;
        break;
      }
      case 'route': {
        if (!shortId) { console.error('ERROR: short_id is required'); break; }
        if (!args.query) { console.error('ERROR: --query is required'); break; }
        spinnerId = startSpinner('Routing relevant resources');
        const body = { query: args.query };
        if (args.maxResources) {
          const n = parseInt(args.maxResources, 10);
          if (Number.isFinite(n) && n > 0) body.max_resources = n;
        }
        const payload = await apiRequest('POST', `/livedocs/${shortId}/resources/route`, body, apiKey, apiBase, timeoutMs);
        if (json) { console.log(JSON.stringify(payload, null, 2)); }
        else {
          const resourceIds = payload?.data || [];
          if (!resourceIds.length) { process.stderr.write('No relevant resources found.\n'); }
          else {
            process.stdout.write(`Found ${resourceIds.length} relevant resource(s):\n\n`);
            for (const id of resourceIds) process.stdout.write(`- ${id}\n`);
          }
        }
        code = 0;
        break;
      }
      case 'download': {
        if (!shortId) { console.error('ERROR: short_id is required'); break; }
        if (!resourceId) { console.error('ERROR: resource_id is required'); break; }
        spinnerId = startSpinner('Getting download URL');
        const url = `${apiBase}/v2/livedocs/${shortId}/resources/${resourceId}/download${args.expiresIn ? `?expires_in=${args.expiresIn}` : ''}`;
        const res = await fetchWithRetry(url, { method: 'GET', headers: { Authorization: `Bearer ${apiKey}` }, redirect: 'manual' }, timeoutMs);
        const location = res.headers.get('location');
        if (json) { console.log(JSON.stringify({ download_url: location }, null, 2)); }
        else { process.stdout.write(`Download URL:\n${location || ''}\n`); }
        code = 0;
        break;
      }
      case 'content': {
        if (!shortId) { console.error('ERROR: short_id is required'); break; }
        if (!resourceId) { console.error('ERROR: resource_id is required'); break; }
        spinnerId = startSpinner('Fetching resource content');
        const payload = await apiRequest('GET', `/livedocs/${shortId}/resources/${resourceId}/content`, null, apiKey, apiBase, timeoutMs);
        if (json) { console.log(JSON.stringify(payload, null, 2)); }
        else {
          const d = payload?.data;
          process.stdout.write(`## ${d?.title || '(untitled)'}\n- Type: ${d?.type}\n\n${d?.content || '(empty)'}\n`);
        }
        code = 0;
        break;
      }
      case 'ppt-retrieve': {
        if (!shortId) { console.error('ERROR: short_id is required'); break; }
        if (!args.resourceId) { console.error('ERROR: --resource-id is required'); break; }
        if (!args.pageNumber) { console.error('ERROR: --page-number is required'); break; }
        if (!args.query) { console.error('ERROR: --query is required'); break; }
        spinnerId = startSpinner('Retrieving PPT page content');
        const body = { resource_id: args.resourceId, page_number: parseInt(args.pageNumber, 10), query: args.query };
        if (args.maxChunk) { const n = parseInt(args.maxChunk, 10); if (Number.isFinite(n) && n > 0) body.max_chunk = n; }
        const payload = await apiRequest('POST', `/livedocs/${shortId}/resources/ppt-retrieve`, body, apiKey, apiBase, timeoutMs);
        if (json) { console.log(JSON.stringify(payload, null, 2)); }
        else {
          const results = payload?.data || [];
          if (!results.length) { process.stderr.write('No results found.\n'); }
          else {
            process.stdout.write(`Found ${results.length} result(s)\n\n`);
            for (const r of results) process.stdout.write(formatRetrieveResult(r));
          }
        }
        code = 0;
        break;
      }
      default:
        console.error(`Unknown action: ${action}`);
        usage();
    }
  } catch (err) {
    process.stderr.write(`Error: ${err?.message || err}\n`);
  } finally {
    stopSpinner(spinnerId);
  }

  process.exit(code);
}

main().catch((err) => {
  process.stderr.write(`Fatal: ${err?.message || err}\n`);
  process.exit(1);
});
