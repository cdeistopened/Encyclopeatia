"use client";

import { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import { getShow } from "@/data/shows";

interface EpisodeWithTranscript {
  slug: string;
  title: string;
  show: string;
  date: string;
  duration?: string;
  audioUrl: string | null;
  speakers: string[];
  filePath: string;
  transcript: string;
  rawTranscript?: string;
  hasRawTranscript?: boolean;
}

interface TranscriptBlock {
  type: "speaker" | "section" | "paragraph";
  speaker?: string;
  content: string;
}

function parseTranscript(markdown: string): TranscriptBlock[] {
  const blocks: TranscriptBlock[] = [];
  const lines = markdown.split("\n");
  let currentParagraph: string[] = [];
  let inFrontmatter = false;

  for (const line of lines) {
    // Skip YAML frontmatter
    if (line.trim() === "---") {
      inFrontmatter = !inFrontmatter;
      continue;
    }
    if (inFrontmatter) continue;

    // Section headers
    if (line.startsWith("## ")) {
      if (currentParagraph.length > 0) {
        blocks.push({ type: "paragraph", content: currentParagraph.join(" ") });
        currentParagraph = [];
      }
      blocks.push({ type: "section", content: line.replace("## ", "") });
      continue;
    }

    // Skip h1 headers (title)
    if (line.startsWith("# ")) continue;

    // Speaker labels (bold at start of line)
    const speakerMatch = line.match(/^\*\*([^*]+)\*\*:?\s*(.*)/);
    if (speakerMatch) {
      if (currentParagraph.length > 0) {
        blocks.push({ type: "paragraph", content: currentParagraph.join(" ") });
        currentParagraph = [];
      }
      blocks.push({
        type: "speaker",
        speaker: speakerMatch[1].trim(),
        content: speakerMatch[2] || "",
      });
      continue;
    }

    // Empty lines end paragraphs
    if (line.trim() === "") {
      if (currentParagraph.length > 0) {
        blocks.push({ type: "paragraph", content: currentParagraph.join(" ") });
        currentParagraph = [];
      }
      continue;
    }

    // Accumulate paragraph text
    currentParagraph.push(line.trim());
  }

  // Don't forget the last paragraph
  if (currentParagraph.length > 0) {
    blocks.push({ type: "paragraph", content: currentParagraph.join(" ") });
  }

  return blocks;
}

function getSpeakerClass(speaker: string): string {
  const lowerSpeaker = speaker.toLowerCase();
  if (lowerSpeaker.includes("peat") || lowerSpeaker.includes("ray")) {
    return "speaker-peat";
  }
  if (
    lowerSpeaker.includes("andrew") ||
    lowerSpeaker.includes("sarah") ||
    lowerSpeaker.includes("danny") ||
    lowerSpeaker.includes("host") ||
    lowerSpeaker.includes("patrick") ||
    lowerSpeaker.includes("john")
  ) {
    return "speaker-host";
  }
  return "speaker-caller";
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function EpisodePage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug: slugParts } = use(params);
  const slug = slugParts.join("/"); // Reconstruct the full slug path
  const [episode, setEpisode] = useState<EpisodeWithTranscript | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRawTranscript, setShowRawTranscript] = useState(false);

  // Audio player state
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    fetch(`/api/episode/${encodeURIComponent(slug)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Episode not found");
        return res.json();
      })
      .then((data) => {
        setEpisode(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [episode]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handlePlaybackRateChange = () => {
    const rates = [1, 1.25, 1.5, 1.75, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const skip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        0,
        Math.min(duration, currentTime + seconds)
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-ink animate-spin">
            progress_activity
          </span>
          <p className="mt-4 font-mono text-sm text-ink-muted">
            Loading episode...
          </p>
        </div>
      </div>
    );
  }

  if (error || !episode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-accent">
            error
          </span>
          <h2 className="font-serif text-2xl mt-4">Episode Not Found</h2>
          <p className="text-ink-muted mt-2">{error || "Unable to load episode"}</p>
          <Link
            href="/podcasts"
            className="btn-primary mt-6 inline-flex"
          >
            Back to Archive
          </Link>
        </div>
      </div>
    );
  }

  const showInfo = getShow(episode.show);
  const activeTranscript = showRawTranscript && episode.rawTranscript
    ? episode.rawTranscript
    : episode.transcript;
  const transcriptBlocks = parseTranscript(activeTranscript);
  const formattedDate = episode.date
    ? new Date(episode.date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen font-body antialiased">
      {/* Header */}
      <header className="w-full border-b-2 border-ink sticky top-0 z-40 bg-paper">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="material-symbols-outlined text-2xl text-primary group-hover:rotate-12 transition-transform duration-300">
              auto_stories
            </span>
            <h1 className="font-display text-xl font-bold tracking-tight text-ink">
              EncycloPEATia
            </h1>
          </Link>
          <nav className="flex gap-6 items-center">
            <Link
              href="/podcasts"
              className="font-mono text-sm font-medium hover:text-primary transition-colors"
            >
              ARCHIVE
            </Link>
            <Link
              href="/encyclopedia"
              className="font-mono text-sm font-medium hover:text-primary transition-colors"
            >
              ENCYCLOPEDIA
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm font-mono text-ink-muted mb-6">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <span>/</span>
          <Link href="/podcasts" className="hover:text-primary">
            Archive
          </Link>
          <span>/</span>
          <Link
            href={`/podcasts?show=${encodeURIComponent(episode.show)}`}
            className="hover:text-primary"
          >
            {showInfo.name}
          </Link>
          <span>/</span>
          <span className="text-ink truncate max-w-[200px]">{episode.title}</span>
        </nav>

        {/* Episode Header Card */}
        <div className="bg-surface border-2 border-ink shadow-hard mb-8">
          <div className="p-6 md:p-8">
            {/* Show Badge */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: showInfo.color }}
              >
                <span className="material-symbols-outlined text-lg">
                  {showInfo.icon}
                </span>
              </div>
              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-ink-muted">
                  {showInfo.name}
                </span>
                <p className="text-xs text-ink-muted">{showInfo.host}</p>
              </div>
              {showInfo.externalUrl !== "#" && (
                <a
                  href={showInfo.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-xs font-mono text-primary hover:underline flex items-center gap-1"
                >
                  Visit Show
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                </a>
              )}
            </div>

            {/* Title */}
            <h1 className="font-serif text-3xl md:text-4xl font-bold leading-tight mb-4">
              {episode.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm font-mono text-ink-muted border-t border-ink/10 pt-4 mt-4">
              {formattedDate && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-lg">calendar_today</span>
                  {formattedDate}
                </span>
              )}
              {episode.duration && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-lg">schedule</span>
                  {episode.duration}
                </span>
              )}
              {episode.speakers.length > 0 && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-lg">group</span>
                  {episode.speakers.join(", ")}
                </span>
              )}
            </div>
          </div>

          {/* Audio Player */}
          {episode.audioUrl && (
            <div className="border-t-2 border-ink bg-paper-dim p-4 md:p-6">
              <audio
                ref={audioRef}
                src={episode.audioUrl}
                preload="metadata"
              />
              <div className="flex items-center gap-4">
                {/* Play/Pause Button */}
                <button
                  onClick={togglePlay}
                  className="w-14 h-14 rounded-full bg-primary border-2 border-ink shadow-hard-sm flex items-center justify-center hover:shadow-hard hover:-translate-y-0.5 active:shadow-none active:translate-y-0 transition-all"
                >
                  <span className="material-symbols-outlined text-2xl text-ink">
                    {isPlaying ? "pause" : "play_arrow"}
                  </span>
                </button>

                {/* Progress */}
                <div className="flex-grow">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-ink-muted w-12">
                      {formatTime(currentTime)}
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleSeek}
                      className="flex-grow h-2 bg-ink/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-ink"
                    />
                    <span className="font-mono text-xs text-ink-muted w-12 text-right">
                      {formatTime(duration)}
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() => skip(-15)}
                    className="w-10 h-10 rounded border-2 border-ink bg-surface flex items-center justify-center hover:bg-ink hover:text-white transition-colors"
                    title="Rewind 15s"
                  >
                    <span className="material-symbols-outlined text-lg">replay_10</span>
                  </button>
                  <button
                    onClick={() => skip(30)}
                    className="w-10 h-10 rounded border-2 border-ink bg-surface flex items-center justify-center hover:bg-ink hover:text-white transition-colors"
                    title="Forward 30s"
                  >
                    <span className="material-symbols-outlined text-lg">forward_30</span>
                  </button>
                  <button
                    onClick={handlePlaybackRateChange}
                    className="px-3 h-10 rounded border-2 border-ink bg-surface font-mono text-sm font-bold hover:bg-ink hover:text-white transition-colors"
                    title="Playback speed"
                  >
                    {playbackRate}x
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* No Audio Available */}
          {!episode.audioUrl && (
            <div className="border-t-2 border-ink bg-paper-dim p-4 text-center">
              <span className="material-symbols-outlined text-2xl text-ink-muted">
                headset_off
              </span>
              <p className="font-mono text-sm text-ink-muted mt-1">
                Audio not available for this episode
              </p>
            </div>
          )}
        </div>

        {/* Transcript */}
        <div className="bg-surface border-2 border-ink shadow-hard-sm">
          <div className="border-b-2 border-ink p-4 flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-mono text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined">description</span>
              Transcript
            </h2>
            <div className="flex items-center gap-3">
              {/* Polished/Raw Toggle */}
              {episode.hasRawTranscript && (
                <div className="flex items-center border-2 border-ink rounded overflow-hidden">
                  <button
                    onClick={() => setShowRawTranscript(false)}
                    className={`px-3 py-1.5 text-xs font-mono font-bold uppercase transition-colors ${
                      !showRawTranscript
                        ? "bg-primary text-ink"
                        : "bg-surface text-ink-muted hover:bg-paper-dim"
                    }`}
                  >
                    Polished
                  </button>
                  <button
                    onClick={() => setShowRawTranscript(true)}
                    className={`px-3 py-1.5 text-xs font-mono font-bold uppercase transition-colors border-l-2 border-ink ${
                      showRawTranscript
                        ? "bg-primary text-ink"
                        : "bg-surface text-ink-muted hover:bg-paper-dim"
                    }`}
                  >
                    Raw
                  </button>
                </div>
              )}
              <span className="font-mono text-xs text-ink-muted">
                {transcriptBlocks.filter((b) => b.type === "paragraph").length} paragraphs
              </span>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {transcriptBlocks.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-4xl text-ink-muted">
                  article
                </span>
                <p className="mt-4 text-ink-muted">
                  Transcript not yet available for this episode.
                </p>
              </div>
            ) : (
              <div className="prose max-w-none">
                {transcriptBlocks.map((block, i) => {
                  if (block.type === "section") {
                    return (
                      <h2 key={i} className="font-serif">
                        {block.content}
                      </h2>
                    );
                  }
                  if (block.type === "speaker") {
                    return (
                      <div key={i} className="mt-6 first:mt-0">
                        <span className={`speaker-label ${getSpeakerClass(block.speaker || "")}`}>
                          {block.speaker}
                        </span>
                        {block.content && (
                          <p className="mt-1">{block.content}</p>
                        )}
                      </div>
                    );
                  }
                  return <p key={i}>{block.content}</p>;
                })}
              </div>
            )}
          </div>
        </div>

        {/* External Links */}
        <div className="mt-8 p-6 bg-primary/10 border-2 border-primary rounded">
          <h3 className="font-mono text-sm font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined">link</span>
            Learn More
          </h3>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://raypeat.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-sm"
            >
              RayPeat.com
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </a>
            {showInfo.externalUrl !== "#" && (
              <a
                href={showInfo.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-sm"
              >
                {showInfo.name}
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </a>
            )}
          </div>
        </div>

        {/* Back Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <Link
            href="/podcasts"
            className="flex items-center gap-2 font-mono text-sm font-bold hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Archive
          </Link>
          <Link
            href="/encyclopedia"
            className="flex items-center gap-2 font-mono text-sm font-bold hover:text-primary transition-colors"
          >
            Browse Encyclopedia
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-ink mt-16 py-8">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="font-mono text-sm text-ink-muted">
            EncycloPEATia is a community project. All content is for educational purposes.
          </p>
          <p className="font-mono text-sm text-ink-muted mt-2">
            Visit{" "}
            <a
              href="https://raypeat.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              RayPeat.com
            </a>{" "}
            for Ray Peat&apos;s original articles and research.
          </p>
        </div>
      </footer>
    </div>
  );
}
