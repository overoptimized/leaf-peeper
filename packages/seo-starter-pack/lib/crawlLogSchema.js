// Single source of truth for the crawl_log column list. middleware.js's
// INSERT and the schema-drift canary in api/snapshot.js both import this so
// they can't silently drift apart from the live D1 table (see OPERATIONS.md,
// July 2026 incident: a migration existed in the repo but was never applied
// to prod, and this INSERT failed silently for ~8 days).
export const CRAWL_LOG_COLUMNS = [
  "ts", "method", "path", "query", "status", "ua", "ip", "asn", "as_org", "country",
  "referer", "host", "ray_id", "cf_verified", "latency_ms",
  "schema_v", "http_protocol", "tls_version", "tls_cipher", "colo", "client_tcp_rtt",
  "verified_bot", "bot_score", "accept", "accept_language", "accept_encoding",
  "if_modified_since", "if_none_match", "from_header",
  "resp_content_type", "resp_content_length", "raw_cf", "raw_headers", "tls_fp",
  "tls_ciphers_sha1", "tls_extensions_sha1",
  "latitude", "longitude", "city", "region", "timezone", "is_owner",
];

// Turns a { columnName: value } object into a positionally-ordered array
// matching CRAWL_LOG_COLUMNS, for .bind(...spread). Deliberately keyed by
// name rather than position: reordering or inserting a column in the array
// above can no longer silently desync from a hand-written positional
// argument list (the actual bug class this replaces — see OPERATIONS.md).
// Throws on a missing key instead of silently binding `undefined`, so a
// forgotten column fails loudly at deploy/test time, not as quietly wrong
// data in production.
export function bindCrawlLogRow(values) {
  return CRAWL_LOG_COLUMNS.map((col) => {
    if (!(col in values)) {
      throw new Error(`bindCrawlLogRow: missing value for column "${col}"`);
    }
    return values[col];
  });
}
