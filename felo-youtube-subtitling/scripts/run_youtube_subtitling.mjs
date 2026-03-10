#!/usr/bin/env node

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

/** Extract video ID from YouTube URL or return string if plain ID. Returns null if invalid. */
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

function usage() {
  console.error(
    [
      'Usage:',
      '  node felo-youtube-subtitling/scripts/run_youtube_subtitling.mjs --video-code <url-or-id> [options]',
      '',
      'Options:',
      '  --video-code, -v <url-or-id>  YouTube video URL or 11-char video ID (required)',
      '  --language, -l <code>         Subtitle language (e.g. en, zh-CN)',
      '  --with-time                  Include start/duration per segment',
      '  --json, -j                   Print full API response as JSON',
      '  --help                       Show this help',
    ].join('\n')
  );
}

function parseArgs(argv) {
  const out = {
    videoCode: '',
    language: '',
    withTime: false,
    json: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--help' || a === '-h') {
      out.help = true;
    } else if (a === '--json' || a === '-j') {
      out.json = true;
    } else if (a === '--with-time') {
      out.withTime = true;
    } else if (a === '--video-code' || a === '-v') {
      const next = argv[i + 1];
      if (next === undefined || next === null || String(next).trim() === '' || String(next).startsWith('-')) {
        out.videoCode = '';
      } else {
        out.videoCode = String(next).trim();
      }
      i += 1;
    } else if (a === '--language' || a === '-l') {
      out.language = (argv[i + 1] ?? '').trim();
      i += 1;
    }
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
    const code = body.code;
    const hasData = body?.data != null;
    const successCodes = [0, 200];
    const hasSuccessCode =
      successCodes.includes(Number(code)) ||
      code === undefined ||
      code === null ||
      (hasData && res.ok);
    if (!hasSuccessCode) {
      throw new Error(getMessage(body));
    }
    return body;
  } finally {
    clearTimeout(timer);
  }
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

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    process.exit(0);
  }
  const videoCode = extractVideoId(args.videoCode);
  if (!videoCode) {
    if (!args.videoCode || String(args.videoCode).trim() === '') {
      usage();
    } else {
      console.error('ERROR: Invalid YouTube URL or video ID. Use a link (e.g. https://youtube.com/watch?v=ID) or an 11-character video ID.');
    }
    process.exit(1);
  }

  const apiKey = process.env.FELO_API_KEY?.trim();
  if (!apiKey) {
    console.error('ERROR: FELO_API_KEY not set');
    process.exit(1);
  }

  const apiBase = (process.env.FELO_API_BASE?.trim() || DEFAULT_API_BASE).replace(/\/$/, '');

  const spinnerId = startSpinner(`Fetching subtitles ${videoCode}`);

  try {
    const params = new URLSearchParams({ video_code: videoCode });
    if (args.language) params.set('language', args.language);
    if (args.withTime) params.set('with_time', 'true');

    const url = `${apiBase}/v2/youtube/subtitling?${params.toString()}`;

    const payload = await fetchJson(
      url,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      },
      DEFAULT_TIMEOUT_MS
    );

    const data = payload?.data ?? {};
    const title = data?.title ?? '';
    const contents = data?.contents ?? [];

    if (args.json) {
      console.log(JSON.stringify(payload, null, 2));
      return;
    }

    const text = formatContents(contents, args.withTime);
    const isEmpty = !text || text.trim() === '';

    if (isEmpty) {
      stopSpinner(spinnerId);
      process.stderr.write(
        `No subtitles found for video ${videoCode}. The video may have no captions or the language is not available.\n`
      );
      process.exit(1);
    }

    if (title) {
      console.log(`# ${title}\n`);
    }
    console.log(text);
  } finally {
    stopSpinner(spinnerId);
  }
}

main().catch((err) => {
  let videoCode = '';
  const argv = process.argv.slice(2);
  const i = argv.findIndex((a) => a === '--video-code' || a === '-v');
  if (i >= 0 && argv[i + 1]) videoCode = argv[i + 1];
  process.stderr.write(
    `YouTube subtitling failed${videoCode ? ` for video ${videoCode}` : ''}: ${err?.message || err}\n`
  );
  process.exit(1);
});
