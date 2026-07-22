#!/usr/bin/env python3
"""
Content QA — a weekly crawl of the site checking for the class of problem
that doesn't throw an error, doesn't fail a build, and just quietly sits
broken: dead internal links, missing/empty title or meta description,
missing canonical, missing h1, invalid structured data, malformed
robots.txt/sitemap, and spam-injection canary keywords.

Runs against a local `wrangler dev --local` instance (see content-qa.yml),
same pattern as the Playwright smoke tests -- not against production, so
findings are about the code, not affected by live data/traffic.

First real run of this script (2026-07) caught a genuine live bug: every
entry link on /notes/changelog/ pointed at the pre-move /changelog/ path
and 404'd. Fixed in the same PR that introduced this script.
"""
import json
import re
import sys
from pathlib import Path
from xml.etree import ElementTree

import advertools as adv
import pandas as pd
import requests

BASE_URL = "http://localhost:8787"
CRAWL_OUTPUT = "/tmp/content-qa-crawl.jl"
BLACKLIST_FILE = Path(__file__).parent / "content-qa-blacklist.json"

# Machine-readable endpoints aren't HTML pages -- following/parsing them for
# outbound links crashes Scrapy's HTML link extractor (it expects an lxml
# tree, these give it JSON/plain text). Exclude them from link-following;
# they get checked separately (robots.txt, sitemap) or not at all (they're
# not pages with title/meta/h1 to check). /keystatic is the CMS admin UI --
# not a content page, has no title/canonical/h1 by design.
EXCLUDE_FROM_CRAWL = (
    r"\.(json|xml|txt|md)$|^mailto:|^" + re.escape(BASE_URL) + r"/api/|^" + re.escape(BASE_URL) + r"/keystatic"
)

# Paths that are intentionally noindex -- a noindex hit here is not a finding.
EXPECTED_NOINDEX = {"/dashboard/", "/dashboard/limits/", "/crawl-logs/", "/404/"}


def crawl():
    Path(CRAWL_OUTPUT).unlink(missing_ok=True)
    adv.crawl(
        url_list=[f"{BASE_URL}/"],
        output_file=CRAWL_OUTPUT,
        follow_links=True,
        allowed_domains=["localhost"],
        exclude_url_regex=EXCLUDE_FROM_CRAWL,
        exclude_url_params=True,  # e.g. /page-speed/?days=90 -- same page, not a distinct page to QA
        css_selectors={"robots_meta": 'meta[name="robots"]::attr(content)'},
        custom_settings={
            "CLOSESPIDER_TIMEOUT": 120,
            "DEPTH_LIMIT": 6,
            "LOG_LEVEL": "ERROR",
            "ROBOTSTXT_OBEY": False,
            "USER_AGENT": "leedriggers-content-qa/1.0",
        },
    )
    if not Path(CRAWL_OUTPUT).exists():
        return pd.DataFrame()
    return pd.read_json(CRAWL_OUTPUT, lines=True)


def col(row, name):
    v = row.get(name) if hasattr(row, "get") else None
    if v is None or (isinstance(v, float) and pd.isna(v)):
        return None
    return str(v).strip() or None


def path_of(url):
    return url.replace(BASE_URL, "") or "/"


def check_pages(df):
    errors, warnings = [], []
    if df.empty:
        return [("crawl", "Crawl produced zero pages -- something is badly wrong.")], []

    for _, row in df.iterrows():
        url = row["url"]
        path = path_of(url)
        status = row.get("status")

        if status is not None and int(status) >= 400:
            errors.append((url, f"HTTP {int(status)}"))
            continue  # other checks meaningless on a broken page

        if not col(row, "title"):
            errors.append((url, "Missing/empty <title>"))
        if not col(row, "canonical"):
            errors.append((url, "Missing/empty canonical tag"))
        if not col(row, "meta_desc"):
            warnings.append((url, "Missing/empty meta description"))
        if not col(row, "h1"):
            warnings.append((url, "Missing <h1>"))
        if not col(row, "h2"):
            warnings.append((url, "No <h2> found (informational -- not all pages need one)"))

        robots_meta = col(row, "robots_meta")
        if robots_meta and "noindex" in robots_meta.lower() and path not in EXPECTED_NOINDEX:
            errors.append((url, f"Unexpected noindex ({robots_meta}) on a page that should be indexed"))

    return errors, warnings


def check_blacklist(df):
    if not BLACKLIST_FILE.exists():
        return []
    keywords = json.loads(BLACKLIST_FILE.read_text()).get("keywords", [])
    if not keywords:
        return []

    hits = []
    for _, row in df.iterrows():
        blob = " ".join(
            col(row, c) or "" for c in ["title", "meta_desc", "body_text"]
        ).lower()
        for kw in keywords:
            if kw.lower() in blob:
                hits.append((row["url"], f"Blacklisted keyword found: '{kw}'"))
    return hits


def check_jsonld():
    """Independently re-fetch and validate JSON-LD, rather than trusting
    the crawler's already-parsed columns (which would just show empty on a
    parse failure, not tell us WHY)."""
    errors = []
    try:
        pages = requests.get(f"{BASE_URL}/sitemap-main.xml", timeout=10)
        pages.raise_for_status()
        root = ElementTree.fromstring(pages.content)
        ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        urls = [loc.text for loc in root.findall(".//s:loc", ns)]
    except Exception as e:
        return [("sitemap-main.xml", f"Could not read sitemap to find pages to check: {e}")]

    for url in urls:
        local_url = url.replace("https://leedriggers.com", BASE_URL)
        try:
            r = requests.get(local_url, timeout=10)
            if "text/html" not in r.headers.get("content-type", ""):
                continue
            blocks = re.findall(
                r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>([\s\S]*?)</script>',
                r.text, re.IGNORECASE,
            )
            for block in blocks:
                json.loads(block)
        except json.JSONDecodeError as e:
            errors.append((url, f"Invalid JSON-LD: {e}"))
        except requests.RequestException as e:
            errors.append((url, f"Could not fetch for JSON-LD check: {e}"))
    return errors


def check_robots_txt():
    errors, warnings = [], []
    try:
        r = requests.get(f"{BASE_URL}/robots.txt", timeout=10)
    except requests.RequestException as e:
        return [("/robots.txt", f"Fetch failed: {e}")], []
    if r.status_code != 200:
        errors.append(("/robots.txt", f"HTTP {r.status_code}"))
        return errors, warnings
    if "User-agent:" not in r.text:
        errors.append(("/robots.txt", "No 'User-agent:' directive found"))
    if "Sitemap:" not in r.text:
        warnings.append(("/robots.txt", "No 'Sitemap:' directive found"))
    return errors, warnings


def check_sitemap():
    errors = []
    try:
        r = requests.get(f"{BASE_URL}/sitemap-main.xml", timeout=10)
    except requests.RequestException as e:
        return [("/sitemap-main.xml", f"Fetch failed: {e}")]
    if r.status_code != 200:
        return [("/sitemap-main.xml", f"HTTP {r.status_code}")]
    try:
        root = ElementTree.fromstring(r.content)
    except ElementTree.ParseError as e:
        return [("/sitemap-main.xml", f"Not well-formed XML: {e}")]
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls = root.findall(".//s:loc", ns)
    if not urls:
        errors.append(("/sitemap-main.xml", "Parsed but contains zero <loc> entries"))
    for loc in urls:
        if not (loc.text or "").startswith("http"):
            errors.append(("/sitemap-main.xml", f"Malformed URL entry: {loc.text!r}"))
    return errors


def report(label, items):
    for url, msg in items:
        yield f"{label}\t{url}\t{msg}"


def main():
    df = crawl()

    page_errors, page_warnings = check_pages(df)
    blacklist_hits = check_blacklist(df) if not df.empty else []
    jsonld_errors = check_jsonld()
    robots_errors, robots_warnings = check_robots_txt()
    sitemap_errors = check_sitemap()

    all_errors = page_errors + blacklist_hits + jsonld_errors + robots_errors + sitemap_errors
    all_warnings = page_warnings + robots_warnings

    print(f"Content QA: {len(df)} pages crawled, {len(all_errors)} errors, {len(all_warnings)} warnings\n")

    for line in report("::error::", all_errors):
        print(line)
    for line in report("::warning::", all_warnings):
        print(line)

    if all_errors:
        sys.exit(1)


if __name__ == "__main__":
    main()
