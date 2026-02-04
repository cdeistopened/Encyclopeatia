# Encyclopedia Entity Map

> Visual dependency graph + SEO priority for article generation.
> Use this alongside WIKI-COORDINATION.md for scope definitions.

**Last Updated:** 2026-01-22

---

## The Anti-Redundancy System

### The Problem
In Ray Peat's framework, EVERYTHING connects:
- Estrogen → cancer, inflammation, aging, PUFA, hypothyroidism
- PUFA → Randle cycle, diabetes, inflammation, estrogen
- Thyroid → metabolism, everything

Without strict rules, every article becomes "Estrogen and PUFA cause problems, thyroid fixes them."

### The Solution: Ownership + Delegation

**Rule 1: One Home Per Concept**
Every mechanism, claim, or explanation has ONE article that "owns" it.
Other articles link to it with: "For X, see [[Y]]"

**Rule 2: Anchors Explain, Satellites Apply**
- PUFA (anchor) explains WHY polyunsaturated fats are harmful
- Randle Cycle (satellite) explains the SPECIFIC mechanism
- Diabetes (anchor) explains how this manifests CLINICALLY

**Rule 3: Quote Once**
A powerful Ray Peat quote belongs to ONE article. Others reference it.

---

## Dependency Graph

### Tier 1: Foundation Layer (Write FIRST)

These 6 anchors stand alone - they don't require other anchors to exist.

```
┌─────────────────────────────────────────────────────────────────┐
│                     FOUNDATION LAYER                            │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │ ESTROGEN │  │  PUFA    │  │ THYROID  │                      │
│  │ (3177)   │  │ (1428)   │  │ (1520)   │                      │
│  └──────────┘  └──────────┘  └──────────┘                      │
│       ↓             ↓             ↓                             │
│  ┌───────────────────────────────────────┐                      │
│  │           METABOLISM (883)            │                      │
│  │      (requires all three above)       │                      │
│  └───────────────────────────────────────┘                      │
│       ↓                                                         │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │ INFLAMMATION │  │ PROGESTERONE │ ← DONE                     │
│  │   (1942)     │  │   (2949)     │                            │
│  └──────────────┘  └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

**Writing Order:**
1. Estrogen (standalone - the primary antagonist)
2. PUFA (standalone - the dietary enemy)
3. Thyroid (standalone - the metabolic regulator)
4. Metabolism (needs 1-3 for context)
5. Inflammation (needs metabolism)
6. ~~Progesterone~~ ✅ COMPLETE

---

### Tier 2: Condition Layer (Write AFTER Foundation)

```
┌─────────────────────────────────────────────────────────────────┐
│                     CONDITION LAYER                             │
│                   (Depends on Foundation)                       │
│                                                                 │
│  ┌────────┐    ┌────────┐    ┌──────────┐    ┌────────┐       │
│  │ CANCER │    │ AGING  │    │ STRESS   │    │DIABETES│       │
│  │ (1973) │    │ (1281) │    │ (1487)   │    │ (635)  │       │
│  └────┬───┘    └────┬───┘    └────┬─────┘    └────┬───┘       │
│       │             │             │               │            │
│       ↓             ↓             ↓               ↓            │
│   ┌───────────────────────────────────────────────────┐        │
│   │              Requires from Foundation:            │        │
│   │   Cancer → Estrogen, Metabolism                   │        │
│   │   Aging → PUFA, Estrogen, Inflammation            │        │
│   │   Stress → Thyroid, Metabolism                    │        │
│   │   Diabetes → PUFA, Metabolism (via Randle)        │        │
│   └───────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

---

### Tier 3: Mechanism Satellites (Write WITH Anchors)

```
┌─────────────────────────────────────────────────────────────────┐
│                    KEY MECHANISM SATELLITES                     │
│                                                                 │
│  PUFA ────────────→ Randle Cycle (THE mechanism)               │
│  Cancer ──────────→ Warburg Effect                              │
│  Thyroid ─────────→ T3 (the active hormone)                     │
│  Stress ──────────→ Cortisol, Serotonin                        │
│  Progesterone ────→ Pregnenolone                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## SEO Priority Matrix

Based on keyword research (estimated search volumes):

| Topic | Searches/mo | Priority | Notes |
|-------|-------------|----------|-------|
| **Ray Peat Diet** | 1,000+ | 🔴 HIGH | Create dedicated landing page |
| **Thyroid** | 800+ | 🔴 HIGH | "ray peat thyroid", "hypothyroid symptoms" |
| **PUFA** | 600+ | 🔴 HIGH | "seed oils bad", "pufa dangers" |
| **Estrogen** | 500+ | 🔴 HIGH | "estrogen dominance", "high estrogen symptoms" |
| **Progesterone** | 400+ | ✅ DONE | |
| **Metabolism** | 400+ | 🔴 HIGH | "how to increase metabolism", "metabolic rate" |
| **Fasting** | 300+ | 🟡 MED | Contrarian angle ranks well |
| **Serotonin** | 250+ | 🟡 MED | "serotonin myth" is contrarian hook |
| **Cortisol** | 200+ | 🟡 MED | |
| **Randle Cycle** | 50 | 🟢 LOW | Technical, but important for authority |

**Strategy:** Write HIGH priority anchors first. They drive traffic.

---

## Content Ownership Matrix

### What Each Anchor OWNS (exclusive content)

| Anchor | This Article Explains | Does NOT Explain (links instead) |
|--------|----------------------|----------------------------------|
| **Estrogen** | Why harmful, sources, reduction | Breast cancer specifics → [[breast cancer]] |
| **PUFA** | What they are, why harmful, elimination | Randle mechanism → [[Randle cycle]] |
| **Thyroid** | What it does, testing, epidemic | T3 dosing → [[T3]], supplements → [[thyroid supplement]] |
| **Metabolism** | Oxidative vs glycolytic, fundamentals | Randle cycle → [[Randle cycle]] |
| **Inflammation** | Core mechanism, anti-inflammatory strategies | Specific conditions → their articles |
| **Cancer** | Metabolic theory overview | Warburg details → [[Warburg effect]] |
| **Diabetes** | Metabolic view, not about sugar | Randle mechanism → [[Randle cycle]] |

### Quote Ownership

| Quote | Owned By |
|-------|----------|
| "Estrogen causes hypoxia at every imaginable site" | [[Estrogen]] |
| "The rising blood sugar shouldn't be fought in itself" | [[Randle Cycle]] |
| "There are two clear points where free fatty acids inhibit glucose" | [[Randle Cycle]] |
| "Estrogen is the hormone of cellular excitement" | [[Estrogen]] |

---

## Replicable Article Workflow

### For Each Article:

**Step 1: Check Prerequisites**
```
Before writing [X], verify these exist:
- [ ] All linked anchors are written
- [ ] Scope definition reviewed in WIKI-COORDINATION.md
```

**Step 2: Research (Multi-Query RAG)**
```bash
# Run 5-10 semantic queries per entity
python query.py "estrogen harmful effects" --limit 10
python query.py "estrogen hypoxia cellular" --limit 10
python query.py "estrogen cancer proliferation" --limit 10
python query.py "reducing estrogen naturally" --limit 10
python query.py "estrogen progesterone opposition" --limit 10
```

**Step 3: Check Sources**
```bash
# Grep across all source types
grep -r "estrogen" notebooklm-sources/newsletters-batch-*.md | head -50
grep -r "estrogen" notebooklm-sources/emails/*.md | head -50
```

**Step 4: Draft with Scope Boundaries**
- Write ONLY what this article owns
- Add "For X, see [[Y]]" for delegated topics
- Weave quotes (max 1-2 blockquotes per section)

**Step 5: Cross-Reference Check**
- [ ] All required wikilinks present
- [ ] No content duplicated from other articles
- [ ] Episode links use `[[slug|Display]]` format

---

## Generation Phases

### Phase 1: Foundation Anchors (This Week)
1. ~~Progesterone~~ ✅
2. **Estrogen** ← START HERE
3. PUFA
4. Thyroid
5. Metabolism
6. Inflammation

### Phase 2: Condition Anchors
7. Cancer
8. Aging
9. Stress
10. Diabetes
11. Serotonin
12. Cortisol

### Phase 3: Key Mechanism Satellites
13. Randle Cycle
14. Warburg Effect
15. T3
16. Lipid Peroxidation

### Phase 4: Food/Supplement Anchors
17. Milk
18. Sugar
19. Coffee
20. Saturated Fat
21. Cholesterol

### Phase 5: Remaining Satellites + Stubs
- Minerals, vitamins, people, etc.
- Can be batched more aggressively

---

## Anti-Redundancy Checklist

Before publishing ANY article:

- [ ] **Scope verified**: Only covers owned content
- [ ] **Delegations explicit**: "For X, see [[Y]]" present
- [ ] **Quotes unique**: No quote appears in multiple articles
- [ ] **Mechanism once**: Technical explanations live in ONE place
- [ ] **Cross-links bidirectional**: If A links to B, B should link to A

---

## Next Action

**Generate ESTROGEN article** using this workflow:
1. Review scope in WIKI-COORDINATION.md
2. Run multi-query RAG search
3. Grep newsletters + emails
4. Draft with explicit delegations
5. Add episode links from episode-index.txt

---

*This document complements WIKI-COORDINATION.md (scope definitions) and STYLE-GUIDE.md (writing standards).*
