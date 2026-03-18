import { getApiKey, fetchWithTimeoutAndRetry, NO_KEY_MESSAGE } from './search.js';
import * as config from './config.js';
import fs from 'fs/promises';
import path from 'path';

const DEFAULT_API_BASE = 'https://openapi.felo.ai';
const DEFAULT_TIMEOUT_MS = 60_000;
const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const SPINNER_INTERVAL_MS = 80;
const STATUS_PAD = 56;

// ── Shared helpers ──

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

async function apiRequest(method, apiPath, body, apiKey, apiBase, timeoutMs) {
  const url = `${apiBase}/v2${apiPath}`;
  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };
  const init = { method, headers };

  if (body !== undefined && body !== null) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }
  const res = await fetchWithTimeoutAndRetry(url, init, timeoutMs);
  let data = {};
  try { data = await res.json(); } catch { data = {}; }
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${getMessage(data)}`);
  if (data.status === 'error') throw new Error(getMessage(data));
  return data;
}

async function uploadFormData(apiPath, formData, apiKey, apiBase, timeoutMs) {
  const url = `${apiBase}/v2${apiPath}`;
  const res = await fetchWithTimeoutAndRetry(
    url,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    },
    timeoutMs,
  );
  let data = {};
  try { data = await res.json(); } catch { data = {}; }
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${getMessage(data)}`);
  if (data.status === 'error') throw new Error(getMessage(data));
  return data;
}

// ── Formatting helpers ──

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
function formatResource(res) {
  if (!res) return '';
  let out = `### ${res.title || '(untitled)'}\n`;
  out += `- Resource ID: \`${res.id}\`\n`;
  if (res.resource_type) out += `- Type: ${res.resource_type}\n`;
  if (res.status) out += `- Status: ${res.status}\n`;
  if (res.source) out += `- Source: ${res.source}\n`;
  if (res.link) out += `- Link: ${res.link}\n`;
  if (res.snippet) out += `- Snippet: ${res.snippet}\n`;
  if (res.created_at) out += `- Created: ${res.created_at}\n`;
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

// ── Exported functions ──

export async function createLiveDoc(opts = {}) {
  const apiKey = await getApiKey();
  if (!apiKey) { console.error(NO_KEY_MESSAGE.trim()); return 1; }
  if (!opts.name) { process.stderr.write('ERROR: --name is required.\n'); return 1; }

  const apiBase = await getApiBase();
  const timeoutMs = opts.timeoutMs || DEFAULT_TIMEOUT_MS;
  const spinnerId = startSpinner('Creating LiveDoc');

  try {
    const body = { name: opts.name };
    if (opts.description) body.description = opts.description;
    if (opts.icon) body.icon = opts.icon;
    const payload = await apiRequest('POST', '/livedocs', body, apiKey, apiBase, timeoutMs);
    if (opts.json) { console.log(JSON.stringify(payload, null, 2)); return 0; }
    const doc = payload?.data;
    process.stdout.write(`LiveDoc created successfully!\n\n`);
    process.stdout.write(formatLiveDoc(doc));
    return 0;
  } catch (err) {
    process.stderr.write(`Failed to create LiveDoc: ${err?.message || err}\n`);
    return 1;
  } finally { stopSpinner(spinnerId); }
}
export async function listLiveDocs(opts = {}) {
  const apiKey = await getApiKey();
  if (!apiKey) { console.error(NO_KEY_MESSAGE.trim()); return 1; }

  const apiBase = await getApiBase();
  const timeoutMs = opts.timeoutMs || DEFAULT_TIMEOUT_MS;
  const spinnerId = startSpinner('Listing LiveDocs');

  try {
    const params = new URLSearchParams();
    if (opts.keyword) params.set('keyword', opts.keyword);
    if (opts.page) params.set('page', opts.page);
    if (opts.size) params.set('size', opts.size);
    const qs = params.toString();
    const apiPath = `/livedocs${qs ? `?${qs}` : ''}`;
    const payload = await apiRequest('GET', apiPath, null, apiKey, apiBase, timeoutMs);
    if (opts.json) { console.log(JSON.stringify(payload, null, 2)); return 0; }

    const data = payload?.data;
    const items = data?.items || [];
    if (!items.length) { process.stderr.write('No LiveDocs found.\n'); return 0; }
    process.stdout.write(`Found ${data.total || items.length} LiveDoc(s)\n\n`);
    for (const doc of items) { process.stdout.write(formatLiveDoc(doc)); }
    return 0;
  } catch (err) {
    process.stderr.write(`Failed to list LiveDocs: ${err?.message || err}\n`);
    return 1;
  } finally { stopSpinner(spinnerId); }
}

export async function updateLiveDoc(shortId, opts = {}) {
  const apiKey = await getApiKey();
  if (!apiKey) { console.error(NO_KEY_MESSAGE.trim()); return 1; }
  if (!shortId) { process.stderr.write('ERROR: short_id is required.\n'); return 1; }

  const apiBase = await getApiBase();
  const timeoutMs = opts.timeoutMs || DEFAULT_TIMEOUT_MS;
  const spinnerId = startSpinner('Updating LiveDoc');

  try {
    const body = {};
    if (opts.name) body.name = opts.name;
    if (opts.description) body.description = opts.description;
    const payload = await apiRequest('PUT', `/livedocs/${shortId}`, body, apiKey, apiBase, timeoutMs);
    if (opts.json) { console.log(JSON.stringify(payload, null, 2)); return 0; }
    process.stdout.write(`LiveDoc updated successfully!\n\n`);
    process.stdout.write(formatLiveDoc(payload?.data));
    return 0;
  } catch (err) {
    process.stderr.write(`Failed to update LiveDoc: ${err?.message || err}\n`);
    return 1;
  } finally { stopSpinner(spinnerId); }
}
export async function deleteLiveDoc(shortId, opts = {}) {
  const apiKey = await getApiKey();
  if (!apiKey) { console.error(NO_KEY_MESSAGE.trim()); return 1; }
  if (!shortId) { process.stderr.write('ERROR: short_id is required.\n'); return 1; }

  const apiBase = await getApiBase();
  const timeoutMs = opts.timeoutMs || DEFAULT_TIMEOUT_MS;
  const spinnerId = startSpinner('Deleting LiveDoc');

  try {
    await apiRequest('DELETE', `/livedocs/${shortId}`, null, apiKey, apiBase, timeoutMs);
    if (opts.json) { console.log(JSON.stringify({ status: 'ok' }, null, 2)); return 0; }
    process.stdout.write(`LiveDoc \`${shortId}\` deleted.\n`);
    return 0;
  } catch (err) {
    process.stderr.write(`Failed to delete LiveDoc: ${err?.message || err}\n`);
    return 1;
  } finally { stopSpinner(spinnerId); }
}

export async function listResources(shortId, opts = {}) {
  const apiKey = await getApiKey();
  if (!apiKey) { console.error(NO_KEY_MESSAGE.trim()); return 1; }
  if (!shortId) { process.stderr.write('ERROR: short_id is required.\n'); return 1; }

  const apiBase = await getApiBase();
  const timeoutMs = opts.timeoutMs || DEFAULT_TIMEOUT_MS;
  const spinnerId = startSpinner('Listing resources');

  try {
    const params = new URLSearchParams();
    if (opts.type) params.set('resource_types', opts.type);
    if (opts.page) params.set('page', opts.page);
    if (opts.size) params.set('size', opts.size);
    const qs = params.toString();
    const apiPath = `/livedocs/${shortId}/resources${qs ? `?${qs}` : ''}`;
    const payload = await apiRequest('GET', apiPath, null, apiKey, apiBase, timeoutMs);
    if (opts.json) { console.log(JSON.stringify(payload, null, 2)); return 0; }

    const data = payload?.data;
    const items = data?.items || [];
    if (!items.length) { process.stderr.write('No resources found.\n'); return 0; }
    process.stdout.write(`Found ${data.total || items.length} resource(s)\n\n`);
    for (const r of items) { process.stdout.write(formatResource(r)); }
    return 0;
  } catch (err) {
    process.stderr.write(`Failed to list resources: ${err?.message || err}\n`);
    return 1;
  } finally { stopSpinner(spinnerId); }
}
export async function getResource(shortId, resourceId, opts = {}) {
  const apiKey = await getApiKey();
  if (!apiKey) { console.error(NO_KEY_MESSAGE.trim()); return 1; }
  if (!shortId || !resourceId) { process.stderr.write('ERROR: short_id and resource_id are required.\n'); return 1; }

  const apiBase = await getApiBase();
  const timeoutMs = opts.timeoutMs || DEFAULT_TIMEOUT_MS;
  const spinnerId = startSpinner('Fetching resource');

  try {
    const payload = await apiRequest('GET', `/livedocs/${shortId}/resources/${resourceId}`, null, apiKey, apiBase, timeoutMs);
    if (opts.json) { console.log(JSON.stringify(payload, null, 2)); return 0; }
    process.stdout.write(formatResource(payload?.data));
    return 0;
  } catch (err) {
    process.stderr.write(`Failed to get resource: ${err?.message || err}\n`);
    return 1;
  } finally { stopSpinner(spinnerId); }
}

export async function addDoc(shortId, opts = {}) {
  const apiKey = await getApiKey();
  if (!apiKey) { console.error(NO_KEY_MESSAGE.trim()); return 1; }
  if (!shortId) { process.stderr.write('ERROR: short_id is required.\n'); return 1; }
  if (!opts.content) { process.stderr.write('ERROR: --content is required.\n'); return 1; }

  const apiBase = await getApiBase();
  const timeoutMs = opts.timeoutMs || DEFAULT_TIMEOUT_MS;
  const spinnerId = startSpinner('Creating document resource');

  try {
    const body = { content: opts.content };
    if (opts.title) body.title = opts.title;
    const payload = await apiRequest('POST', `/livedocs/${shortId}/resources/doc`, body, apiKey, apiBase, timeoutMs);
    if (opts.json) { console.log(JSON.stringify(payload, null, 2)); return 0; }
    process.stdout.write(`Document resource created!\n\n`);
    process.stdout.write(formatResource(payload?.data));
    return 0;
  } catch (err) {
    process.stderr.write(`Failed to create document: ${err?.message || err}\n`);
    return 1;
  } finally { stopSpinner(spinnerId); }
}

export async function addUrls(shortId, opts = {}) {
  const apiKey = await getApiKey();
  if (!apiKey) { console.error(NO_KEY_MESSAGE.trim()); return 1; }
  if (!shortId) { process.stderr.write('ERROR: short_id is required.\n'); return 1; }
  if (!opts.urls) { process.stderr.write('ERROR: --urls is required.\n'); return 1; }

  const urls = opts.urls.split(',').map(u => u.trim()).filter(Boolean);
  if (!urls.length) { process.stderr.write('ERROR: at least one URL is required.\n'); return 1; }
  if (urls.length > 10) { process.stderr.write('ERROR: maximum 10 URLs allowed.\n'); return 1; }
  const apiBase = await getApiBase();
  const timeoutMs = opts.timeoutMs || DEFAULT_TIMEOUT_MS;
  const spinnerId = startSpinner(`Adding ${urls.length} URL(s)`);

  try {
    const payload = await apiRequest('POST', `/livedocs/${shortId}/resources/urls`, { urls }, apiKey, apiBase, timeoutMs);
    if (opts.json) { console.log(JSON.stringify(payload, null, 2)); return 0; }

    const results = payload?.data || [];
    for (const r of results) {
      const icon = r.status === 'success' ? '✓' : r.status === 'existed' ? '~' : '✗';
      let line = `${icon} ${r.url} → ${r.status}`;
      if (r.resource_id) line += ` (id: ${r.resource_id})`;
      if (r.fail_reason) line += ` (${r.fail_reason})`;
      process.stdout.write(line + '\n');
    }
    return 0;
  } catch (err) {
    process.stderr.write(`Failed to add URLs: ${err?.message || err}\n`);
    return 1;
  } finally { stopSpinner(spinnerId); }
}

export async function uploadFile(shortId, opts = {}) {
  const apiKey = await getApiKey();
  if (!apiKey) { console.error(NO_KEY_MESSAGE.trim()); return 1; }
  if (!shortId) { process.stderr.write('ERROR: short_id is required.\n'); return 1; }
  if (!opts.file) { process.stderr.write('ERROR: --file is required.\n'); return 1; }

  const apiBase = await getApiBase();
  const timeoutMs = opts.timeoutMs || DEFAULT_TIMEOUT_MS;
  const endpoint = opts.convert ? 'upload-doc' : 'upload';
  const spinnerId = startSpinner(`Uploading file (${endpoint})`);

  try {
    const fileBuffer = await fs.readFile(opts.file);
    const blob = new Blob([fileBuffer]);
    const formData = new FormData();
    formData.append('file', blob, path.basename(opts.file));

    const payload = await uploadFormData(`/livedocs/${shortId}/resources/${endpoint}`, formData, apiKey, apiBase, timeoutMs);
    if (opts.json) { console.log(JSON.stringify(payload, null, 2)); return 0; }
    process.stdout.write(`File uploaded successfully!\n\n`);
    process.stdout.write(formatResource(payload?.data));
    return 0;
  } catch (err) {
    process.stderr.write(`Failed to upload file: ${err?.message || err}\n`);
    return 1;
  } finally { stopSpinner(spinnerId); }
}
export async function removeResource(shortId, resourceId, opts = {}) {
  const apiKey = await getApiKey();
  if (!apiKey) { console.error(NO_KEY_MESSAGE.trim()); return 1; }
  if (!shortId || !resourceId) { process.stderr.write('ERROR: short_id and resource_id are required.\n'); return 1; }

  const apiBase = await getApiBase();
  const timeoutMs = opts.timeoutMs || DEFAULT_TIMEOUT_MS;
  const spinnerId = startSpinner('Deleting resource');

  try {
    await apiRequest('DELETE', `/livedocs/${shortId}/resources/${resourceId}`, null, apiKey, apiBase, timeoutMs);
    if (opts.json) { console.log(JSON.stringify({ status: 'ok' }, null, 2)); return 0; }
    process.stdout.write(`Resource \`${resourceId}\` deleted.\n`);
    return 0;
  } catch (err) {
    process.stderr.write(`Failed to delete resource: ${err?.message || err}\n`);
    return 1;
  } finally { stopSpinner(spinnerId); }
}

export async function route(shortId, opts = {}) {
  const apiKey = await getApiKey();
  if (!apiKey) { console.error(NO_KEY_MESSAGE.trim()); return 1; }
  if (!shortId) { process.stderr.write('ERROR: short_id is required.\n'); return 1; }
  if (!opts.query) { process.stderr.write('ERROR: --query is required.\n'); return 1; }

  const apiBase = await getApiBase();
  const timeoutMs = opts.timeoutMs || DEFAULT_TIMEOUT_MS;
  const spinnerId = startSpinner('Routing relevant resources');

  try {
    const body = { query: opts.query };
    if (opts.maxResources) {
      const n = parseInt(opts.maxResources, 10);
      if (Number.isFinite(n) && n > 0) body.max_resources = n;
    }
    const payload = await apiRequest('POST', `/livedocs/${shortId}/resources/route`, body, apiKey, apiBase, timeoutMs);
    if (opts.json) { console.log(JSON.stringify(payload, null, 2)); return 0; }

    const resourceIds = payload?.data || [];
    if (!resourceIds.length) { process.stderr.write('No relevant resources found.\n'); return 0; }
    process.stdout.write(`Found ${resourceIds.length} relevant resource(s):\n\n`);
    for (const id of resourceIds) process.stdout.write(`- ${id}\n`);
    return 0;
  } catch (err) {
    process.stderr.write(`Failed to route resources: ${err?.message || err}\n`);
    return 1;
  } finally { stopSpinner(spinnerId); }
}

export async function retrieve(shortId, opts = {}) {
  const apiKey = await getApiKey();
  if (!apiKey) { console.error(NO_KEY_MESSAGE.trim()); return 1; }
  if (!shortId) { process.stderr.write('ERROR: short_id is required.\n'); return 1; }
  if (!opts.query) { process.stderr.write('ERROR: --query is required.\n'); return 1; }

  const apiBase = await getApiBase();
  const timeoutMs = opts.timeoutMs || DEFAULT_TIMEOUT_MS;
  const spinnerId = startSpinner('Retrieving from knowledge base');

  try {
    const body = { query: opts.query };
    if (opts.resourceIds) {
      body.resource_ids = opts.resourceIds.split(',').map(id => id.trim()).filter(Boolean);
    }
    const payload = await apiRequest('POST', `/livedocs/${shortId}/resources/retrieve`, body, apiKey, apiBase, timeoutMs);
    if (opts.json) { console.log(JSON.stringify(payload, null, 2)); return 0; }

    const results = payload?.data || [];
    if (!results.length) { process.stderr.write('No results found.\n'); return 0; }
    process.stdout.write(`Found ${results.length} result(s)\n\n`);
    for (const r of results) { process.stdout.write(formatRetrieveResult(r)); }
    return 0;
  } catch (err) {
    process.stderr.write(`Failed to retrieve: ${err?.message || err}\n`);
    return 1;
  } finally { stopSpinner(spinnerId); }
}

export async function downloadResource(shortId, resourceId, opts = {}) {
  const apiKey = await getApiKey();
  if (!apiKey) { console.error(NO_KEY_MESSAGE.trim()); return 1; }
  if (!shortId) { process.stderr.write('ERROR: short_id is required.\n'); return 1; }
  if (!resourceId) { process.stderr.write('ERROR: resource_id is required.\n'); return 1; }

  const apiBase = await getApiBase();
  const timeoutMs = opts.timeoutMs || DEFAULT_TIMEOUT_MS;
  const spinnerId = startSpinner('Downloading resource');

  try {
    const params = new URLSearchParams();
    if (opts.expiresIn) params.set('expires_in', opts.expiresIn);
    const qs = params.toString();
    const url = `${apiBase}/v2/livedocs/${shortId}/resources/${resourceId}/download${qs ? `?${qs}` : ''}`;

    // Follow redirects to get the actual file stream from S3
    const res = await fetchWithTimeoutAndRetry(
      url,
      { method: 'GET', headers: { Authorization: `Bearer ${apiKey}` }, redirect: 'follow' },
      timeoutMs,
    );

    if (!res.ok) {
      let msg = res.statusText;
      try { const d = await res.json(); msg = getMessage(d) || msg; } catch { /* ignore */ }
      process.stderr.write(`ERROR: ${res.status} ${msg}\n`);
      return 1;
    }

    // Determine output filename
    let filename = opts.output;
    if (!filename) {
      // Try Content-Disposition header first
      const cd = res.headers.get('content-disposition') || '';
      const match = cd.match(/filename\*?=(?:UTF-8'')?["']?([^"';\r\n]+)/i);
      if (match) {
        filename = decodeURIComponent(match[1].trim());
      } else {
        // Fall back to resource_id as filename
        filename = resourceId;
      }
    }

    // Write file stream to disk
    const { createWriteStream } = await import('fs');
    const writer = createWriteStream(filename);
    const reader = res.body.getReader();
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

    stopSpinner(spinnerId);
    process.stdout.write(`Downloaded: ${filename}\n`);
    return 0;
  } catch (err) {
    process.stderr.write(`Failed to download resource: ${err?.message || err}\n`);
    return 1;
  } finally { stopSpinner(spinnerId); }
}

export async function getResourceContent(shortId, resourceId, opts = {}) {
  const apiKey = await getApiKey();
  if (!apiKey) { console.error(NO_KEY_MESSAGE.trim()); return 1; }
  if (!shortId) { process.stderr.write('ERROR: short_id is required.\n'); return 1; }
  if (!resourceId) { process.stderr.write('ERROR: resource_id is required.\n'); return 1; }

  const apiBase = await getApiBase();
  const timeoutMs = opts.timeoutMs || DEFAULT_TIMEOUT_MS;
  const spinnerId = startSpinner('Fetching resource content');

  try {
    const payload = await apiRequest('GET', `/livedocs/${shortId}/resources/${resourceId}/content`, null, apiKey, apiBase, timeoutMs);
    if (opts.json) { console.log(JSON.stringify(payload, null, 2)); return 0; }
    const d = payload?.data;
    if (!d) { process.stderr.write('No content returned.\n'); return 0; }
    process.stdout.write(`## ${d.title || '(untitled)'}\n`);
    process.stdout.write(`- Type: ${d.type}\n\n`);
    process.stdout.write(d.content || '(empty)');
    process.stdout.write('\n');
    return 0;
  } catch (err) {
    process.stderr.write(`Failed to get resource content: ${err?.message || err}\n`);
    return 1;
  } finally { stopSpinner(spinnerId); }
}

export async function pptRetrieve(shortId, opts = {}) {
  const apiKey = await getApiKey();
  if (!apiKey) { console.error(NO_KEY_MESSAGE.trim()); return 1; }
  if (!shortId) { process.stderr.write('ERROR: short_id is required.\n'); return 1; }
  if (!opts.resourceId) { process.stderr.write('ERROR: --resource-id is required.\n'); return 1; }
  if (!opts.pageNumber) { process.stderr.write('ERROR: --page-number is required.\n'); return 1; }
  if (!opts.query) { process.stderr.write('ERROR: --query is required.\n'); return 1; }

  const apiBase = await getApiBase();
  const timeoutMs = opts.timeoutMs || DEFAULT_TIMEOUT_MS;
  const spinnerId = startSpinner('Retrieving PPT page content');

  try {
    const body = {
      resource_id: opts.resourceId,
      page_number: parseInt(opts.pageNumber, 10),
      query: opts.query,
    };
    if (opts.maxChunk) {
      const n = parseInt(opts.maxChunk, 10);
      if (Number.isFinite(n) && n > 0) body.max_chunk = n;
    }
    const payload = await apiRequest('POST', `/livedocs/${shortId}/resources/ppt-retrieve`, body, apiKey, apiBase, timeoutMs);
    if (opts.json) { console.log(JSON.stringify(payload, null, 2)); return 0; }
    const results = payload?.data || [];
    if (!results.length) { process.stderr.write('No results found.\n'); return 0; }
    process.stdout.write(`Found ${results.length} result(s)\n\n`);
    for (const r of results) { process.stdout.write(formatRetrieveResult(r)); }
    return 0;
  } catch (err) {
    process.stderr.write(`Failed to ppt-retrieve: ${err?.message || err}\n`);
    return 1;
  } finally { stopSpinner(spinnerId); }
}
