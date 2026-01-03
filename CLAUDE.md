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
│   │   ├── raw/        # AssemblyAI output (with timestamps)
│   │   └── polished/   # Gemini-cleaned (with ## section headers)
│   ├── politics-and-science/
│   ├── generative-energy/
│   ├── eastwest-healing/
│   ├── one-radio-network/
│   ├── jodellefit/
│   ├── eluv/
│   └── ...
├── newsletters/
│   └── v2/              # Ray Peat newsletters (Markdown)
├── backend/
│   └── rag/            # RAG search system
│       ├── config.py
│       ├── transcript_parser.py  # Parse markdown by ## headers
│       ├── newsletter_parser.py  # Parse newsletters (v2)
│       ├── vector_store.py       # Qdrant vector DB (local, free)
│       ├── inference.py          # Gemini Flash for Q&A
│       ├── ingest.py             # Index transcripts
│       ├── query.py              # CLI query interface
│       └── data/                 # Vector storage (auto-created)
├── clips/              # Social media clip workflow
│   ├── scripts/        # Python tools for clip creation
│   │   ├── clip.py     # Main CLI (unified interface)
│   │   ├── find_clips.py
│   │   ├── create_project.py
│   │   └── extract_audio.py
│   ├── queue/          # Clips awaiting processing
│   ├── in_progress/    # Clips being edited
│   ├── ready/          # Clips ready for export
│   └── published/      # Archived published clips
├── contexts/           # Show-specific speaker identification
├── docs/
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
- Search: RAG system (backend/rag/) with Qdrant + Gemini
- Audio: Custom player or Plyr
- Styling: Tailwind CSS

## RAG Search System

The `backend/rag/` folder contains a semantic search system:

### Features
- **Section-based indexing** - Chunks by `##` headers, not arbitrary text
- **Rich metadata** - Show, date, speakers, audio URL preserved
- **Vector search** - Qdrant (local, free)
- **AI answers** - Gemini Flash synthesizes answers from sources

### Usage

```bash
cd backend/rag
pip install -r requirements.txt

# Index all polished transcripts
python ingest.py

# Query
python query.py "What does Ray Peat say about calcium?"
python query.py "serotonin" --show ask-the-herb-doctor
python query.py "aspirin" --no-llm  # Search only
```

### Costs
- Qdrant: FREE (local storage)
- Embeddings: FREE (runs locally with sentence-transformers)
- Gemini Flash: ~$0.001 per query (optional, for AI synthesis)

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

## Social Media Clips Workflow

The `clips/` folder contains a workflow for creating short audio clips for social media.

### Workflow

1. **Find** - Scan raw transcripts for clip-worthy segments
2. **Create** - Generate a project folder with transcript, edit notes, captions
3. **Edit** - Review and refine the clip (strikethrough for cuts, italics for moves)
4. **Extract** - Use FFmpeg to cut the audio segment
5. **Publish** - Move to published/ after posting

### Usage

```bash
cd clips/scripts
pip install -r requirements.txt

# Scan transcripts for clip candidates
python clip.py find

# Show details of a candidate
python clip.py show 0

# Create project folder from candidate #0
python clip.py create 0

# Extract audio from project
python clip.py extract 20241208-tryptophan

# List all projects by status
python clip.py list

# Move project between status folders
python clip.py move 20241208-tryptophan in_progress
```

### Clip Criteria

- **Hook Strength (1-10)**: How attention-grabbing is the opening?
- **Arc Quality (1-10)**: Does it contain a complete thought?
- **Standalone Value**: Understandable without context?

### Project Folder Contents

Each clip project in `queue/`, `in_progress/`, etc. contains:
- `metadata.yaml` - Source info, timestamps, scores
- `raw_segment.md` - Full raw transcript
- `edit_notes.md` - Suggested edits with notation
- `caption.md` - Social media caption options
- `extract.sh` - FFmpeg command to extract audio
- `clip.mp3` - Extracted audio (after extraction)

### Dependencies

- FFmpeg (for audio extraction)
- Gemini API key (for LLM analysis)

## Next Steps

1. Complete polishing of remaining raw transcripts
2. Standardize YAML frontmatter across all files
3. Extract audio URLs from Toxinless Forum
4. Design and build frontend
5. Deploy as static site or simple web app
