export const prerender = false;

export async function GET({ request, site }) {
  const host = new URL(request.url).origin;

  // Pull site config from Astro.site if available, fall back to request origin
  const siteUrl = site?.href?.replace(/\/$/, '') || host;

  // Leaf Peeper-specific llms.txt — site implementors can override via integration options
  const text = `# ${siteUrl}
# llms.txt — AI agent & LLM discoverability file (https://llmstxt.org)

> This site provides fall foliage tracking, peak color forecasts, and scenic drive
> guides for the United States. Data includes historical phenology, real-time
> condition reports, and interactive maps across 48 states and 250+ locations.

## Key pages

- [Home](${siteUrl}/): Interactive national fall foliage map
- [Scenic Drives](${siteUrl}/scenic-drives/): GPS-traced fall foliage drives across the US
- [Regions](${siteUrl}/regions/): Regional foliage breakdown (New England, Appalachians, Rockies, Pacific Northwest)
- [Blog](${siteUrl}/blog/): Foliage news, tips, and seasonal guides
- [Reports](${siteUrl}/reports/): Real-time field color reports by location
- [Forecasts](${siteUrl}/forecast/): Expert annual peak timing predictions

## Sitemap

- [XML Sitemap Index](${siteUrl}/sitemap.xml)
- [Main Pages Sitemap](${siteUrl}/sitemap-main.xml)
- [States Sitemap](${siteUrl}/sitemap-states.xml)
- [Locations Sitemap](${siteUrl}/sitemap-locations.xml)
- [Drives Sitemap](${siteUrl}/sitemap-drives.xml)
`;

  return new Response(text.trim(), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
