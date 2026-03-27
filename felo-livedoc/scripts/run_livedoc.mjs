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
  if (!process.stderr.isTTY) return null;
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
  if (process.stderr.isTTY) process.stderr.write(`\r${' '.repeat(STATUS_PAD)}\r`);
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
  if (doc.is_shared != null) out += `- Shared: ${doc.is_shared}\n`;
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

function formatTask(t) {
  if (!t) return '';
  let out = `### ${t.title || '(untitled)'}\n`;
  out += `- Task ID: \`${t.id}\`\n`;
  out += `- Status: ${t.status === 0 ? 'TODO' : t.status === 1 ? 'IN_PROGRESS' : t.status === 2 ? 'DONE' : t.status}\n`;
  if (t.sort != null) out += `- Sort: ${t.sort}\n`;
  if (t.description) out += `- Description: ${t.description}\n`;
  if (t.labels?.length) out += `- Labels: ${t.labels.join(', ')}\n`;
  if (t.created_at) out += `- Created: ${t.created_at}\n`;
  out += '\n';
  return out;
}

function formatTaskRecord(r) {
  if (!r) return '';
  let out = `- [${r.record_type}] `;
  if (r.content) out += r.content;
  else if (r.meta) out += JSON.stringify(r.meta);
  out += `  (id: ${r.id}, ${r.created_at || ''})\n`;
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
    '  update-resource <short_id> <resource_id>  Update resource title/snippet/thumbnail',
    '  update-resource-content <short_id> <resource_id>  Update ai_doc content (--content required)',
    '  retrieve <short_id>   Semantic search (--query required, --resource-ids optional)',
    '  route <short_id>      Route relevant resources by query (--query required)',
    '  download <short_id> <resource_id>  Download source file to disk',
    '  content <short_id> <resource_id>   Get text content of a resource',
    '  ppt-retrieve <short_id>  PPT page deep retrieval (--resource-id, --page-number, --query required)',
    '  get-readme <short_id>    Get README content',
    '  update-readme <short_id> Create or replace README (--content required)',
    '  append-readme <short_id> Append to README (--content required)',
    '  delete-readme <short_id> Delete README',
    '  tasks <short_id>         List tasks (--status, --labels optional)',
    '  create-task <short_id>   Create a task (--title required; --status default 0, --sort default 0)',
    '  update-task <short_id> <task_id>  Partially update a task',
    '  delete-task <short_id> <task_id>  Delete a task',
    '  task-records <short_id> <task_id> List task records (comments + history)',
    '  add-task-comment <short_id> <task_id>  Add a comment (--content required)',
    '',
    'Options:',
    '  --name <name>         LiveDoc name',
    '  --description <desc>  LiveDoc description',
    '  --icon <icon>         LiveDoc icon',
    '  --keyword <kw>        Search keyword (list)',
    '  --page <n>            Page number',
    '  --size <n>            Page size',
    '  --type <type>         Resource type filter',
    '  --content <text>      Document/README/comment content',
    '  --title <title>       Document/task title',
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
    '  --output <path>       Output file path (download, default: filename from response)',
    '  --status <n>          Task status: 0=TODO, 1=IN_PROGRESS, 2=DONE',
    '  --sort <n>            Task sort order (non-negative integer)',
    '  --labels <labels>     Comma-separated labels (tasks)',
    '  --record-type <type>  Record type filter: comment, edit, status_change',
    '  --operated-by <sig>   Operator signature, e.g. claude-code, openclaw (max 100 chars)',
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
    resourceId: '', pageNumber: '', maxChunk: '', expiresIn: '', output: '',
    status: '', sort: '', labels: '', recordType: '', operatedBy: '',
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
    else if (a === '--output') out.output = argv[++i] || '';
    else if (a === '--status') out.status = argv[++i] || '';
    else if (a === '--sort') out.sort = argv[++i] || '';
    else if (a === '--labels') out.labels = argv[++i] || '';
    else if (a === '--record-type') out.recordType = argv[++i] || '';
    else if (a === '--operated-by') out.operatedBy = argv[++i] || '';
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
      case 'update-resource': {
        if (!shortId || !resourceId) { console.error('ERROR: short_id and resource_id are required'); break; }
        spinnerId = startSpinner('Updating resource');
        const body = {};
        if (args.title !== undefined) body.title = args.title;
        if (args.snippet !== undefined) body.snippet = args.snippet;
        if (args.thumbnail !== undefined) body.thumbnail = args.thumbnail;
        const payload = await apiRequest('PUT', `/livedocs/${shortId}/resources/${resourceId}`, body, apiKey, apiBase, timeoutMs);
        if (json) { console.log(JSON.stringify(payload, null, 2)); }
        else { process.stdout.write('Resource updated!\n\n'); process.stdout.write(formatResource(payload?.data)); }
        code = 0;
        break;
      }
      case 'update-resource-content': {
        if (!shortId || !resourceId) { console.error('ERROR: short_id and resource_id are required'); break; }
        if (!args.content) { console.error('ERROR: --content is required'); break; }
        spinnerId = startSpinner('Updating resource content');
        const payload = await apiRequest('PUT', `/livedocs/${shortId}/resources/${resourceId}/content`, { content: args.content }, apiKey, apiBase, timeoutMs);
        if (json) { console.log(JSON.stringify(payload, null, 2)); }
        else { process.stdout.write('Resource content updated.\n'); }
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
        spinnerId = startSpinner('Downloading resource');
        const dlUrl = `${apiBase}/v2/livedocs/${shortId}/resources/${resourceId}/download${args.expiresIn ? `?expires_in=${args.expiresIn}` : ''}`;
        const dlRes = await fetchWithRetry(dlUrl, { method: 'GET', headers: { Authorization: `Bearer ${apiKey}` }, redirect: 'follow' }, timeoutMs);
        if (!dlRes.ok) {
          let msg = dlRes.statusText;
          try { const d = await dlRes.json(); msg = d?.message || d?.error || msg; } catch { /* ignore */ }
          console.error(`ERROR: ${dlRes.status} ${msg}`);
          break;
        }
        let filename = args.output;
        if (!filename) {
          const cd = dlRes.headers.get('content-disposition') || '';
          const match = cd.match(/filename\*?=(?:UTF-8'')?["']?([^"';\r\n]+)/i);
          filename = match ? decodeURIComponent(match[1].trim()) : resourceId;
        }
        const { createWriteStream } = await import('fs');
        const writer = createWriteStream(filename);
        const reader = dlRes.body.getReader();
        await new Promise((resolve, reject) => {
          writer.on('error', reject);
          writer.on('finish', resolve);
          const pump = async () => {
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) { writer.end(); break; }
                writer.write(value);
              }
            } catch (err) { reject(err); }
          };
          pump();
        });
        process.stdout.write(`Downloaded: ${filename}\n`);
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
      case 'get-readme': {
        if (!shortId) { console.error('ERROR: short_id is required'); break; }
        spinnerId = startSpinner('Fetching README');
        const payload = await apiRequest('GET', `/livedocs/${shortId}/readme`, null, apiKey, apiBase, timeoutMs);
        if (json) { console.log(JSON.stringify(payload, null, 2)); }
        else { process.stdout.write(payload?.data?.content || '(empty)\n'); }
        code = 0;
        break;
      }
      case 'update-readme': {
        if (!shortId) { console.error('ERROR: short_id is required'); break; }
        if (args.content === undefined || args.content === '') { console.error('ERROR: --content is required'); break; }
        spinnerId = startSpinner('Updating README');
        await apiRequest('PUT', `/livedocs/${shortId}/readme`, { content: args.content }, apiKey, apiBase, timeoutMs);
        if (json) { console.log(JSON.stringify({ status: 'ok' }, null, 2)); }
        else { process.stdout.write('README updated.\n'); }
        code = 0;
        break;
      }
      case 'append-readme': {
        if (!shortId) { console.error('ERROR: short_id is required'); break; }
        if (!args.content) { console.error('ERROR: --content is required'); break; }
        spinnerId = startSpinner('Appending to README');
        await apiRequest('POST', `/livedocs/${shortId}/readme/append`, { content: args.content }, apiKey, apiBase, timeoutMs);
        if (json) { console.log(JSON.stringify({ status: 'ok' }, null, 2)); }
        else { process.stdout.write('README appended.\n'); }
        code = 0;
        break;
      }
      case 'delete-readme': {
        if (!shortId) { console.error('ERROR: short_id is required'); break; }
        spinnerId = startSpinner('Deleting README');
        await apiRequest('DELETE', `/livedocs/${shortId}/readme`, null, apiKey, apiBase, timeoutMs);
        if (json) { console.log(JSON.stringify({ status: 'ok' }, null, 2)); }
        else { process.stdout.write('README deleted.\n'); }
        code = 0;
        break;
      }
      case 'tasks': {
        if (!shortId) { console.error('ERROR: short_id is required'); break; }
        spinnerId = startSpinner('Listing tasks');
        const params = new URLSearchParams();
        if (args.status !== '') params.set('status', args.status);
        if (args.labels) args.labels.split(',').map(l => l.trim()).filter(Boolean).forEach(l => params.append('labels', l));
        if (args.page) params.set('page', args.page);
        if (args.size) params.set('size', args.size);
        const qs = params.toString();
        const payload = await apiRequest('GET', `/livedocs/${shortId}/tasks${qs ? `?${qs}` : ''}`, null, apiKey, apiBase, timeoutMs);
        if (json) { console.log(JSON.stringify(payload, null, 2)); }
        else {
          const items = payload?.data?.items || [];
          if (!items.length) { process.stderr.write('No tasks found.\n'); }
          else {
            process.stdout.write(`Found ${payload.data.total || items.length} task(s)\n\n`);
            for (const t of items) process.stdout.write(formatTask(t));
          }
        }
        code = 0;
        break;
      }
      case 'create-task': {
        if (!shortId) { console.error('ERROR: short_id is required'); break; }
        if (!args.title) { console.error('ERROR: --title is required'); break; }
        spinnerId = startSpinner('Creating task');
        const status = (args.status !== '') ? parseInt(args.status, 10) : 0;
        const sort = (args.sort !== '') ? parseInt(args.sort, 10) : 0;
        const body = { title: args.title, status, sort };
        if (args.description) body.description = args.description;
        body.labels = args.labels ? args.labels.split(',').map(l => l.trim()).filter(Boolean) : [];
        if (args.operatedBy) body.operated_by = args.operatedBy;
        const payload = await apiRequest('POST', `/livedocs/${shortId}/tasks`, body, apiKey, apiBase, timeoutMs);
        if (json) { console.log(JSON.stringify(payload, null, 2)); }
        else { process.stdout.write('Task created!\n\n'); process.stdout.write(formatTask(payload?.data)); }
        code = 0;
        break;
      }
      case 'update-task': {
        if (!shortId) { console.error('ERROR: short_id is required'); break; }
        if (!resourceId) { console.error('ERROR: task_id is required'); break; }
        spinnerId = startSpinner('Updating task');
        const body = {};
        if (args.title) body.title = args.title;
        if (args.description !== undefined) body.description = args.description;
        if (args.status !== '') body.status = parseInt(args.status, 10);
        if (args.sort !== '') body.sort = parseInt(args.sort, 10);
        if (args.labels !== undefined) body.labels = args.labels.split(',').map(l => l.trim()).filter(Boolean);
        if (args.operatedBy) body.operated_by = args.operatedBy;
        const payload = await apiRequest('PATCH', `/livedocs/${shortId}/tasks/${resourceId}`, body, apiKey, apiBase, timeoutMs);
        if (json) { console.log(JSON.stringify(payload, null, 2)); }
        else { process.stdout.write('Task updated!\n\n'); process.stdout.write(formatTask(payload?.data)); }
        code = 0;
        break;
      }
      case 'delete-task': {
        if (!shortId) { console.error('ERROR: short_id is required'); break; }
        if (!resourceId) { console.error('ERROR: task_id is required'); break; }
        spinnerId = startSpinner('Deleting task');
        await apiRequest('DELETE', `/livedocs/${shortId}/tasks/${resourceId}`, null, apiKey, apiBase, timeoutMs);
        if (json) { console.log(JSON.stringify({ status: 'ok' }, null, 2)); }
        else { process.stdout.write(`Task \`${resourceId}\` deleted.\n`); }
        code = 0;
        break;
      }
      case 'task-records': {
        if (!shortId) { console.error('ERROR: short_id is required'); break; }
        if (!resourceId) { console.error('ERROR: task_id is required'); break; }
        spinnerId = startSpinner('Fetching task records');
        const params = new URLSearchParams();
        if (args.recordType) params.set('record_type', args.recordType);
        if (args.page) params.set('page', args.page);
        if (args.size) params.set('size', args.size);
        const qs = params.toString();
        const payload = await apiRequest('GET', `/livedocs/${shortId}/tasks/${resourceId}/records${qs ? `?${qs}` : ''}`, null, apiKey, apiBase, timeoutMs);
        if (json) { console.log(JSON.stringify(payload, null, 2)); }
        else {
          const items = payload?.data?.items || [];
          if (!items.length) { process.stderr.write('No records found.\n'); }
          else {
            process.stdout.write(`Found ${payload.data.total || items.length} record(s)\n\n`);
            for (const r of items) process.stdout.write(formatTaskRecord(r));
          }
        }
        code = 0;
        break;
      }
      case 'add-task-comment': {
        if (!shortId) { console.error('ERROR: short_id is required'); break; }
        if (!resourceId) { console.error('ERROR: task_id is required'); break; }
        if (!args.content) { console.error('ERROR: --content is required'); break; }
        spinnerId = startSpinner('Adding comment');
        const body = { content: args.content };
        if (args.operatedBy) body.operated_by = args.operatedBy;
        const payload = await apiRequest('POST', `/livedocs/${shortId}/tasks/${resourceId}/comments`, body, apiKey, apiBase, timeoutMs);
        if (json) { console.log(JSON.stringify(payload, null, 2)); }
        else { process.stdout.write('Comment added.\n'); process.stdout.write(formatTaskRecord(payload?.data)); }
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
