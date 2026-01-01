import { NextRequest, NextResponse } from "next/server";

// Backend API URL - defaults to localhost for development
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

interface EntityDetail {
  id: number;
  name: string;
  entity_type: string;
  description: string | null;
  aliases: string[] | null;
  mention_count: number;
  episodes: string[];
  related_entities: Array<{
    id: number;
    name: string;
    entity_type: string;
    cooccurrence_count: number;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const entityId = parseInt(id);

    if (isNaN(entityId)) {
      return NextResponse.json({ error: "Invalid entity ID" }, { status: 400 });
    }

    // Call the FastAPI backend
    const response = await fetch(`${BACKEND_URL}/topics/${entityId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Backend error:", errorData);

      if (response.status === 404) {
        return NextResponse.json(
          { error: "Entity not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: errorData.detail || `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    const result: EntityDetail = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Entity API error:", error);

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
