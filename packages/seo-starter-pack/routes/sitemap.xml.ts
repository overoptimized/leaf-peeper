export const prerender = false;

export async function GET({ request }) {
  const host = new URL(request.url).origin;
  
  let collections = {};
  let dates = {};
  try {
    const collModule = await import("../../src/data/collections-sitemap.json");
    collections = collModule.default || {};
    const datesModule = await import("../../src/data/page-dates.json");
    dates = datesModule.default || {};
  } catch (e) {
    // Missing data - maybe script hasn't been run
  }

  const sitemaps = [];
  
  // 1. The main sitemap (top level pages)
  sitemaps.push(`  <sitemap>
    <loc>${host}/sitemap-main.xml</loc>
    ${dates["/"] ? `<lastmod>${dates["/"]}</lastmod>` : ""}
  </sitemap>`);

  // 2. Collection sitemaps
  for (const [collection, items] of Object.entries(collections)) {
    if (!Array.isArray(items) || items.length === 0) continue;
    
    // Find the most recent lastmod across all items in this collection
    let latest = null;
    for (const item of items) {
      if (!latest || (item.lastmod && item.lastmod > latest)) {
        latest = item.lastmod;
      }
    }
    
    sitemaps.push(`  <sitemap>
    <loc>${host}/sitemap-${collection}.xml</loc>
    ${latest ? `<lastmod>${latest}</lastmod>` : ""}
  </sitemap>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.join("\n")}
</sitemapindex>`;

  return new Response(xml.trim(), {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
