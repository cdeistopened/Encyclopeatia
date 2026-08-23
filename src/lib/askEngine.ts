import { searchCorpus, type CorpusHit } from "./corpusSearch";

/**
 * Ask Dr. Peat — agentic retrieval + synthesis over the full corpus.
 *
 * Loop: question -> LLM proposes diverse search queries -> BM25 search across
 * all 28k chunks -> (optional) one refinement round if coverage is thin ->
 * LLM synthesizes an answer IN PEAT'S VOICE grounded only in retrieved
 * passages, with numbered citations mapped back to sources.
 */

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = process.env.OPENROUTER_MODEL || "google/gemini-3.1-flash-lite";

export interface EngineSource {
  text: string;
  section_header: string;
  section_anchor: string;
  episode_title: string;
  episode_id: string;
  show: string;
  date_published: string | null;
  audio_url: string | null;
  score: number;
  url?: string | null;
}

export class MissingKeyError extends Error {
  constructor() {
    super("OPENROUTER_API_KEY is not configured on this deployment");
    this.name = "MissingKeyError";
  }
}

async function llm(messages: Array<{ role: string; content: string }>, opts?: { json?: boolean }): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new MissingKeyError();

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 55_000);
  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        "HTTP-Referer": "https://raypeat.wiki",
        "X-Title": "EncycloPEATia Ask Dr. Peat",
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: opts?.json ? 0.2 : 0.7,
        max_tokens: opts?.json ? 400 : 1600,
        ...(opts?.json ? { response_format: { type: "json_object" } } : {}),
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`OpenRouter ${res.status}: ${body.slice(0, 300)}`);
    }
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error("Empty completion");
    return text;
  } finally {
    clearTimeout(timer);
  }
}

function parseJsonLoose(raw: string): unknown {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const start = cleaned.search(/[[{]/);
  if (start === -1) return null;
  try {
    return JSON.parse(cleaned.slice(start));
  } catch {
    return null;
  }
}

// ---------- step 1: query generation ----------

const QUERY_SYSTEM = `You generate database search queries for a retrieval system over the complete works of Raymond Peat (PhD biology): 180 newsletters, 2 books, hundreds of emails and articles, ~250 interview transcripts, and a wiki of his ideas (thyroid, progesterone, PUFA, sugar/fruit, milk, calcium, aspirin, energy metabolism).

Given a user question, output JSON {"queries": [...]} with 7-9 short search queries (2-6 words each) that together would surface everything relevant:
- The user's own terms AND Peat's vocabulary for the same thing (e.g. weight loss -> obesity, fat loss, Randle cycle, liver, thyroid, metabolic rate)
- Mechanisms he'd invoke (hormones, enzymes, organs)
- Specific foods/supplements he discusses for it
- Opposing things he warns about (e.g. polyunsaturated fat, estrogen, serotonin, fasting, starch)
- One query per line of thought; no duplicates, no generic filler.`;

async function generateSearchQueries(question: string): Promise<string[]> {
  const raw = await llm(
    [
      { role: "system", content: QUERY_SYSTEM },
      { role: "user", content: `QUESTION: ${question}` },
    ],
    { json: true },
  );
  const parsed = parseJsonLoose(raw) as { queries?: string[] } | string[] | null;
  let queries: string[] = [];
  if (Array.isArray(parsed)) queries = parsed as string[];
  else if (parsed && Array.isArray((parsed as { queries?: string[] }).queries))
    queries = (parsed as { queries?: string[] }).queries!;
  return queries.filter((q) => typeof q === "string" && q.trim().length > 1).slice(0, 10);
}

// ---------- step 2: search + merge ----------

function runSearches(queries: string[], perQueryLimit = 9): CorpusHit[] {
  const byId = new Map<number, CorpusHit>();
  const hitCount = new Map<number, number>();
  for (const q of queries) {
    for (const hit of searchCorpus(q, perQueryLimit)) {
      const prev = byId.get(hit.i);
      if (prev) {
        prev.score = Math.max(prev.score, hit.score);
        hitCount.set(hit.i, (hitCount.get(hit.i) || 0) + 1);
      } else {
        byId.set(hit.i, hit);
        hitCount.set(hit.i, 1);
      }
    }
  }
  // Reward chunks surfaced by multiple independent queries.
  return [...byId.values()]
    .map((h) => ({ ...h, score: h.score * (1 + 0.25 * ((hitCount.get(h.i) || 1) - 1)) }))
    .sort((a, b) => b.score - a.score);
}

// ---------- step 3: synthesis in Peat's voice ----------

const SYNTH_SYSTEM = `You are "Ask Dr. Peat" on raypeat.wiki (the EncycloPEATia). You answer questions the way Raymond Peat, PhD (1935-2024), biologist and physiologist, actually answered them — drawing ONLY on the numbered source excerpts provided.

HOW PEAT ANSWERED:
- Start from physiology, not protocol. He explains the mechanism first: energy, thyroid, CO2, the liver, hormones. Then the practical follows naturally.
- First person, conversational-scholar tone, plain words for complex things. "I think...", "as I've said...", "people write to me...". Warm, curious, a little wry; never preachy.
- Skeptical of mainstream nutrition dogma (calorie obsession, cholesterol fear, "safe" vegetable oils, fiber worship) without being hostile.
- When asked about diet or weight, he famously started with "first I ask them what they're eating" — context before prescriptions. He distrusted starvation dieting because it lowers metabolic rate.
- Flowing prose, short paragraphs. No bullet lists except maybe a brief practical summary at most. No headings.

HARD RULES:
- Ground EVERY factual claim in the excerpts. Cite like [3] after the sentence(s) drawn from excerpt 3. Multiple citations fine: [1][4].
- Never invent quotes, studies, numbers, or claims. If the excerpts don't cover something, say what you'd want to look into rather than guessing ("I haven't written much about that...").
- Do not give individualized medical advice; when someone describes symptoms, explain the general physiology and suggest working with a doctor who understands these ideas.
- 250-450 words. End with nothing extra — no sign-off, no meta commentary.`;

function formatPassages(passages: CorpusHit[]): string {
  return passages
    .map(
      (p, idx) =>
        `[${idx + 1}] ${p.t} — ${p.s}${p.d ? `, ${p.d}` : ""} (${p.c}, chunk ${p.n})\n${p.x}`,
    )
    .join("\n\n---\n\n");
}

async function synthesize(question: string, passages: CorpusHit[]): Promise<string> {
  const raw = await llm([
    { role: "system", content: SYNTH_SYSTEM },
    {
      role: "user",
      content: `SOURCE EXCERPTS FROM RAY PEAT'S CORPUS:\n\n${formatPassages(passages)}\n\nUSER QUESTION: ${question}\n\nANSWER AS DR. PEAT (with [n] citations):`,
    },
  ]);
  return raw.trim();
}

// ---------- the agentic loop ----------

export async function askDrPeat(question: string): Promise<{ answer: string; sources: EngineSource[] }> {
  const t0 = Date.now();

  // Round 1 — expand the question into corpus-native queries.
  let queries = await generateSearchQueries(question);
  if (!queries.length) queries = [question];

  let hits = runSearches(queries);

  // Refinement round — if we barely found anything, look at what we got and
  // try once more with sharper queries.
  const distinctDocs = new Set(hits.map((h) => h.t)).size;
  if (distinctDocs < 5 || hits.length < 12) {
    try {
      const titles = [...new Set(hits.slice(0, 12).map((h) => h.t))].join("; ") || "nothing useful yet";
      const more = await llm(
        [
          { role: "system", content: QUERY_SYSTEM },
          {
            role: "user",
            content: `QUESTION: ${question}\nQueries already tried: ${queries.join(" | ")}\nDocuments found so far: ${titles}\n\nOutput 5 NEW, different search queries to fill the gaps.`,
          },
        ],
        { json: true },
      );
      const parsed = parseJsonLoose(more) as { queries?: string[] } | null;
      const extra = (parsed?.queries || []).filter(Boolean).slice(0, 6);
      if (extra.length) hits = runSearches([...queries, ...extra]);
    } catch {
      // refinement is best-effort
    }
  }

  const top = hits.slice(0, 22); // ~26k chars of context
  if (!top.length) {
    return {
      answer:
        "I couldn't find anything in my writings on that. Try rephrasing — different words often reach different corners of the archive.",
      sources: [],
      };
  }

  const answer = await synthesize(question, top);
  console.log(`[ask] "${question.slice(0, 60)}" -> ${queries.length}+ queries, ${top.length} chunks, ${Date.now() - t0}ms`);

  // Map cited chunks back to document-level sources, in citation order of appearance.
  const usedIdx = [...answer.matchAll(/\[(\d{1,2})\]/g)].map((m) => parseInt(m[1], 10));
  const order: number[] = [];
  for (const n of usedIdx) if (n >= 1 && n <= top.length && !order.includes(n - 1)) order.push(n - 1);
  for (let i = 0; i < top.length; i++) if (!order.includes(i) && order.length < 8) order.push(i);

  const seenTitles = new Set<string>();
  const sources: EngineSource[] = [];
  for (const i of order) {
    const h = top[i];
    if (seenTitles.has(h.t)) continue;
    seenTitles.add(h.t);
    sources.push({
      text: h.x.slice(0, 600),
      section_header: `${h.s}${h.d ? ` · ${h.d}` : ""} · chunk ${h.n}`,
      section_anchor: "",
      episode_title: h.t,
      episode_id: h.slug || "",
      show: h.s,
      date_published: h.d,
      audio_url: h.a,
      score: Math.round(h.score * 100) / 100,
      url: h.u,
    });
    if (sources.length >= 8) break;
  }

  return { answer, sources };
}
