import { superAgent } from './superAgent.js';

function buildAppleBuyAdvisorPrompt(query) {
  const trimmed = String(query || '').trim();
  return [
    `/apple-buy-advisor ${trimmed}`,
    '',
    'If slash-style skill routing is unavailable, still act as an Apple product buy advisor.',
    'Use current information, compare relevant Apple models, summarize user and professional feedback when possible, and end with a clear buying recommendation.',
  ].join('\n');
}

export async function appleBuyAdvisor(query, options = {}) {
  return superAgent(buildAppleBuyAdvisorPrompt(query), options);
}

export { buildAppleBuyAdvisorPrompt };
