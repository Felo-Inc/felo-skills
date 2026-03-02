const FELO_API = 'https://openapi.felo.ai/v2/chat';

const NO_KEY_MESSAGE = `
❌ Felo API Key not configured

To use Felo CLI, set the FELO_API_KEY environment variable:

1. Get your API key from https://felo.ai (Settings → API Keys)
2. Set the environment variable:

   Linux/macOS:
   export FELO_API_KEY="your-api-key-here"

   Windows (PowerShell):
   $env:FELO_API_KEY="your-api-key-here"

3. Run your command again.
`;

export async function search(query, options = {}) {
  const apiKey = process.env.FELO_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    console.error(NO_KEY_MESSAGE.trim());
    return 1;
  }

  try {
    process.stderr.write('Searching...\n');

    const res = await fetch(FELO_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: query.trim() }),
    });

    const data = await res.json().catch(() => ({}));

    // API error response: { status: "error", code, message } (per doc)
    if (data.status === 'error') {
      const msg = data.message || data.code || 'Unknown error';
      console.error(`Error: ${msg}`);
      return 1;
    }

    if (!res.ok) {
      const msg = data.message || data.error || res.statusText || `HTTP ${res.status}`;
      console.error(`Error: ${msg}`);
      return 1;
    }

    // Success: { status: "ok", data: { answer, query_analysis: { queries }, resources } }
    const payload = data.data;
    if (!payload) {
      console.error('Error: Unexpected response format');
      return 1;
    }

    if (options.json) {
      console.log(JSON.stringify(data, null, 2));
      return 0;
    }

    // Default: only the answer (stdout, pipe-friendly)
    if (payload.answer) {
      console.log(payload.answer);
    }

    // Verbose: add query analysis and sources (per API doc)
    if (options.verbose) {
      const queries = payload.query_analysis?.queries;
      if (Array.isArray(queries) && queries.length) {
        process.stderr.write('\n## Query Analysis\n');
        process.stderr.write(`Optimized search terms: ${queries.join(', ')}\n`);
      }
      const resources = payload.resources;
      if (Array.isArray(resources) && resources.length) {
        process.stderr.write('\n## Sources\n');
        resources.forEach((r) => {
          process.stderr.write(`- ${r.title}: ${r.link}\n`);
        });
      }
    }

    return 0;
  } catch (err) {
    console.error('Error:', err.message || err);
    return 1;
  }
}
