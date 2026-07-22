export const prerender = false;

export async function GET({ request }) {
  const host = new URL(request.url).origin;

  const text = `# General crawlers
User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /api/

# Google
User-agent: Googlebot
Allow: /
Disallow: /dashboard/
Disallow: /api/

# Bing
User-agent: Bingbot
Allow: /
Disallow: /dashboard/
Disallow: /api/

# AI training / indexing bots — allowed, we want AI citation
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: YouBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: cohere-ai
Allow: /

User-agent: Meta-ExternalAgent
Allow: /

User-agent: Applebot-Extended
Allow: /

# Sitemap
Sitemap: ${host}/sitemap.xml
Sitemap: ${host}/sitemap-main.xml

# AI discoverability
LLMs: ${host}/llms.txt`;

  return new Response(text.trim(), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
