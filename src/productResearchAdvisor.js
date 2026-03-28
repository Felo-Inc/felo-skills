import { superAgent } from './superAgent.js';

function buildProductResearchAdvisorPrompt(query) {
  const trimmed = String(query || '').trim();
  return [
    `/product-research-advisor ${trimmed}`,
    '',
    'If slash-style skill routing is unavailable, still act as a product research advisor.',
    'Use current information, collect official specs plus user and professional reviews, and end with a concise product summary or recommendation.',
  ].join('\n');
}

export async function productResearchAdvisor(query, options = {}) {
  return superAgent(buildProductResearchAdvisorPrompt(query), options);
}

export { buildProductResearchAdvisorPrompt };
