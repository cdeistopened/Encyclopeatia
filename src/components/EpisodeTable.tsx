"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePlayer } from "@/contexts/PlayerContext";
import type { Episode } from "@/lib/types";

interface EpisodeTableProps {
  episodes: Episode[];
  className?: string;
}

type SortField = "date" | "title" | "show" | "duration";
type SortDirection = "asc" | "desc";

export default function EpisodeTable({ episodes, className = "" }: EpisodeTableProps) {
  const { play, currentEpisode, isPlaying, toggle } = usePlayer();
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc"); // Default to desc for new sorts (usually better for dates/duration)
    }
  };

  const filteredAndSortedEpisodes = useMemo(() => {
    let result = [...episodes];

    // Filter
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        (ep) =>
          ep.title.toLowerCase().includes(lowerSearch) ||
          ep.show.toLowerCase().includes(lowerSearch)
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "show":
          comparison = a.show.localeCompare(b.show);
          break;
        case "duration":
            // Duration is string "MM:SS" or "H:MM:SS", need to parse to compare
            // Simple string compare works for same length, but "5:00" > "10:00" is false, which is correct
            // But "1:00:00" > "50:00" is false (lexicographically), which is WRONG.
            // Let's just do string compare for now as duration format is not strictly guaranteed
            // Or better, parse it.
            const getSeconds = (dur: string | undefined) => {
                if(!dur) return 0;
                const parts = dur.split(':').map(Number);
                if(parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
                if(parts.length === 2) return parts[0] * 60 + parts[1];
                return 0;
            };
            comparison = getSeconds(a.duration) - getSeconds(b.duration);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [episodes, search, sortField, sortDirection]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search episodes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 bg-paper border border-ink rounded-md focus:outline-none focus:ring-1 focus:ring-ink-muted transition-shadow"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Table */}
      <div className="border border-ink rounded-md overflow-hidden bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper border-b border-ink text-ink-muted font-medium">
              <tr>
                <th className="px-4 py-3 w-10"></th>
                <th 
                  className="px-4 py-3 cursor-pointer hover:text-ink"
                  onClick={() => handleSort("title")}
                >
                  Title {sortField === "title" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th 
                  className="px-4 py-3 cursor-pointer hover:text-ink"
                  onClick={() => handleSort("show")}
                >
                  Show {sortField === "show" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th 
                  className="px-4 py-3 cursor-pointer hover:text-ink w-32"
                  onClick={() => handleSort("date")}
                >
                  Date {sortField === "date" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                 <th 
                  className="px-4 py-3 cursor-pointer hover:text-ink w-24 text-right"
                  onClick={() => handleSort("duration")}
                >
                  Duration {sortField === "duration" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/20">
              {filteredAndSortedEpisodes.map((episode) => {
                  const isCurrent = currentEpisode?.slug === episode.slug;
                  const isPlayingCurrent = isCurrent && isPlaying;

                  return (
                     <tr 
                        key={episode.slug} 
                        className="group hover:bg-paper-dim transition-colors"
                    >
                      <td className="px-4 py-3">
                        <button
                          onClick={() => isCurrent ? toggle() : play(episode)}
                          className={`w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
                              isCurrent 
                                ? "bg-ink text-paper" 
                                : "text-ink-muted group-hover:text-ink group-hover:bg-ink/10"
                          }`}
                        >
                          {isPlayingCurrent ? (
                             <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
                          ) : (
                             <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-medium text-ink">
                        <Link href={`/episode/${episode.slug}`} className="hover:underline decoration-ink-muted underline-offset-4 block">
                          {episode.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-ink-muted whitespace-nowrap">
                        {episode.show}
                      </td>
                      <td className="px-4 py-3 text-ink-muted whitespace-nowrap">
                        {formatDate(episode.date)}
                      </td>
                      <td className="px-4 py-3 text-ink-muted text-right font-mono text-xs">
                        {episode.duration || "-"}
                      </td>
                    </tr>
                  );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredAndSortedEpisodes.length === 0 && (
            <div className="p-8 text-center text-ink-muted">
                No episodes found matching "{search}"
            </div>
        )}
        
        <div className="px-4 py-2 border-t border-ink bg-paper text-xs text-ink-muted text-right">
            {filteredAndSortedEpisodes.length} episodes
        </div>
      </div>
    </div>
  );
}




