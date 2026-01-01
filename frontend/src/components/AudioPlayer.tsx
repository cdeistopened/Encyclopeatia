"use client";

import { usePlayer } from "@/contexts/PlayerContext";
import Link from "next/link";

export default function AudioPlayer() {
  const {
    currentEpisode,
    isPlaying,
    currentTime,
    duration,
    toggle,
    seek,
    playbackRate,
    setPlaybackRate,
  } = usePlayer();

  if (!currentEpisode) return null;

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(parseFloat(e.target.value));
  };

  const cyclePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 1.75, 2, 0.75];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    setPlaybackRate(rates[nextIndex]);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--card)] border-t border-[var(--border)] shadow-lg safe-bottom">
      {/* Progress Bar */}
      <div className="w-full h-1 bg-[var(--border)] group cursor-pointer relative">
        <div
          className="absolute top-0 left-0 h-full bg-[var(--primary)]"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        />
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Play/Pause Button */}
        <button
          onClick={toggle}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] transition-colors flex-shrink-0"
        >
          {isPlaying ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Episode Info */}
        <div className="flex-1 min-w-0">
          <Link 
            href={`/episode/${encodeURIComponent(currentEpisode.slug)}`}
            className="block hover:underline"
          >
            <h3 className="font-medium text-sm truncate text-[var(--foreground)]">
              {currentEpisode.title}
            </h3>
          </Link>
          <div className="flex items-center gap-2 text-xs text-[var(--muted)] truncate">
            <span>{currentEpisode.show}</span>
            <span>•</span>
            <span>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Rewind 15s */}
          <button
            onClick={() => seek(Math.max(0, currentTime - 15))}
            className="p-2 rounded hover:bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            title="Rewind 15s"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 100 1.6 1 1 0 000-1.6zm-4.757-1.485A5.006 5.006 0 0111.45 6.222M6 8.5h2.5V6m10.19 11.778a5.006 5.006 0 01-4.141 3.498m4.949-2.276H17v2.5" />
            </svg>
          </button>

          {/* Forward 15s */}
          <button
            onClick={() => seek(Math.min(duration, currentTime + 15))}
            className="p-2 rounded hover:bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            title="Forward 15s"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.934 11.2a1 1 0 100 1.6 1 1 0 000-1.6zm4.757-1.485A5.006 5.006 0 0012.55 6.222M18 8.5h-2.5V6m-10.19 11.778a5.006 5.006 0 004.141 3.498M6.949 19.5H9.5v2.5" />
            </svg>
          </button>

          {/* Speed */}
          <button
            onClick={cyclePlaybackRate}
            className="min-w-[3rem] px-2 py-1 text-xs font-medium rounded border border-[var(--border)] hover:bg-[var(--background)] transition-colors"
          >
            {playbackRate}x
          </button>
        </div>
      </div>
    </div>
  );
}




