import { NextRequest, NextResponse } from "next/server";

// Backend API URL - defaults to localhost for development
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

interface Entity {
  id: number;
  name: string;
  description: string | null;
  mention_count: number;
  episode_count: number;
}

interface TopicsResponse {
  entities_by_type: Record<string, Entity[]>;
  stats: {
    total_entities: number;
    total_mentions: number;
    total_cooccurrences: number;
    processed_sections: number;
    entity_types: Record<string, number>;
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const entityType = searchParams.get("type");
    const search = searchParams.get("search");
    const limit = searchParams.get("limit") || "100";

    // Build query params for backend
    const params = new URLSearchParams();
    if (entityType) params.set("entity_type", entityType);
    if (search) params.set("search", search);
    params.set("limit", limit);

    // Call the FastAPI backend
    const response = await fetch(`${BACKEND_URL}/topics?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Backend error:", errorData);
      return NextResponse.json(
        {
          error: errorData.detail || `Backend error: ${response.status}`,
          entities_by_type: {},
          stats: {},
        },
        { status: response.status }
      );
    }

    const result: TopicsResponse = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Topics API error:", error);

    // Check if it's a connection error to the backend
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        {
          error: "Backend service unavailable. Please try again later.",
          entities_by_type: {},
          stats: {},
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
        entities_by_type: {},
        stats: {},
      },
      { status: 500 }
    );
  }
}
