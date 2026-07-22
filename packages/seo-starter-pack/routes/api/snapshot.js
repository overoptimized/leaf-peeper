export const prerender = false;
import { env } from "cloudflare:workers";
import { classify } from "../../lib/botClassify.js";
import { groupFor, HUMAN_LABELS, TOOL_LABELS, HEADLESS_LABELS } from "../../lib/botGroups.js";
import { CRAWL_LOG_COLUMNS } from "../../lib/crawlLogSchema.js";

// Machine-readable / bot-interface paths tracked with full detail in KV
const AI_PATHS_SET = new Set([
  '/llms.txt', '/ai-catalog.json', '/robots.txt', '/entitymap.json',
  '/sitemap-main.xml', '/sitemap.xml', '/build-lees-sitemap.xml', '/changelog.xml',
]);
const isAiPath = (p) => AI_PATHS_SET.has(p) || p.endsWith('.md') || p.endsWith('.mdx');

const PATH_BLACKLIST = [
  "/dashboard", "/api/", "/keystatic", "/_", "/wp-admin", "/.git",
  "/phpmyadmin", "/backup-2025", "/staging/api", "/internal/api",
  "/sitemap.xml", "/build-lees-sitemap.xml", "/.env", "/config.json",
  "/config.js", "/settings.js", "/passwords.txt", "/database.sql", "/config.bak",
];
function isBlacklisted(path) { return PATH_BLACKLIST.some(p => path.startsWith(p)); }

function sanitizePath(path) {
  let clean = path.split("?")[0];
  clean = clean.replace(/[a-f0-9-]{20,}/gi, "[id]");
  clean = clean.replace(/[^/]+@[^/]+\.[^/]+/g, "[email]");
  clean = clean.replace(/\/\d{4,}\//g, "/[id]/");
  return clean;
}

// groupFor, HUMAN_LABELS, TOOL_LABELS, HEADLESS_LABELS imported from botGroups.js
const botGroup = groupFor;

// Gated incremental snapshot. Reads only rows newer than lastRun, merges into
// persistent KV aggregates so history compounds across runs with no row cap.
export async function GET({ url }) {
  const key = url.searchParams.get("key");
  if (!key || key !== env.SNAPSHOT_KEY) {
    return new Response("forbidden", { status: 403 });
  }

  const nowTs = Date.now();
  const UA_NEW_DAYS = 30;

  // Schema-drift canary: catch a migration that was written but never applied
  // to the live DB before it causes another silent multi-day data-loss
  // incident (see OPERATIONS.md, July 2026). Cheap — one PRAGMA read.
  let missingColumns = [];
  try {
    const { results: liveColumns } = await env.DB.prepare(
      "PRAGMA table_info(crawl_log)"
    ).all();
    const liveNames = new Set(liveColumns.map((c) => c.name));
    missingColumns = CRAWL_LOG_COLUMNS.filter((c) => !liveNames.has(c));
  } catch (e) {
    missingColumns = ["<schema check failed: " + e.message + ">"];
  }
  if (missingColumns.length) {
    return new Response(JSON.stringify({
      ok: false,
      schemaDrift: true,
      missingColumns,
      message: "crawl_log is missing columns the INSERT expects — a migration " +
        "was likely committed but never applied with `wrangler d1 migrations apply --remote`.",
    }), { status: 500, headers: { "content-type": "application/json" } });
  }

  // Load all existing KV aggregates in parallel
  const [metaRaw, dailyRaw, totalsRaw, uaRegRaw, unknownUAsRaw, perpathRaw, perpathDailyRaw, aiPathsRaw, aiPathsDailyRaw] = await Promise.all([
    env.STATS.get("snapshot:meta"),
    env.STATS.get("snapshot:daily"),
    env.STATS.get("snapshot:totals"),
    env.STATS.get("snapshot:ua-registry"),
    env.STATS.get("snapshot:unknown-uas"),
    env.STATS.get("snapshot:perpath"),
    env.STATS.get("snapshot:perpath-daily"),
    env.STATS.get("snapshot:ai-paths"),
    env.STATS.get("snapshot:ai-paths-daily"),
  ]);

  const PERPATH_DAILY_DAYS = 90;

  const meta       = metaRaw       ? JSON.parse(metaRaw)       : { lastRun: 0 };
  const daily      = dailyRaw      ? JSON.parse(dailyRaw)      : {};
  const totals     = totalsRaw     ? JSON.parse(totalsRaw)     : {};
  // uaReg: { bot: [ {ua, firstSeen}, ... ] }
  const uaReg      = uaRegRaw      ? JSON.parse(uaRegRaw)      : {};
  // unknownUAs: { ua: { hits, firstSeen } }
  const unknownUAs = unknownUAsRaw ? JSON.parse(unknownUAsRaw) : {};
  // perpath: { path: [ {bot, hits}, ... ] } — flat array format for CrawlWidget
  // Internally we accumulate as { path: { bot: count } } then convert on write
  const perpathIn  = perpathRaw    ? JSON.parse(perpathRaw)    : {};
  const perpath    = {};
  for (const [path, entries] of Object.entries(perpathIn)) {
    perpath[path] = {};
    for (const { bot, hits } of entries) perpath[path][bot] = hits;
  }

  // perpathDaily: { path: { date: { bot: count } } } — 30-day per-page trend
  const perpathDaily = perpathDailyRaw ? JSON.parse(perpathDailyRaw) : {};

  // aiPaths: { path: { bot: { hits, firstSeen, lastSeen } } } — machine-readable endpoint tracking
  const aiPaths = aiPathsRaw ? JSON.parse(aiPathsRaw) : {};
  // aiPathsDaily: { path: { date: { bot: count } } } — 30-day trend for AI paths
  const aiPathsDaily = aiPathsDailyRaw ? JSON.parse(aiPathsDailyRaw) : {};

  // Fetch only rows newer than last run (incremental)
  // Fall back to 90 days on first ever run so we backfill history
  const since = meta.lastRun || 0;

  let rows = [], dbError = null;
  try {
    const { results } = await env.DB.prepare(
      `SELECT ts, path, ua, as_org, country, verified_bot FROM crawl_log WHERE ts > ? ORDER BY ts ASC`
    ).bind(since).all();
    rows = results || [];
  } catch (e) {
    dbError = e.message;
  }
  if (dbError) {
    return new Response(JSON.stringify({ error: dbError }), { status: 500 });
  }

  let processed = 0;
  for (const r of rows) {
    if (isBlacklisted(r.path)) continue;
    const bot = classify(r.ua, r.as_org, r.path, r.verified_bot);
    const safePath = sanitizePath(r.path);
    const ua = r.ua || "(no UA)";
    const day = new Date(r.ts).toISOString().slice(0, 10);
    processed++;

    // daily counts
    (daily[day] = daily[day] || {})[bot] = (daily[day][bot] || 0) + 1;

    // all-time totals per bot
    const t = totals[bot] = totals[bot] || { hits: 0, firstSeen: r.ts, lastSeen: r.ts, countries: {} };
    t.hits += 1;
    if (r.ts < t.firstSeen) t.firstSeen = r.ts;
    if (r.ts > t.lastSeen)  t.lastSeen  = r.ts;
    if (r.country) t.countries[r.country] = (t.countries[r.country] || 0) + 1;

    // UA registry — append new UA strings with their first-seen timestamp
    if (!uaReg[bot]) uaReg[bot] = [];
    if (!uaReg[bot].some(e => e.ua === ua)) {
      uaReg[bot].push({ ua, firstSeen: r.ts });
    }

    // Unknown bot UA tracking
    if (bot === "Other bot") {
      const unk = unknownUAs[ua] = unknownUAs[ua] || { hits: 0, firstSeen: r.ts };
      unk.hits += 1;
      if (r.ts < unk.firstSeen) unk.firstSeen = r.ts;
    }

    // per-path counts for CrawlWidget — normalize to canonical trailing-slash form
    const canonPath = safePath === "/" ? "/" : safePath.endsWith("/") ? safePath : `${safePath}/`;
    if (!perpath[canonPath]) perpath[canonPath] = {};
    perpath[canonPath][bot] = (perpath[canonPath][bot] || 0) + 1;

    // per-path daily trend
    if (!perpathDaily[canonPath]) perpathDaily[canonPath] = {};
    if (!perpathDaily[canonPath][day]) perpathDaily[canonPath][day] = {};
    perpathDaily[canonPath][day][bot] = (perpathDaily[canonPath][day][bot] || 0) + 1;

    // machine-readable / AI-friendly path detail tracking
    if (isAiPath(r.path)) {
      if (!aiPaths[r.path]) aiPaths[r.path] = {};
      const ap = aiPaths[r.path][bot] = aiPaths[r.path][bot] || { hits: 0, firstSeen: r.ts, lastSeen: r.ts };
      ap.hits += 1;
      if (r.ts < ap.firstSeen) ap.firstSeen = r.ts;
      if (r.ts > ap.lastSeen)  ap.lastSeen  = r.ts;

      if (!aiPathsDaily[r.path]) aiPathsDaily[r.path] = {};
      if (!aiPathsDaily[r.path][day]) aiPathsDaily[r.path][day] = {};
      aiPathsDaily[r.path][day][bot] = (aiPathsDaily[r.path][day][bot] || 0) + 1;
    }
  }

  // snapshot:daily kept indefinitely — no pruning

  // Prune perpathDaily: remove old dates, drop paths that become empty, cap to top 300 paths
  const perpathDailyCutoff = new Date(nowTs - PERPATH_DAILY_DAYS * 86400000).toISOString().slice(0, 10);
  for (const path of Object.keys(perpathDaily)) {
    for (const d of Object.keys(perpathDaily[path])) {
      if (d < perpathDailyCutoff) delete perpathDaily[path][d];
    }
    if (Object.keys(perpathDaily[path]).length === 0) delete perpathDaily[path];
  }
  // Keep top 300 paths by total hits across the window
  const perpathDailyOut = Object.fromEntries(
    Object.entries(perpathDaily)
      .map(([p, days]) => {
        const total = Object.values(days).reduce((s, bots) => s + Object.values(bots).reduce((a, b) => a + b, 0), 0);
        return [p, days, total];
      })
      .sort((a, b) => b[2] - a[2])
      .slice(0, 300)
      .map(([p, days]) => [p, days])
  );

  // Prune aiPathsDaily to retain window
  for (const path of Object.keys(aiPathsDaily)) {
    for (const d of Object.keys(aiPathsDaily[path])) {
      if (d < perpathDailyCutoff) delete aiPathsDaily[path][d];
    }
    if (Object.keys(aiPathsDaily[path]).length === 0) delete aiPathsDaily[path];
  }

  // Derive ua-new: UA strings first seen within UA_NEW_DAYS, for bots that have
  // more than one known UA (i.e. a new version appeared) OR any UA for a bot
  // we've never seen before
  const uaNewCutoff = nowTs - UA_NEW_DAYS * 86400000;
  const uaNew = [];
  for (const [bot, entries] of Object.entries(uaReg)) {
    for (const entry of entries) {
      if (entry.firstSeen >= uaNewCutoff) {
        uaNew.push({ bot, ua: entry.ua, firstSeen: entry.firstSeen, totalVariants: entries.length });
      }
    }
  }
  uaNew.sort((a, b) => b.firstSeen - a.firstSeen);

  // Convert perpath back to CrawlWidget array format, cap at 500 paths
  const perpathOut = {};
  for (const [path, counts] of Object.entries(perpath).slice(0, 500)) {
    perpathOut[path] = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([bot, hits]) => ({ bot, hits }));
  }

  // Write all KV keys in parallel
  await Promise.all([
    env.STATS.put("snapshot:meta",        JSON.stringify({ lastRun: nowTs })),
    env.STATS.put("snapshot:daily",       JSON.stringify(daily)),
    env.STATS.put("snapshot:totals",      JSON.stringify(totals)),
    env.STATS.put("snapshot:ua-registry", JSON.stringify(uaReg)),
    env.STATS.put("snapshot:ua-new",      JSON.stringify(uaNew.slice(0, 500))),
    env.STATS.put("snapshot:unknown-uas", JSON.stringify(unknownUAs)),
    env.STATS.put("snapshot:perpath",       JSON.stringify(perpathOut)),
    env.STATS.put("snapshot:perpath-daily", JSON.stringify(perpathDailyOut)),
    env.STATS.put("snapshot:ai-paths",       JSON.stringify(aiPaths)),
    env.STATS.put("snapshot:ai-paths-daily", JSON.stringify(aiPathsDaily)),
  ]);

  return new Response(JSON.stringify({
    ok: true,
    since: new Date(since).toISOString(),
    rowsFound: rows.length,
    processedRows: processed,
    botsTracked: Object.keys(totals).length,
    dailyDays: Object.keys(daily).length,
    uaVariantsTotal: Object.values(uaReg).reduce((s, e) => s + e.length, 0),
    newUAsInLast30d: uaNew.length,
    unknownUATypes: Object.keys(unknownUAs).length,
    pathsIndexed: Object.keys(perpathOut).length,
    pathsDailyIndexed: Object.keys(perpathDailyOut).length,
    aiPathsIndexed: Object.keys(aiPaths).length,
    lastRun: new Date(nowTs).toISOString(),
  }), { headers: { "content-type": "application/json" } });
}
