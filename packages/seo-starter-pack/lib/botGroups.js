/**
 * Shared bot-group definitions used by crawl-stats, dashboard, and CrawlWidget.
 * Keeps group labels, colors, ordering, and the groupFor() classifier in one place.
 */
import { SEARCH_BOTS, AI_BOTS, SEO_BOTS, SOCIAL_BOTS, ASN_BOTS } from "./botClassify.js";

export const HUMAN_LABELS = new Set([
  "Browser", "Human / unknown",
  "Chrome", "Firefox", "Safari", "Edge", "Opera",
  "Samsung Browser", "DuckDuckGo Browser", "Internet Explorer",
]);

export const TOOL_LABELS = new Set([
  "curl", "wget", "Python HTTP", "Go HTTP", "Node.js HTTP",
  "Java HTTP", "Ruby HTTP", "PHP HTTP", "Rust HTTP", "PowerShell",
  "Offline Browser", "No User-Agent",
]);

export const HEADLESS_LABELS = new Set([
  "Headless Browser", "Playwright", "Puppeteer",
  "Selenium", "PhantomJS", "SlimerJS",
]);

export const GROUP_COLORS = {
  search:   { bar: "#4285f4", bg: "#4285f414", text: "#4285f4" },
  ai:       { bar: "#10a37f", bg: "#10a37f14", text: "#10a37f" },
  seo:      { bar: "#f59e0b", bg: "#f59e0b14", text: "#d97706" },
  social:   { bar: "#0a66c2", bg: "#0a66c214", text: "#0a66c2" },
  scanner:  { bar: "#dc2626", bg: "#dc26260a", text: "#dc2626" },
  other:    { bar: "#9333ea", bg: "#9333ea0a", text: "#9333ea" },
  human:    { bar: "#22c55e", bg: "#22c55e14", text: "#16a34a" },
  tool:     { bar: "#64748b", bg: "#64748b14", text: "#64748b" },
  headless: { bar: "#f97316", bg: "#f9731614", text: "#ea580c" },
  asn:      { bar: "#06b6d4", bg: "#06b6d414", text: "#0891b2" },
  unknown:  { bar: "#94a3b8", bg: "#94a3b814", text: "#94a3b8" },
};

export const GROUP_LABELS = {
  search:   "Search Engines",
  ai:       "AI Crawlers",
  seo:      "SEO Tools",
  social:   "Social / Fetchers",
  scanner:  "Scanners & Probes",
  other:    "Other / Unclassified",
  human:    "Human / Browser",
  tool:     "Dev Tools & Scripts",
  headless: "Headless Browsers",
  asn:      "ASN-identified Bots",
  unknown:  "Unknown",
};

export const GROUP_LABELS_SHORT = {
  search:   "Search",
  ai:       "AI",
  seo:      "SEO",
  social:   "Social",
  scanner:  "Scanners",
  other:    "Other",
  human:    "Human",
  tool:     "Tools",
  headless: "Headless",
  asn:      "ASN",
  unknown:  "Unknown",
};

/** Full display order — bot-facing groups first, then visitor/tool groups */
export const GROUP_ORDER = [
  "search", "ai", "seo", "social", "scanner", "other",
  "human", "tool", "headless", "asn", "unknown",
];

/** Map a bot label to its group key. Returns null for human/browser traffic. */
export function groupFor(bot) {
  if (HUMAN_LABELS.has(bot))    return "human";
  if (SEARCH_BOTS.has(bot))     return "search";
  if (AI_BOTS.has(bot))         return "ai";
  if (SEO_BOTS.has(bot))        return "seo";
  if (SOCIAL_BOTS.has(bot))     return "social";
  if (bot === "Security Scanner" || bot === "Scanner / probe") return "scanner";
  if (bot === "Other bot")       return "other";
  if (TOOL_LABELS.has(bot))     return "tool";
  if (HEADLESS_LABELS.has(bot)) return "headless";
  if (ASN_BOTS.has(bot))        return "asn";
  return "unknown";
}

/** True if the label represents a real human browser session */
export const isHuman = (bot) => HUMAN_LABELS.has(bot);
