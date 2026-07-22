export const prerender = false;
import { env } from "cloudflare:workers";

const METRICS = ["LCP", "INP", "CLS", "FCP", "TTFB"];
const MAX_VALUES = 500; // reservoir sample size per metric for percentile computation
// Core Web Vitals thresholds (Google)
const THRESHOLDS = {
  LCP:  { good: 2500, poor: 4000  },
  INP:  { good: 200,  poor: 500   },
  CLS:  { good: 0.1,  poor: 0.25  },
  FCP:  { good: 1800, poor: 3000  },
  TTFB: { good: 800,  poor: 1800  },
};

function rateValue(name, value) {
  const t = THRESHOLDS[name];
  if (!t) return "unknown";
  return value <= t.good ? "good" : value <= t.poor ? "ni" : "poor";
}

function ratKey(rat) {
  // web-vitals lib uses "needs-improvement"; normalize to "ni"
  return rat === "good" ? "good" : (rat === "poor" ? "poor" : "ni");
}

function percentile(sortedArr, p) {
  if (!sortedArr?.length) return null;
  const idx = Math.min(Math.ceil(p * sortedArr.length) - 1, sortedArr.length - 1);
  return Math.round(sortedArr[idx] * 1000) / 1000;
}

function emptyMetric() {
  return { count: 0, sum: 0, ratings: { good: 0, ni: 0, poor: 0 }, values: [] };
}

function emptyDayMetric() {
  return { count: 0, sum: 0, ratings: { good: 0, ni: 0, poor: 0 } };
}

// Gated incremental snapshot — mirrors the pattern of /api/snapshot for crawl data.
export async function GET({ url }) {
  const key = url.searchParams.get("key");
  if (!key || key !== env.SNAPSHOT_KEY) {
    return new Response("forbidden", { status: 403 });
  }

  const nowTs = Date.now();

  const [metaRaw, totalsRaw, dailyRaw, byPathRaw] = await Promise.all([
    env.STATS.get("cwv:meta"),
    env.STATS.get("cwv:totals"),
    env.STATS.get("cwv:daily"),
    env.STATS.get("cwv:by-path"),
  ]);

  const meta   = metaRaw   ? JSON.parse(metaRaw)   : { lastRun: 0 };
  const totals = totalsRaw ? JSON.parse(totalsRaw) : {};
  const daily  = dailyRaw  ? JSON.parse(dailyRaw)  : {};
  const byPath = byPathRaw ? JSON.parse(byPathRaw) : {};

  for (const m of METRICS) {
    if (!totals[m]) totals[m] = emptyMetric();
  }

  // Fetch only rows newer than last run
  const since = meta.lastRun || 0;

  let rows = [], dbError = null;
  try {
    const { results } = await env.DB.prepare(
      `SELECT ts, name, value, rating, path FROM cwv_log WHERE ts > ? ORDER BY ts ASC`
    ).bind(since).all();
    rows = results || [];
  } catch (e) { dbError = e.message; }
  if (dbError) return new Response(JSON.stringify({ error: dbError }), { status: 500 });

  for (const r of rows) {
    const m = r.name;
    if (!METRICS.includes(m)) continue;
    const v = typeof r.value === "number" ? r.value : parseFloat(r.value);
    if (!isFinite(v)) continue;

    const day  = new Date(r.ts).toISOString().slice(0, 10);
    const path = r.path || "/";
    const rk   = ratKey(r.rating || rateValue(m, v));

    // totals — reservoir sampling for percentile accuracy
    const t = totals[m];
    t.count += 1;
    t.sum   += v;
    t.ratings[rk] = (t.ratings[rk] || 0) + 1;
    if (t.values.length < MAX_VALUES) {
      t.values.push(v);
    } else {
      const slot = Math.floor(Math.random() * t.count);
      if (slot < MAX_VALUES) t.values[slot] = v;
    }

    // daily
    if (!daily[day])    daily[day]    = {};
    if (!daily[day][m]) daily[day][m] = emptyDayMetric();
    daily[day][m].count += 1;
    daily[day][m].sum   += v;
    daily[day][m].ratings[rk] = (daily[day][m].ratings[rk] || 0) + 1;

    // per-path (skip scanner/bot noise paths)
    if (!path.includes(".") || path.endsWith("/")) {
      if (!byPath[path])    byPath[path]    = {};
      if (!byPath[path][m]) byPath[path][m] = emptyDayMetric();
      byPath[path][m].count += 1;
      byPath[path][m].sum   += v;
      byPath[path][m].ratings[rk] = (byPath[path][m].ratings[rk] || 0) + 1;
    }
  }

  // Sort value arrays and compute percentiles
  for (const m of METRICS) {
    totals[m].values.sort((a, b) => a - b);
    totals[m].p50 = percentile(totals[m].values, 0.50);
    totals[m].p75 = percentile(totals[m].values, 0.75);
    totals[m].p95 = percentile(totals[m].values, 0.95);
  }

  // cwv:daily kept indefinitely — no pruning

  // Prune by-path to top 100 paths by sample count
  const pathEntries = Object.entries(byPath);
  if (pathEntries.length > 100) {
    const keep = new Set(
      pathEntries
        .sort((a, b) => (b[1].LCP?.count || 0) - (a[1].LCP?.count || 0))
        .slice(0, 100).map(([p]) => p)
    );
    for (const p of Object.keys(byPath)) if (!keep.has(p)) delete byPath[p];
  }

  await Promise.all([
    env.STATS.put("cwv:meta",    JSON.stringify({ lastRun: nowTs })),
    env.STATS.put("cwv:totals",  JSON.stringify(totals)),
    env.STATS.put("cwv:daily",   JSON.stringify(daily)),
    env.STATS.put("cwv:by-path", JSON.stringify(byPath)),
  ]);

  return new Response(JSON.stringify({
    ok: true,
    processedRows: rows.length,
    lastRun: new Date(nowTs).toISOString(),
    metrics: Object.fromEntries(METRICS.map(m => [m, { count: totals[m].count, p75: totals[m].p75 }])),
  }), { headers: { "content-type": "application/json" } });
}
