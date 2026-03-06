#!/usr/bin/env node

import { createRequire } from "module";
import { Command } from "commander";
import { search } from "./search.js";
import { slides } from "./slides.js";
import { webExtract } from "./webExtract.js";
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
  .command("web-extract")
  .description("Extract webpage content from a URL (markdown, text, or html)")
  .requiredOption("-u, --url <url>", "page URL to extract")
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
    "wait for selector before extracting"
  )
  .option("--readability", "use readability (main content only)")
  .option("--crawl-mode <mode>", "crawl mode: fast or fine", "fast")
  .option("-t, --timeout <seconds>", "request timeout in seconds", "60")
  .option("-j, --json", "output full API response as JSON")
  .action(async (opts) => {
    const timeoutMs = parseInt(opts.timeout, 10) * 1000;
    const code = await webExtract({
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
