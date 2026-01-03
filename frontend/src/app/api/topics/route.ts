import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

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
    const limit = parseInt(searchParams.get("limit") || "100");

    // Path to the RAG system
    const ragDir = path.resolve(process.cwd(), "../backend/rag");
    const venvPython = path.join(ragDir, "venv/bin/python");

    // Build the Python script to run
    const pythonScript = `
import sys
import json
sys.path.insert(0, "${ragDir}")

try:
    from knowledge_graph import KnowledgeGraph
    graph = KnowledgeGraph()

    ${search ? `
    # Search mode
    entities = graph.search_entities(
        query=${JSON.stringify(search)},
        entity_type=${entityType ? JSON.stringify(entityType) : "None"},
        limit=${limit}
    )

    result = {
        "entities": [
            {
                "id": e.id,
                "name": e.name,
                "entity_type": e.entity_type,
                "description": e.description,
                "mention_count": e.mention_count,
                "episode_count": len(graph.get_episodes_for_entity(e.id))
            }
            for e in entities
        ],
        "stats": graph.get_stats()
    }
    ` : `
    # Export all data for frontend
    result = graph.export_for_frontend()
    `}

    print(json.dumps(result))
except ImportError as e:
    print(json.dumps({"error": f"Knowledge graph not available: {e}", "entities_by_type": {}, "stats": {}}))
except Exception as e:
    print(json.dumps({"error": str(e), "entities_by_type": {}, "stats": {}}))
`;

    // Execute Python script
    const result = await new Promise<TopicsResponse>((resolve, reject) => {
      const pythonProcess = spawn(venvPython, ["-c", pythonScript], {
        cwd: ragDir,
        env: { ...process.env },
      });

      let stdout = "";
      let stderr = "";

      pythonProcess.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      pythonProcess.on("close", (code) => {
        if (code !== 0) {
          console.error("Python stderr:", stderr);
          reject(new Error(`Python process exited with code ${code}: ${stderr}`));
          return;
        }

        try {
          // Find the JSON in stdout (skip any logging output)
          const lines = stdout.trim().split("\n");
          const jsonLine = lines[lines.length - 1];
          const parsed = JSON.parse(jsonLine);
          resolve(parsed);
        } catch (e) {
          console.error("Failed to parse Python output:", stdout);
          reject(new Error("Failed to parse topics response"));
        }
      });

      pythonProcess.on("error", (err) => {
        reject(err);
      });
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Topics API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
        entities_by_type: {},
        stats: {}
      },
      { status: 500 }
    );
  }
}
