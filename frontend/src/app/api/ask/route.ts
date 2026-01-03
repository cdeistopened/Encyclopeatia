import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

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

export async function POST(request: NextRequest) {
  try {
    const { question, limit = 12, show } = await request.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Question is required" },
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
from inference import RayPeatRAG

rag = RayPeatRAG()
response = rag.ask(
    question=${JSON.stringify(question)},
    limit=${limit},
    show=${show ? JSON.stringify(show) : "None"}
)

def filepath_to_slug(filepath):
    """Convert filepath to frontend slug format."""
    import os
    parts = filepath.split(os.sep)
    for i, part in enumerate(parts):
        if part in ('polished', 'raw') and i > 0:
            filename = os.path.splitext(parts[-1])[0]
            return f"{parts[i-1]}/{part}/{filename}"
    return os.path.splitext(os.path.basename(filepath))[0]

# Convert to JSON-serializable format
result = {
    "answer": response.answer,
    "query": response.query,
    "sources": [
        {
            "text": s.text[:500] + "..." if len(s.text) > 500 else s.text,
            "section_header": s.section_header,
            "section_anchor": s.section_anchor,
            "episode_title": s.episode_title,
            "episode_id": filepath_to_slug(s.metadata.get("filepath", "")) if s.metadata.get("filepath") else s.episode_id,
            "show": s.show,
            "date_published": s.date_published,
            "audio_url": s.audio_url,
            "score": s.score
        }
        for s in response.sources
    ]
}
print(json.dumps(result))
`;

    // Execute Python script
    const result = await new Promise<RAGResponse>((resolve, reject) => {
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
          reject(new Error("Failed to parse RAG response"));
        }
      });

      pythonProcess.on("error", (err) => {
        reject(err);
      });
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("RAG API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
