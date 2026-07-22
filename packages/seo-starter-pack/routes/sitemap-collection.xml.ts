export const prerender = false;

export async function GET({ request, params }) {
  const host = new URL(request.url).origin;
  const collectionName = params.collection;
  
  let collections = {};
  try {
    const collModule = await import("../../src/data/collections-sitemap.json");
    collections = collModule.default || {};
  } catch (e) {}

  const items = collections[collectionName];
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    return new Response("Not found", { status: 404 });
  }

  const urls = items.map(item => {
    return `  <url>\n    <loc>${host}${item.url}</loc>${item.lastmod ? `\n    <lastmod>${item.lastmod}</lastmod>` : ""}\n  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new Response(xml.trim(), {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
