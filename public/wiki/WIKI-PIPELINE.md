# Ray Peat Encyclopedia Wiki Pipeline

> Workflow for generating wiki articles from ALL Ray Peat source material using QMD semantic search.

---

## Source Inventory

| Source Type | QMD Collection | Files | Quality |
|-------------|---------------|-------|---------|
| **Polished Transcripts** | `ray-peat-transcripts` | 252 | High — direct Peat quotes |
| **Emails** | `ray-peat-emails` | 244 | High — practical advice |
| **Newsletters** | `ray-peat-newsletters` | 141 | High — deep science |
| **Articles** | `ray-peat-articles` | 10 | High — published work |
| **Books** | `ray-peat-books` | 2 | Moderate — theoretical |
| **Wiki (scaffolds)** | `ray-peat-wiki` | 181 | Low — mostly scaffolds |

**Total:** 107,049 vectors across 6 collections

---

## RAG Tool: QMD

**Location:** `~/qmd` (global tool)

QMD provides three search modes:
- `query` — Combined BM25 + vector + Qwen3 query expansion + reranking (best for research)
- `search` — BM25 full-text (fast keyword matching)
- `vsearch` — Vector-only similarity search

### Basic Usage

```bash
cd ~/qmd

# Best: combined search with reranking (use for article research)
bun run qmd query "progesterone protective effects" -c ray-peat-transcripts -n 10 --full

# Fast keyword search
bun run qmd search "progesterone" -c ray-peat-emails -n 10 --full

# Vector-only semantic search
bun run qmd vsearch "neuroprotective mechanisms" -c ray-peat-newsletters -n 10 --full
```

### Known Constraints
- Run queries **sequentially** — parallel GPU queries crash processes
- 3,750 docs still need embedding (warning appears but doesn't affect results)
- Qwen3 query expansion has cosmetic repetition bug (doesn't affect quality)

---

## Per-Article Research Protocol

For each encyclopedia article, search across all 6 collections:

```bash
cd ~/qmd

# 1. Transcripts — direct Peat quotes, episode links
bun run qmd query "[ENTITY] Ray Peat [key aspect]" -c ray-peat-transcripts -n 15 --full

# 2. Emails — practical advice and protocols
bun run qmd query "[ENTITY] [practical aspect]" -c ray-peat-emails -n 10 --full

# 3. Newsletters — deep scientific explanations
bun run qmd query "[ENTITY] [mechanism]" -c ray-peat-newsletters -n 10 --full

# 4. Articles — foundational concepts
bun run qmd query "[ENTITY]" -c ray-peat-articles -n 10 --full

# 5. Books — theoretical framing
bun run qmd search "[ENTITY]" -c ray-peat-books -n 5 --full
```

Run 2-3 queries per collection with different angles (e.g., mechanism, practical use, relationship to other concepts).

---

## Content Generation Workflow

### Step 1: Research (QMD)

1. **Identify entity** from curated list (`data/wiki/wiki_entities_deduped.json`)
2. **Check scope** in `vault/WIKI-COORDINATION.md` — what this article owns vs. delegates
3. **Run QMD queries** across all collections (protocol above)
4. **Note episode slugs** from transcript filenames for linking

### Step 2: Synthesis

1. **Read STYLE-GUIDE.md** — follow quote weaving rules
2. **Structure article** based on what sources contribute:
   - Newsletter → Core mechanism explanations
   - Article → Scientific framework
   - Email → Practical protocols
   - Transcript → Illustrative quotes, episode links
3. **Create wikilinks** to related entities
4. **Respect scope boundaries** — delegate to linked articles per WIKI-COORDINATION.md

### Step 3: Write

1. **Opening hook** — Contrarian insight, not neutral definition
2. **Weave quotes** into prose (max 1-2 standalone blockquotes)
3. **Add episode links** using `[[slug|Display Title]]` format
4. **Connect concepts** via `[[wikilinks]]`
5. **Update frontmatter** — set `status: complete`, update date

---

## Episode Linking

### Index Location
`data/episode-index.txt` (505 episodes)

### Format
```
show|slug|title
```

### Usage in Wiki
```markdown
As Peat explained in a [[2011-11-18-ask-the-herb-doctor-energy-production-diabetes|2011 interview on diabetes]]...
```

### Matching Episodes to Content
When you find a quote in a transcript, the filename contains the slug:
- File: `2011-11-18-ask-the-herb-doctor-ask-the-herb-doctor-energy-production-diabetes-and-saturated-fats.md`
- Slug: `2011-11-18-ask-the-herb-doctor-ask-the-herb-doctor-energy-production-diabetes-and-saturated-fats`
- Display: "Energy Production, Diabetes and Saturated Fats (2011)"

---

## Quality Checklist

Before completing any article:

- [ ] Searched all source collections (transcripts, emails, newsletters, articles, books)
- [ ] Opening conveys Peat's perspective (contrarian hook)
- [ ] Quotes woven into prose (not dumped as blockquotes)
- [ ] Episode links use `[[slug|Display]]` format
- [ ] Wikilinks connect to related concepts
- [ ] Scope boundaries respected (per WIKI-COORDINATION.md)
- [ ] No redundancy with existing articles
- [ ] Sources section lists key sources
- [ ] Reads like encyclopedia, not transcript summary

---

## File Locations

```
Ray Peat/
├── vault/                              # THE WIKI — encyclopedia output
│   ├── STYLE-GUIDE.md                  # Editorial standards
│   ├── WIKI-COORDINATION.md            # Writing order + scope definitions
│   ├── WIKI-PIPELINE.md                # THIS FILE
│   ├── substances/                     # hormones, vitamins, foods, fats
│   ├── conditions/                     # diabetes, cancer, aging
│   ├── mechanisms/                     # oxidation, digestion, Randle cycle
│   ├── concepts/                       # bioenergetics, stress
│   └── people/                         # Gilbert Ling, Hans Selye
│
├── sources/                            # Primary source material (input)
│   ├── articles/                       # 10 from raypeat.com
│   ├── newsletters/                    # 141 newsletters
│   ├── emails/                         # 244 topic files
│   └── books/                          # 2 books
│
├── app/                                # Next.js Encyclopeatia app
│   └── public/transcripts/*/polished/  # 252 polished transcripts
│
├── data/                               # Indices and metadata
│   ├── wiki/                           # wiki_entities_deduped.json
│   └── episode-index.txt               # 505 episodes (slug|title)
│
└── pipeline/                           # Processing tools
    └── qdrant-rag/                     # Legacy RAG (preserved, not used)
```

---

## Lessons Learned

1. **QMD > Qdrant** — 10 results vs 3, primary sources vs derivative docs, multi-query expansion + reranking
2. **Search all collections** — Transcripts alone miss newsletters (deep science) and emails (protocols)
3. **Newsletters are gold** — Most detailed scientific explanations
4. **Emails are practical** — Specific recommendations and dosing
5. **Episode slugs from filenames** — Match transcript file to slug for linking
6. **Weave, don't dump** — Quotes integrated into prose, not standalone blocks
7. **Scope boundaries matter** — WIKI-COORDINATION.md prevents redundancy across articles
8. **Run queries sequentially** — Parallel GPU queries crash QMD processes

---

*Last Updated: 2026-02-04*
