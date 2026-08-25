"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePlayer } from "@/contexts/PlayerContext";
import type { Episode } from "@/lib/types";
import { getShow } from "@/data/shows";

interface WikiArticleSummary {
  slug: string;
  title: string;
  category?: string;
  status?: string;
  mentions?: number;
}

const WIKI_CATEGORIES = [
  { key: "substances", label: "Substances", desc: "Foods, fats, vitamins, minerals, hormones, and drugs — the atomic entities of the framework.", color: "#e63946" },
  { key: "concepts", label: "Concepts", desc: "Frameworks for thinking: bioenergetics, stress, energy, structure.", color: "#1d3557" },
  { key: "conditions", label: "Conditions", desc: "States you can have — and how the energy framework reads them.", color: "#c9a227" },
  { key: "mechanisms", label: "Mechanisms", desc: "Processes and pathways: how the biology actually moves.", color: "#0d9488" },
  { key: "people", label: "People", desc: "The researchers Peat built on — Barnes, Ling, Warburg, Selye.", color: "#7c3aed" },
  { key: "protocols", label: "Protocols", desc: "Actionable frameworks: what to actually do, and when.", color: "#c96f2e" },
  { key: "practices", label: "Practices", desc: "Daily and weekly routines that move the needle.", color: "#2a9d8f" },
  { key: "articles", label: "Articles", desc: "Narrative synthesis across entities — where Peat's positions evolved.", color: "#e76f51" },
] as const;

function categoryOf(article: WikiArticleSummary): string {
  if (article.slug.includes("/")) return article.slug.split("/")[0].toLowerCase();
  if (article.category) return article.category.toLowerCase().replace(/s?$/, "s");
  return "other";
}

export default function Home() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wikiArticles, setWikiArticles] = useState<WikiArticleSummary[]>([]);
  const [wikiLoading, setWikiLoading] = useState(true);
  const [wikiSearch, setWikiSearch] = useState("");
  const [wikiCategory, setWikiCategory] = useState<string | null>(null);

  const { play, currentEpisode, isPlaying } = usePlayer();

  useEffect(() => {
    fetch("/api/wiki/index")
      .then((res) => res.json())
      .then((data) => {
        setWikiArticles(data.articles || []);
        setWikiLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load wiki index:", err);
        setWikiLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch("/episodes.json")
      .then((res) => res.json())
      .then((data: Episode[]) => {
        // Get a diverse selection from different shows
        const showMap = new Map<string, Episode[]>();
        data.forEach((ep: Episode) => {
          const existing = showMap.get(ep.show) || [];
          existing.push(ep);
          showMap.set(ep.show, existing);
        });

        // Take 2 episodes from each show (up to 6 shows = 12 episodes)
        const featured: Episode[] = [];
        const shows = Array.from(showMap.entries())
          .sort((a, b) => b[1].length - a[1].length) // Sort by episode count
          .slice(0, 6); // Top 6 shows

        shows.forEach(([, eps]) => {
          // Pick episodes with interesting titles (not just "Month Year KMUD")
          const interesting = eps.filter(e =>
            !e.title.match(/^Ask the Herb Doctor: (January|February|March|April|May|June|July|August|September|October|November|December) \d{4}/)
          );
          const toAdd = interesting.length >= 2 ? interesting.slice(0, 2) : eps.slice(0, 2);
          featured.push(...toAdd);
        });

        setEpisodes(featured.slice(0, 12));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load episodes:", err);
        setLoading(false);
      });
  }, []);

  const filteredEpisodes = episodes.filter((ep) => {
    if (!search) return true;
    return (
      ep.title.toLowerCase().includes(search.toLowerCase()) ||
      ep.show.toLowerCase().includes(search.toLowerCase())
    );
  });

  const wikiCounts: Record<string, number> = {};
  for (const a of wikiArticles) {
    const c = categoryOf(a);
    wikiCounts[c] = (wikiCounts[c] || 0) + 1;
  }

  const wikiBrowsing = Boolean(wikiSearch || wikiCategory);

  const filteredWiki = wikiArticles
    .filter((a) => {
      const q = wikiSearch.toLowerCase();
      const matchesSearch =
        !q || a.title.toLowerCase().includes(q) || a.slug.toLowerCase().includes(q);
      const matchesCategory = !wikiCategory || categoryOf(a) === wikiCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => a.title.localeCompare(b.title));

  const handlePlay = (episode: Episode) => {
    if (episode.audioUrl) {
      play({
        slug: episode.slug,
        title: episode.title,
        show: episode.show,
        audioUrl: episode.audioUrl,
        date: episode.date,
        speakers: episode.speakers || [],
        filePath: episode.filePath,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin">
            progress_activity
          </span>
          <p className="mt-4 font-mono text-sm text-ink-muted">Loading archive...</p>
        </div>
      </div>
    );
  }

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
              Ray Peat Wiki
            </h1>
          </Link>
          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-8 items-center">
            <Link
              href="/podcasts"
              className="font-mono text-sm font-medium hover:underline decoration-2 underline-offset-4"
            >
              SOURCES
            </Link>
            <Link href="/ask" className="btn-primary">
              ASK PEAT
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 -mr-2"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t-2 border-ink bg-surface">
            <nav className="flex flex-col p-4 gap-2">
              <Link
                href="/podcasts"
                onClick={() => setMobileMenuOpen(false)}
                className="font-mono text-sm font-medium py-3 px-4 border-2 border-ink hover:bg-ink hover:text-white transition-colors"
              >
                SOURCES
              </Link>
              <Link
                href="/ask"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary text-center"
              >
                ASK PEAT
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <section className="py-16 md:py-24 border-b-2 border-ink">
          <div className="max-w-3xl">
            <div className="inline-block bg-primary text-ink font-mono text-xs font-bold uppercase tracking-widest px-3 py-1 border-2 border-ink shadow-hard-sm mb-6">
              Bioenergetic Archive
            </div>
            <h1 className="font-serif text-5xl md:text-7xl font-bold leading-[0.95] mb-6">
              The Complete<br />
              <span className="text-primary">Ray Peat</span> Archive
            </h1>
            <p className="font-body text-lg text-ink-muted leading-relaxed mb-8 max-w-xl">
              A 300-page interlinked encyclopedia and 250+ interview transcripts,
              with an AI that answers questions in Peat's own words — every claim
              cited back to the source.
            </p>

            {/* Search */}
            <div className="relative max-w-lg mb-8">
              <input
                type="text"
                placeholder="Search transcripts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface border-2 border-ink px-5 py-4 pr-12 font-serif text-lg focus:ring-0 focus:border-primary focus:shadow-hard transition-all"
              />
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted text-2xl">
                search
              </span>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-8">
              <Link href="/ask" className="btn-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-base">smart_toy</span>
                Ask Dr. Peat
              </Link>
              <Link
                href="#encyclopedia"
                className="flex items-center gap-2 py-2 px-5 font-mono text-xs font-bold uppercase tracking-widest border-2 border-ink bg-surface hover:bg-ink hover:text-white transition-all"
              >
                <span className="material-symbols-outlined text-base">auto_stories</span>
                Browse the Encyclopedia
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-6 font-mono text-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">podcasts</span>
                <span className="font-bold">264</span>
                <span className="text-ink-muted">Episodes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">auto_stories</span>
                <span className="font-bold">300+</span>
                <span className="text-ink-muted">Wiki articles</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">smart_toy</span>
                <span className="font-bold">28k</span>
                <span className="text-ink-muted">Searchable passages</span>
              </div>
            </div>
          </div>
        </section>

        {/* The Encyclopedia */}
        <section id="encyclopedia" className="py-12 border-t-2 border-ink">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-ink-muted flex items-center gap-2">
              <span className="material-symbols-outlined">auto_stories</span>
              The Encyclopedia
            </h2>
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search the encyclopedia..."
                value={wikiSearch}
                onChange={(e) => setWikiSearch(e.target.value)}
                className="w-full bg-surface border-2 border-ink px-4 py-2.5 pr-10 font-mono text-sm focus:border-primary focus:outline-none transition-all"
              />
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted">
                search
              </span>
            </div>
          </div>

          {wikiLoading ? (
            <p className="font-mono text-sm text-ink-muted">Loading encyclopedia…</p>
          ) : wikiBrowsing ? (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <p className="font-mono text-xs text-ink-muted">
                  {filteredWiki.length}{" "}
                  {wikiCategory
                    ? `in ${WIKI_CATEGORIES.find((c) => c.key === wikiCategory)?.label ?? wikiCategory}`
                    : "results"}
                </p>
                <button
                  onClick={() => {
                    setWikiSearch("");
                    setWikiCategory(null);
                  }}
                  className="font-mono text-xs border-2 border-ink px-3 py-1 hover:bg-ink hover:text-white transition-all"
                >
                  Clear
                </button>
              </div>
              <div className="bg-surface border-2 border-ink divide-y-2 divide-ink/10 max-h-[32rem] overflow-y-auto">
                {filteredWiki.map((a) => (
                  <Link
                    key={a.slug}
                    href={`/wiki/${a.slug}`}
                    className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-primary/10 transition-colors group"
                  >
                    <span className="font-serif font-bold group-hover:text-primary transition-colors">
                      {a.title}
                    </span>
                    <span className="font-mono text-xs text-ink-muted shrink-0">{a.slug}</span>
                  </Link>
                ))}
                {filteredWiki.length === 0 && (
                  <p className="px-4 py-10 text-center font-mono text-sm text-ink-muted">
                    No entries match.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-6 font-mono text-sm mb-6">
                <span>
                  <span className="font-bold">{wikiArticles.length || "—"}</span>{" "}
                  <span className="text-ink-muted">articles</span>
                </span>
                <span className="text-ink-muted">·</span>
                <span>
                  <span className="font-bold">
                    {WIKI_CATEGORIES.filter((c) => wikiCounts[c.key]).length}
                  </span>{" "}
                  <span className="text-ink-muted">categories</span>
                </span>
                <span className="text-ink-muted">·</span>
                <span>
                  <span className="font-bold">812</span>{" "}
                  <span className="text-ink-muted">sources indexed</span>
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {WIKI_CATEGORIES.filter((c) => wikiCounts[c.key]).map(
                  ({ key, label, desc, color }) => (
                    <Link
                      key={key}
                      href={`/wiki/category/${key}`}
                      className="group bg-surface border-2 border-ink p-4 shadow-hard-sm hover:shadow-hard hover:-translate-y-0.5 transition-all"
                    >
                      <span
                        className="block w-8 h-1.5 mb-3 border border-ink"
                        style={{ backgroundColor: color }}
                      />
                      <p className="font-serif text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                        {label}
                      </p>
                      <p className="font-mono text-xs text-ink-muted mt-1">
                        {wikiCounts[key] || 0} entries
                      </p>
                      <p className="text-xs text-ink-muted mt-2 leading-snug line-clamp-2">
                        {desc}
                      </p>
                    </Link>
                  )
                )}
              </div>
            </>
          )}
        </section>

        {/* Featured Episodes */}
        <section className="py-12 border-t-2 border-ink">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-ink-muted flex items-center gap-2">
              <span className="material-symbols-outlined">play_circle</span>
              From the Interview Archive
            </h2>
            <Link
              href="/podcasts"
              className="font-mono text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              View All
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEpisodes.map((episode) => {
              const isCurrentlyPlaying = currentEpisode?.slug === episode.slug && isPlaying;
              const showInfo = getShow(episode.show);

              return (
                <article
                  key={episode.slug}
                  className={`bg-surface border-2 border-ink p-5 shadow-hard-sm hover:shadow-hard hover:-translate-y-0.5 transition-all group ${
                    isCurrentlyPlaying ? "ring-2 ring-primary" : ""
                  }`}
                >
                  {/* Show Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-[10px] font-mono font-bold uppercase tracking-widest text-white px-2 py-0.5"
                      style={{ backgroundColor: showInfo.color }}
                    >
                      {episode.show}
                    </span>
                    {episode.date && (
                      <span className="text-xs font-mono text-ink-muted">
                        {new Date(episode.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <Link
                    href={`/episode/${episode.slug}`}
                    className="block"
                  >
                    <h3 className="font-serif text-xl font-bold leading-tight mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {episode.title}
                    </h3>
                  </Link>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto pt-3 border-t border-ink/10">
                    <button
                      onClick={() => handlePlay(episode)}
                      disabled={!episode.audioUrl}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 font-mono text-xs font-bold uppercase border-2 border-ink transition-all ${
                        !episode.audioUrl
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : isCurrentlyPlaying
                          ? "bg-primary text-ink"
                          : "bg-ink text-white hover:bg-primary hover:text-ink"
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">
                        {isCurrentlyPlaying ? "pause" : "play_arrow"}
                      </span>
                      {isCurrentlyPlaying ? "Playing" : "Play"}
                    </button>
                    <Link
                      href={`/episode/${episode.slug}`}
                      className="flex items-center justify-center gap-1 py-2 px-3 font-mono text-xs font-bold uppercase border-2 border-ink bg-surface hover:bg-ink hover:text-white transition-all"
                    >
                      <span className="material-symbols-outlined text-base">description</span>
                      Read
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredEpisodes.length === 0 && (
            <div className="text-center py-16 border-2 border-ink bg-surface">
              <span className="material-symbols-outlined text-5xl text-ink-muted">search_off</span>
              <h3 className="font-serif text-xl mt-4">No episodes found</h3>
              <p className="text-ink-muted mt-2">Try a different search term</p>
            </div>
          )}
        </section>

        {/* Quick Links */}
        <section className="py-12 border-t-2 border-ink">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Browse Archive */}
            <Link
              href="/podcasts"
              className="group bg-surface border-2 border-ink p-6 shadow-hard-sm hover:shadow-hard hover:-translate-y-0.5 transition-all"
            >
              <span className="material-symbols-outlined text-4xl text-primary mb-4 block group-hover:rotate-12 transition-transform">
                podcasts
              </span>
              <h3 className="font-serif text-xl font-bold mb-2">Browse Archive</h3>
              <p className="text-ink-muted text-sm mb-4">
                Filter by show, year, or search all 264 episode transcripts.
              </p>
              <span className="font-mono text-xs font-bold text-primary uppercase flex items-center gap-1">
                Explore
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </span>
            </Link>

            {/* Encyclopedia */}
            <Link
              href="#encyclopedia"
              className="group bg-surface border-2 border-ink p-6 shadow-hard-sm hover:shadow-hard hover:-translate-y-0.5 transition-all"
            >
              <span className="material-symbols-outlined text-4xl text-primary mb-4 block group-hover:rotate-12 transition-transform">
                auto_stories
              </span>
              <h3 className="font-serif text-xl font-bold mb-2">Encyclopedia</h3>
              <p className="text-ink-muted text-sm mb-4">
                Explore substances, conditions, and concepts from a bioenergetic lens.
              </p>
              <span className="font-mono text-xs font-bold text-primary uppercase flex items-center gap-1">
                Browse Articles
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </span>
            </Link>

            {/* Ask Peat */}
            <Link
              href="/ask"
              className="group bg-ink text-white border-2 border-ink p-6 shadow-hard-sm hover:shadow-hard hover:-translate-y-0.5 transition-all"
            >
              <span className="material-symbols-outlined text-4xl text-primary mb-4 block group-hover:rotate-12 transition-transform">
                smart_toy
              </span>
              <h3 className="font-serif text-xl font-bold mb-2">Ask Peat</h3>
              <p className="text-white/80 text-sm mb-4">
                AI-powered search across the entire corpus with source citations.
              </p>
              <span className="font-mono text-xs font-bold text-primary uppercase flex items-center gap-1">
                Ask a Question
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </span>
            </Link>
          </div>
        </section>

        {/* Disclaimer */}
        <section aria-label="Disclaimer" className="border-t-2 border-ink bg-paper-dim">
          <div className="py-5 px-6 flex flex-col md:flex-row items-start md:items-center gap-3 max-w-7xl mx-auto">
            <span className="material-symbols-outlined text-primary shrink-0">info</span>
            <p className="text-sm text-ink-muted leading-relaxed max-w-4xl">
              <strong className="text-ink">This is not Ray Peat.</strong> Dr. Peat
              (1935–2024) had no involvement with this site. Every answer and
              article here is assembled exclusively from his published writings,
              newsletters, and interviews — and every claim links back to its
              source. Nothing here is individualized medical advice.{" "}
              <a
                href="https://raypeat.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-medium hover:underline"
              >
                RayPeat.com
              </a>{" "}
              and his books are always the primary sources.
            </p>
          </div>
        </section>

        {/* Contribute */}
        <section className="py-12 border-t-2 border-ink">
          <div className="bg-surface border-2 border-ink p-8 md:p-10 shadow-hard">
            <div className="flex flex-col md:flex-row md:items-center gap-8">
              <div className="flex-1">
                <h2 className="font-serif text-3xl font-bold mb-3">Open source, openly editable</h2>
                <p className="text-ink-muted leading-relaxed mb-4 max-w-2xl">
                  The whole encyclopedia and every transcript is Markdown on GitHub.
                  Clone it, point your AI agent at it, fix a speaker label, add a
                  connection, write a missing entry — pull requests welcome.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/contribute" className="btn-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">volunteer_activism</span>
                    How to Contribute
                  </Link>
                  <a
                    href="https://github.com/cdeistopened/raypeat-wiki"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 py-2 px-5 font-mono text-xs font-bold uppercase tracking-widest border-2 border-ink bg-paper hover:bg-ink hover:text-white transition-all"
                  >
                    <span className="material-symbols-outlined text-base">code</span>
                    GitHub Repo
                  </a>
                </div>
              </div>
              <div className="md:w-80 shrink-0 bg-ink text-white p-4 font-mono text-xs overflow-x-auto border-2 border-ink">
                <p className="text-primary mb-1"># read it with any agent</p>
                <p>git clone https://github.com/</p>
                <p className="pl-6">cdeistopened/raypeat-wiki.git</p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-12 border-t-2 border-ink">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-serif text-3xl font-bold mb-4">About This Archive</h2>
            <p className="text-ink-muted leading-relaxed mb-6">
              This archive preserves and makes searchable the life's work of Dr. Ray Peat,
              exploring bioenergetic principles that support cellular energy production
              and optimal health. All content is provided free and open source.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <a
                href="https://raypeat.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-primary hover:underline flex items-center gap-1"
              >
                RayPeat.com
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </a>
              <span className="text-ink-muted">•</span>
              <span className="text-ink-muted">
                With gratitude to KMUD Radio, Danny Roddy, and all contributors
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-ink bg-paper-dim py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center font-mono text-xs text-ink-muted">
          <p>© 2026 Ray Peat Wiki • An open encyclopedia of the bioenergetic framework</p>
        </div>
      </footer>
    </div>
  );
}
