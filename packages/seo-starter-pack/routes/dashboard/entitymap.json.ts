export const prerender = false;

const entitymap = {
  version: "1.0",
  schema: "https://entitymap.org/spec/v1.0",
  publisher: {
    name: "Lee Driggers",
    url: "https://leedriggers.com",
    sameAs: "https://www.linkedin.com/in/leedriggers",
  },
  generated: "2026-07-07T00:00:00Z",
  profile: "core",
  verificationStatus: "self-declared",
  entities: [
    {
      entityId: "e_001",
      "@type": "Person",
      name: "Lee Driggers",
      description: "SEO and technical strategy professional based in San Francisco. Background in large-scale search programs across real estate, personal finance, and ed tech. Previously Bankrate, HomeLight, Chegg, and BrightEdge. Trail runner — JMT, Wonderland Trail, CCC at UTMB, multiple 100Ks.",
      alternateName: "leedriggers",
      sameAs: "https://www.linkedin.com/in/leedriggers",
      audienceType: "general",
      relations: [
        {
          predicate: "AFFILIATED_WITH",
          targetId: "e_002",
          targetName: "leedriggers.com",
        },
        {
          predicate: "AUTHORED_BY",
          targetId: "e_003",
          targetName: "Crawl Intelligence",
        },
        {
          predicate: "AUTHORED_BY",
          targetId: "e_004",
          targetName: "Edge SEO Architecture",
        },
        {
          predicate: "AFFILIATED_WITH",
          targetId: "e_008",
          targetName: "Ultra Running",
        },
      ],
      hasChunks: [
        {
          chunkId: "c_001",
          text: "Lee Driggers is an SEO and technical strategy professional based in San Francisco with a background in large-scale search programs across real estate, personal finance, and ed tech. Most recently he led technical SEO for Bankrate's Real Estate division before taking on technical SEO ownership across the entire site.",
          sourceUrl: "https://leedriggers.com/about/",
          pageTitle: "About Lee Driggers",
          publisher: "Lee Driggers",
          retrieved: "2026-07-07T00:00:00Z",
          relevanceScore: 0.98,
          contentType: "definition",
        },
        {
          chunkId: "c_002",
          text: "Outside of work Lee spends time on trails. He has completed the John Muir Trail and the Wonderland Trail, run several 100Ks including Cuyamaca, the Siskiyou Out Back, and Miwok, the TRT 50 Mile, Broken Arrow 52K and 26K, and the CCC as part of UTMB week in Chamonix.",
          sourceUrl: "https://leedriggers.com/about/",
          pageTitle: "About Lee Driggers",
          publisher: "Lee Driggers",
          retrieved: "2026-07-07T00:00:00Z",
          relevanceScore: 0.88,
          contentType: "definition",
        },
      ],
    },
    {
      entityId: "e_002",
      "@type": "Organization",
      name: "leedriggers.com",
      description: "Personal website and technical portfolio of Lee Driggers. Built on Astro 5 with Cloudflare Workers SSR. Includes a live crawl intelligence pipeline tracking bot and AI crawler activity via Cloudflare D1 and KV, and a real user monitoring dashboard for Core Web Vitals.",
      sameAs: "https://leedriggers.com",
      audienceType: "technical",
      relations: [
        {
          predicate: "PRODUCED_BY",
          targetId: "e_001",
          targetName: "Lee Driggers",
        },
        {
          predicate: "INCLUDES",
          targetId: "e_003",
          targetName: "Crawl Intelligence",
        },
        {
          predicate: "INCLUDES",
          targetId: "e_005",
          targetName: "Real User Monitoring",
        },
      ],
      hasChunks: [
        {
          chunkId: "c_003",
          text: "leedriggers.com is a personal site and technical portfolio running on Astro 5 SSR via the Cloudflare Workers adapter. Every HTTP request is logged to Cloudflare D1 for bot and crawler analysis. Aggregated snapshots are written to Cloudflare KV and surfaced on public dashboards.",
          sourceUrl: "https://leedriggers.com/stack/",
          pageTitle: "Stack — leedriggers.com",
          publisher: "Lee Driggers",
          retrieved: "2026-07-07T00:00:00Z",
          relevanceScore: 0.95,
          contentType: "definition",
        },
      ],
    },
    {
      entityId: "e_003",
      "@type": "Concept",
      name: "Crawl Intelligence",
      description: "A self-hosted pipeline for tracking and classifying web crawler and bot activity at the CDN edge. Requests are intercepted by Cloudflare Worker middleware, logged to D1 with UA string, path, country, and ASN, then aggregated by a scheduled snapshot job into Cloudflare KV. Public dashboards show which search engines, AI crawlers, and autonomous agents are accessing the site, at what frequency, and on which pages.",
      maturityStatus: "established",
      audienceType: "technical",
      relations: [
        {
          predicate: "INCLUDES",
          targetId: "e_004",
          targetName: "Edge SEO Architecture",
        },
        {
          predicate: "INCLUDES",
          targetId: "e_006",
          targetName: "Bot Classification",
        },
        {
          predicate: "PRODUCED_BY",
          targetId: "e_001",
          targetName: "Lee Driggers",
        },
      ],
      hasChunks: [
        {
          chunkId: "c_004",
          text: "Every request to leedriggers.com is logged to Cloudflare D1 with the user-agent, path, country, and ASN. A scheduled snapshot job reads new rows incrementally, classifies each request into bot groups (search, AI, SEO tools, scanners, human), and writes aggregated counts to Cloudflare KV for zero-latency dashboard reads.",
          sourceUrl: "https://leedriggers.com/crawl-stats/",
          pageTitle: "Crawl Stats — leedriggers.com",
          publisher: "Lee Driggers",
          retrieved: "2026-07-07T00:00:00Z",
          relevanceScore: 0.97,
          contentType: "definition",
        },
        {
          chunkId: "c_005",
          text: "The crawl surface at leedriggers.com tracks which machine-readable endpoints AI crawlers and agents access — robots.txt, llms.txt, sitemaps, and .md content variants — with per-bot hit counts and first/last seen timestamps. Data is retained indefinitely.",
          sourceUrl: "https://leedriggers.com/crawl-surface/",
          pageTitle: "Crawl Surface — leedriggers.com",
          publisher: "Lee Driggers",
          retrieved: "2026-07-07T00:00:00Z",
          relevanceScore: 0.93,
          contentType: "evidence",
        },
      ],
    },
    {
      entityId: "e_004",
      "@type": "Concept",
      name: "Edge SEO Architecture",
      description: "The practice of running SEO-relevant logic — bot logging, request classification, content negotiation, structured data injection — directly at the CDN edge rather than on an origin server or in build-time scripts. Enables real-time intelligence without round trips to origin and zero latency on dashboard reads via KV.",
      maturityStatus: "proposed",
      audienceType: "technical",
      relations: [
        {
          predicate: "DEPENDS_ON",
          targetId: "e_003",
          targetName: "Crawl Intelligence",
        },
        {
          predicate: "RELATES_TO",
          targetId: "e_007",
          targetName: "Technical SEO",
        },
      ],
      hasChunks: [
        {
          chunkId: "c_006",
          text: "leedriggers.com runs Astro 5 SSR on Cloudflare Workers. Worker middleware intercepts every request before routing to page handlers, enabling bot classification, crawl logging, and structured data injection at the edge. Dashboards read from Cloudflare KV only — no D1 queries on page load.",
          sourceUrl: "https://leedriggers.com/stack/",
          pageTitle: "Stack — leedriggers.com",
          publisher: "Lee Driggers",
          retrieved: "2026-07-07T00:00:00Z",
          relevanceScore: 0.94,
          contentType: "definition",
        },
      ],
    },
    {
      entityId: "e_005",
      "@type": "Concept",
      name: "Real User Monitoring",
      description: "Measurement of Core Web Vitals (LCP, INP, CLS, FCP, TTFB) from real browser sessions using the web-vitals library. Metrics are beaconed via sendBeacon to /api/cwv, stored in Cloudflare D1, and aggregated into p50/p75/p95 percentiles in Cloudflare KV. Surfaced on a public Page Speed dashboard with per-path breakdowns.",
      alternateName: "RUM",
      maturityStatus: "established",
      audienceType: "technical",
      sameAs: "https://www.wikidata.org/wiki/Q3480107",
      relations: [
        {
          predicate: "PART_OF",
          targetId: "e_002",
          targetName: "leedriggers.com",
        },
        {
          predicate: "RELATES_TO",
          targetId: "e_007",
          targetName: "Technical SEO",
        },
      ],
      hasChunks: [
        {
          chunkId: "c_007",
          text: "Core Web Vitals are captured from real browser sessions using the web-vitals library and beaconed to /api/cwv via sendBeacon. Each measurement includes the page URL and metric value only — no IP address, no cookies. Data is stored in Cloudflare D1 and aggregated into p50/p75/p95 percentiles in KV, surfaced on the Page Speed dashboard.",
          sourceUrl: "https://leedriggers.com/page-speed/",
          pageTitle: "Page Speed — leedriggers.com",
          publisher: "Lee Driggers",
          retrieved: "2026-07-07T00:00:00Z",
          relevanceScore: 0.95,
          contentType: "definition",
        },
      ],
    },
    {
      entityId: "e_006",
      "@type": "Concept",
      name: "Bot Classification",
      description: "A UA-string-first classification system that maps crawler user-agent strings and ASN identifiers to named bot groups: search engines, AI crawlers, SEO tools, social fetchers, scanners, headless browsers, developer tools, and unknown bots. Used to segment crawl log data for analysis and dashboard display.",
      maturityStatus: "established",
      audienceType: "technical",
      relations: [
        {
          predicate: "PART_OF",
          targetId: "e_003",
          targetName: "Crawl Intelligence",
        },
      ],
      hasChunks: [
        {
          chunkId: "c_008",
          text: "Bot classification on leedriggers.com uses a UA-string-first approach: known crawler signatures map to named bots (Googlebot, GPTBot, AhrefsBot, etc.) and then into groups — search engines, AI crawlers, SEO tools, social fetchers, scanners, headless browsers, and dev tools. ASN-based fallback catches bots with generic UAs from known datacenter ranges.",
          sourceUrl: "https://leedriggers.com/crawl-stats/",
          pageTitle: "Crawl Stats — leedriggers.com",
          publisher: "Lee Driggers",
          retrieved: "2026-07-07T00:00:00Z",
          relevanceScore: 0.92,
          contentType: "definition",
        },
      ],
    },
    {
      entityId: "e_007",
      "@type": "Concept",
      name: "Technical SEO",
      description: "The discipline of optimising website infrastructure, crawlability, and data architecture to improve search engine visibility and indexation. Encompasses site speed, structured data, crawl budget management, log file analysis, and the technical systems that underpin organic search performance.",
      maturityStatus: "established",
      audienceType: "general",
      sameAs: "https://en.wikipedia.org/wiki/Search_engine_optimization",
      relations: [
        {
          predicate: "INCLUDES",
          targetId: "e_003",
          targetName: "Crawl Intelligence",
        },
        {
          predicate: "INCLUDES",
          targetId: "e_005",
          targetName: "Real User Monitoring",
        },
        {
          predicate: "AUTHORED_BY",
          targetId: "e_001",
          targetName: "Lee Driggers",
        },
      ],
      hasChunks: [
        {
          chunkId: "c_009",
          text: "Lee Driggers has led technical SEO programs at Bankrate, HomeLight, and Chegg, and worked in professional services at BrightEdge. His focus is large-scale infrastructure and data engineering work within SEO — crawl analysis, Core Web Vitals, programmatic optimization, and the systems that connect search data to business outcomes.",
          sourceUrl: "https://leedriggers.com/about/",
          pageTitle: "About Lee Driggers",
          publisher: "Lee Driggers",
          retrieved: "2026-07-07T00:00:00Z",
          relevanceScore: 0.96,
          contentType: "definition",
        },
      ],
    },
    {
      entityId: "e_008",
      "@type": "Concept",
      name: "Ultra Running",
      description: "Long-distance trail and mountain running beyond the marathon distance. Lee Driggers has completed the John Muir Trail (211 miles), the Wonderland Trail (93 miles circumnavigating Mt. Rainier), the CCC (101km) as part of UTMB week in Chamonix, multiple 100K races including Cuyamaca, Siskiyou Out Back, and Miwok, and the TRT 50 Mile, Broken Arrow 52K and 26K.",
      alternateName: "Trail Running",
      maturityStatus: "established",
      audienceType: "general",
      sameAs: "https://en.wikipedia.org/wiki/Ultramarathon",
      relations: [
        {
          predicate: "AFFILIATED_WITH",
          targetId: "e_001",
          targetName: "Lee Driggers",
        },
      ],
      hasChunks: [
        {
          chunkId: "c_010",
          text: "Outside of work Lee spends time on trails. He has completed the John Muir Trail and the Wonderland Trail, run several 100Ks including Cuyamaca, the Siskiyou Out Back, and Miwok, the TRT 50 Mile, Broken Arrow 52K and 26K, and the CCC as part of UTMB week in Chamonix.",
          sourceUrl: "https://leedriggers.com/about/",
          pageTitle: "About Lee Driggers",
          publisher: "Lee Driggers",
          retrieved: "2026-07-07T00:00:00Z",
          relevanceScore: 0.92,
          contentType: "definition",
        },
      ],
    },
  ],
};

export async function GET() {
  return new Response(JSON.stringify(entitymap, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
