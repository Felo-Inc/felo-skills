import fs from 'fs/promises';
import path from 'path';
import os from 'os';

function getConfigFilePath() {
  return process.env.FELO_CONFIG_FILE || path.join(os.homedir(), '.felo', 'config.json');
}

const SENSITIVE_KEYS = ['FELO_API_KEY', 'API_KEY', 'SECRET', 'TOKEN', 'PASSWORD'];

async function ensureConfigDir() {
  await fs.mkdir(path.dirname(getConfigFilePath()), { recursive: true });
}

export async function getConfig() {
  const configFile = getConfigFilePath();
  try {
    const raw = await fs.readFile(configFile, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    if (e.code === 'ENOENT') return {};
    if (e instanceof SyntaxError) {
      process.stderr.write('Warning: Invalid config file, using empty config.\n');
      return {};
    }
    throw e;
  }
}

export async function setConfig(key, value) {
  await ensureConfigDir();
  const config = await getConfig();
  config[key] = value;
  await fs.writeFile(getConfigFilePath(), JSON.stringify(config, null, 2), 'utf-8');
}

export async function getConfigValue(key) {
  const config = await getConfig();
  return config[key];
}

/** Returns value suitable for display; masks sensitive keys. */
export function maskValueForDisplay(key, value) {
  if (value === undefined || value === null) return value;
  const s = String(value).trim();
  if (!s) return s;
  const upper = key.toUpperCase();
  const isSensitive = SENSITIVE_KEYS.some((k) => upper === k || upper.endsWith('_' + k));
  if (!isSensitive || s.length <= 8) return s;
  return s.slice(0, 4) + '...' + s.slice(-4);
}

export async function unsetConfig(key) {
  const config = await getConfig();
  delete config[key];
  await ensureConfigDir();
  await fs.writeFile(getConfigFilePath(), JSON.stringify(config, null, 2), 'utf-8');
}

export async function listConfig() {
  return getConfig();
}

export function getConfigPath() {
  return getConfigFilePath();
}
