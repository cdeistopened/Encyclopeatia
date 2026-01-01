"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePlayer } from "@/contexts/PlayerContext";
import type { Episode } from "@/lib/types";
import { SHOWS, getShow } from "@/data/shows";

export default function PodcastBrowser() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedShow, setSelectedShow] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "title">("date");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [showAllShows, setShowAllShows] = useState(false);

  const { play, currentEpisode, isPlaying } = usePlayer();

  useEffect(() => {
    fetch("/episodes.json")
      .then((res) => res.json())
      .then((data: Episode[]) => {
        setEpisodes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load episodes:", err);
        setLoading(false);
      });
  }, []);

  // Extract unique shows and years
  const shows = useMemo(() => {
    const showMap = new Map<string, number>();
    episodes.forEach((ep) => {
      const count = showMap.get(ep.show) || 0;
      showMap.set(ep.show, count + 1);
    });
    return Array.from(showMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [episodes]);

  const years = useMemo(() => {
    const yearSet = new Set<number>();
    episodes.forEach((ep) => {
      if (ep.date) {
        yearSet.add(new Date(ep.date).getFullYear());
      }
    });
    return Array.from(yearSet).sort((a, b) => b - a);
  }, [episodes]);

  // Filter and sort episodes
  const filteredEpisodes = useMemo(() => {
    let result = [...episodes];

    if (selectedShow) {
      result = result.filter((ep) => ep.show === selectedShow);
    }

    if (selectedYear) {
      result = result.filter((ep) => {
        if (!ep.date) return false;
        return new Date(ep.date).getFullYear() === selectedYear;
      });
    }

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (ep) =>
          ep.title.toLowerCase().includes(searchLower) ||
          ep.show.toLowerCase().includes(searchLower)
      );
    }

    result.sort((a, b) => {
      if (sortBy === "date") {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
      } else {
        return sortOrder === "desc"
          ? b.title.localeCompare(a.title)
          : a.title.localeCompare(b.title);
      }
    });

    return result;
  }, [episodes, selectedShow, selectedYear, search, sortBy, sortOrder]);

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
          <span className="material-symbols-outlined text-5xl text-ink animate-spin">
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
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink">EncycloPEATia</h1>
          </Link>
          <nav className="hidden md:flex gap-8 items-center">
            <Link href="/podcasts" className="font-mono text-sm font-medium underline decoration-2 underline-offset-4">
              ARCHIVE
            </Link>
            <Link href="/encyclopedia" className="font-mono text-sm font-medium hover:underline decoration-2 underline-offset-4">
              ENCYCLOPEDIA
            </Link>
            <Link href="/ask" className="btn-primary">
              ASK PEAT
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-8 md:pt-12 pb-16">
        {/* Page Header */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-sm font-mono text-ink-muted mb-2">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <span className="text-ink font-bold">Archive</span>
          </nav>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Podcast Archive</h1>
          <p className="text-ink-muted text-lg max-w-2xl">
            {episodes.length} episodes from {shows.length} shows featuring Ray Peat.
            All transcripts are searchable and linked to our knowledge base.
          </p>
        </div>

        {/* Show Attribution Cards */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-ink-muted flex items-center gap-2">
              <span className="material-symbols-outlined">podcasts</span>
              Featured Shows
            </h2>
            <button
              onClick={() => setShowAllShows(!showAllShows)}
              className="font-mono text-xs text-primary hover:underline"
            >
              {showAllShows ? "Show Less" : "View All Shows"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shows.slice(0, showAllShows ? undefined : 6).map(({ name, count }) => {
              const showInfo = getShow(name);
              return (
                <div
                  key={name}
                  className={`bg-white border-2 border-ink p-5 shadow-hard-sm hover:shadow-hard hover:-translate-y-0.5 transition-all cursor-pointer ${
                    selectedShow === name ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedShow(selectedShow === name ? null : name)}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: showInfo.color }}
                    >
                      <span className="material-symbols-outlined">{showInfo.icon}</span>
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="font-serif font-bold text-lg leading-tight mb-1 truncate">
                        {showInfo.name}
                      </h3>
                      <p className="text-xs font-mono text-ink-muted mb-2">
                        {showInfo.host} • {showInfo.yearsActive}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">
                          {count} episodes
                        </span>
                        {showInfo.externalUrl !== "#" && (
                          <a
                            href={showInfo.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs font-mono text-primary hover:underline flex items-center gap-1"
                          >
                            Visit Site
                            <span className="material-symbols-outlined text-sm">open_in_new</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-3 space-y-6">
            {/* Year Filter */}
            <div className="border-2 border-ink bg-white p-5 shadow-hard-sm">
              <h3 className="font-mono font-bold text-sm uppercase tracking-widest border-b-2 border-ink pb-2 mb-4">
                Filter by Year
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedYear(null)}
                  className={`px-3 py-1.5 text-xs font-mono font-bold border-2 border-ink transition-all ${
                    !selectedYear
                      ? "bg-ink text-white"
                      : "bg-white text-ink hover:bg-gray-50"
                  }`}
                >
                  All Years
                </button>
                {years.slice(0, 12).map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(selectedYear === year ? null : year)}
                    className={`px-3 py-1.5 text-xs font-mono font-bold border-2 border-ink transition-all ${
                      selectedYear === year
                        ? "bg-ink text-white"
                        : "bg-white text-ink hover:bg-gray-50"
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Filters */}
            {(selectedShow || selectedYear) && (
              <div className="bg-amber-50 border-2 border-amber-200 p-4">
                <h4 className="font-mono text-xs font-bold uppercase text-amber-700 mb-2">Active Filters</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedShow && (
                    <button
                      onClick={() => setSelectedShow(null)}
                      className="flex items-center gap-1 bg-white border border-ink/20 px-2 py-1 text-xs font-mono"
                    >
                      {selectedShow}
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  )}
                  {selectedYear && (
                    <button
                      onClick={() => setSelectedYear(null)}
                      className="flex items-center gap-1 bg-white border border-ink/20 px-2 py-1 text-xs font-mono"
                    >
                      {selectedYear}
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Ask Peat CTA */}
            <div className="bg-ink text-white p-5 border-2 border-ink shadow-hard-sm">
              <div className="flex items-start gap-3 mb-2">
                <span className="material-symbols-outlined text-2xl text-primary">smart_toy</span>
                <h3 className="font-display font-bold text-lg leading-tight">Have a question?</h3>
              </div>
              <p className="font-mono text-xs opacity-90 mb-4">
                Search 770+ hours of transcripts with AI.
              </p>
              <Link
                href="/ask"
                className="inline-block bg-primary text-ink font-bold font-mono text-xs px-4 py-2 uppercase tracking-wide hover:bg-primary-dark transition-colors border-2 border-ink"
              >
                Ask Peat
              </Link>
            </div>
          </aside>

          {/* Episode List */}
          <div className="lg:col-span-9">
            {/* Search and Sort */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search episodes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border-2 border-ink px-4 py-3 pr-10 font-mono text-sm focus:ring-0 focus:border-primary focus:shadow-hard transition-all"
                />
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted">
                  search
                </span>
              </div>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "date" | "title")}
                  className="bg-white border-2 border-ink px-3 py-2 font-mono text-sm focus:ring-0 cursor-pointer"
                >
                  <option value="date">Date</option>
                  <option value="title">Title</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                  className="bg-white border-2 border-ink px-3 py-2 font-mono text-sm hover:bg-gray-50"
                >
                  {sortOrder === "desc" ? "↓" : "↑"}
                </button>
              </div>
            </div>

            {/* Results count */}
            <div className="font-mono text-xs text-ink-muted uppercase tracking-widest mb-4 pb-4 border-b-2 border-ink">
              Showing {filteredEpisodes.length} of {episodes.length} episodes
            </div>

            {/* Episode Cards */}
            <div className="space-y-3">
              {filteredEpisodes.slice(0, 50).map((episode) => {
                const isCurrentlyPlaying = currentEpisode?.slug === episode.slug && isPlaying;
                const showInfo = getShow(episode.show);

                return (
                  <div
                    key={episode.slug}
                    className={`bg-white border-2 border-ink p-4 flex items-center gap-4 hover:shadow-hard-sm transition-all ${
                      isCurrentlyPlaying ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    {/* Play Button */}
                    <button
                      onClick={() => handlePlay(episode)}
                      disabled={!episode.audioUrl}
                      className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 border-ink transition-all ${
                        !episode.audioUrl
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : isCurrentlyPlaying
                          ? "bg-primary text-ink"
                          : "bg-ink text-white hover:bg-primary hover:text-ink"
                      }`}
                    >
                      <span className="material-symbols-outlined">
                        {isCurrentlyPlaying ? "pause" : "play_arrow"}
                      </span>
                    </button>

                    {/* Episode Info */}
                    <div className="flex-grow min-w-0">
                      <Link
                        href={`/episode/${episode.slug}`}
                        className="font-serif text-lg font-bold text-ink hover:text-primary transition-colors block truncate"
                      >
                        {episode.title}
                      </Link>
                      <div className="flex items-center gap-3 mt-1">
                        <span
                          className="text-xs font-mono font-bold px-2 py-0.5 rounded text-white"
                          style={{ backgroundColor: showInfo.color }}
                        >
                          {episode.show}
                        </span>
                        {episode.date && (
                          <span className="text-xs font-mono text-ink-muted">
                            {new Date(episode.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Read Link */}
                    <Link
                      href={`/episode/${episode.slug}`}
                      className="shrink-0 flex items-center gap-1 px-4 py-2 border-2 border-ink font-mono text-xs font-bold uppercase hover:bg-ink hover:text-white transition-colors"
                    >
                      Read
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>
                );
              })}
            </div>

            {filteredEpisodes.length > 50 && (
              <div className="text-center mt-8 font-mono text-sm text-ink-muted">
                Showing first 50 of {filteredEpisodes.length} episodes. Use search to find more.
              </div>
            )}

            {filteredEpisodes.length === 0 && (
              <div className="text-center py-16 border-2 border-ink bg-white">
                <span className="material-symbols-outlined text-5xl text-ink-muted">search_off</span>
                <h3 className="font-serif text-xl mt-4">No episodes found</h3>
                <p className="text-ink-muted mt-2">Try adjusting your filters or search</p>
              </div>
            )}
          </div>
        </div>
      </main>

    </div>
  );
}
