"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePlayer } from "@/contexts/PlayerContext";
import type { Episode } from "@/lib/types";
import { SHOWS, getAllShows, getShow } from "@/data/shows";

export default function PodcastBrowser() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedShow, setSelectedShow] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "title">("date");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [view, setView] = useState<"shows" | "episodes">("shows");

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
  const showCounts = useMemo(() => {
    const showMap = new Map<string, number>();
    episodes.forEach((ep) => {
      const count = showMap.get(ep.show) || 0;
      showMap.set(ep.show, count + 1);
    });
    return showMap;
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

    // Filter by show
    if (selectedShow) {
      result = result.filter((ep) => ep.show === selectedShow);
    }

    // Filter by year
    if (selectedYear) {
      result = result.filter((ep) => {
        if (!ep.date) return false;
        return new Date(ep.date).getFullYear() === selectedYear;
      });
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (ep) =>
          ep.title.toLowerCase().includes(searchLower) ||
          ep.show.toLowerCase().includes(searchLower)
      );
    }

    // Sort
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
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">
              progress_activity
            </span>
          </div>
          <div className="font-mono text-sm text-ink-muted">Loading archive...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink font-body antialiased">
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
              className="font-mono text-sm font-medium underline decoration-2 underline-offset-4 decoration-primary"
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

      <div className="flex">
        {/* Sidebar - Filters */}
        <aside className="w-72 border-r-2 border-ink min-h-[calc(100vh-5rem)] bg-surface">
          <div className="p-6">
            {/* View Toggle */}
            <div className="mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setView("shows")}
                  className={`flex-1 py-2 px-3 font-mono text-xs font-bold uppercase border-2 transition-all ${
                    view === "shows"
                      ? "bg-primary border-ink text-ink shadow-hard-sm"
                      : "bg-paper border-ink/30 hover:border-ink"
                  }`}
                >
                  Shows
                </button>
                <button
                  onClick={() => setView("episodes")}
                  className={`flex-1 py-2 px-3 font-mono text-xs font-bold uppercase border-2 transition-all ${
                    view === "episodes"
                      ? "bg-primary border-ink text-ink shadow-hard-sm"
                      : "bg-paper border-ink/30 hover:border-ink"
                  }`}
                >
                  Episodes
                </button>
              </div>
            </div>

            {view === "episodes" && (
              <>
                {/* Shows Filter */}
                <div className="mb-6">
                  <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-ink-muted mb-3">
                    Filter by Show
                  </h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedShow(null)}
                      className={`w-full text-left px-3 py-2 text-sm border-2 transition-all ${
                        !selectedShow
                          ? "bg-primary border-ink text-ink shadow-hard-sm"
                          : "bg-paper border-ink/20 hover:border-ink"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>All Shows</span>
                        <span className="font-mono text-xs">{episodes.length}</span>
                      </div>
                    </button>
                    {Array.from(showCounts.entries())
                      .sort((a, b) => b[1] - a[1])
                      .map(([name, count]) => (
                        <button
                          key={name}
                          onClick={() => setSelectedShow(name)}
                          className={`w-full text-left px-3 py-2 text-sm border-2 transition-all ${
                            selectedShow === name
                              ? "bg-primary border-ink text-ink shadow-hard-sm"
                              : "bg-paper border-ink/20 hover:border-ink"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="truncate pr-2">{name}</span>
                            <span className="font-mono text-xs">{count}</span>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Years Filter */}
                <div className="mb-6">
                  <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-ink-muted mb-3">
                    Filter by Year
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedYear(null)}
                      className={`px-3 py-1 text-sm font-mono border-2 transition-all ${
                        !selectedYear
                          ? "bg-primary border-ink text-ink shadow-hard-sm"
                          : "bg-paper border-ink/20 hover:border-ink"
                      }`}
                    >
                      All
                    </button>
                    {years.map((year) => (
                      <button
                        key={year}
                        onClick={() => setSelectedYear(year)}
                        className={`px-3 py-1 text-sm font-mono border-2 transition-all ${
                          selectedYear === year
                            ? "bg-primary border-ink text-ink shadow-hard-sm"
                            : "bg-paper border-ink/20 hover:border-ink"
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Ask Peat CTA */}
            <div className="bg-ink text-white p-4 border-2 border-ink">
              <h4 className="font-mono text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">mail</span>
                Have a question?
              </h4>
              <p className="text-sm mb-3 opacity-90">
                Get AI answers from 770+ hours of transcripts.
              </p>
              <Link
                href="/ask"
                className="block text-center py-2 bg-primary text-ink font-mono text-xs font-bold uppercase border-2 border-primary hover:bg-primary/90 transition-all"
              >
                Ask Dr. Peat →
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {view === "shows" ? (
            /* Shows View */
            <div className="p-8">
              <div className="mb-6">
                <h2 className="font-serif text-3xl font-bold mb-2">Podcast Shows</h2>
                <p className="text-ink-muted">
                  Browse all shows featuring Dr. Ray Peat interviews and discussions.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getAllShows().map((show) => {
                  const count = showCounts.get(show.name) || 0;
                  
                  return (
                    <div
                      key={show.id}
                      className="bg-surface border-2 border-ink p-6 hover:shadow-hard transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span 
                          className="material-symbols-outlined text-3xl"
                          style={{ color: show.color }}
                        >
                          {show.icon}
                        </span>
                        {show.externalUrl !== "#" && (
                          <a
                            href={show.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-ink-muted hover:text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">
                              open_in_new
                            </span>
                          </a>
                        )}
                      </div>
                      
                      <h3 className="font-serif text-xl font-bold mb-1">{show.name}</h3>
                      <p className="text-sm text-ink-muted mb-2">Host: {show.host}</p>
                      <p className="text-sm mb-3">{show.description}</p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-mono text-xs text-ink-muted">{show.yearsActive}</span>
                        <button
                          onClick={() => {
                            setView("episodes");
                            setSelectedShow(show.name);
                          }}
                          className="font-mono text-xs font-bold uppercase text-primary hover:underline"
                        >
                          {count} episodes →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Episodes View */
            <div className="p-8">
              {/* Search and Sort Controls */}
              <div className="flex gap-4 mb-6 items-center">
                <input
                  type="search"
                  placeholder="Search episodes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 max-w-md px-4 py-2 bg-paper border-2 border-ink focus:border-primary focus:shadow-hard-sm transition-all"
                />

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "date" | "title")}
                  className="px-4 py-2 bg-paper border-2 border-ink cursor-pointer"
                >
                  <option value="date">Sort by Date</option>
                  <option value="title">Sort by Title</option>
                </select>

                <button
                  onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                  className="px-4 py-2 bg-paper border-2 border-ink hover:border-primary transition-all"
                >
                  {sortOrder === "desc" ? "↓ Newest" : "↑ Oldest"}
                </button>
              </div>

              {/* Results Count */}
              <div className="mb-4 font-mono text-xs text-ink-muted">
                Showing {filteredEpisodes.length} episodes
                {selectedShow && ` from ${selectedShow}`}
                {selectedYear && ` in ${selectedYear}`}
              </div>

              {/* Episode List */}
              <div className="space-y-3">
                {filteredEpisodes.map((episode) => {
                  const isCurrentlyPlaying = currentEpisode?.slug === episode.slug && isPlaying;
                  const show = getShow(episode.show);

                  return (
                    <div
                      key={episode.slug}
                      className={`bg-surface border-2 p-4 transition-all ${
                        isCurrentlyPlaying ? "border-primary shadow-hard" : "border-ink hover:shadow-hard-sm"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Play Button */}
                        <button
                          onClick={() => handlePlay(episode)}
                          disabled={!episode.audioUrl}
                          className={`w-12 h-12 flex items-center justify-center border-2 transition-all ${
                            episode.audioUrl
                              ? isCurrentlyPlaying
                                ? "bg-primary border-ink text-ink"
                                : "bg-paper border-ink hover:bg-primary hover:text-ink"
                              : "bg-paper-dim border-ink/30 text-ink-muted cursor-not-allowed"
                          }`}
                        >
                          <span className="material-symbols-outlined">
                            {isCurrentlyPlaying ? "pause" : "play_arrow"}
                          </span>
                        </button>

                        {/* Episode Info */}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/episode/${encodeURIComponent(episode.slug)}`}
                            className="font-serif text-lg font-bold hover:text-primary transition-colors line-clamp-1"
                          >
                            {episode.title}
                          </Link>
                          <div className="flex items-center gap-3 mt-1 text-sm text-ink-muted">
                            <span
                              className="font-mono text-xs font-bold uppercase px-2 py-0.5"
                              style={{ backgroundColor: show.color + "20", color: show.color }}
                            >
                              {episode.show}
                            </span>
                            {episode.date && (
                              <span>
                                {new Date(episode.date).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Read Button */}
                        <Link
                          href={`/episode/${encodeURIComponent(episode.slug)}`}
                          className="px-4 py-2 font-mono text-xs font-bold uppercase border-2 border-ink hover:bg-primary hover:shadow-hard-sm transition-all"
                        >
                          Read →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredEpisodes.length === 0 && (
                <div className="text-center py-16">
                  <span className="material-symbols-outlined text-6xl text-ink-muted mb-4 block">
                    search_off
                  </span>
                  <h3 className="font-serif text-xl font-bold mb-2">No episodes found</h3>
                  <p className="text-ink-muted">Try adjusting your filters or search</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}