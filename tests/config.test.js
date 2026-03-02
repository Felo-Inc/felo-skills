import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const tmpDir = path.join(os.tmpdir(), `felo-test-${Date.now()}`);
const testConfigFile = path.join(tmpDir, 'config.json');
process.env.FELO_CONFIG_FILE = testConfigFile;

import * as config from '../src/config.js';

after(async () => {
  delete process.env.FELO_CONFIG_FILE;
  await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
});

describe('config', () => {
  it('getConfig returns {} when file does not exist', async () => {
    const c = await config.getConfig();
    assert.deepStrictEqual(c, {});
  });

  it('setConfig and getConfigValue', async () => {
    await config.setConfig('FELO_API_KEY', 'fk-secret-123');
    const v = await config.getConfigValue('FELO_API_KEY');
    assert.strictEqual(v, 'fk-secret-123');
  });

  it('listConfig returns all keys', async () => {
    await config.setConfig('OTHER', 'value');
    const c = await config.listConfig();
    assert.ok('FELO_API_KEY' in c);
    assert.ok('OTHER' in c);
  });

  it('unsetConfig removes key', async () => {
    await config.unsetConfig('OTHER');
    const v = await config.getConfigValue('OTHER');
    assert.strictEqual(v, undefined);
  });

  it('getConfigPath returns configured path', () => {
    assert.strictEqual(config.getConfigPath(), testConfigFile);
  });

  it('getConfig returns {} and warns on invalid JSON', async () => {
    await config.setConfig('X', '1');
    await fs.writeFile(testConfigFile, 'not json {', 'utf-8');
    let writeCalls = 0;
    const orig = process.stderr.write;
    process.stderr.write = () => { writeCalls++; };
    const c = await config.getConfig();
    process.stderr.write = orig;
    assert.deepStrictEqual(c, {});
    assert.ok(writeCalls >= 1);
  });

  describe('maskValueForDisplay', () => {
    it('masks FELO_API_KEY when value long enough', () => {
      const val = 'fk-abc123xyz789';
      assert.strictEqual(config.maskValueForDisplay('FELO_API_KEY', val), 'fk-a...z789');
    });

    it('does not mask short value', () => {
      assert.strictEqual(config.maskValueForDisplay('FELO_API_KEY', 'short'), 'short');
    });

    it('does not mask non-sensitive key', () => {
      assert.strictEqual(config.maskValueForDisplay('LOG_LEVEL', 'debug'), 'debug');
    });

    it('returns value for undefined/null', () => {
      assert.strictEqual(config.maskValueForDisplay('X', undefined), undefined);
      assert.strictEqual(config.maskValueForDisplay('X', null), null);
    });
  });
});
