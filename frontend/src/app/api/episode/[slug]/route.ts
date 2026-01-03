import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const decodedSlug = decodeURIComponent(slug);

  try {
    // Load episodes data
    const episodesPath = path.join(process.cwd(), "public", "episodes.json");
    const episodesData = await fs.readFile(episodesPath, "utf-8");
    const episodes = JSON.parse(episodesData);

    // Find the episode
    const episodeInfo = episodes.find((ep: any) => ep.slug === decodedSlug);
    
    if (!episodeInfo) {
      return NextResponse.json(
        { error: "Episode not found" },
        { status: 404 }
      );
    }

    // Read the transcript file
    const transcriptPath = path.join(
      process.cwd(),
      "..",
      "transcripts",
      episodeInfo.filePath
    );

    let transcript = "";
    let hasRawTranscript = false;
    let rawTranscript = "";

    try {
      const fileContent = await fs.readFile(transcriptPath, "utf-8");
      const { content, data } = matter(fileContent);
      transcript = content;

      // Check if raw transcript exists
      if (episodeInfo.rawFilePath) {
        const rawPath = path.join(
          process.cwd(),
          "..",
          "transcripts",
          episodeInfo.rawFilePath
        );
        try {
          const rawContent = await fs.readFile(rawPath, "utf-8");
          const { content: rawText } = matter(rawContent);
          rawTranscript = rawText;
          hasRawTranscript = true;
        } catch (err) {
          // Raw file doesn't exist, that's okay
        }
      }
    } catch (err) {
      // If transcript file is missing, still return episode info
      transcript = "";
    }

    // Return combined data
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