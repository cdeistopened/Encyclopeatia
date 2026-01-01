import { NextRequest, NextResponse } from "next/server";

// Backend API URL - defaults to localhost for development
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

interface RAGSource {
  text: string;
  section_header: string;
  section_anchor: string;
  episode_title: string;
  episode_id: string;
  show: string;
  date_published: string | null;
  audio_url: string | null;
  score: number;
  metadata?: Record<string, unknown>;
}

interface RAGResponse {
  answer: string;
  sources: RAGSource[];
  query: string;
  entities_found?: string[];
  graph_enhanced?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { question, limit = 12, show, doc_type } = await request.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    // Call the FastAPI backend
    const response = await fetch(`${BACKEND_URL}/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        limit,
        show: show || null,
        doc_type: doc_type || null,
        include_sources: true,
        use_graph: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Backend error:", errorData);
      return NextResponse.json(
        { error: errorData.detail || `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    const result: RAGResponse = await response.json();

    // Transform sources to match frontend expectations
    // Truncate text and convert filepath to slug format
    const transformedSources = result.sources.map((s) => ({
      text: s.text.length > 500 ? s.text.slice(0, 500) + "..." : s.text,
      section_header: s.section_header,
      section_anchor: s.section_anchor,
      episode_title: s.episode_title,
      episode_id: filepathToSlug(s.metadata?.filepath as string, s.episode_id),
      show: s.show,
      date_published: s.date_published,
      audio_url: s.audio_url,
      score: s.score,
    }));

    return NextResponse.json({
      answer: result.answer,
      query: result.query,
      sources: transformedSources,
      entities_found: result.entities_found || [],
      graph_enhanced: result.graph_enhanced || false,
    });
  } catch (error) {
    console.error("RAG API error:", error);

    // Check if it's a connection error to the backend
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        { error: "Backend service unavailable. Please try again later." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Convert filepath to frontend slug format.
 * Example: "/app/transcripts/ask-the-herb-doctor/polished/2019-11-15.md"
 *       -> "ask-the-herb-doctor/polished/2019-11-15"
 */
function filepathToSlug(filepath: string | undefined, fallback: string): string {
  if (!filepath) return fallback;

  // Find the show folder in the path
  const parts = filepath.split(/[/\\]/);
  for (let i = 0; i < parts.length; i++) {
    if ((parts[i] === "polished" || parts[i] === "raw") && i > 0) {
      const filename = parts[parts.length - 1].replace(/\.md$/, "");
      return `${parts[i - 1]}/${parts[i]}/${filename}`;
    }
  }

  // Fallback: just return the filename without extension
  const filename = parts[parts.length - 1].replace(/\.md$/, "");
  return filename || fallback;
}
