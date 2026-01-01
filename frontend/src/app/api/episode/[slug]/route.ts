import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

interface EpisodeData {
  slug: string;
  title: string;
  show: string;
  date: string;
  duration?: string;
  audioUrl: string | null;
  speakers: string[];
  filePath: string;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  try {
    // Load episodes index
    const publicDir = path.join(process.cwd(), "public");
    const episodesPath = path.join(publicDir, "episodes.json");
    const episodesData = await fs.readFile(episodesPath, "utf-8");
    const episodes: EpisodeData[] = JSON.parse(episodesData);

    // Find the episode by slug
    const episode = episodes.find((ep) => ep.slug === slug);

    if (!episode) {
      return NextResponse.json(
        { error: "Episode not found" },
        { status: 404 }
      );
    }

    // Read transcript content from filePath
    // filePath is relative to the app root (e.g., "../transcripts/show/polished/file.md")
    const transcriptsRoot = path.join(process.cwd(), "..");
    const transcriptPath = path.join(transcriptsRoot, episode.filePath);

    let transcript = "";
    try {
      transcript = await fs.readFile(transcriptPath, "utf-8");
    } catch {
      // Transcript file not found - return episode without transcript
      transcript = "";
    }

    return NextResponse.json({
      ...episode,
      transcript,
    });
  } catch (error) {
    console.error("Error loading episode:", error);
    return NextResponse.json(
      { error: "Failed to load episode" },
      { status: 500 }
    );
  }
}
