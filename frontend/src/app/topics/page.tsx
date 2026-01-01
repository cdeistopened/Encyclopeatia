"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Entity {
  id: number;
  name: string;
  entity_type: string;
  description: string | null;
  mention_count: number;
  episode_count: number;
}

interface TopicsData {
  entities_by_type: Record<string, Entity[]>;
  stats: {
    total_entities: number;
    total_mentions: number;
    total_cooccurrences: number;
    processed_sections: number;
    entity_types: Record<string, number>;
  };
  error?: string;
}

const ENTITY_TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  TOPIC: { label: "Topics", icon: "💡", color: "#ffff00" },
  SUBSTANCE: { label: "Substances", icon: "🧪", color: "#00ff00" },
  CONDITION: { label: "Conditions", icon: "🏥", color: "#ff6666" },
  CONCEPT: { label: "Concepts", icon: "📚", color: "#66ccff" },
  PERSON: { label: "People", icon: "👤", color: "#ffcc66" },
  MECHANISM: { label: "Mechanisms", icon: "⚙️", color: "#cc99ff" },
};

const ENTITY_TYPE_ORDER = ["TOPIC", "SUBSTANCE", "CONDITION", "CONCEPT", "MECHANISM", "PERSON"];

function Win95Button({ children, onClick, disabled, primary, active }: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  primary?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-3 py-1 text-sm font-bold
        ${primary || active ? "bg-[#000080] text-white" : "bg-[#c0c0c0] text-black"}
        ${active ? "border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff]" : "border-t-[#ffffff] border-l-[#ffffff] border-b-[#808080] border-r-[#808080]"}
        border-t-2 border-l-2 border-b-2 border-r-2
        disabled:opacity-50 disabled:cursor-not-allowed
        font-['MS_Sans_Serif',_'Segoe_UI',_sans-serif]
      `}
    >
      {children}
    </button>
  );
}

function Win95Window({ title, children }: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#c0c0c0] border-t-2 border-l-2 border-[#ffffff] border-b-2 border-r-2 border-b-[#808080] border-r-[#808080] shadow-lg">
      {/* Title Bar */}
      <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] px-2 py-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center">
            <svg viewBox="0 0 16 16" className="w-4 h-4">
              <rect x="2" y="2" width="12" height="12" fill="#ffff00" stroke="#000" strokeWidth="1"/>
              <circle cx="8" cy="8" r="3" fill="#ff0000"/>
            </svg>
          </div>
          <span className="text-white text-sm font-bold font-['MS_Sans_Serif',_'Segoe_UI',_sans-serif]">
            {title}
          </span>
        </div>
        <div className="flex gap-1">
          <button className="w-4 h-4 bg-[#c0c0c0] border border-[#ffffff] border-b-[#808080] border-r-[#808080] text-xs font-bold flex items-center justify-center">
            _
          </button>
          <button className="w-4 h-4 bg-[#c0c0c0] border border-[#ffffff] border-b-[#808080] border-r-[#808080] text-xs font-bold flex items-center justify-center">
            □
          </button>
          <button className="w-4 h-4 bg-[#c0c0c0] border border-[#ffffff] border-b-[#808080] border-r-[#808080] text-xs font-bold flex items-center justify-center">
            ×
          </button>
        </div>
      </div>
      {/* Content */}
      <div className="p-1">
        {children}
      </div>
    </div>
  );
}

function EntityTag({ entity, onClick }: { entity: Entity; onClick?: () => void }) {
  const typeInfo = ENTITY_TYPE_LABELS[entity.entity_type] || { label: entity.entity_type, icon: "📌", color: "#c0c0c0" };

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-[#c0c0c0]
                 border-t-2 border-l-2 border-[#ffffff] border-b-2 border-r-2 border-b-[#808080] border-r-[#808080]
                 hover:bg-[#000080] hover:text-white group transition-colors"
      style={{ borderBottomColor: typeInfo.color }}
    >
      <span className="text-xs">{typeInfo.icon}</span>
      <span className="font-['MS_Sans_Serif',_'Segoe_UI',_sans-serif]">{entity.name}</span>
      <span className="text-xs opacity-70 group-hover:opacity-100">({entity.mention_count})</span>
    </button>
  );
}

function LoadingAnimation() {
  return (
    <div className="flex items-center gap-3 p-8">
      <div className="animate-spin">
        <svg viewBox="0 0 24 24" className="w-8 h-8">
          <circle cx="12" cy="12" r="10" fill="none" stroke="#000080" strokeWidth="2" strokeDasharray="20 40"/>
        </svg>
      </div>
      <span className="text-sm font-['MS_Sans_Serif',_'Segoe_UI',_sans-serif]">
        Loading knowledge graph...
      </span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="p-8 text-center">
      <div className="text-4xl mb-4">🔬</div>
      <h3 className="text-lg font-bold mb-2">Knowledge Graph Empty</h3>
      <p className="text-sm text-[#808080] max-w-md mx-auto">
        The knowledge graph hasn&apos;t been populated yet. Run the entity extraction
        script to extract topics, substances, and concepts from the transcripts.
      </p>
      <div className="mt-4 p-3 bg-[#000000] text-[#00ff00] font-mono text-xs text-left inline-block">
        cd backend/rag<br/>
        python build_knowledge_graph.py --limit 10
      </div>
    </div>
  );
}

export default function TopicsPage() {
  const [data, setData] = useState<TopicsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);

  useEffect(() => {
    async function fetchTopics() {
      try {
        const response = await fetch("/api/topics");
        if (!response.ok) {
          throw new Error("Failed to fetch topics");
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    }

    fetchTopics();
  }, []);

  const filteredEntities = (): Entity[] => {
    if (!data?.entities_by_type) return [];

    let entities: Entity[] = [];

    if (selectedType) {
      entities = data.entities_by_type[selectedType] || [];
    } else {
      // Combine all types
      for (const type of ENTITY_TYPE_ORDER) {
        if (data.entities_by_type[type]) {
          entities = [...entities, ...data.entities_by_type[type]];
        }
      }
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      entities = entities.filter(e =>
        e.name.toLowerCase().includes(query) ||
        (e.description && e.description.toLowerCase().includes(query))
      );
    }

    // Sort by mention count
    return entities.sort((a, b) => b.mention_count - a.mention_count);
  };

  const totalEntities = data?.stats?.total_entities || 0;
  const isEmpty = totalEntities === 0 && !isLoading;

  return (
    <main className="min-h-screen bg-[#008080] p-4 md:p-8 font-['MS_Sans_Serif',_'Segoe_UI',_sans-serif]">
      <div className="max-w-6xl mx-auto">
        {/* Main Window */}
        <Win95Window title="Knowledge Graph Explorer - Ray Peat Topics">
          {/* Menu Bar */}
          <div className="bg-[#c0c0c0] border-b border-[#808080] px-2 py-1 flex gap-4 text-sm">
            <span className="hover:bg-[#000080] hover:text-white px-1 cursor-pointer">File</span>
            <span className="hover:bg-[#000080] hover:text-white px-1 cursor-pointer">Edit</span>
            <span className="hover:bg-[#000080] hover:text-white px-1 cursor-pointer">View</span>
            <span className="hover:bg-[#000080] hover:text-white px-1 cursor-pointer">Help</span>
          </div>

          {/* Toolbar */}
          <div className="bg-[#c0c0c0] border-b border-[#808080] px-2 py-2 flex flex-wrap gap-2 items-center">
            <Win95Button
              onClick={() => setSelectedType(null)}
              active={selectedType === null}
            >
              All
            </Win95Button>
            {ENTITY_TYPE_ORDER.map(type => {
              const info = ENTITY_TYPE_LABELS[type];
              const count = data?.entities_by_type?.[type]?.length || 0;
              if (count === 0 && !isLoading) return null;
              return (
                <Win95Button
                  key={type}
                  onClick={() => setSelectedType(selectedType === type ? null : type)}
                  active={selectedType === type}
                >
                  {info.icon} {info.label} ({count})
                </Win95Button>
              );
            })}

            <div className="flex-1" />

            {/* Search */}
            <div className="flex items-center gap-2">
              <span className="text-sm">Search:</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find topic..."
                className="px-2 py-1 text-sm border-2 border-[#808080] border-t-[#404040] w-48"
              />
            </div>
          </div>

          {/* Content */}
          <div className="bg-white min-h-[500px] flex">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <LoadingAnimation />
              </div>
            ) : error ? (
              <div className="flex-1 p-8">
                <div className="p-4 bg-[#ffcccc] border-2 border-[#ff0000]">
                  <strong>Error:</strong> {error}
                </div>
              </div>
            ) : isEmpty ? (
              <div className="flex-1">
                <EmptyState />
              </div>
            ) : (
              <>
                {/* Entity List */}
                <div className="flex-1 p-4 overflow-y-auto" style={{ maxHeight: "600px" }}>
                  <div className="flex flex-wrap gap-2">
                    {filteredEntities().slice(0, 200).map(entity => (
                      <EntityTag
                        key={entity.id}
                        entity={entity}
                        onClick={() => setSelectedEntity(entity)}
                      />
                    ))}
                  </div>

                  {filteredEntities().length > 200 && (
                    <div className="mt-4 text-center text-sm text-[#808080]">
                      Showing 200 of {filteredEntities().length} results
                    </div>
                  )}

                  {filteredEntities().length === 0 && searchQuery && (
                    <div className="text-center text-[#808080] py-8">
                      No entities found matching &quot;{searchQuery}&quot;
                    </div>
                  )}
                </div>

                {/* Detail Panel */}
                {selectedEntity && (
                  <div className="w-80 border-l border-[#808080] bg-[#c0c0c0] p-3 overflow-y-auto" style={{ maxHeight: "600px" }}>
                    <div className="bg-white p-3 border-2 border-[#808080] border-t-[#404040]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">
                          {ENTITY_TYPE_LABELS[selectedEntity.entity_type]?.icon || "📌"}
                        </span>
                        <div>
                          <h3 className="font-bold">{selectedEntity.name}</h3>
                          <span className="text-xs text-[#808080]">
                            {ENTITY_TYPE_LABELS[selectedEntity.entity_type]?.label || selectedEntity.entity_type}
                          </span>
                        </div>
                      </div>

                      {selectedEntity.description && (
                        <p className="text-sm mb-3 text-[#404040]">
                          {selectedEntity.description}
                        </p>
                      )}

                      <div className="text-sm space-y-1 pt-2 border-t border-[#c0c0c0]">
                        <div className="flex justify-between">
                          <span>Mentions:</span>
                          <strong>{selectedEntity.mention_count}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Episodes:</span>
                          <strong>{selectedEntity.episode_count}</strong>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-[#c0c0c0]">
                        <Link
                          href={`/?search=${encodeURIComponent(selectedEntity.name)}`}
                          className="block text-center text-sm text-[#000080] underline hover:text-[#ff0000]"
                        >
                          🔍 Find episodes about {selectedEntity.name}
                        </Link>
                      </div>

                      <div className="mt-2">
                        <Link
                          href={`/ask?q=${encodeURIComponent(`What does Ray Peat say about ${selectedEntity.name}?`)}`}
                          className="block text-center text-sm text-[#000080] underline hover:text-[#ff0000]"
                        >
                          ✉️ Ask Peat about {selectedEntity.name}
                        </Link>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedEntity(null)}
                      className="mt-2 w-full text-sm text-[#808080] hover:text-black"
                    >
                      Close
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Status Bar */}
          <div className="bg-[#c0c0c0] border-t border-[#ffffff] px-2 py-1 text-xs flex justify-between">
            <span>
              {totalEntities} entities • {data?.stats?.total_mentions || 0} mentions
            </span>
            <span>
              {selectedType ? `Viewing: ${ENTITY_TYPE_LABELS[selectedType]?.label || selectedType}` : "All types"}
            </span>
          </div>
        </Win95Window>

        {/* Stats Window */}
        {data?.stats && data.stats.total_entities > 0 && (
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <Win95Window title="Graph Statistics">
              <div className="bg-white p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-[#c0c0c0] border-2 border-[#808080] border-t-[#404040]">
                    <div className="text-2xl font-bold">{data.stats.total_entities}</div>
                    <div className="text-xs">Total Entities</div>
                  </div>
                  <div className="p-3 bg-[#c0c0c0] border-2 border-[#808080] border-t-[#404040]">
                    <div className="text-2xl font-bold">{data.stats.total_mentions}</div>
                    <div className="text-xs">Total Mentions</div>
                  </div>
                  <div className="p-3 bg-[#c0c0c0] border-2 border-[#808080] border-t-[#404040]">
                    <div className="text-2xl font-bold">{data.stats.total_cooccurrences}</div>
                    <div className="text-xs">Co-occurrences</div>
                  </div>
                  <div className="p-3 bg-[#c0c0c0] border-2 border-[#808080] border-t-[#404040]">
                    <div className="text-2xl font-bold">{data.stats.processed_sections}</div>
                    <div className="text-xs">Sections Processed</div>
                  </div>
                </div>
              </div>
            </Win95Window>

            <Win95Window title="Entity Types">
              <div className="bg-white p-4">
                <div className="space-y-2">
                  {ENTITY_TYPE_ORDER.map(type => {
                    const count = data.stats.entity_types?.[type] || 0;
                    if (count === 0) return null;
                    const info = ENTITY_TYPE_LABELS[type];
                    const percentage = Math.round((count / data.stats.total_entities) * 100);
                    return (
                      <div key={type} className="flex items-center gap-2 text-sm">
                        <span className="w-6">{info.icon}</span>
                        <span className="w-24">{info.label}</span>
                        <div className="flex-1 h-4 bg-[#c0c0c0] border border-[#808080]">
                          <div
                            className="h-full"
                            style={{ width: `${percentage}%`, backgroundColor: info.color }}
                          />
                        </div>
                        <span className="w-12 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Win95Window>
          </div>
        )}

        {/* Info */}
        <div className="mt-4 text-center text-white/80 text-xs">
          <p>
            Knowledge graph extracted from Ray Peat podcast transcripts.
            <br />
            Entities represent topics, substances, conditions, and concepts discussed.
          </p>
        </div>
      </div>
    </main>
  );
}
