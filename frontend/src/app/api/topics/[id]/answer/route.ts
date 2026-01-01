import { NextRequest, NextResponse } from "next/server";

// Backend API URL - defaults to localhost for development
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

interface TopicAnswerRequest {
  custom_question?: string;
  include_quotes?: boolean;
  max_length?: number;
}

interface TopicAnswerResponse {
  entity_name: string;
  verdict: string;
  one_liner: string;
  full_answer: string;
  key_quotes: string[];
  source_episodes: string[];
  source_sheet_tokens: number;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const entityId = parseInt(id);

    if (isNaN(entityId)) {
      return NextResponse.json({ error: "Invalid entity ID" }, { status: 400 });
    }

    // Parse request body
    const body: TopicAnswerRequest = await request.json().catch(() => ({}));

    // Call the FastAPI backend
    const response = await fetch(`${BACKEND_URL}/topics/${entityId}/answer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        entity_id: entityId,
        custom_question: body.custom_question,
        include_quotes: body.include_quotes ?? true,
        max_length: body.max_length ?? 2000,
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

    const result: TopicAnswerResponse = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Answer API error:", error);

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
