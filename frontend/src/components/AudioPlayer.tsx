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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-paper border-t-2 border-ink shadow-hard safe-bottom">
      {/* Progress Bar */}
      <div className="w-full h-1 bg-ink/20 group cursor-pointer relative">
        <div
          className="absolute top-0 left-0 h-full bg-primary"
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
          className="w-10 h-10 flex items-center justify-center bg-primary border-2 border-ink shadow-hard-sm hover:shadow-hard hover:-translate-y-0.5 active:shadow-none active:translate-y-0 transition-all flex-shrink-0"
        >
          <span className="material-symbols-outlined text-ink">
            {isPlaying ? "pause" : "play_arrow"}
          </span>
        </button>

        {/* Episode Info */}
        <div className="flex-1 min-w-0">
          <Link 
            href={`/episode/${encodeURIComponent(currentEpisode.slug)}`}
            className="block hover:text-primary transition-colors"
          >
            <h3 className="font-medium text-sm truncate text-ink">
              {currentEpisode.title}
            </h3>
          </Link>
          <div className="flex items-center gap-2 text-xs text-ink-muted truncate font-mono">
            <span>{currentEpisode.show}</span>
            <span>•</span>
            <span>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Rewind 15s */}
          <button
            onClick={() => seek(Math.max(0, currentTime - 15))}
            className="p-2 border-2 border-ink bg-surface hover:bg-primary hover:shadow-hard-sm transition-all"
            title="Rewind 15s"
          >
            <span className="material-symbols-outlined text-lg">replay_10</span>
          </button>

          {/* Forward 30s */}
          <button
            onClick={() => seek(Math.min(duration, currentTime + 30))}
            className="p-2 border-2 border-ink bg-surface hover:bg-primary hover:shadow-hard-sm transition-all"
            title="Forward 30s"
          >
            <span className="material-symbols-outlined text-lg">forward_30</span>
          </button>

          {/* Speed */}
          <button
            onClick={cyclePlaybackRate}
            className="min-w-[3rem] px-3 py-2 text-xs font-mono font-bold border-2 border-ink bg-surface hover:bg-primary hover:shadow-hard-sm transition-all"
          >
            {playbackRate}x
          </button>
        </div>
      </div>
    </div>
  );
}




