import { getApiKey, NO_KEY_MESSAGE } from './search.js';
import * as config from './config.js';

const DEFAULT_API_BASE = 'https://openapi.felo.ai';
const DEFAULT_TIMEOUT_MS = 30_000;
const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const SPINNER_INTERVAL_MS = 80;
const STATUS_PAD = 52;

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

/** Extract video ID from a YouTube URL or return the string if it looks like a plain ID. Returns null if invalid. */
function extractVideoId(urlOrId) {
  const s = typeof urlOrId === 'string' ? urlOrId.trim() : '';
  if (!s) return null;
  try {
    if (s.startsWith('http://') || s.startsWith('https://')) {
      const u = new URL(s);
      if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('?')[0] || null;
      if (u.hostname === 'www.youtube.com' || u.hostname === 'youtube.com') {
        if (u.pathname === '/watch') return u.searchParams.get('v');
        const m = u.pathname.match(/^\/(?:embed|v)\/([a-zA-Z0-9_-]{10,12})/);
        if (m) return m[1];
        return u.searchParams.get('v');
      }
    }
    if (/^[a-zA-Z0-9_-]{10,12}$/.test(s)) return s;
    return null;
  } catch {
    return null;
  }
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

function formatContents(contents, withTime) {
  if (!Array.isArray(contents) || contents.length === 0) return '';
  return contents
    .map((c) => {
      if (withTime && (c.start != null || c.duration != null)) {
        const start = Number(c.start);
        const dur = Number(c.duration);
        const startSec = Number.isFinite(start) ? start : 0;
        const durSec = Number.isFinite(dur) ? dur : 0;
        return `[${startSec.toFixed(2)}s, +${durSec.toFixed(2)}s] ${c.text ?? ''}`;
      }
      return c.text ?? '';
    })
    .filter(Boolean)
    .join('\n');
}

async function fetchSubtitling(apiBase, apiKey, params, timeoutMs) {
  const url = `${apiBase}/v2/youtube/subtitling?${params.toString()}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
    });
    let data = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${getMessage(data)}`);
    const code = data.code;
    const hasData = data?.data != null;
    const successCodes = [0, 200];
    const ok =
      successCodes.includes(Number(code)) ||
      code === undefined ||
      code === null ||
      (hasData && res.ok);
    if (!ok) throw new Error(getMessage(data));
    return data;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Run YouTube subtitling and print result. Returns exit code (0 or 1).
 * @param {Object} opts - { videoCode, language, withTime, json }
 */
export async function youtubeSubtitling(opts) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    console.error(NO_KEY_MESSAGE.trim());
    return 1;
  }
  const raw = opts?.videoCode != null ? String(opts.videoCode).trim() : '';
  if (!raw) {
    process.stderr.write('ERROR: YouTube video URL or video ID is required.\n');
    return 1;
  }
  const videoCode = extractVideoId(raw);
  if (!videoCode) {
    process.stderr.write('ERROR: Invalid YouTube URL or video ID. Use a link (e.g. https://youtube.com/watch?v=ID) or an 11-character video ID.\n');
    return 1;
  }

  const apiBase = await getApiBase();
  const timeoutMs =
    Number.isFinite(opts.timeoutMs) && opts.timeoutMs > 0 ? opts.timeoutMs : DEFAULT_TIMEOUT_MS;

  const spinnerId = startSpinner(`Fetching subtitles ${videoCode}`);

  const params = new URLSearchParams({ video_code: videoCode });
  if (opts.language && String(opts.language).trim()) params.set('language', String(opts.language).trim());
  if (opts.withTime) params.set('with_time', 'true');

  try {
    const payload = await fetchSubtitling(apiBase, apiKey, params, timeoutMs);
    const data = payload?.data ?? {};
    const title = data?.title ?? '';
    const contents = data?.contents ?? [];

    if (opts.json) {
      console.log(JSON.stringify(payload, null, 2));
      return 0;
    }

    const text = formatContents(contents, opts.withTime);
    const isEmpty = !text || text.trim() === '';

    if (isEmpty) {
      process.stderr.write(
        `No subtitles found for video ${videoCode}. The video may have no captions or the language is not available.\n`
      );
      return 1;
    }

    if (title) {
      console.log(`# ${title}\n`);
    }
    console.log(text);
    return 0;
  } catch (err) {
    process.stderr.write(
      `YouTube subtitling failed for ${videoCode}: ${err?.message || err}\n`
    );
    return 1;
  } finally {
    stopSpinner(spinnerId);
  }
}
