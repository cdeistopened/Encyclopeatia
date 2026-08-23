import MiniSearch from "minisearch";
import fs from "fs";
import path from "path";
import zlib from "zlib";

/**
 * Full-corpus retrieval for Ask Dr. Peat.
 *
 * Loads the gzipped chunk index produced by scripts/build-corpus-index.mjs
 * (public/ask-data/) once, lazily, then serves BM25-ranked chunks over ALL of
 * Peat's writing and speech — newsletters, books, emails, articles, newspaper
 * letters, interview transcripts, plus the EncycloPEATia wiki layer.
 */

interface Chunk {
  i: number;
  t: string; // title
  c: string; // collection
  s: string; // show / label
  d: string | null; // date
  a: string | null; // audio url (transcripts)
  slug: string | null;
  u: string | null; // site url
  f: string; // file path in corpus
  n: string; // chunk n/total within doc
  x: string; // text
}

export interface CorpusHit extends Chunk {
  score: number;
}

// Peat's own words outrank the derivative wiki layer. Source hierarchy from the
// project rules: newsletters > books > emails > transcripts > articles > letters.
const COLLECTION_WEIGHT: Record<string, number> = {
  newsletter: 1.25,
  book: 1.2,
  email: 1.1,
  transcript: 1.0,
  article: 0.95,
  letter: 0.9,
  wiki: 0.8,
};

let mini: MiniSearch<Chunk> | null = null;
const chunkById = new Map<number, Chunk>();

function load(): void {
  if (mini) return;
  const dir = path.join(process.cwd(), "public", "ask-data");
  let manifest: { parts?: Array<{ file: string }> };
  try {
    manifest = JSON.parse(fs.readFileSync(path.join(dir, "manifest.json"), "utf-8"));
  } catch {
    console.error("[corpus] ask-data manifest missing — run node scripts/build-corpus-index.mjs");
    manifest = { parts: [] };
  }
  const all: Chunk[] = [];
  for (const part of manifest.parts || []) {
    try {
      const gz = fs.readFileSync(path.join(dir, part.file));
      const json = zlib.gunzipSync(gz).toString("utf-8");
      all.push(...(JSON.parse(json) as Chunk[]));
    } catch (e) {
      console.error(`[corpus] failed to load ${part.file}:`, e);
    }
  }

  mini = new MiniSearch<Chunk>({
    idField: "i",
    fields: ["t", "x"],
    storeFields: [],
    searchOptions: {
      boost: { t: 3 },
      fuzzy: 0.15,
      prefix: true,
      combineWith: "AND",
    },
  });
  mini.addAll(all);
  for (const c of all) chunkById.set(c.i, c);
  console.log(`[corpus] loaded ${all.length} chunks`);
}

export function corpusReady(): boolean {
  return !!mini;
}

export function searchCorpus(query: string, limit = 12): CorpusHit[] {
  load();
  if (!mini) return [];
  const q = query.trim().slice(0, 300);
  if (!q) return [];
  // AND can starve on long natural-language queries; retry with OR.
  let results = mini.search(q).slice(0, limit * 3);
  if (results.length < limit) {
    const seen = new Set(results.map((r) => r.id));
    for (const r of mini.search(q, { combineWith: "OR" })) {
      if (!seen.has(r.id)) {
        results.push(r);
        seen.add(r.id);
      }
      if (results.length >= limit * 3) break;
    }
  }
  return results.slice(0, limit).map((r) => {
    const c = chunkById.get(r.id as number)!;
    const w = COLLECTION_WEIGHT[c?.c] ?? 1;
    return { ...c, score: r.score * w };
  });
}
