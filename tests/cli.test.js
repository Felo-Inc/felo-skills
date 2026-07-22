import { describe, it } from 'node:test';
import assert from 'node:assert';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const cliPath = path.resolve('src/cli.js');

describe('CLI command registration', () => {
  it('shows apple-buy-advisor in top-level help', () => {
    const result = spawnSync(process.execPath, [cliPath, '--help'], {
      encoding: 'utf8',
    });

    assert.strictEqual(result.status, 0);
    assert.match(result.stdout, /apple-buy-advisor/);
  });

  it('shows help for apple-buy-advisor command', () => {
    const result = spawnSync(process.execPath, [cliPath, 'apple-buy-advisor', '--help'], {
      encoding: 'utf8',
    });

    assert.strictEqual(result.status, 0);
    assert.match(result.stdout, /Research and compare Apple products before you buy/);
  });

  it('shows file upload support for slides', () => {
    const result = spawnSync(process.execPath, [cliPath, 'slides', '--help'], {
      encoding: 'utf8',
    });

    assert.strictEqual(result.status, 0);
    assert.match(result.stdout, /--file <path>/);
    assert.match(result.stdout, /upload a local file or image/i);
  });
});
