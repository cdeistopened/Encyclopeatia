# EncycloPEATia

The complete Ray Peat archive - 770+ podcast transcripts, newsletters, and articles with AI-powered search.

## Features

- **Browse Archive** - Filter by show, year, or search all transcripts
- **Ask Peat** - AI-powered Q&A with source citations
- **Encyclopedia** - Wiki-style entries on bioenergetic topics

## Collection Overview

| Metric | Count |
|--------|-------|
| Total Episodes | 176+ |
| Raw Transcripts | 216 |
| Polished Transcripts | 220 |
| Shows | 13 |
| Total Audio Hours | ~200 hrs |

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + Tailwind CSS v4
- **Backend**: FastAPI + RAG system with Gemini
- **Design**: Warm neobrutalist aesthetic with golden accents
- **Data**: SQLite + vector search

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

## Getting Started

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
pip3 install -r requirements.txt
python3 run.py
```

Open [http://localhost:3000](http://localhost:3000) for the frontend and [http://localhost:8080](http://localhost:8080) for the API.

## Directory Structure

```
app/
├── README.md                    # This file
├── backend/                     # FastAPI server
│   ├── main.py                  # FastAPI application
│   ├── run.py                   # Server runner
│   ├── requirements.txt         # Python dependencies
│   └── rag/                     # RAG system
│       ├── config.py            # Configuration
│       ├── inference.py         # AI inference layer
│       └── vector_store.py      # Vector database
├── frontend/                    # Next.js app
│   ├── src/
│   └── package.json
├── transcripts/                 # Transcript files
│   ├── raw/                     # Original AssemblyAI transcripts
│   └── polished/                # Gemini-cleaned versions
├── contexts/                    # Show-specific speaker info
└── docs/                        # Documentation
```

## API Endpoints

- `GET /` - Health check
- `POST /ask` - Ask questions with AI synthesis
- `POST /search` - Search transcript sections
- `GET /stats` - System statistics

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

## Data Sources

- **Toxinless Forum**: Primary source for Ray Peat interview archive
- **Generative Energy Podcast**: Danny Roddy's YouTube/podcast
- **KMUD Archives**: Ask Your Herb Doctor, Politics and Science

## License

Transcripts are provided for educational and research purposes. Original audio copyright belongs to respective show producers.

---

Built with love for the Ray Peat community.
