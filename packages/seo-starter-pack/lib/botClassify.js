// isVerifiedBot: 1 = CF confirmed, 0 = CF explicitly denied, null = not checked
export function classify(ua, asOrg, path, isVerifiedBot = null) {
  const u = (ua || "").toLowerCase();
  const o = (asOrg || "").toLowerCase();
  const p = (path || "").toLowerCase();

  // Helper: if CF explicitly denied verification for a UA-matched bot, flag as spoofed
  const maybe = (name) => isVerifiedBot === 0 ? `${name} (spoofed)` : name;

  // ── AI Coding Agents ────────────────────────────────────────────────────────
  if (u.includes("claude-code")) return "Claude Code";
  if (u.startsWith("cursor") || u.includes("cursor/")) return "Cursor";
  if (u.includes("devin")) return "Devin";
  if (u.includes("google-gemini-cli")) return "Gemini CLI";
  if (u.includes("opencode")) return "OpenCode";
  if (u.includes("trae")) return "Trae";

  // ── AI Agents ───────────────────────────────────────────────────────────────
  if (u.includes("chatgpt-agent")) return "ChatGPT Agent";
  if (u.includes("googleagent-mariner") || u.includes("googleagent-urlcontext") || u.includes("google-agent")) return "Google Agent";
  if (u.includes("amazonbuyforme")) return "Amazon BuyForMe";
  if (u.includes("novaact")) return "Amazon NovaAct";
  if (u.includes("manus-user")) return "Manus";
  if (u.includes("twinagent")) return "TwinAgent";

  // ── AI Assistants (user-triggered) ──────────────────────────────────────────
  if (u.includes("claude-user")) return "Claude (User)";
  if (u.includes("chatgpt-user")) return "ChatGPT (User)";
  if (u.includes("perplexity-user")) return "Perplexity (User)";
  if (u.includes("mistralai-user")) return "Mistral (User)";
  if (u.includes("kimi-user")) return "Kimi (User)";
  if (u.includes("gemini-deep-research")) return "Gemini Deep Research";
  if (u.includes("google-notebooklm")) return "Google NotebookLM";
  if (u.includes("duckassistbot")) return "DuckAssist";
  if (u.includes("phindbot")) return "Phind";
  if (u.includes("amzn-user")) return "Amazon (User)";
  if (u.includes("kagi-fetcher")) return "Kagi";
  if (u.includes("wrtnbot")) return "WRTNBot";
  if (u.includes("iaskbot") || u.includes("iaskspider")) return "iAsk AI";
  if (u.includes("bigsur.ai")) return "Big Sur AI";

  // ── AI Search Crawlers ───────────────────────────────────────────────────────
  if (u.includes("claude-searchbot")) return "Claude SearchBot";
  if (u.includes("oai-searchbot")) return "OpenAI SearchBot";
  if (u.includes("perplexitybot")) return "PerplexityBot";
  if (u.includes("mistralai-index")) return "Mistral Index";
  if (u.includes("kimi-searchbot")) return "Kimi SearchBot";
  if (u.includes("xai-searchbot")) return "xAI (Grok)";
  if (u.includes("amzn-searchbot")) return "Amzn SearchBot";
  if (u.includes("azureai-searchbot")) return "Azure AI SearchBot";
  if (u.includes("linkupbot")) return "LinkupBot";
  if (u.includes("cloudflare-autorag")) return "Cloudflare AutoRAG";
  if (u.includes("channel3bot")) return "Channel3Bot";
  if (u.includes("zanistabot")) return "ZanistaBot";

  // ── AI Data Scrapers (training / indexing) ───────────────────────────────────
  if (u.includes("gptbot")) return maybe("GPTBot");
  if (u.includes("claudebot") || u.includes("anthropic-ai") || u.includes("claude-web")) return maybe("ClaudeBot");
  if (u.includes("google-extended")) return maybe("Google Extended");
  if (u.includes("googleother")) return maybe("GoogleOther");
  if (u.includes("google-cloudvertexbot") || u.includes("cloudvertexbot")) return "Google VertexBot";
  if (u.includes("bytespider") || u.includes("imagespider")) return "Bytespider";
  if (u.includes("ccbot")) return "CCBot";
  if (u.includes("meta-externalagent") || u.includes("facebookbot")) return "Meta (Scraper)";
  if (u.includes("amazonbot")) return "Amazonbot";
  if (u.includes("applebot-extended")) return "Applebot Extended";
  if (u.includes("mistralbot")) return "MistralBot";
  if (u.includes("kimibot")) return "KimiBot";
  if (u.includes("pangubot")) return "PanguBot";
  if (u.includes("petalbot")) return "PetalBot";
  if (u.includes("chatglm-spider")) return "ChatGLM Spider";
  if (u.includes("cohere-training") || u.includes("coherebot") || u.includes("cohere-ai")) return "Cohere";
  if (u.includes("deepseekbot")) return "DeepSeekBot";
  if (u.includes("ai2bot")) return "AI2Bot";
  if (u.includes("timpibot")) return "Timpibot";
  if (u.includes("webzio-extended") || u.includes("webzio")) return "Webz.io";
  if (u.includes("diffbot")) return "Diffbot";
  if (u.includes("kangaroo bot")) return "Kangaroo Bot";
  if (u.includes("sbintuitionsbot")) return "SB Intuitions";
  if (u.includes("omgili")) return "Webz.io";

  // ── AI Data Providers ────────────────────────────────────────────────────────
  if (u.includes("firecrawlagent")) return "Firecrawl";
  if (u.includes("tavilybot")) return "Tavily";
  if (u.includes("exabot")) return "Exa";
  if (u.includes("apifybot") || u.includes("apifywebsitecontentcrawler")) return "Apify";
  if (u.includes("youbot")) return "You.com";
  if (u.includes("brightbot")) return "Bright Data";
  if (u.includes("henkbot")) return "Valyu";

  // ── Archiver ─────────────────────────────────────────────────────────────────
  if (u.includes("ia_archiver") || u.includes("archive.org_bot") || u.includes("heritrix") || u.includes("iabot") || u.includes("internetarchivebot")) return "Internet Archive";

  // ── Traditional Search Engines ───────────────────────────────────────────────
  if (u.includes("googlebot") || u.includes("google-inspectiontool")) return maybe("Googlebot");
  if (u.includes("bingbot") || u.includes("msnbot") || u.includes("adidxbot")) return maybe("Bingbot");
  if (u.includes("yandexbot") || u.includes("yandexmobilebot") || u.includes("yandeximages") || u.includes("yandexrenderresourcesbot")) return maybe("YandexBot");
  if (u.includes("baiduspider")) return maybe("Baiduspider");
  if (u.includes("duckduckbot") || u.includes("duckduckgo-favicons")) return maybe("DuckDuckBot");
  if (u.includes("applebot")) return maybe("Applebot");
  if (u.includes("yeti") && o.includes("naver")) return maybe("NaverBot");
  if (u.includes("mojeekbot") || u.includes("mojeek")) return maybe("MojeekBot");
  if (u.includes("yahoo! slurp") || u.includes("yahoocachesystem")) return maybe("Yahoo");
  if (u.includes("sogou")) return maybe("Sogou");
  if (u.includes("seznambot")) return maybe("SeznamBot");
  if (u.includes("qwantbot") || u.includes("qwantify")) return maybe("Qwantbot");
  if (u.includes("kagibot")) return maybe("Kagi");
  if (u.includes("coccocbot")) return maybe("Cốc Cốc");

  // ── Social / RSS Fetchers ─────────────────────────────────────────────────────
  if (u.includes("twitterbot")) return "Twitterbot";
  if (u.includes("linkedinbot")) return "LinkedInBot";
  if (u.includes("slackbot") || u.includes("slack-imgproxy")) return "Slackbot";
  if (u.includes("discordbot")) return "Discordbot";
  if (u.includes("facebookexternalhit")) return "Facebook";
  if (u.includes("whatsapp")) return "WhatsApp";
  if (u.includes("telegrambot")) return "Telegram";
  if (u.includes("pinterestbot")) return "Pinterest";
  if (u.includes("redditbot")) return "Reddit";

  // ── SEO Crawlers ─────────────────────────────────────────────────────────────
  if (u.includes("ahrefsbot") || u.includes("ahrefs site audit") || u.includes("ahrefssiteaudit")) return "AhrefsBot";
  if (u.includes("semrushbot")) return "SemrushBot";
  if (u.includes("mj12bot")) return "MajesticBot";
  if (u.includes("dotbot") || u.includes("rogerbot")) return "MozBot";
  if (u.includes("screaming frog")) return "Screaming Frog";
  if (u.includes("dataforseo")) return "DataForSEO";
  if (u.includes("seobilitybot")) return "SeobilityBot";
  if (u.includes("barkrowler")) return "Barkrowler";
  if (u.includes("blexbot")) return "BLEXBot";
  if (u.includes("sitebulb")) return "Sitebulb";

  // ── Security Scanners ────────────────────────────────────────────────────────
  if (u.includes("censysinspect") || u.includes("shodan") || u.includes("nmap") || u.includes("masscan") || u.includes("zgrab")) return "Security Scanner";
  if (/\.env|\/config\.(js|json)|\/settings\.js|\/api\/(env|config)|\.git|wp-admin|wp-login|phpmyadmin|\/setup\//i.test(p)) return "Scanner / probe";

  // ── Generic ──────────────────────────────────────────────────────────────────
  if (u.includes("bot") || u.includes("crawler") || u.includes("spider")) return "Other bot";

  // ── ASN fallbacks ─────────────────────────────────────────────────────────────
  if (o.includes("openai")) return "OpenAI (by ASN)";
  if (o.includes("anthropic")) return "Anthropic (by ASN)";
  if (o.includes("google")) return "Google (by ASN)";

  // ── No UA ─────────────────────────────────────────────────────────────────────
  if (!ua || !ua.trim()) return "No User-Agent";

  // ── Headless browsers / automation frameworks ─────────────────────────────────
  if (u.includes("headlesschrome") || u.includes("headless")) return "Headless Browser";
  if (u.includes("playwright")) return "Playwright";
  if (u.includes("puppeteer")) return "Puppeteer";
  if (u.includes("selenium") || u.includes("webdriver")) return "Selenium";
  if (u.includes("phantomjs")) return "PhantomJS";
  if (u.includes("slimerjs")) return "SlimerJS";
  // Chrome without a real platform string is a headless signal
  if (u.includes("chrome") && !u.includes("mozilla") && !u.includes("safari")) return "Headless Browser";

  // ── HTTP libraries / CLI tools ────────────────────────────────────────────────
  if (u.startsWith("curl/")) return "curl";
  if (u.startsWith("wget/")) return "wget";
  if (u.startsWith("python-requests") || u.startsWith("python-urllib") || u.startsWith("python/") || u.includes("python-httpx")) return "Python HTTP";
  if (u.startsWith("go-http-client") || u.startsWith("go/")) return "Go HTTP";
  if (u.startsWith("node-fetch") || u.startsWith("node/") || u.includes("axios/") || u.includes("got/") || u.includes("undici")) return "Node.js HTTP";
  if (u.startsWith("java/") || u.includes("apache-httpclient") || u.includes("okhttp")) return "Java HTTP";
  if (u.startsWith("ruby") || u.includes("faraday") || u.includes("httparty")) return "Ruby HTTP";
  if (u.startsWith("php/") || u.includes("guzzlehttp") || u.includes("php-curl")) return "PHP HTTP";
  if (u.startsWith("rust") || u.includes("reqwest")) return "Rust HTTP";
  if (u.includes("libcurl") || u.includes("pycurl")) return "curl";
  if (u.startsWith("powershell") || u.includes("invoke-webrequest")) return "PowerShell";
  if (u.startsWith("httrack") || u.includes("wget-mirror") || u.includes("teleport")) return "Offline Browser";

  // ── Browser detection (order matters — most specific first) ──────────────────
  // Samsung Browser must come before Chrome (its UA contains "Chrome")
  if (u.includes("samsungbrowser")) return "Samsung Browser";
  // DuckDuckGo mobile browser
  if (u.includes("duckduckgo/") && u.includes("mobile")) return "DuckDuckGo Browser";
  // Edge must come before Chrome (its UA contains "Chrome")
  if (u.includes("edg/") || u.includes("edge/")) return "Edge";
  // Opera must come before Chrome (OPR builds include "Chrome")
  if (u.includes("opr/") || u.startsWith("opera")) return "Opera";
  // Chrome (real Chrome, not a derivative above)
  if (u.includes("chrome/") && u.includes("mozilla")) return "Chrome";
  // Firefox
  if (u.includes("firefox/") || u.includes("fxios")) return "Firefox";
  // Safari — UA contains "Safari" but NOT "Chrome" (Chrome UA includes both)
  if (u.includes("safari/") && !u.includes("chrome")) return "Safari";
  // IE / legacy
  if (u.includes("trident/") || u.includes("msie")) return "Internet Explorer";

  return "Browser";
}

export const BOT_COLORS = {
  // AI Coding Agents
  "Claude Code": "#d97757",
  "Cursor": "#000000",
  "Devin": "#5b21b6",
  "Gemini CLI": "#4285f4",
  "OpenCode": "#f97316",
  "Trae": "#fe2c55",
  // AI Agents
  "ChatGPT Agent": "#10a37f",
  "Google Agent": "#4285f4",
  "Amazon BuyForMe": "#ff9900",
  "Amazon NovaAct": "#ff9900",
  "Manus": "#6366f1",
  "TwinAgent": "#0ea5e9",
  // AI Assistants
  "Claude (User)": "#d97757",
  "ChatGPT (User)": "#10a37f",
  "Perplexity (User)": "#20808d",
  "Mistral (User)": "#ff6b35",
  "Kimi (User)": "#7c3aed",
  "Gemini Deep Research": "#4285f4",
  "Google NotebookLM": "#4285f4",
  "DuckAssist": "#de5833",
  "Phind": "#6c63ff",
  "Amazon (User)": "#ff9900",
  "WRTNBot": "#0ea5e9",
  "iAsk AI": "#6c63ff",
  "Big Sur AI": "#64748b",
  // AI Search Crawlers
  "Claude SearchBot": "#d97757",
  "OpenAI SearchBot": "#10a37f",
  "PerplexityBot": "#20808d",
  "Mistral Index": "#ff6b35",
  "Kimi SearchBot": "#7c3aed",
  "xAI (Grok)": "#111827",
  "Amzn SearchBot": "#ff9900",
  "Azure AI SearchBot": "#0078d4",
  "LinkupBot": "#6366f1",
  "Cloudflare AutoRAG": "#f6821f",
  "Channel3Bot": "#0ea5e9",
  // AI Data Scrapers
  "GPTBot": "#10a37f",
  "ClaudeBot": "#d97757",
  "Google Extended": "#4285f4",
  "GoogleOther": "#4285f4",
  "Google VertexBot": "#4285f4",
  "Bytespider": "#fe2c55",
  "CCBot": "#6b7280",
  "Meta (Scraper)": "#0668e1",
  "Amazonbot": "#ff9900",
  "Applebot Extended": "#555555",
  "MistralBot": "#ff6b35",
  "KimiBot": "#7c3aed",
  "PanguBot": "#cc0000",
  "PetalBot": "#cc0000",
  "ChatGLM Spider": "#6d28d9",
  "Cohere": "#39594a",
  "DeepSeekBot": "#4d6bfe",
  "AI2Bot": "#0891b2",
  "Timpibot": "#64748b",
  "Webz.io": "#475569",
  "Diffbot": "#7c3aed",
  "Kangaroo Bot": "#b45309",
  "SB Intuitions": "#475569",
  // AI Data Providers
  "Firecrawl": "#f97316",
  "Tavily": "#6366f1",
  "Exa": "#111827",
  "Apify": "#20c65a",
  "You.com": "#0ea5e9",
  "Bright Data": "#2563eb",
  "Valyu": "#7c3aed",
  // Archiver
  "Internet Archive": "#888888",
  // Search Engines
  "Googlebot": "#4285f4",
  "Bingbot": "#008373",
  "YandexBot": "#cc0000",
  "Baiduspider": "#2932e1",
  "DuckDuckBot": "#de5833",
  "Applebot": "#555555",
  "NaverBot": "#03c75a",
  "MojeekBot": "#2c6e49",
  "Yahoo": "#7b0099",
  "Sogou": "#e5352d",
  "SeznamBot": "#cc0000",
  "Qwantbot": "#5a28be",
  "Kagi": "#f97316",
  "Cốc Cốc": "#e11d48",
  // Social / Fetchers
  "Twitterbot": "#111827",
  "LinkedInBot": "#0a66c2",
  "Slackbot": "#4a154b",
  "Discordbot": "#5865f2",
  "Facebook": "#0668e1",
  "WhatsApp": "#25d366",
  "Telegram": "#26a5e4",
  "Pinterest": "#e60023",
  "Reddit": "#ff4500",
  // SEO
  "AhrefsBot": "#ff7c00",
  "SemrushBot": "#ff6b2d",
  "MajesticBot": "#c41e3a",
  "MozBot": "#0e8a8a",
  "Screaming Frog": "#7dc142",
  "DataForSEO": "#2563eb",
  "SeobilityBot": "#22c55e",
  "Barkrowler": "#b45309",
  "BLEXBot": "#64748b",
  "Sitebulb": "#f59e0b",
  // Security
  "Security Scanner": "#ef4444",
  "Scanner / probe": "#dc2626",
  // Fallbacks
  "Other bot": "#9333ea",
  "OpenAI (by ASN)": "#10a37f",
  "Anthropic (by ASN)": "#d97757",
  "Google (by ASN)": "#4285f4",
  // Unclassified sub-categories
  "Browser": "#94a3b8",
  "No User-Agent": "#dc2626",
  "Headless Browser": "#b45309",
  "Playwright": "#b45309",
  "Puppeteer": "#b45309",
  "Selenium": "#b45309",
  "PhantomJS": "#78716c",
  "SlimerJS": "#78716c",
  "curl": "#64748b",
  "wget": "#64748b",
  "Python HTTP": "#3b82f6",
  "Go HTTP": "#06b6d4",
  "Node.js HTTP": "#22c55e",
  "Java HTTP": "#f59e0b",
  "Ruby HTTP": "#dc2626",
  "PHP HTTP": "#818cf8",
  "Rust HTTP": "#f97316",
  "PowerShell": "#2563eb",
  "Offline Browser": "#78716c",
  // Site owner
  "Site Owner": "#8b5cf6",
  // Browsers
  "Chrome": "#4285f4",
  "Firefox": "#ff6611",
  "Safari": "#006cbe",
  "Edge": "#0078d4",
  "Opera": "#ff1b2d",
  "Samsung Browser": "#1428a0",
  "DuckDuckGo Browser": "#de5833",
  "Internet Explorer": "#0076d6",
  // Legacy label kept for old KV snapshot data
  "Human / unknown": "#94a3b8",
  // Spoofed — CF explicitly denied verification despite UA claiming a known bot
  "Googlebot (spoofed)": "#ef4444",
  "Bingbot (spoofed)": "#ef4444",
  "YandexBot (spoofed)": "#ef4444",
  "Baiduspider (spoofed)": "#ef4444",
  "DuckDuckBot (spoofed)": "#ef4444",
  "Applebot (spoofed)": "#ef4444",
  "NaverBot (spoofed)": "#ef4444",
  "MojeekBot (spoofed)": "#ef4444",
  "Yahoo (spoofed)": "#ef4444",
  "Sogou (spoofed)": "#ef4444",
  "SeznamBot (spoofed)": "#ef4444",
  "Qwantbot (spoofed)": "#ef4444",
  "Kagi (spoofed)": "#ef4444",
  "Cốc Cốc (spoofed)": "#ef4444",
  "GPTBot (spoofed)": "#ef4444",
  "ClaudeBot (spoofed)": "#ef4444",
  "Google Extended (spoofed)": "#ef4444",
  "GoogleOther (spoofed)": "#ef4444",
};

export const colorFor = (b) => BOT_COLORS[b] || "#94a3b8";

export const SEARCH_BOTS = new Set([
  "Googlebot", "Bingbot", "YandexBot", "Baiduspider", "DuckDuckBot",
  "Applebot", "NaverBot", "MojeekBot", "Yahoo", "Sogou",
  "SeznamBot", "Qwantbot", "Kagi", "Cốc Cốc",
]);
export const AI_BOTS = new Set([
  "Claude Code", "Cursor", "Devin", "Gemini CLI", "OpenCode", "Trae",
  "ChatGPT Agent", "Google Agent", "Amazon BuyForMe", "Amazon NovaAct", "Manus", "TwinAgent",
  "Claude (User)", "ChatGPT (User)", "Perplexity (User)", "Mistral (User)", "Kimi (User)",
  "Gemini Deep Research", "Google NotebookLM", "DuckAssist", "Phind", "Amazon (User)",
  "WRTNBot", "iAsk AI", "Big Sur AI",
  "Claude SearchBot", "OpenAI SearchBot", "PerplexityBot", "Mistral Index", "Kimi SearchBot",
  "xAI (Grok)", "Amzn SearchBot", "Azure AI SearchBot", "LinkupBot", "Cloudflare AutoRAG", "Channel3Bot",
  "GPTBot", "ClaudeBot", "Google Extended", "GoogleOther", "Google VertexBot",
  "Bytespider", "CCBot", "Meta (Scraper)", "Amazonbot", "Applebot Extended",
  "MistralBot", "KimiBot", "PanguBot", "PetalBot", "ChatGLM Spider",
  "Cohere", "DeepSeekBot", "AI2Bot", "Timpibot", "Webz.io", "Diffbot",
  "Kangaroo Bot", "SB Intuitions",
  "Firecrawl", "Tavily", "Exa", "Apify", "You.com", "Bright Data", "Valyu",
]);
export const ASN_BOTS = new Set([
  "OpenAI (by ASN)", "Anthropic (by ASN)", "Google (by ASN)",
]);
export const SEO_BOTS = new Set([
  "AhrefsBot", "SemrushBot", "MajesticBot", "MozBot", "Screaming Frog",
  "DataForSEO", "SeobilityBot", "Barkrowler", "BLEXBot", "Sitebulb",
]);
export const SOCIAL_BOTS = new Set([
  "Twitterbot", "LinkedInBot", "Slackbot", "Discordbot", "Facebook",
  "WhatsApp", "Telegram", "Pinterest", "Reddit",
]);
