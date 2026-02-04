# EncycloPEATia Multi-Agent Pipeline Spec

> Specification for generating 145 encyclopedia articles using parallel agents with quality control.

**Created:** 2026-01-22
**First Batch:** 5 Foundation Anchors (Estrogen, PUFA, Thyroid, Metabolism, Inflammation)
**Execution Mode:** Live orchestration with checkpoint notes

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           BATCH-BY-PHASE EXECUTION                              │
│                                                                                 │
│   PHASE 1: RESEARCH (Parallel)                                                  │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐         │
│   │ Estrogen │ │   PUFA   │ │ Thyroid  │ │Metabolism│ │ Inflammation │         │
│   │ Research │ │ Research │ │ Research │ │ Research │ │   Research   │         │
│   └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘         │
│        │            │            │            │               │                 │
│        ▼            ▼            ▼            ▼               ▼                 │
│   PHASE 2: STRUCTURE (Parallel)                                                 │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐         │
│   │ Estrogen │ │   PUFA   │ │ Thyroid  │ │Metabolism│ │ Inflammation │         │
│   │Structure │ │Structure │ │Structure │ │Structure │ │  Structure   │         │
│   └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘         │
│        │            │            │            │               │                 │
│        ▼            ▼            ▼            ▼               ▼                 │
│   PHASE 3: WRITING (Parallel)                                                   │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐         │
│   │ Estrogen │ │   PUFA   │ │ Thyroid  │ │Metabolism│ │ Inflammation │         │
│   │  Writer  │ │  Writer  │ │  Writer  │ │  Writer  │ │    Writer    │         │
│   └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘         │
│        │            │            │            │               │                 │
│        ▼            ▼            ▼            ▼               ▼                 │
│   PHASE 4: QUALITY LOOP (Per Article)                                           │
│   ┌─────────────────────────────────────────────────────────────────────┐       │
│   │  5 Judges → Feedback → Auto-Retry if Needed → Final Article        │       │
│   └─────────────────────────────────────────────────────────────────────┘       │
│                                                                                 │
│   OUTPUT: /vault/estrogen.md, /vault/pufa.md, etc.                             │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Core Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Parallelization** | Batch by phase | All 5 research, then all 5 structure, then all 5 write |
| **Execution** | True parallel | Spawn 5 agents simultaneously per phase |
| **RAG Access** | Pre-fetch research | Run all RAG queries before spawning write agents |
| **Source Scope** | All indexed sources | Transcripts + newsletters + emails |
| **Structure** | Agent-generated H2s | Agents determine structure based on research |
| **Citations** | Internal links only | `[[episode-slug]]` format, no section anchors |
| **Voice** | Encyclopedic advocate | Authoritative, Peat's view as position, use jargon with links |
| **Artifacts** | Temporary only | Don't persist research.json, only final .md |
| **Output** | /vault/ folder | Articles live in Obsidian vault |
| **Quality** | 5-judge loop | Same as MFM with encyclopedic voice |
| **Failure** | Auto-retry with feedback | Quality feedback loops back to writer |

---

## Voice Specification

### Encyclopedic Advocate Voice

**Tone:** Authoritative, clear, confident. Present Peat's framework as the article's position.

**NOT neutral:** Don't say "Peat argues that..." - say "Estrogen is harmful because..."

**Jargon policy:** Use technical terms when necessary. Link to definitions: "the [[Randle cycle]] blocks glucose oxidation"

**Quote integration:**
- Paraphrase the big picture framework
- Feature standout 2-3 sentence quotes in their entirety
- Provide just enough context to weave quotes into narrative
- Look for quotes that would make good podcast clips

**Example opening (Estrogen):**
> Estrogen is the primary metabolic antagonist in Ray Peat's framework—a hormone that drives cellular excitement toward exhaustion. Where mainstream medicine celebrates estrogen as protective, Peat's research reveals its role in hypoxia, cancer promotion, and accelerated aging.

**AI Tells to Avoid:**
- "Here's where it gets interesting"
- "Not only... but also"
- "Fundamentally", "essentially"
- "That's a feature, not a bug"

---

## Agent Specifications

### Agent 1: RESEARCH AGENT

**Purpose:** Gather comprehensive source material from all indexed sources.

**Inputs:**
- Entity name from ENCYCLOPEDIA-MASTER.md
- Scope definition (OWNS, DELEGATES, LINKS OUT)
- Access to RAG backend (Qdrant Cloud)

**Process:**
1. Generate 5-10 semantic queries with synonyms
2. Query transcripts collection (2,907 chunks)
3. Query newsletters/articles if available
4. Extract direct quotes with episode attribution
5. Identify related entities for cross-linking

**Outputs:**
- 15-25 direct quotes (2-3 sentences each preferred)
- Episode list with relevance ranking
- Related entities for wikilinks
- Gap analysis (what's missing?)

**Success Criteria:**
- Minimum 10,000 words of source material
- At least 5 different episodes referenced
- Quotes from Ray Peat specifically (not just hosts)

---

### Agent 2: STRUCTURE AGENT

**Purpose:** Define article skeleton based on research and scope.

**Inputs:**
- Research output from Agent 1
- ENCYCLOPEDIA-MASTER.md scope definition
- Target word count (2500-4000 for anchors)

**Process:**
1. Identify major themes from research
2. Generate H2 structure (5-8 sections typical)
3. Assign quotes to sections
4. Ensure all LINKS OUT are placed
5. Plan hook and conclusion

**Outputs:**
- H2 hierarchy with descriptions
- Quote assignments per section
- Wikilink placements
- Delegation points ("For X, see [[Y]]")

**Structure Template (Flexible):**
```
# [Entity Name]

[Hook - 2-3 sentences, counterintuitive or striking]

## [Core Concept / What It Is]
## [Why It Matters / The Problem]
## [Mechanism / How It Works]
## [Practical Implications]
## [Connections] (wikilinks to related articles)

## Sources & Episodes
```

---

### Agent 3: WRITER AGENT

**Purpose:** Transform structure into polished encyclopedic prose.

**Inputs:**
- Structure from Agent 2
- Full research from Agent 1
- Voice specification (above)
- Completed article summaries (if dependencies exist)

**Process:**
1. Write hook (aim for striking, specific opening)
2. Draft each section following structure
3. Integrate quotes naturally (not "Peat said...")
4. Add wikilinks throughout
5. Write Sources section with episode links
6. Self-check for AI tells

**Outputs:**
- Complete markdown article
- Frontmatter (title, date, tags, status: draft)

**Wikilink Density Target:**
- 20-30 internal links for anchors
- Every LINKS OUT entity from MASTER.md must appear

---

### Quality Loop: 5 Judges

| Judge | Focus | Pass Criteria |
|-------|-------|---------------|
| **Hook Effectiveness** | Opening punch, promise, specificity | Would stop scrolling to read |
| **Information Density** | Insight per paragraph, no fluff | High value throughout |
| **Voice Consistency** | Encyclopedic, authoritative, no AI tells | Reads like expert wrote it |
| **Link Density** | Internal wikilinks, episode citations | 20+ links, all required links present |
| **Reader Experience** | Flow, clarity, actionable knowledge | Would bookmark/share |

**Scoring:** Each judge scores 1-10. Pass threshold: 7+ average, no judge below 5.

**Failure handling:** If below threshold, feedback sent to Writer Agent for revision. Max 2 retries before human review.

---

## Citation Format

**Inline quote attribution:**
```markdown
"Estrogen causes hypoxia at every imaginable site." — Ray Peat, [[ask-the-herb-doctor-2019-11-15|Ask Your Herb Doctor (Nov 2019)]]
```

**Sources section:**
```markdown
## Sources & Episodes

- [[ask-the-herb-doctor-2019-11-15|Ask Your Herb Doctor (Nov 2019)]] - Primary source for estrogen-hypoxia connection
- [[politics-and-science-2015-03-12|Politics & Science (Mar 2015)]] - Historical context on estrogen research suppression
```

---

## Context Management

### What Each Agent Receives

**All Agents:**
- ENCYCLOPEDIA-MASTER.md (full document)
- STYLE-GUIDE.md (quote weaving rules)
- Entity scope definition

**Writer Agent (additional):**
- Completed Progesterone article (as reference for voice/format)
- Summary of any completed dependencies (if writing Cancer, gets Estrogen summary)

### Dependency Handling

For Phase 1 (foundation anchors), no dependencies exist—all can run parallel.

For later phases:
1. Generate 200-word summary of each completed article
2. Append to ENCYCLOPEDIA-MASTER.md under entity
3. Dependent articles receive summaries in context

---

## Execution Plan: First Batch

### Pre-Flight Checklist
- [ ] Verify RAG backend accessible (Railway API)
- [ ] Confirm Qdrant Cloud collection has 2,907 chunks
- [ ] Read Progesterone article for voice reference
- [ ] Clear /vault/ of any draft artifacts

### Phase 1: Research (5 parallel agents)

```
Spawn 5 Task agents simultaneously:
- research-estrogen
- research-pufa
- research-thyroid
- research-metabolism
- research-inflammation

Each runs 5-10 RAG queries, extracts quotes, returns research bundle.
Estimated time: 5-10 minutes
```

### Phase 2: Structure (5 parallel agents)

```
After all research complete:
- structure-estrogen (receives estrogen research)
- structure-pufa (receives pufa research)
- etc.

Each generates H2 outline with quote assignments.
Estimated time: 3-5 minutes
```

### Phase 3: Writing (5 parallel agents)

```
After all structures complete:
- writer-estrogen
- writer-pufa
- etc.

Each produces full draft article.
Estimated time: 10-15 minutes
```

### Phase 4: Quality Loop (sequential per article)

```
For each draft:
1. Run 5 judges
2. If pass: save to /vault/[entity].md
3. If fail: send feedback to writer, retry
4. Max 2 retries before human flag
```

---

## File Outputs

```
/vault/
├── estrogen.md          # Final article
├── pufa.md
├── thyroid.md
├── metabolism.md
├── inflammation.md
├── progesterone.md      # Already complete
├── ENCYCLOPEDIA-MASTER.md
├── MULTI-AGENT-SPEC.md  # This file
└── EXECUTION-LOG.md     # Notes from this run (create during execution)
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Articles generated | 5 |
| Quality pass rate (first attempt) | 80%+ |
| Average word count | 2500-4000 |
| Wikilinks per article | 20-30 |
| Episodes cited per article | 5+ |
| AI tells detected | 0 |

---

## Post-Batch Review

After first 5 articles complete:
1. Human review all 5 for quality
2. Note any systematic issues
3. Adjust agent prompts if needed
4. Document learnings in EXECUTION-LOG.md
5. Proceed to Phase 2 (condition anchors) or iterate

---

## Open Questions (To Resolve During Execution)

1. **Newsletter/email indexing:** Are these in Qdrant or need separate search?
2. **Episode slug format:** Verify exact format for wikilinks
3. **Progesterone as reference:** Does current article match target voice?

---

*Spec complete. Ready for live orchestration.*
