#!/usr/bin/env node
/**
 * Build the Ask-Dr-Peat corpus index.
 *
 * Reads every Ray Peat source layer and produces gzipped JSON chunk parts in
 * public/ask-data/ that the /api/ask route searches at runtime:
 *
 *   1. public/transcripts/<show>/polished/  (253 interview transcripts)
 *   2. ../../sources/newsletters/*.md        (180 newsletters)
 *   3. ../../sources/articles/*.md           (82 articles; skips _batches)
 *   4. ../../sources/emails/*.md             (244 emails; skips ALL-EMAILS.md)
 *   5. ../../sources/books/*.md              (2 books)
 *   6. ../../sources/newspaper-letters/*.md  (48 letters)
 *   7. ../../vault/ + 7 category dirs, recursive (substances, concepts, conditions,
 *      mechanisms, people, protocols, articles)
 *
 * Output: public/ask-data/manifest.json + corpus-<n>.json.gz (~6 MB text each).
 * Run from app/:  node scripts/build-corpus-index.mjs
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const APP_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = path.resolve(APP_DIR, ".."); // corpus/Ray Peat
const OUT_DIR = path.join(APP_DIR, "public", "ask-data");

const PART_BYTES = 6 * 1024 * 1024; // split parts at ~6MB of JSON text

const VAULT_CATEGORIES = [
  "substances",
  "concepts",
  "conditions",
  "mechanisms",
  "people",
  "protocols",
  "articles",
];

// ---------- frontmatter ----------
function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const meta = {};
  let body = text;
  if (m) {
    body = text.slice(m[0].length);
    for (const line of m[1].split(/\r?\n/)) {
      const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
      if (!kv) continue;
      let v = kv[2].trim();
      v = v.replace(/^["']|["']$/g, "");
      meta[kv[1].toLowerCase()] = v;
    }
  }
  return { meta, body };
}

// ---------- chunking ----------
function chunkBody(body) {
  // Strip markdown noise that hurts retrieval but keep structure words.
  const clean = body
    .replace(/\r/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // images
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1") // links -> label
    .replace(/^\s*[-*_]{3,}\s*$/gm, "\n")
    .trim();
  if (!clean) return [];

  const paras = clean.split(/\n\s*\n/).map((p) => p.replace(/\s+/g, " ").trim()).filter((p) => p.length > 40);

  const chunks = [];
  let cur = "";
  for (const p of paras) {
    if ((cur + "\n\n" + p).length <= 1400 || cur === "") {
      cur = cur === "" ? p : cur + "\n\n" + p;
      // hard-split pathological paragraphs
      while (cur.length > 2200) {
        chunks.push(cur.slice(0, 1800));
        cur = cur.slice(1600);
      }
    } else {
      chunks.push(cur);
      cur = p;
    }
  }
  if (cur.length > 40) chunks.push(cur);
  return chunks;
}

// ---------- collectors ----------
const docs = [];
let idCounter = 0;

function addDoc({ title, collection, show, date, audioUrl, slug, url, filePath, body }) {
  const chunks = chunkBody(body);
  if (!chunks.length) return;
  for (let i = 0; i < chunks.length; i++) {
    docs.push({
      i: idCounter++,
      t: title,
      c: collection,
      s: show || collectionLabel(collection),
      d: date || null,
      a: audioUrl || null,
      slug: slug || null,
      u: url || null,
      f: filePath,
      n: `${i + 1}/${chunks.length}`,
      x: chunks[i],
    });
  }
}

function collectionLabel(c) {
  return (
    {
      transcript: "Interview",
      newsletter: "Newsletter",
      article: "Article",
      email: "Email exchange",
      book: "Book",
      letter: "Newspaper letter",
      wiki: "EncycloPEATia",
    }[c] || c
  );
}

function walkMd(dir, cb) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkMd(full, cb);
    else if (e.isFile() && e.name.endsWith(".md")) cb(full);
  }
}

// 1. Transcripts — episode URLs come from public/episodes.json (path-style slugs
//    like "ask-the-herb-doctor/2012-10-19-..."), matched by filePath.
{
  const epsPath = path.join(APP_DIR, "public", "episodes.json");
  const eps = JSON.parse(fs.readFileSync(epsPath, "utf8"));
  const byFilePath = new Map(eps.filter((e) => e.filePath).map((e) => [e.filePath, e]));
  const base = path.join(APP_DIR, "public", "transcripts");
  for (const show of fs.readdirSync(base, { withFileTypes: true })) {
    if (!show.isDirectory()) continue;
    const polished = path.join(base, show.name, "polished");
    walkMd(polished, (f) => {
      const raw = fs.readFileSync(f, "utf8");
      const { meta, body } = parseFrontmatter(raw);
      const fileName = path.basename(f, ".md");
      const rel = `${show.name}/polished/${fileName}.md`;
      const ep = byFilePath.get(rel) || eps.find((e) => e.slug === `${show.name}/${fileName}`);
      addDoc({
        title: meta.title || ep?.title || fileName,
        collection: "transcript",
        show: meta.show || show.name,
        date: meta.date_published || meta.date || null,
        audioUrl: meta.audio_url || ep?.audioUrl || null,
        slug: ep?.slug || fileName,
        url: ep ? `/episode/${ep.slug}` : null,
        filePath: path.relative(ROOT, f),
        body,
      });
    });
  }
}

// sources/* — OWNERSHIP POLICY (Charlie, 2026-08-23):
//   newsletters + articles + newspaper-letters: Peat's property — NOT indexed,
//     never mentioned on the site.
//   emails: queryable, but every citation points to the ORIGINAL off-site source
//     (raypeatemails.com via frontmatter source_url) — we don't host our copy.
//   books: queryable for retrieval quality, unlinked (not ours to publish).
const SOURCE_DIRS = [
  ["emails", "email", "original"],
  ["books", "book", null],
];
for (const [dirName, collection, mode] of SOURCE_DIRS) {
  const dir = path.join(ROOT, "sources", dirName);
  walkMd(dir, (f) => {
    const base = path.basename(f);
    if (base.startsWith("_") || base === "ALL-EMAILS.md" || base === "MANIFEST.md" || base.toUpperCase().startsWith("README")) return;
    const raw = fs.readFileSync(f, "utf8");
    const { meta, body } = parseFrontmatter(raw);
    const slug = path.basename(f, ".md");
    addDoc({
      title: meta.title || slug.replace(/-/g, " "),
      collection,
      show: null,
      date: meta.date || null,
      audioUrl: null,
      slug,
      url: mode === "original" ? meta.source_url || null : null,
      filePath: path.relative(ROOT, f),
      body,
    });
  });
}

// 7. Vault wiki pages
for (const cat of VAULT_CATEGORIES) {
  const dir = path.join(ROOT, "vault", cat);
  walkMd(dir, (f) => {
    const rel = path.relative(path.join(ROOT, "vault"), f); // e.g. substances/amino-acids/x.md
    const base = path.basename(f);
    if (base.startsWith("_") || /^readme\.md$/i.test(base)) return;
    // .research.md files are raw internal briefs — sync-vault.sh excludes them from the
    // site by design, so a /wiki/ url for one can never resolve. Keep them SEARCHABLE
    // (they hold verbatim gold) but with no link.
    const isResearch = base.endsWith(".research.md");
    const raw = fs.readFileSync(f, "utf8");
    const { meta, body } = parseFrontmatter(raw);
    const slug = isResearch ? base.replace(/\.research\.md$/, "") : path.basename(f, ".md");
    addDoc({
      title: meta.title || slug.replace(/-/g, " "),
      collection: "wiki",
      show: null,
      date: null,
      audioUrl: null,
      slug,
      url: isResearch ? null : `/wiki/${slug}`,
      filePath: `vault/${rel}`,
      body,
    });
  });
}

// ---------- write parts ----------
fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

const byCollection = {};
for (const d of docs) byCollection[d.c] = (byCollection[d.c] || 0) + 1;

const parts = [];
let buf = [];
let bytes = 0;
const flush = () => {
  if (!buf.length) return;
  const json = JSON.stringify(buf);
  const partIdx = parts.length;
  const gz = zlib.gzipSync(json, { level: 9 });
  fs.writeFileSync(path.join(OUT_DIR, `corpus-${partIdx}.json.gz`), gz);
  parts.push({ file: `corpus-${partIdx}.json.gz`, chunks: buf.length, bytes: json.length, gzipBytes: gz.length });
  console.log(`  corpus-${partIdx}.json.gz  ${buf.length} chunks  ${(gz.length / 1e6).toFixed(1)} MB gz`);
  buf = [];
  bytes = 0;
};
for (const d of docs) {
  buf.push(d);
  bytes += d.x.length;
  if (bytes > PART_BYTES) flush();
}
flush();

const manifest = { builtAt: new Date().toISOString(), totalChunks: docs.length, byCollection, parts };
fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));

console.log(`\nIndexed ${docs.length.toLocaleString()} chunks from ${Object.keys(byCollection).length} collections:`);
for (const [c, n] of Object.entries(byCollection)) console.log(`  ${c}: ${n}`);
console.log(`\nWrote ${parts.length} parts + manifest to ${path.relative(APP_DIR, OUT_DIR)}`);
