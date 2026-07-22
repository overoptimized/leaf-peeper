import { defineMiddleware } from "astro:middleware";
import { CRAWL_LOG_COLUMNS, bindCrawlLogRow } from "./lib/crawlLogSchema.js";
import { env } from "cloudflare:workers";

const SCHEMA_V = 3;
const CRAWL_LOG_INSERT_SQL = `INSERT INTO crawl_log (${CRAWL_LOG_COLUMNS.join(", ")}) VALUES (${CRAWL_LOG_COLUMNS.map(() => "?").join(",")})`;

// Headers we deliberately capture into raw_headers
const HEADER_ALLOWLIST = [
  "user-agent", "accept", "accept-language", "accept-encoding", "from",
  "referer", "if-modified-since", "if-none-match", "cache-control",
  "x-forwarded-for", "via", "cf-connecting-ip", "cf-ray", "cf-ipcountry",
  "content-type", "range", "purpose", "sec-fetch-mode", "sec-fetch-dest",
];

const CF_BLOB_OMIT = new Set(["tlsClientAuth", "tlsExportedAuthenticator"]);

async function sha256hex(input) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

let _ownerIpCache = { ips: new Set(), fetchedAt: 0 };
const OWNER_IP_TTL_MS = 5 * 60 * 1000;

let _lastDeadLetterWrite = 0;
const DEAD_LETTER_THROTTLE_MS = 5 * 60 * 1000;
const DEAD_LETTER_KV_KEY = "errors:crawl-log";
const DEAD_LETTER_MAX_ENTRIES = 20;

async function recordDeadLetter(statsKV, error, path) {
  const now = Date.now();
  if (now - _lastDeadLetterWrite < DEAD_LETTER_THROTTLE_MS) return;
  _lastDeadLetterWrite = now;
  if (!statsKV) return;
  try {
    const raw = await statsKV.get(DEAD_LETTER_KV_KEY);
    const entries = raw ? JSON.parse(raw) : [];
    entries.unshift({ ts: now, message: String(error?.message ?? error).slice(0, 300), path });
    await statsKV.put(DEAD_LETTER_KV_KEY, JSON.stringify(entries.slice(0, DEAD_LETTER_MAX_ENTRIES)));
  } catch {
    // Best-effort
  }
}

async function isOwnerRequest(req, statsKV) {
  const cookie = req.headers.get("cookie") || "";
  if (cookie.split(";").some(c => c.trim() === "_owner=1")) return true;

  const ip = req.headers.get("cf-connecting-ip");
  if (!ip || !statsKV) return false;

  const now = Date.now();
  if (now - _ownerIpCache.fetchedAt > OWNER_IP_TTL_MS) {
    try {
      const raw = await statsKV.get("owner:ips");
      _ownerIpCache = { ips: new Set(raw ? JSON.parse(raw) : []), fetchedAt: now };
    } catch {
      // Keep stale cache
    }
  }

  return _ownerIpCache.ips.has(ip);
}

export const onRequest = defineMiddleware(async (ctx, next) => {
  const currentEnv = env ?? ctx.locals?.runtime?.env ?? {};
  const start = Date.now();
  const response = await next();

  try {
    const url = ctx.url;
    const skip =
      url.pathname.startsWith("/keystatic") ||
      url.pathname.startsWith("/api/") ||
      url.pathname.startsWith("/dashboard") ||
      url.pathname.startsWith("/crawl-stats") ||
      url.pathname.startsWith("/crawls") ||
      url.pathname.startsWith("/_");

    if (!skip && currentEnv.DB) {
      const mutable = new Response(response.body, response);
      
      const req = ctx.request;
      const cf = req.cf ?? {};
      const h = req.headers;
      const bot = cf.botManagement ?? {};

      const rawHeaders = {};
      for (const name of HEADER_ALLOWLIST) {
        const v = h.get(name);
        if (v != null) rawHeaders[name] = v;
      }

      const rawCf = {};
      for (const [k, v] of Object.entries(cf)) {
        if (!CF_BLOB_OMIT.has(k)) rawCf[k] = v;
      }

      let tlsFp = null;
      const tlsInput = [
        cf.tlsVersion ?? "",
        cf.tlsCipher ?? "",
        cf.tlsClientCiphersSha1 ?? "",
        cf.tlsClientExtensionsSha1 ?? "",
      ].join(":");
      if (tlsInput !== ":::") {
        tlsFp = await sha256hex(tlsInput);
      }

      const respCT = mutable.headers.get("content-type");
      const respCL = mutable.headers.get("content-length");

      const insert = currentEnv.DB.prepare(CRAWL_LOG_INSERT_SQL).bind(...bindCrawlLogRow({
        ts: Date.now(),
        method: req.method,
        path: url.pathname,
        query: url.search || null,
        status: mutable.status,
        ua: h.get("user-agent") || null,
        ip: h.get("cf-connecting-ip") || null,
        asn: cf.asn ?? null,
        as_org: cf.asOrganization ?? null,
        country: cf.country ?? null,
        referer: h.get("referer") || null,
        host: url.host,
        ray_id: h.get("cf-ray") || null,
        cf_verified: cf.verifiedBotCategory ?? null,
        latency_ms: Date.now() - start,
        schema_v: SCHEMA_V,
        http_protocol: cf.httpProtocol ?? null,
        tls_version: cf.tlsVersion ?? null,
        tls_cipher: cf.tlsCipher ?? null,
        colo: cf.colo ?? null,
        client_tcp_rtt: cf.clientTcpRtt ?? null,
        verified_bot: bot.verifiedBot === true ? 1 : (bot.verifiedBot === false ? 0 : null),
        bot_score: bot.score ?? null,
        accept: h.get("accept") || null,
        accept_language: h.get("accept-language") || null,
        accept_encoding: h.get("accept-encoding") || null,
        if_modified_since: h.get("if-modified-since") || null,
        if_none_match: h.get("if-none-match") || null,
        from_header: h.get("from") || null,
        resp_content_type: respCT || null,
        resp_content_length: respCL ? parseInt(respCL) : null,
        raw_cf: JSON.stringify(rawCf),
        raw_headers: JSON.stringify(rawHeaders),
        tls_fp: tlsFp,
        tls_ciphers_sha1: cf.tlsClientCiphersSha1 ?? null,
        tls_extensions_sha1: cf.tlsClientExtensionsSha1 ?? null,
        latitude: cf.latitude != null ? parseFloat(cf.latitude) : null,
        longitude: cf.longitude != null ? parseFloat(cf.longitude) : null,
        city: cf.city ?? null,
        region: cf.region ?? null,
        timezone: cf.timezone ?? null,
        is_owner: (await isOwnerRequest(req, currentEnv.STATS)) ? 1 : null,
      }));

      if (ctx.locals.cfContext?.waitUntil) {
        ctx.locals.cfContext.waitUntil(insert.run());
      } else if (ctx.locals.runtime?.ctx?.waitUntil) {
        ctx.locals.runtime.ctx.waitUntil(insert.run());
      } else {
        await insert.run();
      }
        
      return mutable;
    }
  } catch (e) {
    console.error("crawl-log error:", e);
    await recordDeadLetter(currentEnv.STATS, e, ctx.url?.pathname);
  }

  return response;
});
