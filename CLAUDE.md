# CLAUDE.md - AI Assistant Guide for Ray Peat Radio

## Project Overview

**Ray Peat Radio** is a wiki-style database of Ray Peat podcast transcripts with a frontend for browsing, filtering by show/date, and listening with an attractive audio player.

## Project Status

- **Transcription**: COMPLETE (176 episodes, ~$30 total)
- **Polishing**: IN PROGRESS (220 files need Gemini cleanup)
- **Frontend**: NOT STARTED

## Directory Structure

```
ray-peat-radio/
├── README.md           # Project overview and show inventory
├── CLAUDE.md           # This file
├── transcripts/        # All transcript files
│   ├── ask-the-herb-doctor/
│   │   ├── raw/        # AssemblyAI output
│   │   └── polished/   # Gemini-cleaned
│   ├── politics-and-science/
│   ├── generative-energy/
│   ├── eastwest-healing/
│   ├── one-radio-network/
│   ├── jodellefit/
│   ├── butter-living-podcast/
│   ├── its-rainmaking-time/
│   ├── eluv/
│   ├── source-nutritional-show/
│   ├── voice-of-america/
│   ├── world-puja/
│   ├── other/
│   └── Generative Energy/   # Danny Roddy's podcast (standalone)
├── contexts/           # Show-specific speaker identification
│   ├── ask-the-herb-doctor.md
│   ├── generative-energy.md
│   └── ...
├── docs/
│   └── transcription-progress.md
└── frontend/           # Web app (TBD)
```

## Transcript Format

Each transcript is Markdown with YAML frontmatter:

```yaml
---
title: "Episode Title"
show: ask-the-herb-doctor
date: 2019-11-15
duration: "58:32"
speakers:
  - Speaker Name
audio_url: "https://..."
status: raw | polished
---

[Transcript content with speaker labels]
```

## Shows and Speakers

### Ask Your Herb Doctor (KMUD Radio)
- **Hosts**: Andrew Murray, Sarah Johanneson Murray
- **Guest**: Dr. Raymond Peat
- **Format**: Monthly call-in show
- **Years**: 2008-2019

### Politics and Science (KMUD Radio)
- **Host**: John Barkhausen
- **Guest**: Dr. Raymond Peat
- **Format**: Long-form discussion
- **Years**: 2000-2015

### Generative Energy
- **Host**: Danny Roddy
- **Guests**: Dr. Raymond Peat, Georgi Dinkov, others
- **Format**: Interview podcast
- **Years**: 2020-2024

### EastWest Healing
- **Hosts**: Josh Rubin, Jeanne Rubin
- **Guest**: Dr. Raymond Peat
- **Years**: 2010-2013

### One Radio Network
- **Host**: Patrick Timpone
- **Guest**: Dr. Raymond Peat
- **Years**: 2014-2019

## Context Files

Context files in `/contexts/` provide speaker identification for polishing:

```markdown
# Show Name
Description of the show format.

## Speakers
- **Host Name** - Role description
- **Dr. Raymond Peat** - Guest expert

## Common Mistranscriptions
| Wrong | Correct |
|-------|---------|
| Dr. Pete | Dr. Peat |
| pufa | PUFA |
```

## Frontend Vision (Planned)

### Features
1. **Browse**: Filter by show, year, topic tags
2. **Search**: Full-text search across all transcripts
3. **Read**: Clean reading view with speaker labels
4. **Listen**: Embedded audio player synced to transcript
5. **Compare**: Side-by-side raw vs polished view

### Tech Stack (TBD)
- Framework: Next.js or Astro
- Search: Fuse.js or Algolia
- Audio: Custom player or Plyr
- Styling: Tailwind CSS

## Data Origin

Transcripts were created using the [Verbatim](https://github.com/cdeistopened/Verbatim) transcription tool:
- **Source**: Toxinless Forum archive, YouTube
- **Engine**: AssemblyAI with speaker diarization
- **Polishing**: Gemini 2.5 Flash (thinking mode)

## Commands

```bash
# Count transcripts
find transcripts -name "*.md" | wc -l

# Count raw vs polished
find transcripts -path "*/raw/*.md" | wc -l
find transcripts -path "*/polished/*.md" | wc -l

# List shows
ls transcripts/
```

## Next Steps

1. Complete polishing of remaining raw transcripts
2. Standardize YAML frontmatter across all files
3. Extract audio URLs from Toxinless Forum
4. Design and build frontend
5. Deploy as static site or simple web app
