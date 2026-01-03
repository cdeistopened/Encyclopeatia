"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePlayer } from "@/contexts/PlayerContext";
import type { Episode } from "@/lib/types";

// Blakean color palette
const colors = {
  background: "#0a0a0f",
  surface: "#141420",
  border: "#2a2a3a",
  textPrimary: "#f5f5f0",
  textSecondary: "#8a8a9a",
  accentGold: "#c9a227",
  accentBlue: "#4a7ac9",
};

export default function PodcastBrowser() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedShow, setSelectedShow] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "title">("date");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

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
      <div
        style={{
          minHeight: "100vh",
          background: colors.background,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 48,
              height: 48,
              border: `3px solid ${colors.border}`,
              borderTop: `3px solid ${colors.accentGold}`,
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px",
            }}
          />
          <div style={{ color: colors.textSecondary, fontFamily: "Georgia, serif" }}>
            Loading the archive...
          </div>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.background,
        color: colors.textPrimary,
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: `1px solid ${colors.border}`,
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: colors.surface,
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 20,
            fontWeight: "bold",
            color: colors.textPrimary,
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ color: colors.accentGold }}>✦</span>
          ENCYCLOPEADIA
        </Link>

        <nav style={{ display: "flex", gap: 24 }}>
          <Link
            href="/encyclopedia"
            style={{
              color: colors.textSecondary,
              textDecoration: "none",
              fontSize: 14,
            }}
          >
            Encyclopedia
          </Link>
          <Link
            href="/podcasts"
            style={{
              color: colors.accentGold,
              textDecoration: "none",
              fontSize: 14,
              fontWeight: "bold",
            }}
          >
            ☉ Podcasts
          </Link>
          <Link
            href="/ask"
            style={{
              color: colors.textSecondary,
              textDecoration: "none",
              fontSize: 14,
            }}
          >
            Ask Peat
          </Link>
        </nav>
      </header>

      <div style={{ display: "flex" }}>
        {/* Sidebar - Filters */}
        <aside
          style={{
            width: 260,
            borderRight: `1px solid ${colors.border}`,
            padding: 24,
            background: colors.surface,
            minHeight: "calc(100vh - 60px)",
          }}
        >
          {/* Shows Filter */}
          <div style={{ marginBottom: 32 }}>
            <h3
              style={{
                fontFamily: "Georgia, serif",
                fontSize: 14,
                color: colors.textSecondary,
                marginBottom: 16,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Shows
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                onClick={() => setSelectedShow(null)}
                style={{
                  background: !selectedShow ? colors.accentGold : "transparent",
                  color: !selectedShow ? colors.background : colors.textSecondary,
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: 4,
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: 14,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>All Shows</span>
                <span style={{ opacity: 0.7 }}>{episodes.length}</span>
              </button>
              {shows.map(({ name, count }) => (
                <button
                  key={name}
                  onClick={() => setSelectedShow(name)}
                  style={{
                    background: selectedShow === name ? colors.accentGold : "transparent",
                    color: selectedShow === name ? colors.background : colors.textSecondary,
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: 4,
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: 14,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>
                    {name}
                  </span>
                  <span style={{ opacity: 0.7 }}>{count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Years Filter */}
          <div style={{ marginBottom: 32 }}>
            <h3
              style={{
                fontFamily: "Georgia, serif",
                fontSize: 14,
                color: colors.textSecondary,
                marginBottom: 16,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Years
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <button
                onClick={() => setSelectedYear(null)}
                style={{
                  background: !selectedYear ? colors.accentGold : "transparent",
                  color: !selectedYear ? colors.background : colors.textSecondary,
                  border: `1px solid ${!selectedYear ? colors.accentGold : colors.border}`,
                  padding: "6px 12px",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                All
              </button>
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  style={{
                    background: selectedYear === year ? colors.accentGold : "transparent",
                    color: selectedYear === year ? colors.background : colors.textSecondary,
                    border: `1px solid ${selectedYear === year ? colors.accentGold : colors.border}`,
                    padding: "6px 12px",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          {/* Ask Peat CTA */}
          <div
            style={{
              background: colors.background,
              border: `1px solid ${colors.border}`,
              borderRadius: 8,
              padding: 16,
            }}
          >
            <h4
              style={{
                fontFamily: "Georgia, serif",
                fontSize: 14,
                marginBottom: 8,
                color: colors.textPrimary,
              }}
            >
              ✉ Have a question?
            </h4>
            <p style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 12 }}>
              Get an AI answer from 770+ hours of transcripts.
            </p>
            <Link
              href="/ask"
              style={{
                display: "block",
                textAlign: "center",
                padding: "10px 16px",
                background: colors.accentBlue,
                color: "white",
                borderRadius: 4,
                textDecoration: "none",
                fontSize: 14,
                fontWeight: "bold",
              }}
            >
              Ask Dr. Peat →
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: 24 }}>
          {/* Search and Sort Controls */}
          <div
            style={{
              display: "flex",
              gap: 16,
              marginBottom: 24,
              alignItems: "center",
            }}
          >
            <input
              type="search"
              placeholder="Search episodes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                maxWidth: 400,
                padding: "12px 16px",
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: 6,
                color: colors.textPrimary,
                fontSize: 14,
              }}
            />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date" | "title")}
              style={{
                padding: "12px 16px",
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: 6,
                color: colors.textPrimary,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              <option value="date">Sort by Date</option>
              <option value="title">Sort by Title</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
              style={{
                padding: "12px 16px",
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: 6,
                color: colors.textPrimary,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              {sortOrder === "desc" ? "↓ Newest" : "↑ Oldest"}
            </button>
          </div>

          {/* Results Count */}
          <div
            style={{
              marginBottom: 16,
              fontSize: 14,
              color: colors.textSecondary,
            }}
          >
            Showing {filteredEpisodes.length} episodes
            {selectedShow && ` from ${selectedShow}`}
            {selectedYear && ` in ${selectedYear}`}
          </div>

          {/* Episode List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredEpisodes.map((episode) => {
              const isCurrentlyPlaying = currentEpisode?.slug === episode.slug && isPlaying;

              return (
                <div
                  key={episode.slug}
                  style={{
                    background: colors.surface,
                    border: `1px solid ${isCurrentlyPlaying ? colors.accentGold : colors.border}`,
                    borderRadius: 8,
                    padding: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  {/* Play Button */}
                  <button
                    onClick={() => handlePlay(episode)}
                    disabled={!episode.audioUrl}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: episode.audioUrl
                        ? isCurrentlyPlaying
                          ? colors.accentGold
                          : colors.accentBlue
                        : colors.border,
                      border: "none",
                      color: "white",
                      fontSize: 18,
                      cursor: episode.audioUrl ? "pointer" : "default",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {isCurrentlyPlaying ? "❚❚" : "▶"}
                  </button>

                  {/* Episode Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link
                      href={`/episode/${encodeURIComponent(episode.slug)}`}
                      style={{
                        fontFamily: "Georgia, serif",
                        fontSize: 18,
                        color: colors.textPrimary,
                        textDecoration: "none",
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      {episode.title}
                    </Link>
                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        fontSize: 13,
                        color: colors.textSecondary,
                      }}
                    >
                      <span
                        style={{
                          background: colors.accentGold,
                          color: colors.background,
                          padding: "2px 8px",
                          borderRadius: 3,
                          fontWeight: "bold",
                        }}
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
                    style={{
                      padding: "10px 16px",
                      border: `1px solid ${colors.border}`,
                      borderRadius: 4,
                      color: colors.textSecondary,
                      textDecoration: "none",
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    Read →
                  </Link>
                </div>
              );
            })}
          </div>

          {filteredEpisodes.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: 60,
                color: colors.textSecondary,
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>☉</div>
              <h3 style={{ fontFamily: "Georgia, serif", marginBottom: 8 }}>
                No episodes found
              </h3>
              <p>Try adjusting your filters or search</p>
            </div>
          )}
        </main>
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }
        body {
          margin: 0;
          font-family: system-ui, -apple-system, sans-serif;
        }
        input::placeholder {
          color: ${colors.textSecondary};
        }
        select option {
          background: ${colors.surface};
          color: ${colors.textPrimary};
        }
      `}</style>
    </div>
  );
}
