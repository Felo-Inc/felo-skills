#!/usr/bin/env node

import { Command } from 'commander';
import { search } from './search.js';

const program = new Command();

program
  .name('felo')
  .description('Felo AI CLI - real-time search from the terminal')
  .version('0.1.0');

program
  .command('search')
  .description('Search for current information (weather, news, docs, etc.)')
  .argument('<query>', 'search query')
  .option('-j, --json', 'output raw JSON')
  .option('-v, --verbose', 'show query analysis and sources')
  .action(async (query, opts) => {
    const code = await search(query, { json: opts.json, verbose: opts.verbose });
    process.exit(code);
  });

program.parse();
