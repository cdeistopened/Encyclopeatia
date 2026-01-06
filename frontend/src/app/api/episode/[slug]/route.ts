import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

const TRANSCRIPTS_DIR = path.join(process.cwd(), "public", "transcripts");

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const decodedSlug = decodeURIComponent(slug);

  try {
    const episodesPath = path.join(process.cwd(), "public", "episodes.json");
    const episodesData = await fs.readFile(episodesPath, "utf-8");
    const episodes = JSON.parse(episodesData);

    const episodeInfo = episodes.find((ep: any) => ep.slug === decodedSlug);
    
    if (!episodeInfo) {
      return NextResponse.json(
        { error: "Episode not found" },
        { status: 404 }
      );
    }

    let transcript = "";
    let hasRawTranscript = false;
    let rawTranscript = "";

    if (episodeInfo.filePath) {
      const transcriptPath = path.join(TRANSCRIPTS_DIR, episodeInfo.filePath);
      try {
        const fileContent = await fs.readFile(transcriptPath, "utf-8");
        const { content } = matter(fileContent);
        transcript = content;
      } catch (err) {}
    }

    if (episodeInfo.rawFilePath) {
      const rawPath = path.join(TRANSCRIPTS_DIR, episodeInfo.rawFilePath);
      try {
        const rawContent = await fs.readFile(rawPath, "utf-8");
        const { content: rawText } = matter(rawContent);
        rawTranscript = rawText;
        hasRawTranscript = true;
        
        if (!transcript) {
          transcript = rawText;
        }
      } catch (err) {}
    }

    const episodeData = {
      ...episodeInfo,
      transcript,
      rawTranscript,
      hasRawTranscript,
    };

    return NextResponse.json(episodeData);
  } catch (error) {
    console.error("Error loading episode:", error);
    return NextResponse.json(
      { error: "Failed to load episode" },
      { status: 500 }
    );
  }
}