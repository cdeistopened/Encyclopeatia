"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

interface Entity {
  id: number;
  name: string;
  entity_type: string;
  description: string | null;
  mention_count: number;
  episode_count?: number;
}

interface TopicsData {
  entities_by_type: Record<string, Entity[]>;
  stats: {
    total_entities: number;
    total_mentions: number;
    entity_types: Record<string, number>;
  };
}

// Verdict types based on entity patterns
function getVerdict(entity: Entity): { label: string; type: "good" | "bad" | "neutral" } {
  // Known pro-metabolic substances
  const proMetabolic = [
    "thyroid", "progesterone", "pregnenolone", "dhea", "carbon dioxide", "co2",
    "aspirin", "vitamin e", "vitamin d", "vitamin a", "vitamin k", "calcium",
    "magnesium", "sodium", "salt", "sugar", "sucrose", "fructose", "glucose",
    "orange juice", "milk", "coconut oil", "saturated fat", "gelatin", "glycine",
    "coffee", "caffeine", "red light", "carrot", "cascara", "niacinamide"
  ];

  // Known anti-metabolic substances
  const antiMetabolic = [
    "pufa", "polyunsaturated", "fish oil", "omega-3", "omega-6", "seed oil",
    "estrogen", "estradiol", "serotonin", "cortisol", "prolactin", "tryptophan",
    "iron", "endotoxin", "lactic acid", "nitric oxide", "histamine", "fluoride",
    "carotene", "melatonin", "ssri"
  ];

  const nameLower = entity.name.toLowerCase();

  if (proMetabolic.some(term => nameLower.includes(term))) {
    return { label: "Pro-Metabolic", type: "good" };
  }
  if (antiMetabolic.some(term => nameLower.includes(term))) {
    return { label: "Anti-Metabolic", type: "bad" };
  }
  return { label: "Contextual", type: "neutral" };
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: string }> = {
  SUBSTANCE: { label: "Substances", icon: "science" },
  CONDITION: { label: "Conditions", icon: "healing" },
  CONCEPT: { label: "Concepts", icon: "psychology" },
  MECHANISM: { label: "Mechanisms", icon: "settings" },
  TOPIC: { label: "Topics", icon: "lightbulb" },
  PERSON: { label: "People", icon: "person" },
};

const CATEGORY_ORDER = ["SUBSTANCE", "CONDITION", "CONCEPT", "MECHANISM", "TOPIC", "PERSON"];

export default function EncyclopediaBrowser() {
  const [data, setData] = useState<TopicsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"mentions" | "name">("mentions");
  const [verdictFilter, setVerdictFilter] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/topics");
        if (!res.ok) throw new Error("Failed to fetch topics");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredEntities = useMemo(() => {
    if (!data?.entities_by_type) return [];

    let entities: Entity[] = [];

    if (selectedCategory) {
      entities = data.entities_by_type[selectedCategory] || [];
    } else {
      CATEGORY_ORDER.forEach((cat) => {
        const catEntities = data.entities_by_type[cat] || [];
        entities.push(...catEntities);
      });
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      entities = entities.filter((e) =>
        e.name.toLowerCase().includes(searchLower)
      );
    }

    // Filter by verdict
    if (verdictFilter.size > 0) {
      entities = entities.filter((e) => {
        const verdict = getVerdict(e);
        return verdictFilter.has(verdict.label);
      });
    }

    // Sort
    entities.sort((a, b) => {
      if (sortBy === "mentions") {
        return b.mention_count - a.mention_count;
      }
      return a.name.localeCompare(b.name);
    });

    return entities;
  }, [data, selectedCategory, search, sortBy, verdictFilter]);

  const categoryCounts = useMemo(() => {
    if (!data?.stats?.entity_types) return {};
    return data.stats.entity_types;
  }, [data]);

  const toggleVerdictFilter = (verdict: string) => {
    setVerdictFilter((prev) => {
      const next = new Set(prev);
      if (next.has(verdict)) {
        next.delete(verdict);
      } else {
        next.add(verdict);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-ink animate-pulse">
            auto_stories
          </span>
          <p className="mt-4 font-mono text-sm text-ink-muted">Loading encyclopedia...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-paper flex flex-col">
        {/* Header */}
        <header className="w-full border-b-2 border-ink bg-paper sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <span className="material-symbols-outlined text-3xl text-primary group-hover:rotate-12 transition-transform duration-300">
                auto_stories
              </span>
              <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
                EncycloPEATia
              </h1>
            </Link>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <span className="material-symbols-outlined text-6xl text-primary mb-4 block">
              auto_stories
            </span>
            <h2 className="font-serif text-2xl font-bold mb-4">Encyclopedia Coming Soon</h2>
            <p className="text-ink-muted mb-6">
              The encyclopedia feature requires the knowledge graph backend to be running.
              This feature is under development.
            </p>
            <Link href="/" className="btn-primary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalEntities = data?.stats?.total_entities || 0;

  return (
    <div className="min-h-screen text-ink font-body antialiased">
      {/* Header */}
      <header className="w-full border-b-2 border-ink bg-paper sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="material-symbols-outlined text-3xl text-primary group-hover:rotate-12 transition-transform duration-300">
              auto_stories
            </span>
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
              EncycloPEATia
            </h1>
          </Link>
          <nav className="hidden md:flex gap-8 items-center">
            <Link href="/podcasts" className="font-mono text-sm font-medium hover:underline decoration-2 underline-offset-4">
              ARCHIVE
            </Link>
            <Link href="/encyclopedia" className="font-mono text-sm font-medium underline decoration-2 underline-offset-4">
              ENCYCLOPEDIA
            </Link>
            <Link href="/ask" className="btn-primary">
              ASK PEAT
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto px-6 pt-8 md:pt-12 pb-16">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <nav className="flex items-center gap-2 text-sm font-mono text-ink-muted mb-2">
              <Link href="/" className="hover:text-primary">Home</Link>
              <span>/</span>
              <span className="text-ink font-bold">Encyclopedia</span>
            </nav>
            <h1 className="font-serif text-4xl md:text-5xl font-bold">Browse Entries</h1>
          </div>
          <div className="w-full md:w-auto relative">
            <input
              type="text"
              placeholder="Filter entries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-80 bg-surface border-2 border-ink px-4 py-3 pr-10 font-serif focus:ring-0 focus:border-primary focus:shadow-hard transition-all placeholder-ink-muted/50"
            />
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none">
              search
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-8">
            {/* Categories */}
            <div className="border-2 border-ink bg-surface p-6 shadow-hard-sm">
              <h3 className="font-mono font-bold text-sm uppercase tracking-widest border-b-2 border-ink pb-2 mb-4">
                Categories
              </h3>
              <ul className="space-y-2 font-mono text-sm">
                <li>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full flex items-center justify-between group transition-colors ${
                      !selectedCategory ? "text-ink font-bold" : "text-ink-muted hover:text-ink"
                    }`}
                  >
                    <span>All Entries</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      !selectedCategory ? "bg-ink text-white" : "group-hover:bg-ink/10"
                    }`}>
                      {totalEntities.toLocaleString()}
                    </span>
                  </button>
                </li>
                {CATEGORY_ORDER.map((cat) => {
                  const config = CATEGORY_CONFIG[cat];
                  const count = categoryCounts[cat] || 0;
                  const isActive = selectedCategory === cat;
                  return (
                    <li key={cat}>
                      <button
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full flex items-center justify-between group transition-colors ${
                          isActive ? "text-ink font-bold" : "text-ink-muted hover:text-ink"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-base">{config.icon}</span>
                          {config.label}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          isActive ? "bg-ink text-white" : "group-hover:bg-ink/10"
                        }`}>
                          {count.toLocaleString()}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Verdict Filter */}
            <div className="border-2 border-ink bg-surface p-6 shadow-hard-sm">
              <h3 className="font-mono font-bold text-sm uppercase tracking-widest border-b-2 border-ink pb-2 mb-4">
                Filter by Verdict
              </h3>
              <div className="space-y-3">
                {["Pro-Metabolic", "Anti-Metabolic", "Contextual"].map((verdict) => (
                  <label key={verdict} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={verdictFilter.has(verdict)}
                      onChange={() => toggleVerdictFilter(verdict)}
                      className="w-5 h-5 border-2 border-ink text-primary focus:ring-0 focus:ring-offset-0 bg-paper cursor-pointer rounded-none"
                    />
                    <span className="font-mono text-sm group-hover:text-primary transition-colors">
                      {verdict}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Ask Peat CTA */}
            <div className="bg-ink text-white p-6 border-2 border-ink shadow-hard-sm">
              <div className="flex items-start gap-3 mb-2">
                <span className="material-symbols-outlined text-3xl text-primary">smart_toy</span>
                <h3 className="font-display font-bold text-xl leading-tight">Have a specific question?</h3>
              </div>
              <p className="font-mono text-xs opacity-90 mb-4 leading-relaxed">
                Use the AI engine to search the entire corpus for specific context.
              </p>
              <Link
                href="/ask"
                className="inline-block bg-primary text-ink font-bold font-mono text-xs px-4 py-2 uppercase tracking-wide hover:bg-primary-dark transition-colors border-2 border-ink"
              >
                Ask Peat
              </Link>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-9 flex flex-col">
            {/* Sort Controls */}
            <div className="flex items-center justify-between border-b-2 border-ink pb-4 mb-0 bg-paper sticky top-20 z-20 pt-4">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-ink-muted">
                Showing 1-{Math.min(filteredEntities.length, 50)} of {filteredEntities.length.toLocaleString()} Entries
              </span>
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs font-bold text-ink-muted">SORT:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "mentions" | "name")}
                  className="bg-transparent border-none p-0 text-sm font-bold font-mono text-ink focus:ring-0 cursor-pointer"
                >
                  <option value="mentions">Most Cited</option>
                  <option value="name">Alphabetical (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Entity List */}
            <div className="flex flex-col bg-surface border-x-2 border-ink shadow-hard">
              {filteredEntities.slice(0, 50).map((entity) => {
                const config = CATEGORY_CONFIG[entity.entity_type] || { label: entity.entity_type, icon: "category" };
                const verdict = getVerdict(entity);

                return (
                  <Link
                    key={entity.id}
                    href={`/encyclopedia/${entity.id}`}
                    className="group relative border-b-2 border-ink p-6 hover:bg-paper transition-colors duration-200"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-8">
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h2 className="font-serif text-2xl font-bold text-ink group-hover:text-primary-dark transition-colors">
                            {entity.name}
                          </h2>
                          <span
                            className={`border border-ink/10 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wide ${
                              verdict.type === "good"
                                ? "verdict-yes"
                                : verdict.type === "bad"
                                ? "verdict-no"
                                : "verdict-context"
                            }`}
                          >
                            {verdict.label}
                          </span>
                        </div>
                        {entity.description && (
                          <p className="text-ink-muted font-sans text-sm md:text-base leading-relaxed max-w-2xl line-clamp-2">
                            {entity.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-xs font-mono text-ink-muted/70 uppercase flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">{config.icon}</span>
                            {config.label}
                          </span>
                          <span className="text-xs font-mono text-ink-muted/70">
                            {entity.mention_count.toLocaleString()} citations
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 pt-1">
                        <span className="inline-flex items-center justify-center w-10 h-10 border-2 border-ink bg-white group-hover:bg-ink group-hover:text-white transition-colors rounded-full shadow-hard-sm group-hover:shadow-none group-hover:translate-x-[2px] group-hover:translate-y-[2px]">
                          <span className="material-symbols-outlined">arrow_forward</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredEntities.length === 0 && (
              <div className="text-center py-16 border-2 border-ink bg-surface">
                <span className="material-symbols-outlined text-5xl text-ink-muted">search_off</span>
                <h3 className="font-serif text-xl mt-4">No entries found</h3>
                <p className="text-ink-muted mt-2">Try adjusting your filters or search term</p>
              </div>
            )}

            {/* Pagination placeholder */}
            {filteredEntities.length > 50 && (
              <div className="flex justify-center mt-8">
                <p className="font-mono text-sm text-ink-muted">
                  Showing first 50 of {filteredEntities.length.toLocaleString()} entries. Use search to find more.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

    </div>
  );
}
