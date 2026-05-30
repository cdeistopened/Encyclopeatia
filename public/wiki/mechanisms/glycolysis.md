---
title: "Glycolysis"
tldr: "The ten-enzyme cytoplasmic pathway that breaks one molecule of glucose into two molecules of pyruvate. Glycolysis itself is neutral — every cell runs it. The Peat-relevant question is what happens to the pyruvate at the end. Healthy cells push pyruvate into the mitochondrion via [[pyruvate-dehydrogenase|pyruvate dehydrogenase]], oxidize it completely to carbon dioxide, and capture roughly thirty-six ATP per glucose. Stressed cells — hypothyroid, hypoxic, PUFA-loaded, cancerous — short-circuit the pathway at pyruvate and dump it into [[lactic-acid|lactate]], capturing two ATP and broadcasting the stress signal Otto Warburg identified as the metabolic signature of cancer. Glycolysis is the branch point at which the cell either completes oxidation or reverts to the primitive 'slime metabolism' that preceded oxygen-using life."
category: mechanism
tags: [glycolysis, pyruvate, lactate, warburg, pasteur-effect, crabtree-effect, hif, hypoxia, thyroid, peat-central]
sources: ["[[oxidative-metabolism]]", "[[lactic-acid]]", "[[pyruvate-dehydrogenase]]", "[[mitochondria]]", "[[warburg-effect]]", "[[randle-cycle]]", "[[thyroid]]", "[[carbon-dioxide]]", "[[hypoxia]]", "[[glucose]]"]
explored: false
confidence: high
created: 2026-05-20
status: complete
---

# Glycolysis

Glycolysis is the oldest energy pathway in biology — a ten-enzyme cytoplasmic sequence requiring no oxygen, conserved across bacteria, yeast, plants, and every cell of the human body. It takes one molecule of glucose, invests two ATP to phosphorylate and split it, and returns four ATP, two NADH, and two molecules of pyruvate. Net yield: two ATP. The pathway predates the oxygen atmosphere; the rest of cellular respiration was built on top of it, layered atop a foundation that fermenting microbes had been running for two billion years before mitochondria appeared. Every cell in the human body still runs glycolysis. The question Ray Peat treated as the central question of physiology is not whether glycolysis runs but where it terminates. In a healthy, well-oxygenated, thyroid-sufficient cell, pyruvate enters the [[mitochondria]] through [[pyruvate-dehydrogenase|pyruvate dehydrogenase]], is decarboxylated to acetyl-CoA, oxidized through the Krebs cycle, and the electrons it releases are passed down the respiratory chain to oxygen — yielding roughly thirty-six ATP per glucose and producing the [[carbon-dioxide]] that stabilizes the cell. In a stressed, hypothyroid, PUFA-loaded, hypoxic, or cancerous cell, pyruvate is reduced by lactate dehydrogenase to [[lactic-acid|lactate]] — yielding only those original two ATP, dumping the signal Otto Warburg identified as the metabolic signature of cancer, and locking the cell into what Peat called "a very primitive, ancient, under-organized way of using energy."

This is why glycolysis matters to the Peat framework even though Peat almost never wrote about glycolysis in isolation. The pathway is not the problem. The problem is the branch point at its end — the choice between mitochondrial oxidation and lactate fermentation. Every chronic disease state in Peat's framework is, at the substrate level, a story about pyruvate being diverted away from the mitochondrion and into lactate. Diabetes, [[cancer]], [[dementia]], [[heart-disease|heart disease]], [[aging]], and the [[warburg-effect|Warburg effect]] are all expressions of the same enzymatic short-circuit at the end of the glycolytic pathway. The full lactate signaling story (Warburg, HCAR1, lactylation, autocrine signal) lives at [[lactic-acid]]; the gate-enzyme story lives at [[pyruvate-dehydrogenase]]. This page is about the pathway upstream of the gate — the ten reactions that produce the pyruvate, the regulatory logic that governs them, the conditions under which they dominate over respiration, and the interventions that re-couple glycolysis to mitochondrial oxidation.

## The Ten-Enzyme Pathway

Glycolysis can be summarized in a single line:

> glucose + 2 NAD+ + 2 ADP + 2 Pi → 2 pyruvate + 2 NADH + 2 ATP + 2 H2O + 2 H+

The line obscures the architecture. The pathway runs as ten sequential enzymatic reactions, organized into two phases: an investment phase (reactions 1–5) that consumes two ATP to prime the glucose molecule and split it into two three-carbon fragments, and a payoff phase (reactions 6–10) that recovers four ATP and two NADH while producing the pyruvate output. The net yield of two ATP is small compared to the thirty-four additional ATP that mitochondrial oxidation of the pyruvate would deliver. This is the energetic case for not stopping at lactate: a cell that completes oxidation captures roughly eighteen times the energy of a cell that ferments.

Three of the ten enzymes are irreversible and serve as the regulatory points. **Hexokinase** (step 1) phosphorylates glucose to glucose-6-phosphate, locking the molecule into the pathway. It is product-inhibited in most tissues; in the liver the isoform is glucokinase, which is not, so the liver absorbs postprandial glucose in proportion to concentration. **Phosphofructokinase-1 (PFK-1)** (step 3) is the master regulatory enzyme and the rate-limiting step under most conditions. It is allosterically inhibited by ATP and citrate (signals that the cell has enough energy and the Krebs cycle is saturated) and activated by AMP and fructose-2,6-bisphosphate. The Pasteur effect — oxygen restraining glycolysis — operates largely through citrate inhibition of PFK-1. Cancer cells, in which the Pasteur effect fails, characteristically overexpress PFK-1 and adopt isoforms less sensitive to citrate. **Pyruvate kinase** (step 10) catalyzes the final substrate-level phosphorylation. Its M2 isoform predominates in proliferating cells, including cancer, and is allosterically regulated to slow flux at the final step — allowing upstream glycolytic intermediates to be diverted into biosynthesis of nucleotides, amino acids, and membrane lipids.

Two enzymes deserve mention for their cofactor demands. **Glyceraldehyde-3-phosphate dehydrogenase (GAPDH)** (step 6) is the only oxidation step in glycolysis itself, capturing electrons on NAD+ to form NADH. If NAD+ is not regenerated downstream — either by passing electrons to the mitochondrial respiratory chain or by reducing pyruvate to lactate — GAPDH stalls and the pathway halts. The cell's choice between completing respiration and dumping pyruvate into lactate is, at the level of cofactor accounting, a choice about how to regenerate the NAD+ that GAPDH consumes. **Aldolase** (step 4) splits fructose-1,6-bisphosphate into two three-carbon fragments (DHAP and G3P), the geometric center of the pathway. The remaining enzymes — phosphoglucose isomerase, triose phosphate isomerase, phosphoglycerate kinase, phosphoglycerate mutase, enolase — are not regulated steps and run as fast as substrate flows through them.

The output of the ten reactions — two molecules of pyruvate per glucose, plus two NADH and a net two ATP — sits at the cellular branch point. From here the cell decides what kind of organism it wants to be.

## The Branch Point: Pyruvate to Mitochondria or to Lactate

The single most consequential decision a cell makes, in Peat's framework, is what happens to pyruvate at the end of glycolysis. The decision is made by the relative activity of two enzymes competing for the same substrate: [[pyruvate-dehydrogenase|pyruvate dehydrogenase]] (PDH), which feeds pyruvate into the mitochondrion as acetyl-CoA for complete oxidation, and lactate dehydrogenase (LDH), which reduces pyruvate to lactate in the cytoplasm.

When PDH wins the competition, three things happen at once. The carbon skeleton enters the Krebs cycle and is oxidized over several turns to carbon dioxide. The electrons stripped from the carbon are passed down the respiratory chain to oxygen, producing roughly thirty-four additional ATP and water. And the NAD+ consumed by GAPDH upstream is regenerated by the malate-aspartate shuttle that ferries cytoplasmic NADH electrons into the mitochondrion. The net result is complete oxidation of glucose to CO2 and water, the maximum ATP yield, and the production of the [[carbon-dioxide]] that Peat treated as the diagnostic product of healthy metabolism.

When LDH wins, the carbon never enters the mitochondrion. Pyruvate is reduced to lactate at the cost of one NADH per molecule, regenerating the NAD+ that GAPDH consumed upstream. The pathway is now self-sufficient — it can run indefinitely without oxygen, without functioning mitochondria, and without consuming pyruvate for anything other than NAD+ recycling. The cell captures two ATP per glucose and exports lactate, which becomes the metabolic burden of the [[liver]] (which converts it back to glucose via the [[cori-cycle|Cori cycle]] at additional energetic cost) and the autocrine and paracrine signal at the heart of the [[warburg-effect|Warburg effect]]. The full mechanism of lactate as signal lives at [[lactic-acid]]; the [[pyruvate-dehydrogenase|PDH]] regulation that decides the competition lives at its own article.

The competition is decided by four factors that compound: **mitochondrial capacity** (a cell with functional mitochondria has enough PDH and Krebs cycle and respiratory chain to absorb whatever pyruvate glycolysis delivers; a depleted cell backs up at PDH); **oxygen availability** (without a terminal electron acceptor, NADH accumulates and PDH is inhibited by the high NADH/NAD+ ratio); **substrate competition from fatty acids** (the [[randle-cycle|Randle cycle]] — beta-oxidation generates acetyl-CoA and NADH that activate [[pdk|PDK]] and inactivate PDH, even with abundant oxygen); and **hormonal milieu** (thyroid activates PDH transcriptionally and suppresses PDK4; cortisol does the opposite; insulin activates PDH phosphatase).

The branch point is not binary. It is a continuous gradient set by these four inputs. Most tissues, most of the time, send most of their pyruvate to the mitochondrion. A small fraction always ends in lactate even in healthy resting muscle — basal background that is exported, picked up by heart and brain via [[mct1|MCT1]], and oxidized as fuel. The pathology Peat identified is the chronic shift of the gradient toward lactate, sustained over months and years in tissues where local oxidative capacity has fallen below local glycolytic input. The result is not acute hypoxia but a steady-state Warburg pattern in tissues that look outwardly normal.

## Why Glycolysis Dominates in Stress

The Pasteur effect, named for the observation that oxygen suppresses fermentation in yeast, is the textbook normal physiology of the cell. When oxygen is present, mitochondrial respiration restrains the rate of glycolysis (via citrate inhibition of PFK-1, ATP inhibition of PFK-1, and high NADH/NAD+ ratio inhibition of GAPDH) to match the rate at which pyruvate can be oxidized. Glycolysis runs only as fast as the mitochondrion can consume its products. Lactate production stays low because pyruvate clears through PDH before LDH can reduce it.

The pathology of chronic disease is the failure of the Pasteur effect, and the failure has names that vary by context. The [[warburg-effect|Warburg effect]] in cancer is the failure expressed as aerobic glycolysis — fermentation in the presence of oxygen. The Crabtree effect, originally observed in tumor yeast and tumor cells, is the inverse pattern: a flood of glucose into a cell with compromised mitochondria itself suppresses respiration, locking the cell deeper into glycolysis. Peat treated the two as expressions of the same underlying lesion. As he wrote in [[mitochondria-and-mortality-diet-exercise-and-medicine-damaging-or-repairing-respiratory-metabolism|*Mitochondria and Mortality*]]: "The Crabtree effect, which is the suppression of respiration by glycolysis, is often described as the simple opposite of the Pasteur effect, in which respiration limits glycolysis to the rate that allows its product to be consumed oxidatively. But the Pasteur effect is a normal sort of control system; when the Pasteur effect fails, as in cancer, there is glycolysis which is relatively independent of respiration, causing sugar to be consumed inefficiently."

Several conditions push the gradient toward glycolytic dominance.

**Hypothyroidism.** A hypothyroid cell has fewer mitochondria, lower PDH protein levels, higher PDK4 expression (keeping PDH phosphorylated and inactive), slower Krebs cycle turnover, and reduced cytochrome oxidase activity. The whole oxidative apparatus is suppressed, pyruvate piles up at the branch point, and lactate is exported. The cold-handed person with a slow pulse and depressed temperature is, at the cellular level, running on glycolysis with the gate closed — the same metabolic profile as a tumor, expressed across the whole organism. Full mechanism at [[thyroid]]; the daily lactate dashboard at [[lactic-acid]].

**Hypoxia and HIF.** Genuine oxygen deficiency produces immediate lactate shift because the respiratory chain has no terminal electron acceptor. The molecular response is mediated by the transcription factor [[hif|HIF-1α]], which under low oxygen escapes degradation, accumulates in the nucleus, and upregulates glycolytic enzymes, glucose transporters, and lactate dehydrogenase while inducing PDK1. Peat tied this directly to the broader stress picture. In [[cancer-disorder-and-energy|*Cancer: Disorder and Energy*]] he wrote: "Anything that injures a tissue enough to require cells to be replaced causes the activation of a regulatory protein, hypoxia-inducible factor, HIF, which inhibits mitochondrial respiration, causing a shift toward glycolytic metabolism, increasing substances needed for growth. HIF is essential to the healing of any wound. Even glucose deprivation can cause the induction of HIF. Prostaglandins, made from polyunsaturated fatty acids released by stimulation, can cause HIF to increase." HIF is the general regulator of the wound-healing metabolic state — the same state cancer cells adopt and never leave.

**PUFA accumulation.** Polyunsaturated fatty acids drive the Randle effect (full mechanism at [[randle-cycle]] and [[pyruvate-dehydrogenase]]); the load-bearing point here is that chronic PUFA exposure shifts the branch-point gradient toward lactate over years, and PUFA-derived peroxidation products further damage cytochrome oxidase, compounding the shift through a second pathway.

**Aerobic glycolysis in cancer.** Lactate production in the presence of abundant oxygen — the [[warburg-effect|Warburg effect]] — is the defining metabolic feature of essentially every solid tumor. The detailed mechanism (PDK overexpression, PDH suppression, M2 pyruvate kinase, lactylation, HCAR1 signaling) lives at [[lactic-acid]] and [[warburg-effect]]. The unique point for the glycolysis frame: cancer cells have not adopted a new pathway; they have stopped at an old one. As Peat wrote in [[lactate-vs-co2-in-wounds-sickness-and-aging-the-other-approach-to-cancer|*Lactate vs. CO2*]], aerobic glycolysis is simply "the conversion of glucose to lactic acid even in the presence of oxygen. The presence of oxygen normally restrains glycolysis so that glucose is converted to carbon dioxide instead of lactic acid." The tumor is the cell in which the Pasteur effect no longer works.

**Endotoxin-driven inflammation.** LPS from gut bacteria reaches the liver via the portal circulation, activates Kupffer cells, and triggers cytokines (TNF-α, IL-1, IL-6) that induce PDK4 expression and suppress PDH activity — the same Warburg pattern expressed in inflamed liver. Full gut-lactate axis at [[lactic-acid]]. Chronic low-grade inflammation, without hypoxia and without cancer, is sufficient to drive the shift.

The pattern is the same across all five conditions. Glycolysis is not pathological — it is the cell's oldest, most conserved energy pathway. What is pathological is the failure to couple glycolysis to mitochondrial oxidation at its end. The substrate-level lesion is identical: pyruvate diverted to lactate at the branch point, the Pasteur effect overridden, the cell locked into the slime metabolism that preceded oxygen-using life.

## What Blocks the Harmful Glycolytic Shift

The Peat interventions that re-couple glycolysis to mitochondrial oxidation are the same interventions that reverse the Randle cycle and that reactivate PDH — there is no separate "glycolysis treatment," because the pathway itself is not the problem. The interventions work by restoring the conditions under which the cell can complete oxidation rather than stop at lactate. The full mechanisms live at their respective articles; this section summarizes how each acts on the glycolysis-to-respiration coupling specifically.

**[[Thyroid]].** T3 enlarges the mitochondrial sink — increasing PDH transcription, suppressing PDK4 expression, inducing mitochondrial biogenesis, accelerating Krebs cycle turnover. The net effect is to absorb whatever pyruvate glycolysis delivers and restore the Pasteur-effect restraint on PFK-1 via brisker citrate production. As Peat told Josh Rubin in [[2013-07-17-eastwest-healing-eastwest-healing-energy-and-metabolism|the 2013 *EastWest Healing* episode]], thyroid "is the hormone that activates our whole oxidative system and leads to the production of carbon dioxide when it's working properly." A thyroid-sufficient cell does not stop glycolysis at lactate.

**B-vitamins, especially thiamine (B1) and niacinamide (B3).** Thiamine is the cofactor at PDH's E1 active site; without it pyruvate cannot be decarboxylated and lactate accumulates (the lesion behind refeeding syndrome). Niacinamide supplies the NAD+ that both GAPDH and PDH's E3 subunit need, and lowers the circulating fatty acids that activate PDK. In [[regeneration-and-degeneration-types-of-inflammation-change-with-aging|*Regeneration and Degeneration* (2012)]] Peat wrote that "niacinamide, by lowering free fatty acids and regulating the redox system, supporting sugar oxidation, is useful in the whole spectrum of metabolic degenerative diseases." Riboflavin (B2) and pantothenate (B5) round out the cofactor stack. Full B-vitamin detail at [[pyruvate-dehydrogenase]].

**[[Carbon-dioxide|Carbon dioxide]].** CO2 inhibits lactate dehydrogenase, restrains glycolysis via Bohr-effect-mediated oxygen delivery, and stabilizes the mitochondrial protein-water phase. As Peat said in [[2016-07-15-ask-the-herb-doctor-ask-the-herb-doctor-the-metabolism-of-cancer|the July 2016 *Ask the Herb Doctor* episode]]: "Just by increasing CO2 — breathing in a bag for a minute or so several times a day — you will lower your serum lactic acid." The mechanism is autocatalytic: more CO2 → more mitochondrial stability → more capacity to oxidize pyruvate → more CO2.

**[[Aspirin]].** Aspirin inhibits lipolysis (lowering the free fatty acid load driving the Randle effect at PDH) and blocks inflammatory [[prostaglandins]] that would otherwise activate HIF-1α and induce the glycolytic program. Cuesta et al. (2005) showed direct inhibition of NF-κB activation in glycolysis-depleted cells. Peat recommended evening dosing because circulating fatty acids rise during overnight fasting.

**[[Methylene-blue|Methylene blue]].** Methylene blue acts as an alternative electron acceptor for mitochondrial complex III, bypassing damaged upstream complexes and restoring respiratory chain flux. As Peat described in [[2014-12-19-ask-the-herb-doctor-ask-the-herb-doctor-you-are-what-you-eat-2014|the December 2014 *Ask the Herb Doctor* episode]], the result is restored "productive oxidation of glucose, getting electrons to go all the way to form carbon dioxide. It reverses the cancer metabolism — the Warburg metabolism." It does not fix glycolysis; it restores the downstream sink.

**[[Fructose]].** Fructose absorbs intracellular phosphate during fructose-1-phosphate formation, lowering the phosphate pool that activates PDK. As Peat said in [[2014-03-21-ask-the-herb-doctor-ask-the-herb-doctor-diabetes-ii-and-how-to-restore-and-protect-nerves|the 2014 diabetes-and-nerves episode]]: "Fructose absorbs excess phosphate ions... simply lowering the free phosphate in the cell tends to reactivate this crucial enzyme [PDH] at the top of the energy-producing chain." A glass of orange juice is a direct anti-glycolytic-shift intervention.

**PUFA elimination + adequate glucose.** Reducing dietary PUFA over years lowers the chronic Randle pressure (full mechanism at [[pufa]]). Eating frequently — fruit, milk, gelatin — prevents the adrenaline-and-cortisol excursions that mobilize fatty acids during hypoglycemia and drive the shift. As Peat wrote in [[fatigue-aging-and-recuperation|*Fatigue, Aging, and Recuperation* (2013)]]: "Thyroid stimulation of oxygen consumption tends to prevent lactic acid production, because it keeps the cytoplasm in a state of relative oxidation, i.e., it keeps the concentration of NAD+ hundreds of times higher than that of NADH. NADH is required for the conversion of pyruvate to lactate." Keep the NAD+/NADH ratio high and LDH cannot dominate the branch-point competition.

## Tracking Signal

Glycolytic dominance does not require a lab to detect. The same four daily signals catalogued at [[lactic-acid]] (pulse, temperature, breathing rate, recovery time) read the glycolysis-to-respiration ratio from outside the body. A person whose pulse sits around 85, basal temperature near 98.6°F, breathing is slow and nasal, and post-exertion recovery is brisk is almost certainly running glycolysis with PDH wide open — pyruvate flowing into the mitochondrion, CO2 production high, lactate production low. A person with a 65 pulse, cold extremities, sighing chest-dominant breathing, and post-workout exhaustion is almost certainly running the same glycolysis with PDH suppressed — pyruvate diverted to lactate, CO2 low, the slime metabolism in slow chronic operation.

Serum lactate is the direct laboratory readout and is now used clinically to monitor cancer progression, sepsis severity, and exercise intensity. Resting lactate above about 2 mmol/L is the conventional threshold for stress-pattern fermentation; in Peat's framework the threshold is lower, with chronic lactate above 1 mmol/L treated as evidence of the failed Pasteur effect. Total CO2 (or bicarbonate) on a standard metabolic panel is the corollary readout from the other direction — high bicarbonate in a person eating an ordinary diet reflects brisk mitochondrial CO2 production, low bicarbonate reflects the glycolytic shift. The dashboard Peat recommended (pulse, temperature, breathing, recovery) is the home version of the laboratory signal.

The diagnostic question for any chronic condition is whether glycolysis is feeding the mitochondrion or stopping at lactate. In Peat's framework, the answer is rarely "feeding" — most chronic illness is a story about chronic lactate, and the home dashboard reveals it long before the blood draw confirms it.

## Counter-arguments

**The Brooks lactate-shuttle literature.** George Brooks and colleagues, since the 1980s and crystallized in the 2004 cell-to-cell lactate shuttle work, have argued that lactate is a normal physiological fuel rather than a metabolic dead end — produced by fast-twitch fibers via MCT4, picked up by slow-twitch fibers, heart, and brain via MCT1, oxidized as a preferred substrate. The Cori cycle is one limb of a broader shuttle network. The Peatian framing sits uneasily with this literature. The reply offered at [[lactic-acid]] is the autocrine-signaling distinction: the same molecule serves as fuel at low concentrations (Brooks shuttle) and as a stress signal at high local concentrations (Warburg pattern). Whether the Brooks literature fully refutes Peat or merely complicates him is empirically open.

**Exercise glycolysis as adaptation.** Conventional sports physiology treats transient hyperlactatemia during intense exercise as a marker of effective training stimulus — lactate-threshold and HIIT protocols treat it as a feature, not a bug. Peat's position (developed in [[2020-01-20-one-radio-network-one-radio-network-oxygen-saturation-lactic-acid-thyroid-vaccines-pufas|the January 2020 *One Radio Network* interview]]) is that brief spikes during moderate exercise are tolerable, but chronic training at the lactate-producing intensity is destructive — raising cortisol, lowering protective steroids, driving the long-term glycolytic shift. The empirical threshold question is undersettled.

**The biosynthesis case for the Warburg effect.** Modern cancer biology has rehabilitated aerobic glycolysis as an active biosynthetic strategy (Vander Heiden/Cantley interpretation): proliferating cells need glycolytic intermediates for nucleotide, lipid, and amino-acid synthesis, and lactate is the necessary exhaust of a pathway optimized for biosynthesis rather than ATP. The Peatian inversion — mitochondrial dysfunction is causal, the biosynthetic demand downstream — is contested by this literature. The DCA story supports Peat; the oncogene-driven-metabolism story supports orthodoxy. Both can be partly right.

**The pyruvate kinase M2 controversy.** Within mainstream cancer metabolism, the role of the M2 isoform has been debated for a decade. Some studies show M2 expression promotes tumor growth; others show M1 substitution accelerates rather than slows growth. The Peatian framing treats PDH as the central node and leaves pyruvate kinase as a secondary issue. Whether that secondary issue matters therapeutically is undersettled.

**The mainstream view of HIF.** HIF-1α is conventionally framed as an adaptive response to genuine hypoxia. The Peatian framing — that chronic HIF activation in stressed-but-not-hypoxic tissues drives the glycolytic shift, mediated by inflammatory prostaglandins as much as by oxygen deficit — is mechanistically supported but less prominent in clinical practice.

## Data gaps

- **The branch-point quantification problem.** The fraction of glycolytic flux that ends in lactate versus enters the mitochondrion through PDH is set by tissue, thyroid status, substrate availability, and oxygen tension, but the quantitative thresholds at which the shift becomes self-reinforcing are not well characterized. The clinical threshold is the 2 mmol/L line; whether the relevant tissue-level threshold is much lower is undersettled.

- **Pyruvate kinase M2 in non-cancer tissues.** PKM2 expression in proliferating immune cells, embryonic cells, and regenerating hepatocytes suggests a normal feature of biosynthetic expansion. Whether PKM2 in chronic-inflammation tissues (rheumatoid synovium, atherosclerotic plaques, fibrotic liver) is a useful therapeutic target is undersettled.

- **HIF-1α versus HIF-2α isoform specificity.** HIF-1α more strongly induces glycolytic enzymes; HIF-2α more strongly induces angiogenic factors. The Peatian framing treats them as a single pro-glycolytic signal; whether isoform-specific interventions would be more useful than broad HIF inhibition is undersettled.

- **The Crabtree effect's molecular mechanism.** The phenomenon is well-documented but the underlying mechanism remains contested — competition for inorganic phosphate, ADP, and intracellular protons have all been proposed without resolution.

- **Glycolytic inhibitors (2-DG, lonidamine, 3-bromopyruvate).** These have shown preclinical activity but translated poorly because glycolysis is essential to normal tissues. The Peatian framing (restore mitochondrial oxidation, don't inhibit glycolysis) is consistent with this experience, but combination strategies remain undersettled.

- **Tumor-vs-immune-cell glycolysis competition.** Activated T cells require glycolytic flux for effector function; tumor cells deplete the local glucose pool. The therapeutic problem of suppressing tumor glycolysis without suppressing antitumor immunity is unresolved — the Peatian protocol targeting the lactate signal rather than the pathway may have an advantage here, but the comparison has not been made formally.

- **D-lactate versus L-lactate accounting.** Mammalian glycolysis produces L-lactate; gut bacteria produce both. The role of D-lactate in the chronic shift outside short-bowel syndrome is poorly characterized.

## See also

- [[pyruvate-dehydrogenase]] — the gate at the end of glycolysis; the enzyme whose regulation decides the branch point
- [[lactic-acid]] — what glycolysis produces when the gate is closed; Warburg, HCAR1, lactylation, the daily lactate dashboard
- [[oxidative-metabolism]] — the system glycolysis feeds when the gate is open; framework hub
- [[mitochondria]] — where pyruvate goes when PDH is active
- [[warburg-effect]] — cancer's characteristic aerobic glycolysis
- [[randle-cycle]] — how fatty acids force the glycolytic shift via PDK activation
- [[thyroid]] — the hormone that keeps mitochondrial capacity high enough to absorb glycolytic flux
- [[carbon-dioxide]] — the diagnostic product of completed oxidation; inhibits LDH
- [[glucose]] — the substrate at the head of the pathway
- [[hif|HIF-1α]] — the transcription factor that induces glycolytic enzymes under stress
- [[krebs-cycle]] · [[cori-cycle]] · [[mct1|MCT1/MCT4]] — downstream pyruvate fate, hepatic recycling, lactate shuttle
- [[methylene-blue]] · [[niacinamide]] · [[thiamine]] · [[fructose]] · [[aspirin]] — Peat interventions that re-couple glycolysis to oxidation
- [[cancer]] · [[diabetes]] · [[hypothyroidism]] · [[aging]] — disease states defined by chronic glycolytic shift

<!-- BACKLINKS:START -->
## Referenced by

- [[glucose|concepts/glucose]] — …e-dehydrogenase]] - The enzyme that decides whether glucose finishes its burn - [[glycolysis]] - The initial breakdown of glucose -……
- [[metabolic-rate|concepts/metabolic-rate]] — …nt anchor. The mechanism is at [[oxidative-metabolism]] and the failure mode at [[glycolysis]]; the umbrella that ties these together is……
- [[metabolism|concepts/metabolism]] — …rbon dioxide? The favored mode is [[oxidative-metabolism]]; the failure mode is [[glycolysis]]; the difference between them is the……
- [[structured-water|concepts/structured-water]] — …becomes more bulk-like; oxygen and CO2 solubility falls; the cell shifts toward [[glycolysis]] and [[lactic-acid]] production. Estrogen,……
- [[diabetes|conditions/diabetes]] — …ve-metabolism]] — glucose as the preferred fuel, Randle at the concept level. - [[glycolysis]] — the pathway, lactate as the output, the……
- [[energy-production|mechanisms/energy-production]] — …a] sources: ["[[mitochondria]]", "[[oxidative-metabolism]]", "[[metabolism]]", "[[glycolysis]]", "[[pyruvate-dehydrogenase]]",……
- [[lactic-acid|mechanisms/lactic-acid]] — …Metabolic Dead End  When glucose enters a cell, it is first broken down through [[glycolysis]] into pyruvic acid. In a healthy,……
- [[personas|sequences/personas]] — …tive-metabolism]] — the central concept, now legible against its substrate. 12. [[glycolysis]] — the alternative pathway, what cancer cells……
- [[soy|substances/foods/soy]] — …feration]], and the shift from [[oxidative-metabolism|oxidative metabolism]] to [[glycolysis]]--the inefficient energy production pathway……

<!-- BACKLINKS:END -->

## Sources

### Newsletters

- [[lactate-vs-co2-in-wounds-sickness-and-aging-the-other-approach-to-cancer|"Lactate vs. CO2 in Wounds, Sickness, and Aging"]] (2009) — Glossary definitions: aerobic glycolysis, anaerobic glycolysis, Pasteur effect, Crabtree effect, cancer/stress metabolism
- [[mitochondria-and-mortality-diet-exercise-and-medicine-damaging-or-repairing-respiratory-metabolism|"Mitochondria and Mortality"]] (2016) — Crabtree vs. Pasteur effect; glycolysis independent of respiration in cancer; cardiolipin and the respiratory enzyme
- [[cancer-disorder-and-energy|"Cancer: Disorder and Energy"]] (2013) — HIF activation, prostaglandins, and the glycolytic shift; restoration of oxidation
- [[fatigue-aging-and-recuperation|"Fatigue, Aging, and Recuperation"]] (2013) — NAD+/NADH ratio; thyroid maintaining the oxidized cytoplasmic state
- [[regeneration-and-degeneration-types-of-inflammation-change-with-aging|"Regeneration and Degeneration"]] (2012) — Niacinamide and the supporting-sugar-oxidation spectrum
- [[chronic-fatigue|"Chronic Fatigue"]] — PUFA inhibition of cytochrome oxidase; mitochondrial swelling

### Transcripts

- [[2013-07-17-eastwest-healing-eastwest-healing-energy-and-metabolism|*EastWest Healing: Energy and Metabolism*]] (July 2013) — Thyroid activates the oxidative system; CO2 protects against the glycolytic slide
- [[2016-07-15-ask-the-herb-doctor-ask-the-herb-doctor-the-metabolism-of-cancer|*Ask the Herb Doctor: The Metabolism of Cancer*]] (July 2016) — Bag-breathing lowers lactate; "slime metabolism" framing
- [[2014-03-21-ask-the-herb-doctor-ask-the-herb-doctor-diabetes-ii-and-how-to-restore-and-protect-nerves|*Ask the Herb Doctor: Diabetes II and Nerve Protection*]] (KMUD, 2014) — Fructose as phosphate sink reactivating PDH
- [[2014-12-19-ask-the-herb-doctor-ask-the-herb-doctor-you-are-what-you-eat-2014|*Ask the Herb Doctor: You Are What You Eat*]] (December 2014) — Methylene blue reversing Warburg metabolism by restoring electron flow to CO2
- *Generative Energy* #35: CO2, Ketosis, and Mitochondria — Reductive state self-reinforcement; uncoupling and CO2 production

### Books

- [[generative-energy|*Generative Energy*]] (1994) — Warburg and glycolysis vs. respiration as the central question of cancer biology

### Emails

- [[cancer|cancer email exchange]] — Critique of "glycolysis controlled by random diffusion" and chemiosmotic theory; cancer as reductive shift
