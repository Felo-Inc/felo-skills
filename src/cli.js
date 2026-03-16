#!/usr/bin/env node

import { createRequire } from "module";
import { Command } from "commander";
import { search } from "./search.js";
import { slides } from "./slides.js";
import { superAgent, listLiveDocs, listLiveDocResources } from "./superAgent.js";
import { webFetch } from "./webFetch.js";
import { youtubeSubtitling } from "./youtubeSubtitling.js";
import { contentToSlides } from "./contentToSlides.js";
import * as xSearch from "./xSearch.js";
import * as livedoc from "./livedoc.js";
import * as config from "./config.js";

const require = createRequire(import.meta.url);
const pkg = require("../package.json");

/** Delay (ms) before process.exit to let Windows libuv finish handle cleanup. */
const EXIT_DELAY_MS = 50;

/**
 * Flush stdout then stderr, then exit after a short delay. Avoids Node.js
 * Windows UV_HANDLE_CLOSING assertion when process.exit() runs while streams
 * or other handles are still closing.
 * @param {number} code - Exit code.
 */
function flushStdioThenExit(code) {
  const doExit = () => setTimeout(() => process.exit(code), EXIT_DELAY_MS);
  const flushStderr = () => {
    if (process.stderr?.writable && !process.stderr.destroyed) {
      process.stderr.write("", () => doExit());
    } else {
      doExit();
    }
  };
  if (process.stdout?.writable && !process.stdout.destroyed) {
    process.stdout.write("", () => flushStderr());
  } else {
    flushStderr();
  }
}

const program = new Command();

program
  .name("felo")
  .description("Felo AI CLI - real-time search from the terminal")
  .version(pkg.version);

program
  .command("search")
  .description("Search for current information (weather, news, docs, etc.)")
  .argument("<query>", "search query")
  .option("-j, --json", "output raw JSON")
  .option("-v, --verbose", "show query analysis and sources")
  .option("-t, --timeout <seconds>", "request timeout in seconds", "60")
  .action(async (query, opts) => {
    const timeoutMs = parseInt(opts.timeout, 10) * 1000;
    const code = await search(query, {
      json: opts.json,
      verbose: opts.verbose,
      timeoutMs: Number.isNaN(timeoutMs) ? 60000 : timeoutMs,
    });
    process.exitCode = code;
    flushStdioThenExit(code);
  });

program
  .command("slides")
  .description(
    "Generate PPT/slides from a prompt (async task, outputs live doc URL when done)"
  )
  .argument(
    "<query>",
    'PPT generation prompt (e.g. "Felo, 2 pages" or "Introduction to React")'
  )
  .option("-j, --json", "output raw JSON with task_id and live_doc_url")
  .option("-v, --verbose", "show polling status")
  .option(
    "-t, --timeout <seconds>",
    "request timeout in seconds for each API call",
    "60"
  )
  .option(
    "--poll-timeout <seconds>",
    "max seconds to wait for task completion",
    "1200"
  )
  .action(async (query, opts) => {
    const timeoutMs = parseInt(opts.timeout, 10) * 1000;
    const pollTimeoutMs = parseInt(opts.pollTimeout, 10) * 1000 || 1_200_000;
    const code = await slides(query, {
      json: opts.json,
      verbose: opts.verbose,
      timeoutMs: Number.isNaN(timeoutMs) ? 60000 : timeoutMs,
      pollTimeoutMs: Number.isNaN(pollTimeoutMs) ? 1_200_000 : pollTimeoutMs,
    });
    process.exitCode = code;
    flushStdioThenExit(code);
  });

program
  .command("superagent")
  .description(
    "SuperAgent conversation with SSE streaming and LiveDoc (create + stream answer)"
  )
  .argument("<query>", "user query (1–2000 chars)")
  .option("-j, --json", "output JSON with answer, thread_short_id, live_doc_short_id")
  .option("-v, --verbose", "log stream key, thread ID, LiveDoc ID to stderr")
  .option("-t, --timeout <seconds>", "request/stream timeout in seconds", "60")
  .option("--live-doc-id <id>", "reuse existing LiveDoc short_id for continuous conversation")
  .option("--thread-id <id>", "existing thread/conversation ID for follow-up questions")
  .option("--skill-id <id>", "skill ID (only for new conversations)")
  .option("--selected-resource-ids <ids>", "comma-separated resource IDs (only for new conversations)")
  .option("--ext <json>", "extra params as JSON string, e.g. '{\"style_id\":\"xxx\"}' (only for new conversations)")
  .option("--accept-language <lang>", "language preference (e.g. zh, en)")
  .action(async (query, opts) => {
    let ext;
    if (opts.ext) {
      try {
        ext = JSON.parse(opts.ext);
      } catch {
        console.error('Error: --ext must be valid JSON');
        flushStdioThenExit(1);
        return;
      }
    }
    const timeoutMs = parseInt(opts.timeout, 10) * 1000;
    const code = await superAgent(query, {
      json: opts.json,
      verbose: opts.verbose,
      timeoutMs: Number.isNaN(timeoutMs) ? 60000 : timeoutMs,
      liveDocId: opts.liveDocId || undefined,
      threadId: opts.threadId || undefined,
      skillId: opts.skillId || undefined,
      selectedResourceIds: opts.selectedResourceIds ? opts.selectedResourceIds.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      ext,
      acceptLanguage: opts.acceptLanguage || undefined,
    });
    process.exitCode = code;
    flushStdioThenExit(code);
  });

program
  .command("livedocs")
  .description("List LiveDocs with pagination and optional keyword filtering")
  .option("-p, --page <number>", "page number", "1")
  .option("-s, --size <number>", "page size", "20")
  .option("-k, --keyword <keyword>", "keyword filter")
  .option("-j, --json", "output raw JSON")
  .option("-t, --timeout <seconds>", "request timeout in seconds", "60")
  .action(async (opts) => {
    const timeoutMs = parseInt(opts.timeout, 10) * 1000;
    const code = await listLiveDocs({
      page: parseInt(opts.page, 10) || 1,
      size: parseInt(opts.size, 10) || 20,
      keyword: opts.keyword || undefined,
      json: opts.json,
      timeoutMs: Number.isNaN(timeoutMs) ? 60000 : timeoutMs,
    });
    process.exitCode = code;
    flushStdioThenExit(code);
  });

program
  .command("livedoc-resources")
  .description("List resources in a specific LiveDoc")
  .argument("<livedoc-id>", "LiveDoc short_id")
  .option("-j, --json", "output raw JSON")
  .option("-t, --timeout <seconds>", "request timeout in seconds", "60")
  .action(async (liveDocId, opts) => {
    const timeoutMs = parseInt(opts.timeout, 10) * 1000;
    const code = await listLiveDocResources(liveDocId, {
      json: opts.json,
      timeoutMs: Number.isNaN(timeoutMs) ? 60000 : timeoutMs,
    });
    process.exitCode = code;
    flushStdioThenExit(code);
  });

const configCmd = program
  .command("config")
  .description(
    "Manage persisted config (e.g. FELO_API_KEY). Stored in ~/.felo/config.json"
  );

configCmd
  .command("set <key> <value>")
  .description(
    "Set a config value (e.g. felo config set FELO_API_KEY your-key)"
  )
  .action(async (key, value) => {
    try {
      await config.setConfig(key, value);
      console.log(`Set ${key}`);
      flushStdioThenExit(0);
    } catch (e) {
      console.error("Error:", e.message);
      flushStdioThenExit(1);
    }
  });

configCmd
  .command("get <key>")
  .description("Get a config value (sensitive keys are masked)")
  .action(async (key) => {
    try {
      const value = await config.getConfigValue(key);
      if (value === undefined || value === null) {
        console.log("(not set)");
      } else {
        console.log(config.maskValueForDisplay(key, value));
      }
      flushStdioThenExit(0);
    } catch (e) {
      console.error("Error:", e.message);
      flushStdioThenExit(1);
    }
  });

configCmd
  .command("list")
  .description("List all config keys (values are hidden)")
  .action(async () => {
    try {
      const c = await config.listConfig();
      const keys = Object.keys(c);
      if (keys.length === 0) {
        console.log("No config set. Use: felo config set FELO_API_KEY <key>");
      } else {
        keys.forEach((k) => console.log(k));
      }
      flushStdioThenExit(0);
    } catch (e) {
      console.error("Error:", e.message);
      flushStdioThenExit(1);
    }
  });

configCmd
  .command("unset <key>")
  .description("Remove a config value")
  .action(async (key) => {
    try {
      await config.unsetConfig(key);
      console.log(`Unset ${key}`);
      flushStdioThenExit(0);
    } catch (e) {
      console.error("Error:", e.message);
      flushStdioThenExit(1);
    }
  });

configCmd
  .command("path")
  .description("Show config file path")
  .action(() => {
    console.log(config.getConfigPath());
    flushStdioThenExit(0);
  });

program
  .command("web-fetch")
  .description("Fetch webpage content from a URL (markdown, text, or html)")
  .requiredOption("-u, --url <url>", "page URL to fetch")
  .option(
    "-f, --format <format>",
    "output format: html, text, markdown",
    "markdown"
  )
  .option(
    "--target-selector <selector>",
    "CSS selector for target element only"
  )
  .option(
    "--wait-for-selector <selector>",
    "wait for selector before fetching"
  )
  .option("--readability", "use readability (main content only)")
  .option("--crawl-mode <mode>", "crawl mode: fast or fine", "fast")
  .option("-t, --timeout <seconds>", "request timeout in seconds", "60")
  .option("-j, --json", "output full API response as JSON")
  .action(async (opts) => {
    const timeoutMs = parseInt(opts.timeout, 10) * 1000;
    const code = await webFetch({
      url: opts.url,
      format: opts.format,
      targetSelector: opts.targetSelector,
      waitForSelector: opts.waitForSelector,
      readability: opts.readability,
      crawlMode: opts.crawlMode,
      timeoutMs: Number.isNaN(timeoutMs) ? 60000 : timeoutMs,
      json: opts.json,
    });
    process.exitCode = code;
    flushStdioThenExit(code);
  });

program
  .command("youtube-subtitling")
  .description("Fetch YouTube video subtitles/captions by video URL or ID")
  .requiredOption("-v, --video-code <url-or-id>", "YouTube video URL or video ID (e.g. https://youtube.com/watch?v=ID)")
  .option("-l, --language <code>", "Subtitle language (e.g. en, zh-CN)")
  .option("--with-time", "Include start/duration per segment")
  .option("-j, --json", "Output full API response as JSON")
  .action(async (opts) => {
    const code = await youtubeSubtitling({
      videoCode: opts.videoCode,
      language: opts.language,
      withTime: opts.withTime,
      json: opts.json,
    });
    process.exitCode = code;
    flushStdioThenExit(code);
  });

program
  .command("content-to-slides")
  .description(
    "Fetch content from a webpage or YouTube video, then generate a PPT from that content"
  )
  .option("-u, --url <url>", "Web page URL to fetch and turn into slides")
  .option(
    "-v, --video <url-or-id>",
    "YouTube video URL or ID (use subtitles as content)"
  )
  .option(
    "--extra-prompt <text>",
    "Extra instructions for PPT (e.g. 10页以内)"
  )
  .option("--readability", "For --url: use readability (main content only)")
  .option(
    "-l, --language <code>",
    "For --video: subtitle language (e.g. en, zh-CN)"
  )
  .option("-t, --timeout <seconds>", "Fetch timeout in seconds", "60")
  .option(
    "--poll-timeout <seconds>",
    "Max seconds to wait for PPT task",
    "1200"
  )
  .option("-j, --json", "Output JSON with task_id and ppt/live_doc URL")
  .option("--verbose", "Show polling status")
  .action(async (opts) => {
    const timeoutMs = parseInt(opts.timeout, 10) * 1000;
    const pollTimeoutMs = parseInt(opts.pollTimeout, 10) * 1000;
    const code = await contentToSlides({
      url: opts.url,
      video: opts.video,
      extraPrompt: opts.extraPrompt,
      readability: opts.readability,
      language: opts.language,
      timeoutMs: Number.isNaN(timeoutMs) ? 60_000 : timeoutMs,
      pollTimeoutMs: Number.isNaN(pollTimeoutMs) ? 1_200_000 : pollTimeoutMs,
      json: opts.json,
      verbose: opts.verbose,
    });
    process.exitCode = code;
    flushStdioThenExit(code);
  });

// ── X Search ──
program
  .command("x")
  .description("Search X (Twitter) tweets, users, and replies")
  .argument("[query]", "search keyword (default: search tweets)")
  .option("-q, --query <text>", "search keyword (same as positional arg)")
  .option("--id <values>", "tweet IDs or usernames (comma-separated)")
  .option("--user", "switch to user mode")
  .option("--tweets", "get user tweets (with --id --user)")
  .option("-l, --limit <n>", "number of results to return")
  .option("--cursor <cursor>", "pagination cursor")
  .option("--include-replies", "include replies (with --tweets)")
  .option("--query-type <type>", "query type filter (tweet search)")
  .option("--since-time <val>", "start time filter")
  .option("--until-time <val>", "end time filter")
  .option("-j, --json", "output raw JSON")
  .option("-t, --timeout <seconds>", "request timeout in seconds", "30")
  .action(async (queryArg, opts) => {
    const query = (queryArg || opts.query || "").trim();
    const ids = opts.id
      ? opts.id.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    const timeoutMs = parseInt(opts.timeout, 10) * 1000;
    const commonOpts = {
      json: opts.json,
      timeoutMs: Number.isNaN(timeoutMs) ? 30000 : timeoutMs,
    };
    const limit = opts.limit ? parseInt(opts.limit, 10) : 0;
    let code = 1;

    if (query) {
      // query mode
      if (opts.user) {
        // search users
        code = await xSearch.userSearch(query, {
          ...commonOpts,
          cursor: opts.cursor,
        });
      } else {
        // search tweets (default)
        code = await xSearch.tweetSearch(query, {
          ...commonOpts,
          queryType: opts.queryType,
          sinceTime: opts.sinceTime,
          untilTime: opts.untilTime,
          limit: limit || undefined,
          cursor: opts.cursor,
        });
      }
    } else if (ids.length) {
      // id mode
      if (opts.user) {
        if (opts.tweets) {
          // get user tweets
          code = await xSearch.userTweets({
            ...commonOpts,
            username: ids[0],
            limit: limit || undefined,
            cursor: opts.cursor,
            includeReplies: opts.includeReplies,
          });
        } else {
          // get user info
          code = await xSearch.userInfo(ids, commonOpts);
        }
      } else {
        // get tweet replies (default for --id)
        code = await xSearch.tweetReplies(ids, {
          ...commonOpts,
          cursor: opts.cursor,
          sinceTime: opts.sinceTime ? parseInt(opts.sinceTime, 10) : undefined,
          untilTime: opts.untilTime ? parseInt(opts.untilTime, 10) : undefined,
        });
      }
    } else {
      process.stderr.write(
        'Usage: felo x <query> or felo x --id <values>\n\n' +
        'Examples:\n' +
        '  felo x "AI news"                  Search tweets\n' +
        '  felo x "OpenAI" --user             Search users\n' +
        '  felo x --id "1234567890"           Get tweet replies\n' +
        '  felo x --id "elonmusk" --user      Get user info\n' +
        '  felo x --id "elonmusk" --user --tweets  Get user tweets\n'
      );
    }

    process.exitCode = code;
    flushStdioThenExit(code);
  });

// ── LiveDoc ──
const livedocCmd = program
  .command("livedoc")
  .description("Manage Felo LiveDocs (knowledge bases) and resources");

livedocCmd
  .command("create")
  .description("Create a new LiveDoc")
  .requiredOption("--name <name>", "LiveDoc name")
  .option("--description <desc>", "LiveDoc description")
  .option("--icon <icon>", "LiveDoc icon")
  .option("-j, --json", "output raw JSON")
  .option("-t, --timeout <seconds>", "request timeout in seconds", "60")
  .action(async (opts) => {
    const timeoutMs = parseInt(opts.timeout, 10) * 1000;
    const code = await livedoc.createLiveDoc({
      name: opts.name,
      description: opts.description,
      icon: opts.icon,
      json: opts.json,
      timeoutMs: Number.isNaN(timeoutMs) ? 60000 : timeoutMs,
    });
    process.exitCode = code;
    flushStdioThenExit(code);
  });

livedocCmd
  .command("list")
  .description("List LiveDocs")
  .option("--keyword <kw>", "search keyword")
  .option("--page <n>", "page number")
  .option("--size <n>", "page size")
  .option("-j, --json", "output raw JSON")
  .option("-t, --timeout <seconds>", "request timeout in seconds", "60")
  .action(async (opts) => {
    const timeoutMs = parseInt(opts.timeout, 10) * 1000;
    const code = await livedoc.listLiveDocs({
      keyword: opts.keyword,
      page: opts.page,
      size: opts.size,
      json: opts.json,
      timeoutMs: Number.isNaN(timeoutMs) ? 60000 : timeoutMs,
    });
    process.exitCode = code;
    flushStdioThenExit(code);
  });

livedocCmd
  .command("update <short_id>")
  .description("Update a LiveDoc")
  .option("--name <name>", "new name")
  .option("--description <desc>", "new description")
  .option("-j, --json", "output raw JSON")
  .option("-t, --timeout <seconds>", "request timeout in seconds", "60")
  .action(async (shortId, opts) => {
    const timeoutMs = parseInt(opts.timeout, 10) * 1000;
    const code = await livedoc.updateLiveDoc(shortId, {
      name: opts.name,
      description: opts.description,
      json: opts.json,
      timeoutMs: Number.isNaN(timeoutMs) ? 60000 : timeoutMs,
    });
    process.exitCode = code;
    flushStdioThenExit(code);
  });

livedocCmd
  .command("delete <short_id>")
  .description("Delete a LiveDoc")
  .option("-j, --json", "output raw JSON")
  .option("-t, --timeout <seconds>", "request timeout in seconds", "60")
  .action(async (shortId, opts) => {
    const timeoutMs = parseInt(opts.timeout, 10) * 1000;
    const code = await livedoc.deleteLiveDoc(shortId, {
      json: opts.json,
      timeoutMs: Number.isNaN(timeoutMs) ? 60000 : timeoutMs,
    });
    process.exitCode = code;
    flushStdioThenExit(code);
  });

livedocCmd
  .command("resources <short_id>")
  .description("List resources in a LiveDoc")
  .option("--type <type>", "filter by resource type")
  .option("--page <n>", "page number")
  .option("--size <n>", "page size")
  .option("-j, --json", "output raw JSON")
  .option("-t, --timeout <seconds>", "request timeout in seconds", "60")
  .action(async (shortId, opts) => {
    const timeoutMs = parseInt(opts.timeout, 10) * 1000;
    const code = await livedoc.listResources(shortId, {
      type: opts.type,
      page: opts.page,
      size: opts.size,
      json: opts.json,
      timeoutMs: Number.isNaN(timeoutMs) ? 60000 : timeoutMs,
    });
    process.exitCode = code;
    flushStdioThenExit(code);
  });

livedocCmd
  .command("resource <short_id> <resource_id>")
  .description("Get a single resource")
  .option("-j, --json", "output raw JSON")
  .option("-t, --timeout <seconds>", "request timeout in seconds", "60")
  .action(async (shortId, resourceId, opts) => {
    const timeoutMs = parseInt(opts.timeout, 10) * 1000;
    const code = await livedoc.getResource(shortId, resourceId, {
      json: opts.json,
      timeoutMs: Number.isNaN(timeoutMs) ? 60000 : timeoutMs,
    });
    process.exitCode = code;
    flushStdioThenExit(code);
  });

livedocCmd
  .command("add-doc <short_id>")
  .description("Create a text document resource")
  .requiredOption("--content <content>", "document content")
  .option("--title <title>", "document title")
  .option("-j, --json", "output raw JSON")
  .option("-t, --timeout <seconds>", "request timeout in seconds", "60")
  .action(async (shortId, opts) => {
    const timeoutMs = parseInt(opts.timeout, 10) * 1000;
    const code = await livedoc.addDoc(shortId, {
      content: opts.content,
      title: opts.title,
      json: opts.json,
      timeoutMs: Number.isNaN(timeoutMs) ? 60000 : timeoutMs,
    });
    process.exitCode = code;
    flushStdioThenExit(code);
  });

livedocCmd
  .command("add-urls <short_id>")
  .description("Add URL resources (max 10, comma-separated)")
  .requiredOption("--urls <urls>", "comma-separated URLs")
  .option("-j, --json", "output raw JSON")
  .option("-t, --timeout <seconds>", "request timeout in seconds", "60")
  .action(async (shortId, opts) => {
    const timeoutMs = parseInt(opts.timeout, 10) * 1000;
    const code = await livedoc.addUrls(shortId, {
      urls: opts.urls,
      json: opts.json,
      timeoutMs: Number.isNaN(timeoutMs) ? 60000 : timeoutMs,
    });
    process.exitCode = code;
    flushStdioThenExit(code);
  });

livedocCmd
  .command("upload <short_id>")
  .description("Upload a file as resource")
  .requiredOption("--file <path>", "file path to upload")
  .option("--convert", "convert file to document (use upload-doc endpoint)")
  .option("-j, --json", "output raw JSON")
  .option("-t, --timeout <seconds>", "request timeout in seconds", "60")
  .action(async (shortId, opts) => {
    const timeoutMs = parseInt(opts.timeout, 10) * 1000;
    const code = await livedoc.uploadFile(shortId, {
      file: opts.file,
      convert: opts.convert,
      json: opts.json,
      timeoutMs: Number.isNaN(timeoutMs) ? 60000 : timeoutMs,
    });
    process.exitCode = code;
    flushStdioThenExit(code);
  });

livedocCmd
  .command("remove-resource <short_id> <resource_id>")
  .description("Delete a resource")
  .option("-j, --json", "output raw JSON")
  .option("-t, --timeout <seconds>", "request timeout in seconds", "60")
  .action(async (shortId, resourceId, opts) => {
    const timeoutMs = parseInt(opts.timeout, 10) * 1000;
    const code = await livedoc.removeResource(shortId, resourceId, {
      json: opts.json,
      timeoutMs: Number.isNaN(timeoutMs) ? 60000 : timeoutMs,
    });
    process.exitCode = code;
    flushStdioThenExit(code);
  });

livedocCmd
  .command("retrieve <short_id>")
  .description("Semantic search across resources")
  .requiredOption("--query <query>", "search query")
  .option("--resource-ids <ids>", "comma-separated resource IDs to search within")
  .option("-j, --json", "output raw JSON")
  .option("-t, --timeout <seconds>", "request timeout in seconds", "60")
  .action(async (shortId, opts) => {
    const timeoutMs = parseInt(opts.timeout, 10) * 1000;
    const code = await livedoc.retrieve(shortId, {
      query: opts.query,
      resourceIds: opts.resourceIds,
      json: opts.json,
      timeoutMs: Number.isNaN(timeoutMs) ? 60000 : timeoutMs,
    });
    process.exitCode = code;
    flushStdioThenExit(code);
  });

livedocCmd
  .command("route <short_id>")
  .description("Route relevant resource IDs by query")
  .requiredOption("--query <query>", "routing query")
  .option("--max-resources <n>", "max resources to return")
  .option("-j, --json", "output raw JSON")
  .option("-t, --timeout <seconds>", "request timeout in seconds", "60")
  .action(async (shortId, opts) => {
    const timeoutMs = parseInt(opts.timeout, 10) * 1000;
    const code = await livedoc.route(shortId, {
      query: opts.query,
      maxResources: opts.maxResources,
      json: opts.json,
      timeoutMs: Number.isNaN(timeoutMs) ? 60000 : timeoutMs,
    });
    process.exitCode = code;
    flushStdioThenExit(code);
  });

livedocCmd
  .command("download <short_id> <resource_id>")
  .description("Get presigned download URL for a resource source file (302 redirect)")
  .option("--expires-in <seconds>", "URL expiry in seconds (default 3600)")
  .option("-j, --json", "output raw JSON")
  .option("-t, --timeout <seconds>", "request timeout in seconds", "60")
  .action(async (shortId, resourceId, opts) => {
    const timeoutMs = parseInt(opts.timeout, 10) * 1000;
    const code = await livedoc.downloadResource(shortId, resourceId, {
      expiresIn: opts.expiresIn,
      json: opts.json,
      timeoutMs: Number.isNaN(timeoutMs) ? 60000 : timeoutMs,
    });
    process.exitCode = code;
    flushStdioThenExit(code);
  });

livedocCmd
  .command("content <short_id> <resource_id>")
  .description("Get extracted text content of a resource")
  .option("-j, --json", "output raw JSON")
  .option("-t, --timeout <seconds>", "request timeout in seconds", "60")
  .action(async (shortId, resourceId, opts) => {
    const timeoutMs = parseInt(opts.timeout, 10) * 1000;
    const code = await livedoc.getResourceContent(shortId, resourceId, {
      json: opts.json,
      timeoutMs: Number.isNaN(timeoutMs) ? 60000 : timeoutMs,
    });
    process.exitCode = code;
    flushStdioThenExit(code);
  });

livedocCmd
  .command("ppt-retrieve <short_id>")
  .description("Deep content retrieval from a specific PPT page")
  .requiredOption("--resource-id <id>", "PPT resource ID")
  .requiredOption("--page-number <n>", "page number (starts from 1)")
  .requiredOption("--query <query>", "retrieval query")
  .option("--max-chunk <n>", "max chunks to return (default 3)")
  .option("-j, --json", "output raw JSON")
  .option("-t, --timeout <seconds>", "request timeout in seconds", "60")
  .action(async (shortId, opts) => {
    const timeoutMs = parseInt(opts.timeout, 10) * 1000;
    const code = await livedoc.pptRetrieve(shortId, {
      resourceId: opts.resourceId,
      pageNumber: opts.pageNumber,
      query: opts.query,
      maxChunk: opts.maxChunk,
      json: opts.json,
      timeoutMs: Number.isNaN(timeoutMs) ? 60000 : timeoutMs,
    });
    process.exitCode = code;
    flushStdioThenExit(code);
  });

program
  .command("summarize")
  .description("Summarize text or URL (coming when API is available)")
  .argument("[input]", "text or URL to summarize")
  .action(() => {
    console.error("summarize: not yet implemented. Use felo search for now.");
    flushStdioThenExit(1);
  });

program
  .command("translate")
  .description("Translate text (coming when API is available)")
  .argument("[text]", "text to translate")
  .action(() => {
    console.error("translate: not yet implemented. Use felo search for now.");
    flushStdioThenExit(1);
  });

program.parse();
