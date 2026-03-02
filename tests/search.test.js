import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import path from 'path';
import os from 'os';
import fs from 'fs/promises';

const tmpDir = path.join(os.tmpdir(), `felo-test-search-${Date.now()}`);
const testConfigFile = path.join(tmpDir, 'config.json');
process.env.FELO_CONFIG_FILE = testConfigFile;

import { getApiKey, fetchWithTimeoutAndRetry } from '../src/search.js';
import * as config from '../src/config.js';

after(async () => {
  delete process.env.FELO_API_KEY;
  delete process.env.FELO_CONFIG_FILE;
  await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
});

before(async () => {
  await fs.mkdir(path.dirname(testConfigFile), { recursive: true });
});

describe('getApiKey', () => {
  it('returns env FELO_API_KEY when set', async () => {
    process.env.FELO_API_KEY = 'env-key';
    const key = await getApiKey();
    assert.strictEqual(key, 'env-key');
  });

  it('returns key from config when env not set', async () => {
    delete process.env.FELO_API_KEY;
    await config.setConfig('FELO_API_KEY', 'config-key');
    const key = await getApiKey();
    assert.strictEqual(key, 'config-key');
  });

  it('returns empty string when neither set', async () => {
    delete process.env.FELO_API_KEY;
    await config.unsetConfig('FELO_API_KEY');
    const key = await getApiKey();
    assert.strictEqual(key, '');
  });

  it('env wins over config', async () => {
    process.env.FELO_API_KEY = 'env-wins';
    await config.setConfig('FELO_API_KEY', 'config-key');
    const key = await getApiKey();
    assert.strictEqual(key, 'env-wins');
  });
});

describe('fetchWithTimeoutAndRetry', () => {
  it('returns response on 200', async () => {
    const res = { ok: true, status: 200 };
    let callCount = 0;
    const origFetch = globalThis.fetch;
    globalThis.fetch = () => { callCount++; return Promise.resolve(res); };
    try {
      const out = await fetchWithTimeoutAndRetry('https://example.com', {}, 10_000);
      assert.strictEqual(out, res);
      assert.strictEqual(callCount, 1);
    } finally {
      globalThis.fetch = origFetch;
    }
  });

  it('retries on 500 then succeeds', async () => {
    const res200 = { ok: true, status: 200 };
    const res500 = { ok: false, status: 502 };
    let callCount = 0;
    const origFetch = globalThis.fetch;
    globalThis.fetch = () => {
      callCount++;
      return Promise.resolve(callCount === 1 ? res500 : res200);
    };
    try {
      const out = await fetchWithTimeoutAndRetry('https://example.com', {}, 10_000);
      assert.strictEqual(out, res200);
      assert.strictEqual(callCount, 2);
    } finally {
      globalThis.fetch = origFetch;
    }
  });

  it('throws on timeout (AbortError)', async () => {
    const origFetch = globalThis.fetch;
    const abortErr = new Error('The operation was aborted');
    abortErr.name = 'AbortError';
    globalThis.fetch = () => Promise.reject(abortErr);
    try {
      await assert.rejects(
        async () => fetchWithTimeoutAndRetry('https://example.com', {}, 5000),
        (err) => err.message && err.message.includes('timed out')
      );
    } finally {
      globalThis.fetch = origFetch;
    }
  });
});
