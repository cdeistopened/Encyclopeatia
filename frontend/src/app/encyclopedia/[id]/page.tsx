"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

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

interface GeneratedAnswer {
  entity_name: string;
  verdict: string;
  one_liner: string;
  full_answer: string;
  key_quotes: string[];
  source_episodes: string[];
}

// Determine verdict based on entity patterns
function getVerdict(entity: EntityDetail): { verdict: "YES" | "NO" | "CONTEXT"; label: string; color: "yes" | "no" | "context" } {
  const proMetabolic = [
    "thyroid", "progesterone", "pregnenolone", "dhea", "carbon dioxide", "co2",
    "aspirin", "vitamin e", "vitamin d", "vitamin a", "vitamin k", "calcium",
    "magnesium", "sodium", "salt", "sugar", "sucrose", "fructose", "glucose",
    "orange juice", "milk", "coconut oil", "saturated fat", "gelatin", "glycine",
    "coffee", "caffeine", "red light", "carrot", "cascara", "niacinamide"
  ];

  const antiMetabolic = [
    "pufa", "polyunsaturated", "fish oil", "omega-3", "omega-6", "seed oil",
    "estrogen", "estradiol", "serotonin", "cortisol", "prolactin", "tryptophan",
    "iron", "endotoxin", "lactic acid", "nitric oxide", "histamine", "fluoride",
    "carotene", "melatonin", "ssri"
  ];

  const nameLower = entity.name.toLowerCase();

  if (proMetabolic.some(term => nameLower.includes(term))) {
    return { verdict: "YES", label: "Recommended", color: "yes" };
  }
  if (antiMetabolic.some(term => nameLower.includes(term))) {
    return { verdict: "NO", label: "Avoid", color: "no" };
  }
  return { verdict: "CONTEXT", label: "Context Dependent", color: "context" };
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: string }> = {
  SUBSTANCE: { label: "Substance", icon: "science" },
  CONDITION: { label: "Condition", icon: "healing" },
  CONCEPT: { label: "Concept", icon: "psychology" },
  MECHANISM: { label: "Mechanism", icon: "settings" },
  TOPIC: { label: "Topic", icon: "lightbulb" },
  PERSON: { label: "Person", icon: "person" },
};

export default function EncyclopediaEntry() {
  const params = useParams();
  const id = params?.id as string;

  const [entity, setEntity] = useState<EntityDetail | null>(null);
  const [answer, setAnswer] = useState<GeneratedAnswer | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchEntity = async () => {
      try {
        const res = await fetch(`/api/topics/${id}`);
        if (!res.ok) throw new Error("Entity not found");
        const data = await res.json();
        setEntity(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };

    fetchEntity();
  }, [id]);

  const generateAnswer = async () => {
    if (!entity) return;
    setGenerating(true);
    try {
      const res = await fetch(`/api/topics/${id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ max_length: 2000 }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to generate");
      }
      const data = await res.json();
      setAnswer(data);
    } catch (err) {
      console.error("Generation error:", err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-ink animate-pulse">
            auto_stories
          </span>
          <p className="mt-4 font-mono text-sm text-ink-muted">Loading entry...</p>
        </div>
      </div>
    );
  }

  if (error || !entity) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-accent">error</span>
          <p className="mt-4 text-ink">{error || "Entry not found"}</p>
          <Link href="/encyclopedia" className="mt-4 inline-block text-accent-blue hover:underline">
            ← Back to Encyclopedia
          </Link>
        </div>
      </div>
    );
  }

  const config = CATEGORY_CONFIG[entity.entity_type] || { label: entity.entity_type, icon: "category" };
  const verdictInfo = getVerdict(entity);

  return (
    <div className="min-h-screen text-ink font-body antialiased">
      {/* Header */}
      <header className="w-full border-b-2 border-ink bg-paper sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="material-symbols-outlined text-3xl text-primary group-hover:rotate-12 transition-transform duration-300">
              auto_stories
            </span>
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink">EncycloPEATia</h1>
          </Link>
          <nav className="hidden md:flex gap-8 items-center">
            <Link href="/podcasts" className="font-mono text-sm font-medium hover:underline decoration-2 underline-offset-4">
              ARCHIVE
            </Link>
            <Link href="/encyclopedia" className="font-mono text-sm font-medium hover:underline decoration-2 underline-offset-4">
              ENCYCLOPEDIA
            </Link>
            <Link href="/ask" className="btn-primary">
              ASK PEAT
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-bold font-mono text-ink-muted uppercase tracking-wider mb-8">
          <Link href="/" className="hover:text-primary hover:underline decoration-2 underline-offset-4">Archive</Link>
          <span className="material-symbols-outlined text-xs opacity-50">chevron_right</span>
          <Link href="/encyclopedia" className="hover:text-primary hover:underline decoration-2 underline-offset-4">{config.label}s</Link>
          <span className="material-symbols-outlined text-xs opacity-50">chevron_right</span>
          <span className="bg-primary/20 text-ink px-2 py-0.5 rounded-sm border border-primary">{entity.name}</span>
        </nav>

        {/* Main Card */}
        <section className="relative w-full group mb-12">
          {/* Shadow layers */}
          <div className="absolute top-3 left-3 w-full h-full bg-gradient-to-br from-primary to-accent rounded-sm -z-20 border-2 border-ink opacity-90"></div>
          <div className="absolute top-1.5 left-1.5 w-full h-full bg-white border-2 border-ink rounded-sm -z-10"></div>

          {/* Main card */}
          <div className="relative bg-white border-2 border-ink rounded-sm overflow-hidden flex flex-col md:flex-row">
            {/* Left content */}
            <div className="flex-1 p-8 md:p-10 flex flex-col justify-between relative">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/60 border border-ink/20 px-2 py-0.5 bg-white">
                    {config.label} File
                  </span>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary-dark">
                    #{entity.id.toString().padStart(4, '0')} // BIO-ENERGETIC
                  </span>
                </div>

                {/* Title with shadow effect */}
                <div className="relative">
                  <h1 aria-hidden="true" className="absolute top-1 left-1 text-5xl md:text-6xl font-black uppercase leading-[0.85] tracking-tight text-pink-200/40 select-none pointer-events-none font-serif">
                    {entity.name}
                  </h1>
                  <h1 className="relative text-5xl md:text-6xl font-black uppercase leading-[0.85] tracking-tight text-ink font-serif">
                    {entity.name}
                    {entity.aliases && entity.aliases.length > 0 && (
                      <span className="block text-xl md:text-2xl font-bold tracking-normal normal-case text-ink-muted mt-2">
                        ({entity.aliases[0]})
                      </span>
                    )}
                  </h1>
                </div>

                {entity.description && (
                  <p className="text-lg md:text-xl text-ink/90 font-medium leading-relaxed max-w-xl border-l-[3px] border-pink-400 pl-5 py-1">
                    {entity.description}
                  </p>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-dashed border-gray-300 flex flex-wrap gap-6 text-xs font-mono text-gray-500 uppercase tracking-wider">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">format_quote</span>
                  {entity.mention_count.toLocaleString()} Citations
                </span>
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">podcasts</span>
                  {entity.episodes.length} Episodes
                </span>
              </div>
            </div>

            {/* Right verdict panel */}
            <div className="relative w-full md:w-[280px] bg-gray-50 border-t-2 md:border-t-0 md:border-l-2 border-ink flex flex-col items-center justify-center p-8 overflow-hidden">
              {/* Halftone pattern */}
              <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: 'radial-gradient(circle, #1a1a1a 1px, transparent 1px)',
                backgroundSize: '8px 8px'
              }}></div>

              {/* Tilted verdict card */}
              <div className="relative transform md:rotate-2 hover:rotate-0 transition-transform duration-300 ease-out z-20">
                <div className="absolute inset-0 translate-x-2 translate-y-2 bg-ink/20 rounded-sm"></div>
                <div className="relative bg-white border-2 border-ink p-6 w-[200px] flex flex-col items-center shadow-sm">
                  {/* Pin hole */}
                  <div className="w-3 h-3 rounded-full bg-gray-50 border border-ink/20 absolute -top-1.5 left-1/2 -translate-x-1/2"></div>

                  <div className="text-[10px] font-black tracking-[0.3em] uppercase text-ink/50 mb-3 border-b border-gray-200 pb-2 w-full text-center">
                    Official Verdict
                  </div>

                  <div className="flex items-center justify-center mb-1">
                    <span className={`material-symbols-outlined text-6xl font-bold ${
                      verdictInfo.color === 'yes' ? 'text-verdict-yes' :
                      verdictInfo.color === 'no' ? 'text-verdict-no' : 'text-verdict-context'
                    }`}>
                      {verdictInfo.verdict === 'YES' ? 'check_circle' :
                       verdictInfo.verdict === 'NO' ? 'cancel' : 'help'}
                    </span>
                  </div>

                  <div className="text-5xl font-black uppercase tracking-tighter text-ink leading-none mb-2 font-serif">
                    {verdictInfo.verdict}
                  </div>

                  <div className={`w-full py-1 px-2 text-center rounded-sm ${
                    verdictInfo.color === 'yes' ? 'verdict-yes' :
                    verdictInfo.color === 'no' ? 'verdict-no' : 'verdict-context'
                  }`}>
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      {verdictInfo.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Main content */}
          <div className="md:col-span-2 space-y-8">
            {/* Generate button or AI answer */}
            {!answer ? (
              <div className="bg-white border-2 border-ink p-6 shadow-hard-sm">
                <h3 className="text-xl font-bold font-serif mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">smart_toy</span>
                  AI Analysis
                </h3>
                <p className="text-ink-muted mb-4">
                  Generate a detailed analysis of Ray Peat's views on {entity.name} based on {entity.mention_count} source citations.
                </p>
                <button
                  onClick={generateAnswer}
                  disabled={generating}
                  className={`flex items-center gap-2 px-6 py-3 font-mono text-sm font-bold uppercase tracking-wide border-2 border-ink transition-all ${
                    generating
                      ? 'bg-gray-100 text-ink-muted cursor-wait'
                      : 'bg-accent text-white hover:shadow-hard active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">
                    {generating ? 'hourglass_empty' : 'auto_awesome'}
                  </span>
                  {generating ? 'Analyzing Sources...' : 'Generate Analysis'}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white border-2 border-ink p-6 shadow-hard-sm">
                  <h3 className="text-2xl font-bold font-serif mb-2 border-b-2 border-ink pb-2 inline-block">
                    Summary
                  </h3>
                  <p className="text-lg text-ink leading-relaxed mt-4 italic font-serif">
                    "{answer.one_liner}"
                  </p>
                </div>

                <div className="bg-white border-2 border-ink p-6 shadow-hard-sm">
                  <h3 className="text-2xl font-bold font-serif mb-4 border-b-2 border-amber-300 pb-2 inline-block">
                    The Metabolic Logic
                  </h3>
                  <div className="prose prose-lg max-w-none text-ink leading-relaxed whitespace-pre-wrap">
                    {answer.full_answer}
                  </div>
                </div>

                {answer.key_quotes.length > 0 && (
                  <div className="bg-white border-2 border-ink p-6 shadow-hard-sm">
                    <h3 className="text-2xl font-bold font-serif mb-4 border-b-2 border-primary pb-2 inline-block">
                      Ray Peat's Words
                    </h3>
                    <div className="space-y-4 mt-4">
                      {answer.key_quotes.map((quote, i) => (
                        <blockquote
                          key={i}
                          className="border-l-4 border-primary pl-4 py-2 text-ink/80 italic"
                        >
                          {quote}
                        </blockquote>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Related entries */}
            {entity.related_entities.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-xs font-bold uppercase tracking-widest text-ink-muted mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">hub</span>
                  Related Entries
                </h4>
                <div className="grid gap-3">
                  {entity.related_entities.slice(0, 8).map((related) => (
                    <Link
                      key={related.id}
                      href={`/encyclopedia/${related.id}`}
                      className="group flex items-center gap-4 p-4 bg-white border border-gray-200 hover:border-ink transition-colors rounded-sm"
                    >
                      <div className="size-10 bg-gray-100 text-ink-muted flex items-center justify-center rounded-full shrink-0 group-hover:bg-primary/10 group-hover:text-primary-dark transition-colors">
                        <span className="material-symbols-outlined">
                          {CATEGORY_CONFIG[related.entity_type]?.icon || 'category'}
                        </span>
                      </div>
                      <div className="flex-grow">
                        <p className="font-bold text-ink group-hover:text-primary-dark transition-colors">
                          {related.name}
                        </p>
                        <p className="text-xs font-mono text-ink-muted mt-0.5">
                          {related.cooccurrence_count} co-occurrences
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-gray-300 group-hover:text-primary transition-colors">
                        arrow_forward
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Properties */}
            <div className="bg-white p-6 rounded-sm border-2 border-ink/10 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-widest text-ink-muted mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">info</span>
                Properties
              </h4>
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-mono text-ink-muted uppercase">Type</span>
                  <p className="font-bold">{config.label}</p>
                </div>
                <div>
                  <span className="text-xs font-mono text-ink-muted uppercase">Citations</span>
                  <p className="font-bold">{entity.mention_count.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-xs font-mono text-ink-muted uppercase">Episodes</span>
                  <p className="font-bold">{entity.episodes.length}</p>
                </div>
                {entity.aliases && entity.aliases.length > 0 && (
                  <div>
                    <span className="text-xs font-mono text-ink-muted uppercase">Also Known As</span>
                    <p className="font-medium text-sm">{entity.aliases.join(', ')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Source episodes */}
            <div className="bg-white p-6 rounded-sm border-2 border-ink/10 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-widest text-ink-muted mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">podcasts</span>
                Source Episodes
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {entity.episodes.slice(0, 10).map((episodeId, i) => {
                  const parts = episodeId.split("/");
                  const showName = parts[0]?.replace(/-/g, " ") || "Unknown";
                  return (
                    <div key={i} className="text-sm border-b border-gray-100 pb-2 last:border-0">
                      <span className="font-medium capitalize">{showName}</span>
                    </div>
                  );
                })}
                {entity.episodes.length > 10 && (
                  <p className="text-xs text-ink-muted pt-2">
                    + {entity.episodes.length - 10} more episodes
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>

    </div>
  );
}
