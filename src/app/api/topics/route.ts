import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * GET /api/topics
 *
 * Entity explorer over the corpus knowledge graph. Reads the pre-built graph
 * JSON (public/topics-data/entity-graph.json, copied from brain/graph/ by the
 * corpus pipeline) instead of spawning the old Python venv — which never
 * existed in the Docker image and 500'd every request.
 */

interface GraphNode {
  id: string;
  title?: string;
  category?: string;
  mention_count?: number;
  has_article?: boolean;
  description?: string | null;
}

interface Entity {
  id: number;
  name: string;
  entity_type: string;
  description: string | null;
  mention_count: number;
  episode_count: number;
}

const CATEGORY_TO_TYPE: Record<string, string> = {
  substances: "SUBSTANCE",
  concepts: "CONCEPT",
  conditions: "CONDITION",
  mechanisms: "MECHANISM",
  people: "PERSON",
  protocols: "TOPIC",
  articles: "TOPIC",
  practices: "TOPIC",
};

type GraphFile = { nodes?: Record<string, GraphNode>; edges?: unknown[]; metadata?: Record<string, unknown> };

let cached: {
  entitiesByType: Record<string, Entity[]>;
  stats: {
    total_entities: number;
    total_mentions: number;
    total_cooccurrences: number;
    processed_sections: number;
    entity_types: Record<string, number>;
  };
} | null = null;

function load() {
  if (cached) return cached;
  const file = path.join(process.cwd(), "public", "topics-data", "entity-graph.json");
  let graph: GraphFile;
  try {
    graph = JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    console.error("[topics] entity graph missing — copy brain/graph/entity-graph.json to public/topics-data/");
    graph = {};
  }

  const entitiesByType: Record<string, Entity[]> = {};
  const entityTypes: Record<string, number> = {};
  let totalMentions = 0;
  let nextId = 1;

  for (const node of Object.values(graph.nodes || {})) {
    const type = CATEGORY_TO_TYPE[node.category || ""] || "TOPIC";
    totalMentions += node.mention_count || 0;
    entityTypes[type] = (entityTypes[type] || 0) + 1;
    const e: Entity = {
      id: nextId++,
      name: node.title || node.id,
      entity_type: type,
      description: node.description ?? null,
      mention_count: node.mention_count || 0,
      episode_count: 0,
    };
    (entitiesByType[type] ||= []).push(e);
  }
  for (const list of Object.values(entitiesByType)) list.sort((a, b) => b.mention_count - a.mention_count);

  cached = {
    entitiesByType,
    stats: {
      total_entities: Object.keys(graph.nodes || {}).length,
      total_mentions: totalMentions,
      total_cooccurrences: Array.isArray(graph.edges) ? graph.edges.length : 0,
      processed_sections: Number((graph.metadata as Record<string, unknown> | undefined)?.articles_scanned) || 0,
      entity_types: entityTypes,
    },
  };
  return cached;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const entityType = searchParams.get("type");
    const search = searchParams.get("search")?.toLowerCase();
    const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10) || 100, 500);
    const data = load();

    let types = entityType ? [entityType] : Object.keys(data.entitiesByType);
    if (entityType && !data.entitiesByType[entityType]) types = [];

    let matched: Entity[] = [];
    for (const t of types) {
      for (const e of data.entitiesByType[t] || []) {
        if (!search || e.name.toLowerCase().includes(search)) matched.push(e);
        if (matched.length >= limit * types.length) break;
      }
    }
    matched = matched.sort((a, b) => b.mention_count - a.mention_count);

    return NextResponse.json({
      ...data,
      entities: matched.slice(0, limit),
      count: matched.length,
    });
  } catch (error) {
    console.error("[topics] error:", error);
    return NextResponse.json({ error: "Failed to load topics" }, { status: 500 });
  }
}
