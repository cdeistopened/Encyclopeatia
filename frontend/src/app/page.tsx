"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePlayer } from "@/contexts/PlayerContext";
import type { Episode } from "@/lib/types";
import { getShow } from "@/data/shows";

export default function Home() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const { play, currentEpisode, isPlaying } = usePlayer();

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
              EncycloPEATia
            </h1>
          </Link>
          <nav className="hidden md:flex gap-8 items-center">
            <Link
              href="/podcasts"
              className="font-mono text-sm font-medium hover:underline decoration-2 underline-offset-4"
            >
              ARCHIVE
            </Link>
            <Link
              href="/encyclopedia"
              className="font-mono text-sm font-medium hover:underline decoration-2 underline-offset-4"
            >
              ENCYCLOPEDIA
            </Link>
            <Link href="/ask" className="btn-primary">
              ASK PEAT
            </Link>
          </nav>
        </div>
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
              770+ podcast transcripts, newsletters, and articles. Explore the
              bioenergetic framework that changed how we think about metabolism,
              hormones, and health.
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

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-6 font-mono text-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">podcasts</span>
                <span className="font-bold">770+</span>
                <span className="text-ink-muted">Episodes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">description</span>
                <span className="font-bold">143</span>
                <span className="text-ink-muted">Newsletters</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">article</span>
                <span className="font-bold">96</span>
                <span className="text-ink-muted">Articles</span>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Episodes */}
        <section className="py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-ink-muted flex items-center gap-2">
              <span className="material-symbols-outlined">play_circle</span>
              Featured Episodes
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
                Filter by show, year, or search all 770+ episode transcripts.
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
              href="/encyclopedia"
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
                Browse Entries
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
          <p>© 2024 EncycloPEATia • A community project</p>
        </div>
      </footer>
    </div>
  );
}
