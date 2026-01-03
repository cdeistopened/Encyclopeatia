import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

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
  { params }: { params: { id: string } }
) {
  try {
    const entityId = parseInt(params.id);

    if (isNaN(entityId)) {
      return NextResponse.json(
        { error: "Invalid entity ID" },
        { status: 400 }
      );
    }

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

    # Get entity by ID
    import sqlite3
    with sqlite3.connect(graph.db_path) as conn:
        cursor = conn.execute(
            """SELECT id, name, normalized_name, entity_type, description, aliases, mention_count
               FROM entities WHERE id = ?""",
            (${entityId},)
        )
        row = cursor.fetchone()

        if not row:
            print(json.dumps({"error": "Entity not found"}))
        else:
            entity_id = row[0]

            # Get episodes
            episodes = graph.get_episodes_for_entity(entity_id)

            # Get related entities
            related = graph.get_related_entities(entity_id, limit=20)

            result = {
                "id": row[0],
                "name": row[1],
                "entity_type": row[3],
                "description": row[4],
                "aliases": json.loads(row[5]) if row[5] else None,
                "mention_count": row[6],
                "episodes": episodes,
                "related_entities": [
                    {
                        "id": e.id,
                        "name": e.name,
                        "entity_type": e.entity_type,
                        "cooccurrence_count": count
                    }
                    for e, count in related
                ]
            }
            print(json.dumps(result))

except ImportError as e:
    print(json.dumps({"error": f"Knowledge graph not available: {e}"}))
except Exception as e:
    print(json.dumps({"error": str(e)}))
`;

    // Execute Python script
    const result = await new Promise<EntityDetail>((resolve, reject) => {
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
          const lines = stdout.trim().split("\n");
          const jsonLine = lines[lines.length - 1];
          const parsed = JSON.parse(jsonLine);
          resolve(parsed);
        } catch (e) {
          console.error("Failed to parse Python output:", stdout);
          reject(new Error("Failed to parse entity response"));
        }
      });

      pythonProcess.on("error", (err) => {
        reject(err);
      });
    });

    if ("error" in result) {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Entity API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
