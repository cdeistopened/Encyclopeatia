import MiniSearch from "minisearch";
import fs from "fs";
import path from "path";

interface SearchDocument {
  id: string;
  slug: string;
  title: string;
  show: string;
  date: string;
  transcriptText: string;
}

export interface ServerSearchResult {
  id: string;
  slug: string;
  title: string;
  show: string;
  date: string;
  score: number;
  text: string;
}

let miniSearch: MiniSearch<SearchDocument> | null = null;
let documents: Map<string, SearchDocument> = new Map();

function loadSearchIndex(): void {
  if (miniSearch) return;

  const indexPath = path.join(process.cwd(), "public", "search-index.json");
  const rawData = fs.readFileSync(indexPath, "utf-8");
  const docs: SearchDocument[] = JSON.parse(rawData);

  miniSearch = new MiniSearch<SearchDocument>({
    fields: ["title", "transcriptText"],
    storeFields: ["id", "slug", "title", "show", "date"],
    searchOptions: {
      boost: { title: 3 },
      fuzzy: 0.2,
      prefix: true,
    },
  });

  miniSearch.addAll(docs);

  for (const doc of docs) {
    documents.set(doc.id, doc);
  }
}

export function searchTranscripts(query: string, limit = 20): ServerSearchResult[] {
  loadSearchIndex();
  if (!miniSearch) return [];

  const results = miniSearch.search(query).slice(0, limit);

  return results.map((result) => {
    const doc = documents.get(result.id);
    return {
      id: result.id,
      slug: result.slug as string,
      title: result.title as string,
      show: result.show as string,
      date: result.date as string,
      score: result.score,
      text: doc?.transcriptText || "",
    };
  });
}

export function getDocumentById(id: string): SearchDocument | undefined {
  loadSearchIndex();
  return documents.get(id);
}
