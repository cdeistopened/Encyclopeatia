"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { WikiNav, WikiFooter } from "@/components/WikiChrome";

interface WikiArticleSummary {
  slug: string;
  title: string;
  category?: string;
  status?: string;
  mentions?: number;
}

// The 8 canonical vault categories, in display order, with locked-design
// color classes and one-line descriptions.
const CATEGORIES = [
  { key: "substances", label: "Substances", cls: "cat-substances", desc: "Foods, fats, vitamins, minerals, hormones, and drugs — the atomic entities of the framework." },
  { key: "concepts", label: "Concepts", cls: "cat-concepts", desc: "Frameworks for thinking: bioenergetics, stress, energy, structure." },
  { key: "conditions", label: "Conditions", cls: "cat-conditions", desc: "States you can have — and how the energy framework reads them." },
  { key: "mechanisms", label: "Mechanisms", cls: "cat-mechanisms", desc: "Processes and pathways: how the biology actually moves." },
  { key: "people", label: "People", cls: "cat-people", desc: "The researchers Peat built on — Barnes, Ling, Warburg, Selye." },
  { key: "protocols", label: "Protocols", cls: "cat-protocols", desc: "Actionable frameworks: what to actually do, and when." },
  { key: "practices", label: "Practices", cls: "cat-practices", desc: "Daily and weekly routines that move the needle." },
  { key: "articles", label: "Articles", cls: "cat-articles", desc: "Narrative synthesis across entities — where Peat's positions evolved." },
] as const;

// Group articles by their canonical (folder) category — the first slug segment.
function categoryOf(article: WikiArticleSummary): string {
  if (article.slug.includes("/")) return article.slug.split("/")[0].toLowerCase();
  if (article.category) return article.category.toLowerCase().replace(/s?$/, "s");
  return "other";
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

  const counts: Record<string, number> = {};
  for (const a of articles) {
    const c = categoryOf(a);
    counts[c] = (counts[c] || 0) + 1;
  }

  const filtered = articles
    .filter((a) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q || a.title.toLowerCase().includes(q) || a.slug.toLowerCase().includes(q);
      const matchesCategory = !selectedCategory || categoryOf(a) === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => a.title.localeCompare(b.title));

  const browsing = Boolean(searchQuery || selectedCategory);

  return (
    <div style={{ background: "#e8e4d8", minHeight: "100vh" }}>
      <div className="page">
        {/* Navbar */}
        <WikiNav
          active="wiki"
          right={
            <input
              className="nav-search"
              type="text"
              placeholder="SEARCH ARTICLES…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          }
        />

        {/* Hero */}
        <div className="content heatmap-y" style={{ paddingTop: 40, paddingBottom: 28 }}>
          <h1 className="page-title" style={{ maxWidth: 900 }}>
            An encyclopedia of Ray Peat&rsquo;s bioenergetic framework.
          </h1>
          <p className="lede" style={{ maxWidth: 720 }}>
            {articles.length || 300}+ interlinked articles on the substances, mechanisms,
            conditions, and protocols Ray Peat spent fifty years working out — synthesized
            from his newsletters, interviews, and correspondence, every claim traced to a source.
          </p>
          <div className="row-tight mono" style={{ gap: 18, flexWrap: "wrap" }}>
            <span><strong style={{ color: "var(--ink)" }}>{articles.length || "—"}</strong> articles</span>
            <span>·</span>
            <span><strong style={{ color: "var(--ink)" }}>{CATEGORIES.filter((c) => counts[c.key]).length}</strong> categories</span>
            <span>·</span>
            <span><strong style={{ color: "var(--ink)" }}>812</strong> sources indexed</span>
          </div>
        </div>

        {/* Body */}
        <div className="content" style={{ paddingTop: 8 }}>
          {loading ? (
            <p className="mono">Loading wiki…</p>
          ) : browsing ? (
            <>
              <div className="sec-h">
                <span className="stamp red">Results</span>
                <span className="title">
                  {selectedCategory
                    ? CATEGORIES.find((c) => c.key === selectedCategory)?.label
                    : `“${searchQuery}”`}
                </span>
                <span className="meta mono">{filtered.length} articles</span>
                <button
                  className="btn"
                  style={{ marginLeft: 12 }}
                  onClick={() => {
                    setSelectedCategory(null);
                    setSearchQuery("");
                  }}
                >
                  Clear
                </button>
              </div>
              <table className="entry-table">
                <thead>
                  <tr>
                    <th style={{ width: "30%" }}>Entry</th>
                    <th>Slug</th>
                    <th style={{ width: 120 }}>Category</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.slug}>
                      <td>
                        <Link href={`/wiki/${a.slug}`} className="wl">{a.title}</Link>
                      </td>
                      <td className="slug">{a.slug}</td>
                      <td>
                        <span className={`cat-tag sm ${CATEGORIES.find((c) => c.key === categoryOf(a))?.cls ?? ""}`}>
                          {categoryOf(a)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <>
              <div className="sec-h">
                <span className="stamp">Browse</span>
                <span className="title">Categories</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
                {CATEGORIES.filter((c) => counts[c.key]).map((c) => (
                  <Link
                    key={c.key}
                    href={`/wiki/category/${c.key}`}
                    className={`cat-card ${c.cls}`}
                  >
                    <div className="c-stripe" />
                    <div className="c-title">{c.label}</div>
                    <div className="c-count">{counts[c.key] || 0} entries</div>
                    <div className="c-desc">{c.desc}</div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <WikiFooter />
      </div>
    </div>
  );
}
