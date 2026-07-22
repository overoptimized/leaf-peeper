#!/usr/bin/env node
/**
 * Dynamic SEO Data Generator for seo-starter-pack
 * 
 * Scans the host Astro project (src/pages and src/content) 
 * to automatically generate the data needed for sitemaps and the crawl surface dashboard.
 */

import { execSync } from "child_process";
import { writeFileSync, readFileSync, mkdirSync, statSync, readdirSync, existsSync } from "fs";
import { resolve, dirname, relative, extname, join } from "path";

// Run from the host project root (assumes this is run via npm script in host project)
const ROOT = process.cwd();
const SRC_DIR = resolve(ROOT, "src");
const PAGES_DIR = resolve(SRC_DIR, "pages");
const CONTENT_DIR = resolve(SRC_DIR, "content");
const DATA_DIR = resolve(SRC_DIR, "data");

function gitDate(absPath) {
  const rel = relative(ROOT, absPath);
  try {
    const d = execSync(`git log -1 --format=%aI -- "${rel}"`, {
      encoding: "utf-8",
      cwd: ROOT,
    }).trim();
    if (d) return d.slice(0, 10);
  } catch {}
  
  // Fallback to file creation/modification time if not in git
  try {
    const stat = statSync(absPath);
    return stat.mtime.toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

function walk(dir, allowedExts) {
  if (!existsSync(dir)) return [];
  const entries = [];
  for (const name of readdirSync(dir)) {
    const full = resolve(dir, name);
    if (statSync(full).isDirectory()) {
      entries.push(...walk(full, allowedExts));
    } else {
      if (!allowedExts || allowedExts.includes(extname(full))) {
        entries.push(full);
      }
    }
  }
  return entries;
}

// --- Page Processing ---
function fileToSlug(absPath) {
  const rel = relative(PAGES_DIR, absPath);
  const noExt = rel.replace(/\.[^.]+$/, "");
  const parts = noExt.split(/[\\/]/);

  const skip = ["api", "robots.txt", "sitemap", "sitemap-main", "crawls", "dashboard"];
  if (skip.some((s) => parts[0] === s || parts[0].startsWith(s))) return null;

  if (parts[parts.length - 1] === "index") {
    parts.pop();
  }
  
  // Filter out parameterized Astro routes (e.g., [slug].astro)
  // because those are handled by content collections
  if (parts.some(p => p.startsWith("[") && p.endsWith("]"))) return null;

  return "/" + (parts.length ? parts.join("/") + "/" : "");
}

const today = new Date().toISOString().slice(0, 10);
const pageDates = {};

// 1. Process static pages
if (existsSync(PAGES_DIR)) {
  const pageFiles = walk(PAGES_DIR, [".astro", ".ts", ".js", ".tsx", ".jsx", ".md", ".mdx"]);
  for (const f of pageFiles) {
    const slug = fileToSlug(f);
    if (slug) {
      pageDates[slug] = gitDate(f) || today;
    }
  }
}

// 2. Process content collections
const collections = {};
if (existsSync(CONTENT_DIR)) {
  // Directories directly under src/content are collections
  const colDirs = readdirSync(CONTENT_DIR).filter(n => statSync(resolve(CONTENT_DIR, n)).isDirectory());
  
  for (const col of colDirs) {
    const colPath = resolve(CONTENT_DIR, col);
    const files = walk(colPath, [".md", ".mdx", ".json", ".yaml", ".yml"]);
    
    if (files.length > 0) {
      collections[col] = [];
      for (const f of files) {
        // Strip extension to get the entry slug
        const rel = relative(colPath, f);
        const slugStr = rel.replace(/\.[^.]+$/, "");
        // Typically Astro content routes look like /collectionName/slug/
        const finalUrl = `/${col}/${slugStr}/`;
        
        const date = gitDate(f) || today;
        pageDates[finalUrl] = date;
        
        collections[col].push({
          url: finalUrl,
          lastmod: date
        });
      }
    }
  }
}

// 3. Process data-file-driven routes (parameterized pages that can't be walked)
function loadJson(filename) {
  const filePath = resolve(DATA_DIR, filename);
  if (!existsSync(filePath)) return null;
  try { return JSON.parse(readFileSync(filePath, "utf8")); } catch { return null; }
}

const states = loadJson("states.json") || [];
const locations = loadJson("locations.json") || [];
const drives = loadJson("drives.json") || [];
const regions = loadJson("regions.json") || [];

// State index pages: /[stateSlug]/
for (const state of states) {
  const url = `/${state.stateSlug}/`;
  if (!pageDates[url]) pageDates[url] = today;
  if (!collections.states) collections.states = [];
  collections.states.push({ url, lastmod: today });
}

// City hub pages: /[stateSlug]/[citySlug]/
const cityHubs = new Map();
for (const loc of locations) {
  const key = `${loc.stateSlug}/${loc.citySlug}`;
  if (!cityHubs.has(key)) {
    cityHubs.set(key, { stateSlug: loc.stateSlug, citySlug: loc.citySlug });
  }
}
for (const { stateSlug, citySlug } of cityHubs.values()) {
  const url = `/${stateSlug}/${citySlug}/`;
  if (!pageDates[url]) pageDates[url] = today;
  if (!collections.cities) collections.cities = [];
  collections.cities.push({ url, lastmod: today });
}

// Location pages: /[stateSlug]/[locationSlug]/ and /locations/[slug]/
for (const loc of locations) {
  const stateUrl = `/${loc.stateSlug}/${loc.slug}/`;
  if (!pageDates[stateUrl]) pageDates[stateUrl] = today;
  if (!collections.locations) collections.locations = [];
  collections.locations.push({ url: stateUrl, lastmod: today });

  const directUrl = `/locations/${loc.slug}/`;
  if (!pageDates[directUrl]) pageDates[directUrl] = today;
}

// Scenic drive pages: /scenic-drives/[slug]/ and /[stateSlug]/drives/[slug]/
for (const drive of drives) {
  const url = `/scenic-drives/${drive.slug}/`;
  if (!pageDates[url]) pageDates[url] = today;
  if (!collections.drives) collections.drives = [];
  collections.drives.push({ url, lastmod: today });

  // Per-state drive pages
  for (const stateSlug of (drive.states || [])) {
    const stateUrl = `/${stateSlug}/drives/${drive.slug}/`;
    if (!pageDates[stateUrl]) pageDates[stateUrl] = today;
  }
}

// Region pages: /regions/[slug]/
for (const region of regions) {
  const url = `/regions/${region.slug}/`;
  if (!pageDates[url]) pageDates[url] = today;
  if (!collections.regions) collections.regions = [];
  collections.regions.push({ url, lastmod: today });
}

// Write the outputs
mkdirSync(DATA_DIR, { recursive: true });

writeFileSync(resolve(DATA_DIR, "page-dates.json"), JSON.stringify(pageDates, null, 2));
writeFileSync(resolve(DATA_DIR, "collections-sitemap.json"), JSON.stringify(collections, null, 2));

console.log(`✅ Generated SEO Data: ${Object.keys(pageDates).length} total URLs tracked.`);
console.log(`✅ Collections found: ${Object.keys(collections).join(", ") || "none"}`);
