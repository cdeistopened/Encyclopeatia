# Wiki Coordination Document

> Master reference for encyclopedia architecture. Prevents redundancy, ensures orthogonal coverage, defines article scope and dependencies.

**Last Updated:** 2026-01-14
**Total Entities:** 173 (before consolidation) → 145 (after consolidation)
**Status:** Planning phase

---

## Table of Contents

1. [Architecture Principles](#architecture-principles)
2. [Consolidation Map](#consolidation-map)
3. [Tier Classification](#tier-classification)
4. [Scope Definitions](#scope-definitions)
5. [Writing Order](#writing-order)
6. [Cross-Reference Matrix](#cross-reference-matrix)

---

## Architecture Principles

### The Redundancy Problem

If articles are written independently, every entry will repeat:
- "Estrogen is harmful because..."
- "PUFA blocks oxidative metabolism..."
- "Peat's dissertation showed..."

**Solution:** Strict scope boundaries. Each article owns specific content. Other articles link to it rather than repeating.

### Tier System

| Tier | Word Count | Purpose | Count |
|------|------------|---------|-------|
| **ANCHOR** | 2000-4000 | Comprehensive treatment of foundational concepts | ~25 |
| **SATELLITE** | 800-1500 | Focused coverage, heavy linking to anchors | ~80 |
| **STUB** | 200-500 | Brief definition, mostly links | ~40 |

### Scope Assignment Rules

1. **Anchors own the concept** — all general explanation lives here
2. **Satellites own the specific** — one focused aspect, links for context
3. **Stubs redirect** — just enough to orient, then link

### The "For X, see [[Y]]" Pattern

Every article must explicitly delegate:
- "For the mechanism by which fatty acids block glucose oxidation, see [[Randle cycle]]."
- "For practical supplementation, see [[progesterone#practical-use]]."

---

## Consolidation Map

These entities are duplicates or subsets. Consolidate into single articles.

### Direct Merges (Same Topic, Different Names)

| Keep | Merge Into It | Combined Mentions |
|------|---------------|-------------------|
| **PUFA** | polyunsaturated fats, polyunsaturated fatty acids | 1428 |
| **Saturated Fat** | saturated fats | 583 |
| **Fruit** | fruits | 475 |
| **Antioxidants** | antioxidant | 170 |
| **Vaccines** | vaccine | 171 |
| **Antibiotics** | antibiotic | 205 |

### Hierarchy Merges (One Anchor, Others Satellite)

| Anchor | Satellites (Separate Articles) | Redirects (No Separate Article) |
|--------|-------------------------------|--------------------------------|
| **Thyroid** | T3, Thyroid Supplement | thyroid hormone, thyroid function, low thyroid |
| **Estrogen** | Estradiol | — |
| **Cancer** | Breast Cancer | tumor |
| **Fatty Acids** | Free Fatty Acids, Linoleic Acid | — |
| **Hypothyroidism** | — | low thyroid |
| **Metabolism** | Metabolic Rate, Oxidative Metabolism, Energy Metabolism | — |

### Entity Count After Consolidation

- Original: 173
- Removed (merged): 28
- **Final: 145 articles**

---

## Tier Classification

### TIER 1: ANCHOR ARTICLES (25)

Foundational concepts requiring comprehensive treatment. These are the "home" for major ideas.

#### Hormones & Signaling (8)
| Entity | Mentions | Unique Scope |
|--------|----------|--------------|
| **Estrogen** | 3177 | The primary metabolic antagonist. All harmful effects, sources, reduction strategies. Estradiol gets separate satellite. |
| **Progesterone** | 2949 | ✅ COMPLETE. The protective steroid. Synthesis, mechanisms, practical use. |
| **Thyroid** | 1520+ | Master metabolic regulator. Combines thyroid hormone, function. T3 gets focused satellite. |
| **Cortisol** | 895 | Stress hormone. Acute vs chronic, relationship to progesterone. |
| **Serotonin** | 595 | The "dark side" neurotransmitter. Peat's contrarian view. |
| **Pregnenolone** | 511 | Mother of all steroids. Synthesis, neuroprotection, practical use. |
| **Insulin** | 364 | Blood sugar regulation. Links to diabetes, sugar. |
| **Prolactin** | 294 | Stress marker, relationship to estrogen. |

#### Fats (3)
| Entity | Mentions | Unique Scope |
|--------|----------|--------------|
| **PUFA** | 1428 | ALL polyunsaturated fat content. Why harmful, sources, elimination, storage. Randle cycle gets satellite. |
| **Saturated Fat** | 583 | Why beneficial, sources, the reversal of mainstream advice. |
| **Cholesterol** | 233 | Precursor to all steroids, not the enemy. |

#### Conditions (7)
| Entity | Mentions | Unique Scope |
|--------|----------|--------------|
| **Cancer** | 1973 | Metabolic view of cancer. Warburg effect, estrogen connection. Breast cancer gets satellite. |
| **Inflammation** | 1942 | Core mechanism of degeneration. Anti-inflammatory strategies. |
| **Stress** | 1487 | Selye's model, adaptation vs exhaustion, the stress hormones. |
| **Aging** | 1281 | The degenerative cascade. Accumulation of PUFA, estrogen dominance. |
| **Hypothyroidism** | 755 | The hidden epidemic. Diagnosis, symptoms, treatment. |
| **Diabetes** | 635 | Metabolic view—not about sugar, about fat. Links to Randle cycle. |
| **Obesity** | 332 | Metabolic, not caloric. PUFA storage, thyroid connection. |

#### Mechanisms (4)
| Entity | Mentions | Unique Scope |
|--------|----------|--------------|
| **Metabolism** | 883+ | Oxidative vs glycolytic. Energy production fundamentals. |
| **Oxidation** | 586 | Cellular respiration, oxygen utilization, CO2 production. |
| **Digestion** | 485 | Gut health, endotoxin, bacterial balance. |
| **Immune System** | 320 | Thymus, T cells, the estrogen-immunity connection. |

#### Foods (3)
| Entity | Mentions | Unique Scope |
|--------|----------|--------------|
| **Milk** | 1038 | The perfect food. Calcium, protein, controversy. |
| **Sugar** | 420 | Peat's defense of sugar. Fructose, sucrose, context. |
| **Coffee** | 256 | Protective effects, magnesium, anti-serotonin. |

---

### TIER 2: SATELLITE ARTICLES (80)

Focused coverage of specific topics. Heavy linking to anchors.

#### Hormones & Signaling Satellites
| Entity | Mentions | Scope | Links To |
|--------|----------|-------|----------|
| T3 | 664 | Active thyroid hormone specifically. Dosing, Cytomel. | [[thyroid]] |
| DHEA | 330 | The "anti-aging" hormone. Practical use. | [[pregnenolone]], [[cortisol]] |
| Adrenaline | 327 | Acute stress response. | [[stress]], [[cortisol]] |
| Testosterone | 476 | Male hormone, aromatization to estrogen. | [[estrogen]], [[DHEA]] |
| Estradiol | 272 | Specific estrogen form. Measurement. | [[estrogen]] |
| Parathyroid Hormone | 283 | Calcium regulation, stress marker. | [[calcium]], [[stress]] |
| Thyroid Supplement | 68 | Practical: Armour, Cynomel, dosing. | [[thyroid]], [[T3]] |

#### Minerals Satellites
| Entity | Mentions | Scope | Links To |
|--------|----------|-------|----------|
| Calcium | 1370 | The anti-stress mineral. Dairy, PTH. | [[milk]], [[parathyroid hormone]] |
| Magnesium | 508 | Protective, anti-inflammatory. | [[stress]], [[inflammation]] |
| Sodium | 479 | Salt rehabilitation. Adrenal support. | [[stress]], [[hypothyroidism]] |
| Potassium | 241 | Cellular health, Gilbert Ling. | [[Gilbert Ling]], [[metabolism]] |
| Iron | 405 | Oxidative stress, excess dangers. | [[oxidation]], [[inflammation]] |
| Phosphate | 313 | PTH, calcium balance. | [[calcium]], [[parathyroid hormone]] |
| Iodine | 170 | Thyroid support, controversy. | [[thyroid]] |
| Copper | 147 | Metabolism, iron interaction. | [[iron]], [[metabolism]] |
| Selenium | 76 | Thyroid conversion, protection. | [[thyroid]], [[T3]] |

#### Vitamins Satellites
| Entity | Mentions | Scope | Links To |
|--------|----------|-------|----------|
| Vitamin D | 753 | Hormone, not vitamin. Sun, supplementation. | [[calcium]], [[thyroid]] |
| Vitamin E | 506 | Antioxidant, anti-estrogen. | [[PUFA]], [[estrogen]] |
| Vitamin A | 357 | Thyroid synergy, steroid synthesis. | [[thyroid]], [[progesterone]] |
| Vitamin K | 204 | Calcium direction, anti-calcification. | [[calcium]], [[calcification]] |
| Vitamin C | 187 | Ascorbic acid, adrenal support. | [[stress]], [[cortisol]] |
| B Vitamins | 108 | Energy production, liver support. | [[metabolism]], [[liver]] |
| Niacin | 40 | Anti-lipolytic, fatty acid lowering. | [[free fatty acids]], [[Randle cycle]] |
| Vitamin B6 | 66 | Specific B vitamin. | [[B vitamins]] |
| Vitamin B1 | 44 | Thiamine, energy. | [[B vitamins]], [[metabolism]] |

#### Fats Satellites
| Entity | Mentions | Scope | Links To |
|--------|----------|-------|----------|
| Coconut Oil | 482 | Safe fat, MCTs, metabolism boost. | [[saturated fat]], [[metabolism]] |
| Free Fatty Acids | 314 | Circulating fats, stress marker. | [[PUFA]], [[Randle cycle]] |
| Linoleic Acid | 205 | The specific bad actor in seed oils. | [[PUFA]] |
| Fish Oil | 126 | Peat's critique of omega-3 supplementation. | [[PUFA]] |
| Fatty Acids | 329 | General category overview. | [[PUFA]], [[saturated fat]] |

#### Mechanisms Satellites
| Entity | Mentions | Scope | Links To |
|--------|----------|-------|----------|
| Randle Cycle | 30 | How fats block glucose oxidation. THE key mechanism. | [[PUFA]], [[diabetes]], [[free fatty acids]] |
| Warburg Effect | 7 | Cancer cell metabolism. | [[cancer]], [[metabolism]], [[glycolysis]] |
| Lipid Peroxidation | 210 | PUFA breakdown, age pigment. | [[PUFA]], [[aging]], [[age pigment]] |
| Glycolysis | 136 | Anaerobic metabolism, stress state. | [[metabolism]], [[lactic acid production]] |
| Fibrosis | 141 | Scar tissue, degeneration. | [[estrogen]], [[inflammation]] |
| Calcification | 112 | Soft tissue calcium, vitamin K. | [[calcium]], [[vitamin K]] |
| Regeneration | 140 | Tissue repair, stem cells. | [[metabolism]], [[stem cells]] |
| Cell Division | 162 | Proliferation vs differentiation. | [[cancer]], [[estrogen]] |
| Respiration | 156 | Cellular oxygen use, CO2 production. | [[metabolism]], [[oxidation]] |
| Blood Sugar | 137 | Regulation, the real story. | [[diabetes]], [[insulin]], [[sugar]] |
| Lactic Acid Production | 86 | Stress marker, Warburg. | [[glycolysis]], [[stress]] |
| ATP Production | 53 | Energy currency. | [[metabolism]], [[mitochondrial respiration]] |
| Mitochondrial Respiration | 83 | The powerhouse. | [[metabolism]], [[oxidation]] |
| Oxygen Consumption | 106 | Metabolic rate indicator. | [[metabolism]], [[thyroid]] |
| Endotoxin Absorption | 22 | Gut barrier, liver stress. | [[endotoxin]], [[digestion]] |
| Hyperventilation | 88 | CO2 loss, alkalosis. | [[carbon dioxide]], [[stress]] |
| Oxidative Stress | 89 | When oxidation goes wrong. | [[PUFA]], [[inflammation]] |

#### Conditions Satellites
| Entity | Mentions | Scope | Links To |
|--------|----------|-------|----------|
| Heart Disease | 383 | Metabolic view, not cholesterol. | [[cholesterol]], [[PUFA]], [[inflammation]] |
| Breast Cancer | 337 | Estrogen-driven cancer specifically. | [[cancer]], [[estrogen]] |
| Osteoporosis | 299 | Bone loss, estrogen myth, progesterone truth. | [[progesterone]], [[estrogen]], [[calcium]] |
| Dementia | 232 | Brain degeneration, estrogen role. | [[aging]], [[estrogen]], [[brain]] |
| Alzheimer's Disease | 229 | Specific dementia type. | [[dementia]], [[brain]] |
| Depression | 261 | Serotonin myth, metabolic reality. | [[serotonin]], [[hypothyroidism]] |
| Menopause | 230 | Hormone transition, estrogen dominance. | [[estrogen]], [[progesterone]] |
| Pregnancy | 269 | Progesterone's primary role. | [[progesterone]], [[estrogen]] |
| Anxiety | 159 | Metabolic, hormonal causes. | [[serotonin]], [[hypothyroidism]], [[progesterone]] |
| Fatigue | 180 | Energy deficit, thyroid. | [[hypothyroidism]], [[metabolism]] |
| Edema | 174 | Water retention, estrogen. | [[estrogen]], [[hypothyroidism]] |
| Hypertension | 183 | Blood pressure, metabolic causes. | [[hypothyroidism]], [[stress]] |
| Degenerative Diseases | 149 | Umbrella category. | [[aging]], [[inflammation]] |

#### Foods Satellites
| Entity | Mentions | Scope | Links To |
|--------|----------|-------|----------|
| Orange Juice | 474 | Potassium, fructose, practical use. | [[sugar]], [[fruit]] |
| Eggs | 315 | Complete nutrition, cholesterol. | [[cholesterol]], [[protein]] |
| Butter | 310 | Saturated fat source, vitamin A. | [[saturated fat]], [[vitamin A]] |
| Cheese | 272 | Calcium, aged vs fresh. | [[milk]], [[calcium]] |
| Fruit | 475 | Fructose, potassium, digestion. | [[sugar]], [[digestion]] |
| Meat | 378 | Protein source, quality concerns. | [[protein]], [[gelatin]] |
| Gelatin | 161 | Glycine, anti-inflammatory protein. | [[protein]], [[glycine]] |
| Fish | 243 | Peat's concerns about PUFA content. | [[PUFA]] |
| Vegetables | 278 | Fiber concerns, anti-nutrients. | [[digestion]] |
| Starch | 205 | Glucose source, digestion issues. | [[digestion]], [[blood sugar]] |
| Grains | 192 | Problems with grains. | [[digestion]], [[starch]] |
| Liver | 176 | Nutrient density, vitamin A. | [[vitamin A]], [[B vitamins]] |
| Salt | 275 | Same as sodium entry. | [[sodium]] |

#### Amino Acids Satellites
| Entity | Mentions | Scope | Links To |
|--------|----------|-------|----------|
| Protein | 382 | General protein needs, quality. | [[gelatin]], [[amino acids]] |
| Tryptophan | 291 | Serotonin precursor, excess problems. | [[serotonin]] |
| Glycine | 100 | Anti-inflammatory amino acid. | [[gelatin]], [[protein]] |
| Cysteine | 90 | Sulfur amino acid, concerns. | [[protein]] |
| Methionine | 79 | Balance with glycine. | [[glycine]], [[protein]] |
| Glutamate | 52 | Excitotoxicity. | [[brain]], [[serotonin]] |
| Glutamic Acid | 44 | Same as glutamate. | [[glutamate]] |
| Albumin | 49 | Blood protein, toxin binding. | [[protein]] |
| Amino Acids | 184 | General overview. | [[protein]] |

#### Drugs Satellites
| Entity | Mentions | Scope | Links To |
|--------|----------|-------|----------|
| Aspirin | 544 | Anti-inflammatory, anti-estrogen. Could be anchor. | [[inflammation]], [[estrogen]] |
| Caffeine | 66 | Coffee's active compound. | [[coffee]] |
| Antibiotics | 205 | Gut effects, appropriate use. | [[digestion]], [[endotoxin]] |
| Vaccines | 171 | Peat's concerns. | [[immune system]] |
| Cyproheptadine | 50 | Anti-serotonin drug. | [[serotonin]] |
| LSD | 64 | Serotonin antagonist, research. | [[serotonin]] |

#### People Satellites
| Entity | Mentions | Scope | Links To |
|--------|----------|-------|----------|
| Gilbert Ling | 101 | Cell water, association-induction. | [[metabolism]], [[potassium]] |
| Hans Selye | 68 | Stress research, catatoxic steroids. | [[stress]], [[cortisol]] |
| Otto Warburg | 43 | Cancer metabolism research. | [[cancer]], [[Warburg effect]] |
| Broda Barnes | 46 | Thyroid diagnosis pioneer. | [[thyroid]], [[hypothyroidism]] |
| Linus Pauling | 63 | Vitamin C, orthomolecular. | [[vitamin C]] |
| Darwin | 66 | Evolution critique. | [[evolution]] |
| Lamarck | 47 | Inheritance of acquired traits. | [[evolution]], [[genetics]] |
| Vernadsky | 56 | Biosphere, cosmic biology. | [[bioenergetics]] |
| William Blake | 60 | Philosophy, quotes. | [[consciousness]] |

#### Concepts Satellites
| Entity | Mentions | Scope | Links To |
|--------|----------|-------|----------|
| Endotoxin | 121 | Bacterial toxins, gut barrier. | [[digestion]], [[inflammation]] |
| Antioxidants | 170 | What they are, which ones matter. | [[vitamin E]], [[oxidation]] |
| Carbon Dioxide | 28 | Protective gas, Bohr effect. | [[respiration]], [[metabolism]] |
| Free Radicals | 56 | Oxidative damage. | [[PUFA]], [[oxidation]] |
| Energy | 108 | Core concept in Peat's framework. | [[metabolism]], [[bioenergetics]] |
| Bioenergetics | 7 | Peat's central framework. | [[metabolism]], [[energy]] |
| Learned Helplessness | 43 | Seligman, stress research. | [[stress]], [[serotonin]] |
| Stem Cells | 31 | Regeneration potential. | [[regeneration]], [[cancer]] |
| Genetic Determinism | 32 | Peat's critique. | [[genetics]], [[evolution]] |
| Longevity | 29 | What actually extends life. | [[aging]], [[metabolism]] |
| Age Pigment | 27 | Lipofuscin, PUFA accumulation. | [[PUFA]], [[aging]] |
| Reductive Stress | 27 | Opposite of oxidative stress. | [[oxidation]] |
| Nitric Oxide | 23 | Stress marker, not always good. | [[stress]], [[inflammation]] |
| Exosomes | 40 | Cellular communication. | [[cell division]] |
| pH | 35 | Acid-base balance. | [[carbon dioxide]], [[respiration]] |
| Toxins | 24 | General category. | [[endotoxin]], [[detoxification]] |
| Consciousness | 89 | Peat's philosophical interests. | [[brain]], [[William Blake]] |
| Authoritarianism | 27 | Science and politics. | [[genetic determinism]] |
| Precautionary Principle | 43 | Risk assessment. | — |
| Nutrition | 38 | General framework. | [[metabolism]] |
| Evolution | 24 | Peat's heterodox views. | [[Darwin]], [[Lamarck]] |
| Genetics | 27 | Critique of determinism. | [[genetic determinism]] |
| Entropy | 25 | Thermodynamics, life. | [[bioenergetics]] |

#### Beverages Satellites
| Entity | Mentions | Scope | Links To |
|--------|----------|-------|----------|
| Water | 355 | Structured water, hydration. | [[Gilbert Ling]] |
| Juice | 46 | General category. | [[orange juice]], [[fruit]] |
| Tea | 41 | Concerns and benefits. | [[caffeine]] |
| Beer | 33 | Estrogenic concerns. | [[estrogen]], [[alcohol]] |
| Alcohol | 59 | Metabolic effects. | [[liver]] |

---

### TIER 3: STUB ARTICLES (40)

Brief entries (200-500 words) that primarily redirect to more comprehensive articles.

These include:
- Minor mechanisms (absorption, detoxification, circulation, growth, immunity)
- Narrow concepts (ascorbic acid → [[vitamin C]])
- Overlapping terms (resolved by redirects)

---

## Scope Definitions

### How to Use This Section

When writing an article, check its scope definition here. The scope tells you:
1. What this article MUST cover (owned content)
2. What to DELEGATE via links (not owned)
3. Key quotes/concepts that belong HERE

### Anchor Article Scopes

#### Estrogen
**Owns:**
- Definition and forms (estrone, estradiol, estriol)
- Why Peat considers it harmful (hypoxia, proliferation, excitation)
- Sources (endogenous, environmental, dietary)
- How to reduce estrogen (liver, progesterone, thyroid, aspirin)
- Historical suppression of estrogen dangers

**Delegates:**
- Specific form details → [[estradiol]]
- Aromatase enzyme → [[aromatase]]
- Opposition by progesterone → [[progesterone]]
- Breast cancer specifics → [[breast cancer]]

**Key quotes this article owns:**
- "Estrogen causes hypoxia at every imaginable site"
- "Estrogen is the hormone of cellular excitement"

---

#### Thyroid
**Owns:**
- What thyroid hormone does (metabolic rate, oxygen consumption, CO2)
- Hypothyroidism epidemic (why it's missed, symptoms)
- Testing controversies (TSH vs temperature/pulse)
- The thyroid-everything connection

**Delegates:**
- T3 specifically → [[T3]]
- Practical supplementation → [[thyroid supplement]]
- Iodine → [[iodine]]

---

#### PUFA
**Owns:**
- What polyunsaturated fats are (structure, sources)
- Why they're harmful (oxidation, hormone disruption, storage)
- Elimination timeline (years to clear from tissues)
- Historical promotion (seed oil industry)

**Delegates:**
- Randle cycle mechanism → [[Randle cycle]]
- Lipid peroxidation details → [[lipid peroxidation]]
- Fish oil specifically → [[fish oil]]
- Linoleic acid specifically → [[linoleic acid]]
- Safe fats → [[saturated fat]], [[coconut oil]]

---

#### Cancer
**Owns:**
- Peat's metabolic theory of cancer
- Warburg effect (overview)
- Estrogen as carcinogen
- The anti-cancer substances (progesterone, thyroid, aspirin)

**Delegates:**
- Warburg mechanism details → [[Warburg effect]]
- Breast cancer → [[breast cancer]]
- Specific substances → [[progesterone#cancer]], [[aspirin]]

---

#### Serotonin
**Owns:**
- Peat's contrarian view ("not the happiness molecule")
- Harmful effects (gut, brain, blood vessels)
- What raises serotonin (tryptophan, estrogen, PUFA)
- What lowers it (anti-serotonin drugs, progesterone)

**Delegates:**
- Tryptophan → [[tryptophan]]
- Cyproheptadine → [[cyproheptadine]]
- LSD research → [[LSD]]
- Depression → [[depression]]

---

### Satellite Article Scopes

#### Randle Cycle
**Owns:**
- The specific mechanism (fatty acids blocking pyruvate dehydrogenase)
- P.J. Randle's 1963 research
- Why this explains diabetes better than insulin resistance
- The vicious cycle (fatty acids → blocked glucose → more fatty acids)

**Delegates:**
- General PUFA harm → [[PUFA]]
- Diabetes overview → [[diabetes]]
- Niacin lowering FFAs → [[niacin]]

**Key quotes this article owns:**
- "There are two clear points where free fatty acids inhibit the use of glucose"
- "The rising blood sugar shouldn't be fought in itself"

---

#### Gilbert Ling
**Owns:**
- Biography and career
- Association-Induction Hypothesis
- Cell water structure (gel state)
- Sodium-potassium pump critique
- Relationship with Ray Peat

**Delegates:**
- Potassium in cells → [[potassium]]
- Water structure → [[water]]
- General cell metabolism → [[metabolism]]

---

## Writing Order

Articles should be written in dependency order. Write anchors before their satellites.

### Phase 1: Core Anchors (Write First)
1. ~~Progesterone~~ ✅ COMPLETE
2. Estrogen
3. Thyroid
4. PUFA
5. Metabolism
6. Inflammation

### Phase 2: Secondary Anchors
7. Cancer
8. Aging
9. Stress
10. Serotonin
11. Cortisol
12. Diabetes

### Phase 3: Key Satellites
13. Randle Cycle (depends on PUFA, diabetes)
14. T3 (depends on thyroid)
15. Pregnenolone
16. Gilbert Ling
17. Hans Selye
18. Warburg Effect (depends on cancer)

### Phase 4: Remaining Satellites
- Minerals (calcium, magnesium, etc.)
- Vitamins
- Foods
- Conditions
- People
- Concepts

### Phase 5: Stubs
- Brief entries, redirects

---

## Cross-Reference Matrix

Which articles should link to which (key relationships only).

```
estrogen ←→ progesterone (primary opposition)
estrogen → cancer, inflammation, aging, breast cancer
thyroid → metabolism, T3, hypothyroidism, temperature
PUFA → Randle cycle, lipid peroxidation, inflammation
PUFA ←→ saturated fat (contrast)
cancer → Warburg effect, estrogen, metabolism
serotonin → depression, tryptophan, learned helplessness
stress → cortisol, Selye, learned helplessness
aging → PUFA, estrogen, inflammation, degenerative diseases
diabetes → Randle cycle, PUFA, metabolism
```

---

## Batch Processing Protocol

When generating articles in batches:

### Pre-Generation Checklist
1. Check tier classification (anchor/satellite/stub)
2. Read scope definition
3. Identify required cross-links
4. Check if dependencies are written

### Generation Prompt Template
```
Generate a Ray Peat encyclopedia article for: [ENTITY]

Tier: [ANCHOR/SATELLITE/STUB]
Word count: [RANGE]

SCOPE (what this article MUST cover):
[FROM SCOPE DEFINITION]

DELEGATE (link to these, don't explain):
[FROM SCOPE DEFINITION]

STYLE: Follow /wiki/STYLE-GUIDE.md

SOURCES: Draw from newsletters, podcasts, emails, articles, books.
```

### Post-Generation Checklist
1. Verify scope boundaries respected
2. Confirm all required links present
3. Check for redundancy with existing articles
4. Update this document if scope needs adjustment

---

## Revision Log

| Date | Change |
|------|--------|
| 2026-01-14 | Initial creation |

