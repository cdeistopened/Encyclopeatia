import { NextRequest, NextResponse } from "next/server";

// Backend URL - Python FastAPI server
const BACKEND_URL = process.env.RAG_BACKEND_URL || "http://localhost:8080";

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
}

interface RAGResponse {
  answer: string;
  sources: RAGSource[];
  query: string;
}

interface BackendChatResponse {
  answer: string;
  sources: Array<{ title: string; source: string }>;
  query: string;
  remaining_today: number;
}

export async function POST(request: NextRequest) {
  try {
    const { question, limit = 20 } = await request.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    // Get email from request (passed from frontend localStorage)
    const email = request.headers.get("X-User-Email");

    // First, ensure user is registered with backend
    if (email) {
      try {
        await fetch(`${BACKEND_URL}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
      } catch (e) {
        console.warn("Could not register with backend:", e);
      }
    }

    // Try the full RAG backend first
    try {
      const backendResponse = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Backend uses cookie-based auth, but we'll pass email header
          "X-User-Email": email || "anonymous@encyclopeatia.com",
        },
        body: JSON.stringify({ query: question, limit, wiki: "ray_peat" }),
        // Include credentials for cookie handling
      });

      if (backendResponse.ok) {
        const data: BackendChatResponse = await backendResponse.json();

        // Transform backend response to match frontend expectations
        const sources: RAGSource[] = data.sources.map((s, i) => ({
          text: "",
          section_header: "Source",
          section_anchor: "",
          episode_title: s.title,
          episode_id: extractEpisodeId(s.source),
          show: extractShow(s.source),
          date_published: null,
          audio_url: null,
          score: 1 - i * 0.1, // Approximate score based on order
        }));

        const response: RAGResponse = {
          answer: data.answer,
          sources,
          query: question,
        };

        return NextResponse.json(response);
      }

      // If backend returned an error, log it and fall through to fallback
      const errorData = await backendResponse.json().catch(() => ({}));
      console.warn("Backend error:", backendResponse.status, errorData);

      // If it's a rate limit error, pass it through
      if (backendResponse.status === 429) {
        return NextResponse.json(
          { error: errorData.detail || "Rate limit exceeded" },
          { status: 429 }
        );
      }

      // If it's an auth error, pass it through
      if (backendResponse.status === 401) {
        return NextResponse.json(
          { error: "Please enter your email to use the chatbot" },
          { status: 401 }
        );
      }

    } catch (backendError) {
      console.warn("Backend unavailable, using fallback:", backendError);
    }

    // Fallback: Use simple search if backend is unavailable
    return await fallbackSearch(question, limit);

  } catch (error) {
    console.error("RAG API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper to extract episode ID from source path
function extractEpisodeId(sourcePath: string): string {
  // Extract filename without extension
  const parts = sourcePath.split("/");
  const filename = parts[parts.length - 1];
  return filename.replace(/\.(md|txt)$/, "");
}

// Helper to extract show from source path
function extractShow(sourcePath: string): string {
  if (sourcePath.includes("kmud") || sourcePath.includes("herb-doctor")) {
    return "Ask Your Herb Doctor";
  }
  if (sourcePath.includes("generative-energy")) {
    return "Generative Energy";
  }
  if (sourcePath.includes("politics-and-science")) {
    return "Politics & Science";
  }
  if (sourcePath.includes("newsletter")) {
    return "Newsletter";
  }
  if (sourcePath.includes("article")) {
    return "Article";
  }
  if (sourcePath.includes("email")) {
    return "Email";
  }
  return "Ray Peat Archive";
}

// Fallback search using built-in Gemini (limited to transcripts only)
async function fallbackSearch(question: string, limit: number) {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const { searchTranscripts } = await import("@/lib/serverSearch");

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY not configured" },
      { status: 500 }
    );
  }

  const searchResults = searchTranscripts(question, limit);

  if (searchResults.length === 0) {
    return NextResponse.json({
      answer: "I couldn't find any relevant information in the transcripts for that question. Try rephrasing or asking about a different topic.",
      sources: [],
      query: question,
    });
  }

  const contextParts = searchResults.map((result, i) => {
    const section = result.text.slice(0, 2000);
    return `[Source ${i + 1}] ${result.title} (${result.show})\n${section}`;
  });

  const context = contextParts.join("\n\n---\n\n");

  const prompt = `You are an AI research assistant helping users understand Ray Peat's views on health and biology.

Based ONLY on the transcript excerpts below, synthesize a comprehensive answer to the user's question.

GUIDELINES:
- Be direct and factual - state what Ray Peat believes and why
- Explain the underlying mechanisms when mentioned
- Reference specific shows/episodes when citing claims
- If the transcripts don't fully answer the question, say so
- Keep the response focused and well-organized (2-4 paragraphs)
- Do not make up information not present in the sources

TRANSCRIPT EXCERPTS:
${context}

USER QUESTION: ${question}

ANSWER:`;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent(prompt);
  const answer = result.response.text();

  const sources: RAGSource[] = searchResults.slice(0, 8).map((r) => ({
    text: r.text.slice(0, 500),
    section_header: "Transcript excerpt",
    section_anchor: "",
    episode_title: r.title,
    episode_id: r.slug,
    show: r.show,
    date_published: r.date || null,
    audio_url: null,
    score: r.score,
  }));

  return NextResponse.json({
    answer: answer + "\n\n*Note: Using limited transcript search. Full RAG backend unavailable.*",
    sources,
    query: question,
  });
}
