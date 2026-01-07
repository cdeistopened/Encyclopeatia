"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import MiniSearch from "minisearch";

interface SearchDocument {
  id: string;
  slug: string;
  title: string;
  show: string;
  date: string;
  transcriptText: string;
}

export interface SearchResult {
  id: string;
  slug: string;
  title: string;
  show: string;
  date: string;
  score: number;
  snippet: string;
}

interface UseTranscriptSearchReturn {
  search: (query: string) => SearchResult[];
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  documentCount: number;
}

function extractSnippet(text: string, query: string, maxLength = 200): string {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const textLower = text.toLowerCase();
  
  let bestIndex = 0;
  let bestScore = 0;
  
  for (const word of queryWords) {
    const idx = textLower.indexOf(word);
    if (idx !== -1 && idx > bestScore) {
      bestIndex = idx;
      bestScore = idx;
    }
  }
  
  const start = Math.max(0, bestIndex - 50);
  const end = Math.min(text.length, start + maxLength);
  
  let snippet = text.slice(start, end);
  if (start > 0) snippet = "..." + snippet;
  if (end < text.length) snippet = snippet + "...";
  
  return snippet;
}

export function useTranscriptSearch(): UseTranscriptSearchReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documentCount, setDocumentCount] = useState(0);
  
  const miniSearchRef = useRef<MiniSearch<SearchDocument> | null>(null);
  const documentsRef = useRef<Map<string, SearchDocument>>(new Map());

  useEffect(() => {
    let cancelled = false;

    async function loadSearchIndex() {
      try {
        const response = await fetch("/search-index.json");
        if (!response.ok) throw new Error("Failed to load search index");
        
        const documents: SearchDocument[] = await response.json();
        if (cancelled) return;

        const miniSearch = new MiniSearch<SearchDocument>({
          fields: ["title", "transcriptText"],
          storeFields: ["id", "slug", "title", "show", "date"],
          searchOptions: {
            boost: { title: 3 },
            fuzzy: 0.2,
            prefix: true,
          },
        });

        miniSearch.addAll(documents);
        
        const docMap = new Map<string, SearchDocument>();
        for (const doc of documents) {
          docMap.set(doc.id, doc);
        }

        miniSearchRef.current = miniSearch;
        documentsRef.current = docMap;
        setDocumentCount(documents.length);
        setIsReady(true);
        setIsLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
          setIsLoading(false);
        }
      }
    }

    loadSearchIndex();
    return () => { cancelled = true; };
  }, []);

  const search = useCallback((query: string): SearchResult[] => {
    if (!miniSearchRef.current || !query.trim()) return [];

    const results = miniSearchRef.current.search(query, { limit: 50 });
    
    return results.map((result) => {
      const doc = documentsRef.current.get(result.id);
      const snippet = doc 
        ? extractSnippet(doc.transcriptText, query)
        : "";

      return {
        id: result.id,
        slug: result.slug as string,
        title: result.title as string,
        show: result.show as string,
        date: result.date as string,
        score: result.score,
        snippet,
      };
    });
  }, []);

  return {
    search,
    isLoading,
    isReady,
    error,
    documentCount,
  };
}
