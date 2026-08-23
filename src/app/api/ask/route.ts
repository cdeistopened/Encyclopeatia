import { NextRequest, NextResponse } from "next/server";
import { askDrPeat, MissingKeyError } from "@/lib/askEngine";

/**
 * POST /api/ask  { question }
 *
 * Ask Dr. Peat — self-contained agentic RAG over the full corpus (28k chunks:
 * newsletters, books, emails, articles, letters, transcripts, Ray Peat Wiki).
 * Retrieval is local BM25 (public/ask-data/); synthesis runs on a cheap model
 * via OpenRouter (OPENROUTER_API_KEY, OPENROUTER_MODEL). No external backend.
 */

// Light abuse guard: 30 questions/day per IP, in-memory (resets on deploy).
const RATE_LIMIT = 30;
const hits = new Map<string, { day: string; count: number }>();

function rateLimited(ip: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  const rec = hits.get(ip);
  if (!rec || rec.day !== today) {
    hits.set(ip, { day: today, count: 1 });
    return false;
  }
  rec.count += 1;
  return rec.count > RATE_LIMIT;
}

export async function POST(request: NextRequest) {
  try {
    let question: unknown;
    let modelOverride: string | null = null;
    try {
      const body = await request.json();
      ({ question, model: modelOverride } = body);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!question || typeof question !== "string" || question.trim().length < 3) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }
    if (question.length > 1000) {
      return NextResponse.json({ error: "Question too long (max 1000 chars)" }, { status: 400 });
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    if (rateLimited(ip)) {
      return NextResponse.json(
        { error: "Daily question limit reached. Come back tomorrow." },
        { status: 429 },
      );
    }

    const trimmed = question.trim();
    const { answer, sources } = await askDrPeat(trimmed, modelOverride);

    return NextResponse.json({ answer, sources, query: trimmed });
  } catch (error) {
    if (error instanceof MissingKeyError) {
      console.error("[ask] OPENROUTER_API_KEY missing");
      return NextResponse.json(
        { error: "The answer engine isn't configured yet — the site owner needs to add an API key." },
        { status: 503 },
      );
    }
    console.error("[ask] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
