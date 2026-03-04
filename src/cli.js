#!/usr/bin/env node

import { createRequire } from 'module';
import { Command } from 'commander';
import { search } from './search.js';
import { slides } from './slides.js';
import * as config from './config.js';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const program = new Command();

program
  .name('felo')
  .description('Felo AI CLI - real-time search from the terminal')
  .version(pkg.version);

program
  .command('search')
  .description('Search for current information (weather, news, docs, etc.)')
  .argument('<query>', 'search query')
  .option('-j, --json', 'output raw JSON')
  .option('-v, --verbose', 'show query analysis and sources')
  .option('-t, --timeout <seconds>', 'request timeout in seconds', '60')
  .action(async (query, opts) => {
    const timeoutMs = parseInt(opts.timeout, 10) * 1000;
    const code = await search(query, {
      json: opts.json,
      verbose: opts.verbose,
      timeoutMs: Number.isNaN(timeoutMs) ? 60000 : timeoutMs,
    });
    process.exitCode = code;
    // Defer exit so stdout/stderr can flush; avoids Node.js Windows UV_HANDLE_CLOSING assertion
    setTimeout(() => process.exit(code), 0);
  });

program
  .command('slides')
  .description('Generate PPT/slides from a prompt (async task, outputs live doc URL when done)')
  .argument('<query>', 'PPT generation prompt (e.g. "Felo, 2 pages" or "Introduction to React")')
  .option('-j, --json', 'output raw JSON with task_id and live_doc_url')
  .option('-v, --verbose', 'show polling status')
  .option('-t, --timeout <seconds>', 'request timeout in seconds for each API call', '60')
  .option('--poll-timeout <seconds>', 'max seconds to wait for task completion', '600')
  .action(async (query, opts) => {
    const timeoutMs = parseInt(opts.timeout, 10) * 1000;
    const pollTimeoutMs = parseInt(opts.pollTimeout, 10) * 1000 || 600000;
    const code = await slides(query, {
      json: opts.json,
      verbose: opts.verbose,
      timeoutMs: Number.isNaN(timeoutMs) ? 60000 : timeoutMs,
      pollTimeoutMs: Number.isNaN(pollTimeoutMs) ? 600000 : pollTimeoutMs,
    });
    process.exitCode = code;
    // Defer exit so stderr can flush; reduces Node.js Windows assertion (UV_HANDLE_CLOSING)
    setTimeout(() => process.exit(code), 0);
  });

const configCmd = program
  .command('config')
  .description('Manage persisted config (e.g. FELO_API_KEY). Stored in ~/.felo/config.json');

configCmd
  .command('set <key> <value>')
  .description('Set a config value (e.g. felo config set FELO_API_KEY your-key)')
  .action(async (key, value) => {
    try {
      await config.setConfig(key, value);
      console.log(`Set ${key}`);
    } catch (e) {
      console.error('Error:', e.message);
      process.exit(1);
    }
  });

configCmd
  .command('get <key>')
  .description('Get a config value (sensitive keys are masked)')
  .action(async (key) => {
    try {
      const value = await config.getConfigValue(key);
      if (value === undefined || value === null) {
        console.log('(not set)');
      } else {
        console.log(config.maskValueForDisplay(key, value));
      }
    } catch (e) {
      console.error('Error:', e.message);
      process.exit(1);
    }
  });

configCmd
  .command('list')
  .description('List all config keys (values are hidden)')
  .action(async () => {
    try {
      const c = await config.listConfig();
      const keys = Object.keys(c);
      if (keys.length === 0) {
        console.log('No config set. Use: felo config set FELO_API_KEY <key>');
        return;
      }
      keys.forEach((k) => console.log(k));
    } catch (e) {
      console.error('Error:', e.message);
      process.exit(1);
    }
  });

configCmd
  .command('unset <key>')
  .description('Remove a config value')
  .action(async (key) => {
    try {
      await config.unsetConfig(key);
      console.log(`Unset ${key}`);
    } catch (e) {
      console.error('Error:', e.message);
      process.exit(1);
    }
  });

configCmd
  .command('path')
  .description('Show config file path')
  .action(() => {
    console.log(config.getConfigPath());
  });

program
  .command('summarize')
  .description('Summarize text or URL (coming when API is available)')
  .argument('[input]', 'text or URL to summarize')
  .action(() => {
    console.error('summarize: not yet implemented. Use felo search for now.');
    process.exit(1);
  });

program
  .command('translate')
  .description('Translate text (coming when API is available)')
  .argument('[text]', 'text to translate')
  .action(() => {
    console.error('translate: not yet implemented. Use felo search for now.');
    process.exit(1);
  });

program.parse();
