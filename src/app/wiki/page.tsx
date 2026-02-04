"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface WikiArticleSummary {
  slug: string;
  title: string;
  category?: string;
  status?: string;
  mentions?: number;
}

// Group articles by category
function groupByCategory(articles: WikiArticleSummary[]): Record<string, WikiArticleSummary[]> {
  const groups: Record<string, WikiArticleSummary[]> = {};

  for (const article of articles) {
    // Extract main category from path
    let category = "Other";
    if (article.category) {
      const parts = article.category.split("/");
      category = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    } else if (article.slug.includes("/")) {
      const parts = article.slug.split("/");
      category = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }

    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(article);
  }

  // Sort articles within each group by title
  for (const category of Object.keys(groups)) {
    groups[category].sort((a, b) => a.title.localeCompare(b.title));
  }

  return groups;
}

// Get category icon
function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    Substances: "science",
    Conditions: "healing",
    Mechanisms: "settings",
    Concepts: "psychology",
    People: "person",
    Other: "article",
  };
  return icons[category] || "article";
}

// Get category color
function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Substances: "bg-blue-100 text-blue-800",
    Conditions: "bg-red-100 text-red-800",
    Mechanisms: "bg-purple-100 text-purple-800",
    Concepts: "bg-indigo-100 text-indigo-800",
    People: "bg-amber-100 text-amber-800",
    Other: "bg-gray-100 text-gray-800",
  };
  return colors[category] || "bg-gray-100 text-gray-800";
}

export default function WikiIndexPage() {
  const [articles, setArticles] = useState<WikiArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/wiki/index")
      .then((res) => res.json())
      .then((data) => {
        setArticles(data.articles || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load wiki index:", err);
        setLoading(false);
      });
  }, []);

  const groupedArticles = groupByCategory(articles);
  const categories = Object.keys(groupedArticles).sort();

  // Filter articles based on search and category
  const filteredArticles = articles.filter((article) => {
    const matchesSearch = !searchQuery ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory ||
      article.category?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      article.slug.toLowerCase().startsWith(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const completeCount = articles.filter(a => a.status === "complete").length;
  const scaffoldCount = articles.filter(a => a.status === "scaffold").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-ink animate-pulse">
            auto_stories
          </span>
          <p className="mt-4 font-mono text-sm text-ink-muted">Loading wiki...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-body antialiased">
      {/* Header */}
      <header className="w-full border-b-2 border-ink bg-paper sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="material-symbols-outlined text-2xl text-primary group-hover:rotate-12 transition-transform duration-300">
              auto_stories
            </span>
            <h1 className="font-display text-xl font-bold tracking-tight text-ink">
              EncycloPEATia
            </h1>
          </Link>
          <nav className="flex gap-6 items-center">
            <Link
              href="/podcasts"
              className="font-mono text-sm font-medium hover:text-primary transition-colors"
            >
              ARCHIVE
            </Link>
            <Link
              href="/wiki"
              className="font-mono text-sm font-medium text-primary"
            >
              WIKI
            </Link>
            <Link
              href="/encyclopedia"
              className="font-mono text-sm font-medium hover:text-primary transition-colors"
            >
              ENCYCLOPEDIA
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="font-serif text-5xl font-bold mb-4">Ray Peat Wiki</h1>
          <p className="text-xl text-ink-muted max-w-2xl">
            A comprehensive encyclopedia of Ray Peat's ideas on metabolism, hormones, nutrition, and health.
            Each article synthesizes his views from transcripts, newsletters, and email exchanges.
          </p>

          {/* Stats */}
          <div className="flex gap-6 mt-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-green-600">check_circle</span>
              <span className="font-mono text-sm">
                <strong>{completeCount}</strong> complete articles
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-yellow-600">edit_note</span>
              <span className="font-mono text-sm">
                <strong>{scaffoldCount}</strong> in progress
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-ink-muted">category</span>
              <span className="font-mono text-sm">
                <strong>{categories.length}</strong> categories
              </span>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">
              search
            </span>
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-ink rounded font-mono text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded font-mono text-sm font-medium border-2 transition-colors ${
                !selectedCategory
                  ? "bg-ink text-white border-ink"
                  : "bg-white text-ink border-ink/20 hover:border-ink"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                className={`px-4 py-2 rounded font-mono text-sm font-medium border-2 transition-colors ${
                  selectedCategory === cat
                    ? "bg-ink text-white border-ink"
                    : "bg-white text-ink border-ink/20 hover:border-ink"
                }`}
              >
                {cat} ({groupedArticles[cat].length})
              </button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        {searchQuery || selectedCategory ? (
          // Flat list when searching/filtering
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/wiki/${article.slug}`}
                className="block p-4 bg-white border-2 border-ink/10 rounded hover:border-ink hover:shadow-hard-sm transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif text-lg font-bold group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  {article.status === "complete" && (
                    <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
                  )}
                </div>
                {article.category && (
                  <p className="text-xs font-mono text-ink-muted mt-1">{article.category}</p>
                )}
                {article.mentions && (
                  <p className="text-xs font-mono text-ink-muted mt-1">
                    {article.mentions.toLocaleString()} mentions
                  </p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          // Grouped by category when not searching
          <div className="space-y-12">
            {categories.map((category) => (
              <section key={category}>
                <div className="flex items-center gap-3 mb-6">
                  <span className={`p-2 rounded ${getCategoryColor(category)}`}>
                    <span className="material-symbols-outlined">{getCategoryIcon(category)}</span>
                  </span>
                  <h2 className="font-serif text-2xl font-bold">{category}</h2>
                  <span className="font-mono text-sm text-ink-muted">
                    ({groupedArticles[category].length} articles)
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedArticles[category].slice(0, 12).map((article) => (
                    <Link
                      key={article.slug}
                      href={`/wiki/${article.slug}`}
                      className="block p-4 bg-white border-2 border-ink/10 rounded hover:border-ink hover:shadow-hard-sm transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-serif text-lg font-bold group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        {article.status === "complete" && (
                          <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
                        )}
                      </div>
                      {article.mentions && (
                        <p className="text-xs font-mono text-ink-muted mt-1">
                          {article.mentions.toLocaleString()} mentions
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
                {groupedArticles[category].length > 12 && (
                  <button
                    onClick={() => setSelectedCategory(category)}
                    className="mt-4 text-primary hover:underline font-mono text-sm"
                  >
                    View all {groupedArticles[category].length} {category.toLowerCase()} articles →
                  </button>
                )}
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-ink mt-16 py-8">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="font-mono text-sm text-ink-muted">
            EncycloPEATia Wiki - Community-driven Ray Peat encyclopedia
          </p>
        </div>
      </footer>
    </div>
  );
}
