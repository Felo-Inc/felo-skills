import {
  getApiKey,
  fetchWithTimeoutAndRetry,
  NO_KEY_MESSAGE,
} from "./search.js";

const DEFAULT_API_BASE = "https://openapi.felo.ai";
const DEFAULT_REQUEST_TIMEOUT_MS = 60_000;
const DEFAULT_LAYOUT = "MIND_MAP";

const VALID_LAYOUTS = [
  "MIND_MAP",
  "LOGICAL_STRUCTURE",
  "ORGANIZATION_STRUCTURE",
  "CATALOG_ORGANIZATION",
  "TIMELINE",
  "FISHBONE",
];

/** API base URL (default https://openapi.felo.ai). Override via FELO_API_BASE env or config if needed. */
async function getApiBase() {
  let base = process.env.FELO_API_BASE?.trim();
  if (!base) {
    const { getConfigValue } = await import("./config.js");
    const v = await getConfigValue("FELO_API_BASE");
    base = typeof v === "string" ? v.trim() : "";
  }
  const normalized = (base || DEFAULT_API_BASE).replace(/\/$/, "");
  return normalized;
}

/**
 * Create a mindmap. Returns { resource_id, status, mindmap_url, livedoc_short_id } or throws.
 * Uses fetchWithTimeoutAndRetry for 5xx retry.
 * @param {string} apiKey
 * @param {string} query
 * @param {string} layout
 * @param {string} livedocShortId
 * @param {number} timeoutMs
 * @param {string} apiBase
 */
async function createMindmap(apiKey, query, layout, livedocShortId, timeoutMs, apiBase) {
  const url = `${apiBase}/v2/mindmap`;
  const body = { query: query.trim(), layout };
  if (livedocShortId) {
    body.livedoc_short_id = livedocShortId;
  }

  const res = await fetchWithTimeoutAndRetry(
    url,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
    timeoutMs
  );

  const data = await res.json().catch(() => ({}));

  if (data.status === "error") {
    const msg = data.message || data.code || "Unknown error";
    throw new Error(msg);
  }

  if (!res.ok) {
    const msg =
      data.message || data.error || res.statusText || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  const payload = data.data;
  if (!payload) {
    throw new Error("Unexpected response: missing data");
  }

  return payload;
}

/**
 * Run mindmap: create mindmap and output URL or error.
 * @returns {Promise<number>} exit code (0 success, 1 failure)
 */
export async function mindmap(query, options = {}) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    console.error(NO_KEY_MESSAGE.trim());
    return 1;
  }

  const requestTimeoutMs = options.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;
  const layout = (options.layout || DEFAULT_LAYOUT).toUpperCase();

  // Validate layout
  if (!VALID_LAYOUTS.includes(layout)) {
    console.error(`Error: Invalid layout "${options.layout}"`);
    console.error("");
    console.error("Available layouts:");
    VALID_LAYOUTS.forEach((l) => console.error(`  - ${l}`));
    return 1;
  }

  try {
    const apiBase = await getApiBase();

    process.stderr.write("Creating mindmap...\n");

    const result = await createMindmap(
      apiKey,
      query,
      layout,
      options.livedocShortId,
      requestTimeoutMs,
      apiBase
    );

    const mindmapUrl = result.mindmap_url;
    const livedocShortId = result.livedoc_short_id;
    const resourceId = result.resource_id;

    if (options.json) {
      console.log(
        JSON.stringify(
          {
            status: "ok",
            data: {
              resource_id: resourceId,
              mindmap_status: result.status,
              mindmap_url: mindmapUrl,
              livedoc_short_id: livedocShortId,
              message: result.message,
            },
          },
          null,
          2
        )
      );
    } else {
      if (mindmapUrl) {
        process.stderr.write("Mindmap ready. Open this link to view:\n");
        console.log(mindmapUrl);
      } else {
        console.error("Error: No mindmap_url in response");
        return 1;
      }
    }

    return 0;
  } catch (err) {
    console.error("Error:", err.message || err);
    return 1;
  }
}

/**
 * List available layout types for mindmap.
 * @returns {Promise<number>} exit code (0 success)
 */
export async function listMindmapLayouts(options = {}) {
  if (options.json) {
    console.log(JSON.stringify({ layouts: VALID_LAYOUTS }, null, 2));
    return 0;
  }

  console.log("Available mindmap layouts:\n");
  const layoutDescriptions = {
    MIND_MAP: "Classic mind map (default)",
    LOGICAL_STRUCTURE: "Logical structure diagram",
    ORGANIZATION_STRUCTURE: "Organization chart",
    CATALOG_ORGANIZATION: "Catalog organization chart",
    TIMELINE: "Timeline diagram",
    FISHBONE: "Fishbone diagram",
  };

  for (const l of VALID_LAYOUTS) {
    const desc = layoutDescriptions[l] || "";
    console.log(`  ${l.padEnd(22)} ${desc}`);
  }

  return 0;
}