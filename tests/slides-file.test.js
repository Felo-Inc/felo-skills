import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { slides } from '../src/slides.js';

const originalFetch = globalThis.fetch;
const originalApiKey = process.env.FELO_API_KEY;
const originalApiBase = process.env.FELO_API_BASE;

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalApiKey === undefined) delete process.env.FELO_API_KEY;
  else process.env.FELO_API_KEY = originalApiKey;
  if (originalApiBase === undefined) delete process.env.FELO_API_BASE;
  else process.env.FELO_API_BASE = originalApiBase;
});

describe('slides file upload', () => {
  it('uses multipart form data in the CLI implementation', async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), 'felo-slides-'));
    const filePath = path.join(tempDir, 'source.jpg');
    await writeFile(filePath, Buffer.from('image-bytes'));

    process.env.FELO_API_KEY = 'test-key';
    process.env.FELO_API_BASE = 'https://mock.felo.test';
    const calls = [];
    globalThis.fetch = async (url, init) => {
      calls.push({ url: String(url), init });
      if (String(url).endsWith('/v2/ppts')) {
        assert.ok(init.body instanceof FormData);
        assert.strictEqual(init.headers['Content-Type'], undefined);
        assert.strictEqual(init.body.get('query'), 'Use the original image in 2 slides');
        assert.strictEqual(init.body.get('livedoc_short_id'), 'live-123');

        const config = init.body.get('ppt_config');
        assert.strictEqual(config.type, 'application/json');
        assert.deepStrictEqual(JSON.parse(await config.text()), { ai_theme_id: 'theme-123' });

        const file = init.body.get('file');
        assert.strictEqual(file.name, 'source.jpg');
        assert.strictEqual(file.type, 'image/jpeg');
        assert.strictEqual(await file.text(), 'image-bytes');

        return Response.json({
          status: 200,
          code: 'OK',
          data: { task_id: 'task-123', livedoc_short_id: 'live-123', ppt_business_id: 'ppt-123' },
        });
      }

      return Response.json({
        status: 200,
        code: 'OK',
        data: { task_status: 'COMPLETED', ppt_url: 'https://felo.ai/slides/ppt-123' },
      });
    };

    try {
      const code = await slides('Use the original image in 2 slides', {
        filePath,
        livedocShortId: 'live-123',
        pptConfig: { ai_theme_id: 'theme-123' },
        pollIntervalMs: 0,
        pollTimeoutMs: 1_000,
        json: true,
      });
      assert.strictEqual(code, 0);
      assert.strictEqual(calls.length, 2);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('uploads a file through the bundled skill runner', async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), 'felo-slides-runner-'));
    const filePath = path.join(tempDir, 'source.jpg');
    await writeFile(filePath, Buffer.from('runner-image-bytes'));

    const requests = [];
    const server = createServer((req, res) => {
      const chunks = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => {
        requests.push({
          method: req.method,
          url: req.url,
          contentType: req.headers['content-type'] || '',
          body: Buffer.concat(chunks).toString('utf8'),
        });
        res.setHeader('Content-Type', 'application/json');
        if (req.method === 'POST') {
          res.end(JSON.stringify({
            status: 200,
            code: 'OK',
            data: { task_id: 'task-runner', livedoc_short_id: 'live-runner', ppt_business_id: 'ppt-runner' },
          }));
        } else {
          res.end(JSON.stringify({
            status: 200,
            code: 'OK',
            data: { task_status: 'COMPLETED', ppt_url: 'https://felo.ai/slides/ppt-runner' },
          }));
        }
      });
    });

    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();

    try {
      const result = await new Promise((resolve, reject) => {
        const child = spawn(
          process.execPath,
          [
            'felo-slides/scripts/run_ppt_task.mjs',
            '--query', 'Use this image in 2 slides',
            '--file', filePath,
            '--theme', 'theme-runner',
            '--interval', '1',
            '--max-wait', '5',
            '--json',
          ],
          {
            cwd: path.resolve('.'),
            env: {
              ...process.env,
              FELO_API_KEY: 'test-key',
              FELO_API_BASE: `http://127.0.0.1:${address.port}`,
            },
          }
        );
        let stdout = '';
        let stderr = '';
        child.stdout.on('data', (chunk) => { stdout += chunk; });
        child.stderr.on('data', (chunk) => { stderr += chunk; });
        child.on('error', reject);
        child.on('close', (code) => resolve({ code, stdout, stderr }));
      });

      assert.strictEqual(result.code, 0, result.stderr);
      assert.strictEqual(JSON.parse(result.stdout).data.task_id, 'task-runner');
      assert.strictEqual(requests.length, 2);

      const upload = requests[0];
      assert.match(upload.contentType, /^multipart\/form-data; boundary=/);
      assert.match(upload.body, /name="query"/);
      assert.match(upload.body, /Use this image in 2 slides/);
      assert.match(upload.body, /name="ppt_config"/);
      assert.match(upload.body, /theme-runner/);
      assert.match(upload.body, /name="file"; filename="source.jpg"/);
      assert.match(upload.body, /Content-Type: image\/jpeg/i);
      assert.match(upload.body, /runner-image-bytes/);
    } finally {
      await new Promise((resolve) => server.close(resolve));
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});
