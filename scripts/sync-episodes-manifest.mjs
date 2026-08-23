#!/usr/bin/env node
/**
 * Sync public/episodes.json with polished transcripts on disk.
 *
 * Adds entries for any polished transcript missing from the manifest (32 as of
 * 2026-08-23 — mostly late Generative Energy episodes with unicode filenames
 * that were never registered), giving them sanitized path-style slugs so they
 * become first-class browsable episodes. Existing entries are untouched.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const APP_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TRANSCRIPTS = path.join(APP_DIR, "public", "transcripts");
const MANIFEST = path.join(APP_DIR, "public", "episodes.json");

const eps = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
const bySlug = new Map(eps.map((e) => [e.slug, e]));
const byFile = new Map(eps.filter((e) => e.filePath).map((e) => [e.filePath, e]));

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const meta = {};
  if (!m) return meta;
  // naive YAML scalars only — enough for title/date/show/audio_url
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv || kv[2].startsWith("- ") || kv[2].startsWith("[")) continue;
    meta[kv[1].toLowerCase()] = kv[2].trim().replace(/^["']|["']$/g, "");
  }
  return meta;
}

// Full-width punctuation -> ascii, strip noise, collapse separators.
function sanitize(name) {
  return name
    .replace(/[#＃]/g, "")
    .replace(/[：:？?＂"'｜|]/g, "-")
    .replace(/[&]/g, "and")
    .replace(/[^\w\-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

let added = 0;
for (const showDir of fs.readdirSync(TRANSCRIPTS, { withFileTypes: true })) {
  if (!showDir.isDirectory()) continue;
  const polished = path.join(TRANSCRIPTS, showDir.name, "polished");
  if (!fs.existsSync(polished)) continue;
  for (const f of fs.readdirSync(polished)) {
    if (!f.endsWith(".md")) continue;
    const rel = `${showDir.name}/polished/${f}`;
    if (byFile.has(rel)) continue;
    const base = f.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(polished, f), "utf8");
    const meta = parseFrontmatter(raw);

    let slug = sanitize(`${showDir.name}/${base}`);
    while (bySlug.has(slug)) slug = `${slug}-x`;
    const date = meta.date_published || meta.date || "";
    eps.push({
      slug,
      title: meta.title || base,
      show: meta.show || showDir.name.replace(/-/g, " "),
      date: date ? new Date(date).toISOString() : null,
      audioUrl: meta.audio_url || null,
      speakers: [],
      filePath: rel,
      rawFilePath: null,
    });
    bySlug.set(slug, true);
    added++;
    console.log(`+ ${slug}`);
  }
}

fs.writeFileSync(MANIFEST, JSON.stringify(eps, null, 2));
console.log(`\nAdded ${added} episodes -> ${path.relative(APP_DIR, MANIFEST)} (${eps.length} total)`);
