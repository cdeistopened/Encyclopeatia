"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { WikiNav, WikiFooter } from "@/components/WikiChrome";

interface WikiArticleSummary {
  slug: string;
  title: string;
  category?: string;
  status?: string;
  mentions?: number;
  tldr?: string;
  confidence?: string;
  explored?: boolean;
  wordCount?: number;
}

const CATEGORIES = [
  { key: "substances", label: "Substances", cls: "cat-substances", desc: "Atomic entities in Peat's framework — foods, fats, hormones, vitamins, minerals, drugs, amino acids, beverages. The densest category, and where most of the encyclopedia eventually routes." },
  { key: "concepts", label: "Concepts", cls: "cat-concepts", desc: "Frameworks for thinking: bioenergetics, stress, energy, structure." },
  { key: "conditions", label: "Conditions", cls: "cat-conditions", desc: "States you can have — and how the energy framework reads them." },
  { key: "mechanisms", label: "Mechanisms", cls: "cat-mechanisms", desc: "Processes and pathways: how the biology actually moves." },
  { key: "people", label: "People", cls: "cat-people", desc: "The researchers Peat built on — Barnes, Ling, Warburg, Selye." },
  { key: "protocols", label: "Protocols", cls: "cat-protocols", desc: "Actionable frameworks: what to actually do, and when." },
  { key: "practices", label: "Practices", cls: "cat-practices", desc: "Daily and weekly routines that move the needle." },
  { key: "articles", label: "Articles", cls: "cat-articles", desc: "Narrative synthesis across entities — where Peat's positions evolved." },
];

function topCat(a: WikiArticleSummary): string {
  return a.slug.includes("/") ? a.slug.split("/")[0].toLowerCase() : "";
}
function subCat(a: WikiArticleSummary): string | null {
  const parts = a.slug.split("/");
  return parts.length >= 3 ? parts[1].toLowerCase() : null;
}

type SortKey = "words" | "alpha" | "confidence";

export default function CategoryPage({ params }: { params: Promise<{ cat: string }> }) {
  const { cat } = use(params);
  const meta = CATEGORIES.find((c) => c.key === cat) || CATEGORIES[CATEGORIES.length - 1];

  const [all, setAll] = useState<WikiArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [sub, setSub] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("words");

  useEffect(() => {
    fetch("/api/wiki/index")
      .then((r) => r.json())
      .then((d) => { setAll(d.articles || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const counts: Record<string, number> = {};
  for (const a of all) { const c = topCat(a); counts[c] = (counts[c] || 0) + 1; }

  const inCat = all.filter((a) => topCat(a) === cat);
  const subCounts: Record<string, number> = {};
  for (const a of inCat) { const s = subCat(a); if (s) subCounts[s] = (subCounts[s] || 0) + 1; }
  const subs = Object.entries(subCounts).sort((a, b) => b[1] - a[1]);

  const rows = inCat
    .filter((a) => !sub || subCat(a) === sub)
    .sort((a, b) => {
      if (sort === "alpha") return a.title.localeCompare(b.title);
      if (sort === "confidence") return (a.confidence || "z").localeCompare(b.confidence || "z");
      return (b.wordCount || 0) - (a.wordCount || 0);
    });

  const totalWords = inCat.reduce((n, a) => n + (a.wordCount || 0), 0);
  const reviewed = inCat.filter((a) => a.explored).length;

  return (
    <div style={{ background: "#e8e4d8", minHeight: "100vh" }}>
      <div className="page">
        <WikiNav active="wiki" />
        <div className="grid-2col">
          {/* Sidebar */}
          <aside className="side">
            <div className="head">Browse</div>
            <Link href="/wiki" className="link">Home</Link>
            <div className="head">Categories</div>
            {CATEGORIES.filter((c) => counts[c.key]).map((c) => (
              <Link key={c.key} href={`/wiki/category/${c.key}`} className={`link${c.key === cat ? " active" : ""}`}>
                <span className={`cat-dot ${c.cls}`} />
                {c.label}
                <span className="count">{counts[c.key]}</span>
              </Link>
            ))}
            {subs.length > 0 && (
              <>
                <div className="head">{meta.label} · Subcategories</div>
                {subs.map(([s, n]) => (
                  <button key={s} className={`link${sub === s ? " active" : ""}`} style={{ width: "100%", textAlign: "left", background: "none", cursor: "pointer" }} onClick={() => setSub(sub === s ? null : s)}>
                    {s}
                    <span className="count">{n}</span>
                  </button>
                ))}
              </>
            )}
          </aside>

          {/* Main */}
          <div className="content">
            <div className="article-cat-row">
              <span className={`cat-tag ${meta.cls}`}>{meta.label} · {inCat.length}</span>
            </div>
            <h1 className="page-title" style={{ fontSize: 48 }}>{meta.label}</h1>
            <p className="lede" style={{ maxWidth: 720 }}>{meta.desc}</p>

            <div className="row-tight mono" style={{ gap: 22, flexWrap: "wrap", marginBottom: 18 }}>
              <span><strong style={{ color: "var(--ink)" }}>{inCat.length}</strong> entries</span>
              {subs.length > 0 && <span><strong style={{ color: "var(--ink)" }}>{subs.length}</strong> subcategories</span>}
              <span><strong style={{ color: "var(--ink)" }}>~{totalWords.toLocaleString()}</strong> words</span>
              <span><strong style={{ color: "var(--ink)" }}>{reviewed}</strong> reviewed</span>
            </div>

            {subs.length > 0 && (
              <div className="tabs">
                <button className={`tab${!sub ? " active" : ""}`} onClick={() => setSub(null)}>All · {inCat.length}</button>
                {subs.map(([s, n]) => (
                  <button key={s} className={`tab${sub === s ? " active" : ""}`} onClick={() => setSub(s)}>{s} {n}</button>
                ))}
              </div>
            )}

            <div className="spread" style={{ marginBottom: 10 }}>
              <span className="mono">{rows.length} entries</span>
              <span className="mono">
                sort:{" "}
                {(["words", "alpha", "confidence"] as SortKey[]).map((k) => (
                  <button key={k} className="btn" style={{ marginLeft: 6, padding: "3px 8px", boxShadow: sort === k ? "2px 2px 0 var(--ink)" : "none", background: sort === k ? "var(--yellow)" : "var(--paper)" }} onClick={() => setSort(k)}>
                    {k === "words" ? "Word count" : k === "alpha" ? "A–Z" : "Confidence"}
                  </button>
                ))}
              </span>
            </div>

            {loading ? (
              <p className="mono">Loading…</p>
            ) : (
              <table className="entry-table">
                <thead>
                  <tr>
                    <th style={{ width: 180 }}>Slug</th>
                    <th>One-line blurb</th>
                    <th style={{ width: 60, textAlign: "right" }}>Words</th>
                    <th style={{ width: 90 }}>Confidence</th>
                    <th style={{ width: 70 }}>Reviewed</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((a) => (
                    <tr key={a.slug}>
                      <td><Link href={`/wiki/${a.slug}`} className="slug wl" style={{ textDecoration: "none" }}>{a.slug.split("/").pop()}</Link></td>
                      <td className="blurb">{a.tldr || ""}</td>
                      <td className="wc">{a.wordCount ? a.wordCount.toLocaleString() : "—"}</td>
                      <td className="conf">{a.confidence || "—"}</td>
                      <td><span className="badge-explored">{a.explored ? "✓" : "—"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <WikiFooter />
      </div>
    </div>
  );
}
