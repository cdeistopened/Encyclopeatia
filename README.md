# Ray Peat Radio

A wiki-style database of Ray Peat podcast transcripts with an attractive frontend for browsing, filtering, and listening.

## Collection Overview

| Metric | Count |
|--------|-------|
| Total Episodes | 176+ |
| Raw Transcripts | 216 |
| Polished Transcripts | 220 |
| Shows | 13 |
| Total Audio Hours | ~200 hrs |

## Shows Included

| Show | Episodes | Years | Description |
|------|----------|-------|-------------|
| Ask Your Herb Doctor | ~100 | 2008-2019 | Monthly call-in on KMUD Radio with Andrew & Sarah Murray |
| Politics and Science | ~20 | 2000-2015 | John Barkhausen's show on KMUD |
| Generative Energy | ~35 | 2020-2024 | Danny Roddy's podcast (post-Ray Peat) |
| EastWest Healing | ~12 | 2010-2013 | Josh & Jeanne Rubin interviews |
| One Radio Network | ~12 | 2014-2019 | Patrick Timpone interviews |
| Butter Living Podcast | 2 | 2011, 2019 | Casual conversations |
| Jodellefit | 4 | 2019 | Jodelle fitness/nutrition interviews |
| It's Rainmaking Time | 2 | 2011, 2014 | Kim Greenhouse interviews |
| ELUV | 2 | 2008, 2014 | Health radio show |
| Source Nutritional Show | 2 | 2012 | Brain and tissue series |
| Voice of America | 1 | - | Single interview |
| World Puja | 1 | - | Single interview |
| Other | misc | - | Hope for Health, etc. |

## Directory Structure

```
ray-peat-radio/
├── README.md                    # This file
├── transcripts/
│   ├── raw/                     # Original AssemblyAI transcripts
│   │   ├── ask-the-herb-doctor/
│   │   ├── politics-and-science/
│   │   ├── generative-energy/
│   │   └── ...
│   └── polished/                # Gemini-cleaned versions
│       ├── ask-the-herb-doctor/
│       ├── politics-and-science/
│       └── ...
├── audio/                       # Audio files or URLs
│   └── metadata.json            # Episode metadata with audio URLs
├── contexts/                    # Show-specific speaker info
│   ├── ask-the-herb-doctor.md
│   ├── eastwest-healing.md
│   └── ...
├── frontend/                    # Web interface
│   ├── src/
│   └── package.json
└── docs/
    ├── transcription-progress.md
    └── polishing-progress.md
```

## Transcript Format

Each transcript is a Markdown file with YAML frontmatter:

```yaml
---
title: "Ask Your Herb Doctor - Tryptophan"
show: ask-the-herb-doctor
date: 2019-11-15
duration: "58:32"
speakers:
  - Andrew Murray
  - Sarah Johanneson Murray
  - Dr. Raymond Peat
audio_url: "https://..."
status: polished  # raw | polished
---

[Transcript content...]
```

## Frontend Features (Planned)

### Browse & Filter
- Filter by show, year, topic
- Full-text search across all transcripts
- Tag-based navigation (thyroid, progesterone, PUFA, etc.)

### Read
- Clean reading view with speaker labels
- Side-by-side raw vs polished comparison
- Highlight and annotate

### Listen
- Embedded audio player
- Sync playback with transcript position
- Playback speed control

### Discover
- Related episodes
- Topic clustering
- Timeline view

## Data Sources

- **Toxinless Forum**: Primary source for Ray Peat interview archive
- **Generative Energy Podcast**: Danny Roddy's YouTube/podcast
- **KMUD Archives**: Ask Your Herb Doctor, Politics and Science

## Technical Notes

### Transcription
- Engine: AssemblyAI with speaker diarization
- Cost: ~$0.15/hour of audio
- Total cost: ~$30 for full collection

### Polishing
- Engine: Gemini 2.5 Flash (thinking mode)
- Purpose: Fix speaker names, clean up OCR artifacts, improve readability
- Status: In progress

## License

Transcripts are provided for educational and research purposes. Original audio copyright belongs to respective show producers.

---

*This project was bootstrapped from the [Verbatim](https://github.com/cdeistopened/Verbatim) transcription tool.*
