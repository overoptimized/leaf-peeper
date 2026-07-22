CREATE TABLE IF NOT EXISTS crawl_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  ts          INTEGER NOT NULL,
  method      TEXT,
  path        TEXT,
  query       TEXT,
  status      INTEGER,
  ua          TEXT,
  ip          TEXT,
  asn         INTEGER,
  as_org      TEXT,
  country     TEXT,
  referer     TEXT,
  host        TEXT,
  ray_id      TEXT,
  cf_verified TEXT,
  latency_ms  INTEGER
);
CREATE INDEX IF NOT EXISTS idx_crawl_ts   ON crawl_log(ts);
CREATE INDEX IF NOT EXISTS idx_crawl_ua   ON crawl_log(ua);
CREATE INDEX IF NOT EXISTS idx_crawl_path ON crawl_log(path);
