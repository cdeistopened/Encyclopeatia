import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { searchTranscripts, ServerSearchResult } from "@/lib/serverSearch";

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

function extractRelevantSection(fullText: string, query: string, maxChars = 2000): string {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const textLower = fullText.toLowerCase();
  
  let bestIndex = 0;
  for (const word of queryWords) {
    const idx = textLower.indexOf(word);
    if (idx !== -1) {
      bestIndex = idx;
      break;
    }
  }
  
  const start = Math.max(0, bestIndex - 200);
  const end = Math.min(fullText.length, start + maxChars);
  
  let section = fullText.slice(start, end);
  if (start > 0) section = "..." + section;
  if (end < fullText.length) section = section + "...";
  
  return section;
}

export async function POST(request: NextRequest) {
  try {
    const { question, limit = 15 } = await request.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

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
      const section = extractRelevantSection(result.text, question);
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
      text: extractRelevantSection(r.text, question, 500),
      section_header: "Transcript excerpt",
      section_anchor: "",
      episode_title: r.title,
      episode_id: r.slug,
      show: r.show,
      date_published: r.date || null,
      audio_url: null,
      score: r.score,
    }));

    const response: RAGResponse = {
      answer,
      sources,
      query: question,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("RAG API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
