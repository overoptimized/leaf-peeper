export const prerender = false;

export async function GET({ request }) {
  const host = new URL(request.url).origin;
  
  let dates = {};
  let collections = {};
  try {
    const datesModule = await import("../../src/data/page-dates.json");
    dates = datesModule.default || {};
    const collModule = await import("../../src/data/collections-sitemap.json");
    collections = collModule.default || {};
  } catch (e) {}

  // Collect all URLs that belong to collections so we can exclude them from the main sitemap
  const collectionUrls = new Set();
  for (const items of Object.values(collections)) {
    if (Array.isArray(items)) {
      items.forEach(item => collectionUrls.add(item.url));
    }
  }

  const urls = [];
  for (const [url, lastmod] of Object.entries(dates)) {
    if (!collectionUrls.has(url)) {
      urls.push(`  <url>\n    <loc>${host}${url}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}\n  </url>`);
    }
  }

  // Fallback if no pages were discovered
  if (urls.length === 0) {
    urls.push(`  <url>\n    <loc>${host}/</loc>\n  </url>`);
  }

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
