import { getWebContent } from "./webFetch.js";
import { getYoutubeContent } from "./youtubeSubtitling.js";
import { slides } from "./slides.js";

const DEFAULT_PROMPT_PREFIX =
  "Generate a presentation from the content below. Summarize key points and organize into clear slides:";
const MAX_CONTENT_LENGTH = 20_000;

/**
 * Fetch content from URL (web or YouTube), then generate PPT.
 * @param {Object} opts - { url?, video?, extraPrompt?, readability?, language?, timeoutMs?, pollTimeoutMs?, json?, verbose? }
 * @returns {Promise<number>} exit code (0 or 1)
 */
export async function contentToSlides(opts) {
  const hasUrl = Boolean(opts?.url && String(opts.url).trim());
  const hasVideo = Boolean(opts?.video && String(opts.video).trim());
  if (!hasUrl && !hasVideo) {
    process.stderr.write(
      "ERROR: Provide either --url <page-url> or --video <youtube-url-or-id>\n"
    );
    return 1;
  }
  if (hasUrl && hasVideo) {
    process.stderr.write("ERROR: Provide only one of --url or --video\n");
    return 1;
  }

  const fetchTimeoutMs =
    Number.isFinite(opts?.timeoutMs) && opts.timeoutMs > 0
      ? opts.timeoutMs
      : 60_000;

  let content;
  try {
    if (hasUrl) {
      process.stderr.write(`Fetching page: ${opts.url.slice(0, 60)}...\n`);
      content = await getWebContent({
        url: opts.url,
        format: "markdown",
        readability: opts?.readability ?? true,
        timeoutMs: fetchTimeoutMs,
      });
    } else {
      process.stderr.write("Fetching YouTube subtitles...\n");
      content = await getYoutubeContent({
        videoCode: opts.video,
        language: opts?.language ?? "",
        timeoutMs: fetchTimeoutMs,
      });
    }
  } catch (err) {
    process.stderr.write(`Fetch failed: ${err?.message || err}\n`);
    return 1;
  }

  content = (content || "").trim();
  if (!content) {
    process.stderr.write(
      "ERROR: No content fetched. Page may be empty or video has no subtitles.\n"
    );
    return 1;
  }

  if (content.length > MAX_CONTENT_LENGTH) {
    content =
      content.slice(0, MAX_CONTENT_LENGTH) + "\n\n[... content truncated ...]";
  }

  const promptSuffix = opts?.extraPrompt
    ? `\n\nExtra instructions: ${opts.extraPrompt}`
    : "";
  const query = `${DEFAULT_PROMPT_PREFIX}\n\n${content}${promptSuffix}`;

  process.stderr.write("Generating PPT (this may take a few minutes)...\n");
  return slides(query, {
    json: opts?.json,
    verbose: opts?.verbose,
    timeoutMs: fetchTimeoutMs,
    pollTimeoutMs: opts?.pollTimeoutMs,
    pptConfig: opts?.theme ? { ai_theme_id: opts.theme } : undefined,
  });
}
