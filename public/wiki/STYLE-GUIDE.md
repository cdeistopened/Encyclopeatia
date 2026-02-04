# Ray Peat Encyclopedia Style Guide

## Core Principles

This encyclopedia captures Ray Peat's bioenergetic framework. Every article should:
1. Present Peat's perspective as the primary lens (not "mainstream vs. Peat")
2. Weave quotes naturally into flowing prose
3. Link to source episodes using Obsidian-style `[[episode-slug]]` links
4. Connect concepts through `[[wikilinks]]` to build a knowledge graph

---

## Quote Integration (THE KEY DIFFERENCE)

### ❌ BAD: Blockquote Dumping
```markdown
Ray Peat views estrogen as problematic.

> "Estrogen is a stress hormone that promotes aging."
> — Dr. Raymond Peat, Ask Your Herb Doctor (2011)

This shows his negative view.
```

### ✓ GOOD: Woven Prose
```markdown
Ray Peat considers estrogen fundamentally a stress hormone—one that, as he explained in a [[2011-11-18-energy-production-diabetes|2011 interview]], "promotes aging by interfering with oxidative metabolism." Rather than viewing estrogen as protective, Peat argues it creates a cascade of metabolic dysfunction: reduced oxygen consumption, increased lactic acid, and cellular edema.
```

### Quote Weaving Techniques

1. **Attributive clause integration:**
   - "As Peat noted in [[episode-slug|episode title]], 'quote here.'"
   - "Peat describes this as 'quote fragment,' explaining that..."

2. **Mid-sentence integration:**
   - "The mechanism—what Peat calls 'the Randle effect'—blocks glucose oxidation."

3. **Supporting detail:**
   - "This creates a vicious cycle. 'The fatty acids block glucose,' Peat explained, 'and then the liver makes more glucose to compensate.'"

4. **Reserve blockquotes for:**
   - Particularly striking or memorable statements
   - Complex explanations that need full context
   - Maximum 1-2 per major section

---

## Episode Linking

### Format
```markdown
[[episode-slug|Display Title]]
```

### Examples
```markdown
In a [[2011-11-18-energy-production-diabetes|2011 discussion on diabetes]]...
During his [[2014-02-21-diabetes-i|first dedicated episode on diabetes]]...
Peat elaborated on this in [[2010-09-17-sugar-i|Sugar I]]...
```

### Finding Episode Slugs
Episode index is at: `/data/episode-index.txt`
Format: `show|slug|title`

---

## Article Structure

### Typical Flow
1. **Opening hook** - A striking insight or contrarian claim
2. **Core thesis** - What Peat believes and why
3. **Mechanism** - The biology/physiology
4. **Practical implications** - What this means for health
5. **Connections** - Links to related concepts
6. **Sources** - Key episodes/articles

### Section Headers
Use descriptive headers that convey Peat's perspective:

❌ "Peat's View" (generic)
✓ "Estrogen as a Stress Hormone" (specific, conveys the stance)

❌ "Mechanisms"
✓ "How Fatty Acids Block Glucose Oxidation"

---

## Tone and Voice

### Wikipedia-style but with perspective
- Encyclopedic, not promotional
- Authoritative, not hedging
- Present Peat's views as a coherent framework
- Acknowledge contrarian nature without constantly qualifying

### DO
- "Peat argues that..."
- "In Peat's framework..."
- "This explains why Peat recommends..."

### DON'T
- "Ray Peat controversially believes..."
- "While mainstream medicine says X, Peat says Y..." (save for specific contrast sections)
- "Some might disagree, but..."

---

## Wikilinks Strategy

### Link liberally to:
- Related substances: [[progesterone]], [[thyroid]], [[aspirin]]
- Mechanisms: [[oxidative metabolism]], [[Randle cycle]]
- Conditions: [[hypothyroidism]], [[diabetes]]
- People: [[Gilbert Ling]], [[Hans Selye]]
- Episodes: [[2011-11-18-energy-production-diabetes|Energy Production episode]]

### First mention rule
Link concept on first mention in each major section, not every occurrence.

---

## Example: Randle Cycle (Rewritten)

```markdown
# Randle Cycle

The Randle cycle—named after P.J. Randle, who described it in 1963—explains the metabolic competition between glucose and fatty acids for cellular oxidation. In Ray Peat's framework, this mechanism is central to understanding [[diabetes]], [[cancer]], and degenerative disease.

## The Mechanism

When free fatty acids rise in the bloodstream, they inhibit the enzyme pyruvate dehydrogenase, blocking cells from oxidizing [[glucose]]. As Peat explained in a [[2010-09-17-sugar-i|2010 episode on sugar]], hospitals discovered this dramatically when they began feeding patients intravenous fat emulsions: "About fifteen minutes after injecting this emulsified soy oil, people would get hyperglycemic."

The blockade creates a cascade. Unable to fully oxidize glucose, cells shift to producing [[lactic acid]]—an inefficient process that signals metabolic stress. The body responds by making more glucose, creating the elevated blood sugar seen in diabetes. But the high glucose isn't the cause; it's the compensation.

"To a great extent, the rising blood sugar shouldn't be fought in itself," Peat argues. "The cause that interferes with the use of glucose should be concentrated on." This represents a fundamental inversion of conventional diabetes treatment.

## Why PUFA Makes It Worse

While any fatty acid can trigger the Randle effect, [[polyunsaturated fats]] create unique long-term damage. Peat cites research by Fu showing that the glycated proteins blamed on glucose in diabetics are actually caused more powerfully by PUFA. Unlike [[saturated fats]], which have minimal impact on stress hormones, polyunsaturated fatty acids activate [[cortisol]], [[adrenaline]], and glucagon—all of which release more fatty acids, perpetuating the cycle.

In a [[2011-11-18-energy-production-diabetes|2011 interview]], Peat contrasted butter and corn oil directly: "The butter turns off adrenaline and cortisol, while the corn oil turns them on."

## Practical Implications

The Randle cycle explains why Peat recommends sugar over fat restriction for metabolic problems. Dietary sugar suppresses lipolysis, keeping fatty acids stored where they belong and allowing direct glucose oxidation. Combined with adequate [[thyroid]] function and avoiding PUFA, this can reverse what appears to be insulin resistance.

## See Also

- [[glucose]] - The preferred fuel blocked by fatty acids
- [[PUFA]] - The most problematic fatty acids
- [[diabetes]] - Where this mechanism manifests clinically
- [[Warburg effect]] - Related cancer metabolism

## Sources

- [[2010-09-17-sugar-i|Sugar I]] (KMUD, 2010)
- [[2011-11-18-energy-production-diabetes|Energy Production, Diabetes and Saturated Fats]] (KMUD, 2011)
- [[2014-02-21-diabetes-i|Diabetes I]] (KMUD, 2014)
```

---

## Checklist

Before completing any article:

- [ ] Opening conveys Peat's perspective, not a neutral definition
- [ ] Quotes are woven into prose (max 1-2 standalone blockquotes)
- [ ] Episode links use `[[slug|display]]` format
- [ ] Sections have descriptive headers (not generic)
- [ ] Wikilinks connect to related concepts
- [ ] Sources section lists key episodes/articles
- [ ] Reads like an encyclopedia entry, not a transcript summary
