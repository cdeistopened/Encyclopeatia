# Ray Peat Radio: Project Requirements

## Vision

A wiki-style database of Ray Peat podcast transcripts with an attractive frontend for browsing, filtering by show/date/topic, reading transcripts, and listening to audio with a modern player.

---

## Phase 1: Data Foundation

### 1.1 Transcript Inventory & Audit
- [ ] Audit all 543 files for completeness
- [ ] Verify raw/polished pairs exist for each episode
- [ ] Identify any missing episodes from known shows
- [ ] Standardize file naming convention: `YYYY-MM-DD-show-slug-episode-title.md`

### 1.2 YAML Frontmatter Standardization
Every transcript needs consistent frontmatter:

```yaml
---
title: "Episode Title"
show: ask-the-herb-doctor  # slug matching folder name
date: 2019-11-15
duration: "58:32"
speakers:
  - Andrew Murray
  - Sarah Johanneson Murray
  - Dr. Raymond Peat
audio_url: "https://..."
source_url: "https://toxinless.com/..."  # original forum post
status: polished  # raw | polished
topics:
  - thyroid
  - progesterone
  - PUFA
---
```

### 1.3 Audio URL Extraction
- [ ] Scrape Toxinless Forum for audio file URLs
- [ ] Create `audio/metadata.json` mapping episodes to audio sources
- [ ] Verify audio URLs are still accessible
- [ ] Consider hosting backup copies (S3/Cloudflare R2)

### 1.4 Topic Tagging
- [ ] Define topic taxonomy (thyroid, hormones, nutrition, politics, etc.)
- [ ] Auto-tag transcripts based on keyword analysis
- [ ] Allow manual topic assignment

---

## Phase 2: Frontend MVP

### 2.1 Tech Stack Decision

**Option A: Static Site (Astro/Next.js SSG)**
- Pros: Fast, cheap hosting (Vercel/Netlify), SEO-friendly
- Cons: Rebuild needed for new content

**Option B: Full-Stack (Next.js with API)**
- Pros: Dynamic search, real-time updates
- Cons: More complex, needs database

**Recommendation**: Start with Astro SSG for simplicity, migrate later if needed.

### 2.2 Core Pages

#### Home / Browse
- Grid/list of all episodes
- Filter by: show, year, topic
- Sort by: date, duration, show
- Search box with full-text search

#### Episode Detail
- Clean reading view with speaker labels
- Audio player (if URL available)
- Episode metadata sidebar
- Related episodes
- "Raw" vs "Polished" toggle (if both exist)

#### Show Index
- List of all shows with descriptions
- Episode count and date range per show
- Show artwork/logo if available

#### Search Results
- Full-text search across all transcripts
- Highlight matching terms
- Filter results by show/date/topic

### 2.3 Audio Player
- Embedded HTML5 audio player
- Playback speed control (0.5x - 2x)
- Skip forward/back 15 seconds
- Remember playback position
- Optional: Sync transcript highlighting with audio position

### 2.4 Design System
- Clean, readable typography (similar to Notion/Obsidian)
- Light/dark mode toggle
- Mobile-responsive
- Accessible (WCAG AA)

---

## Phase 3: Enhanced Features

### 3.1 Search & Discovery
- [ ] Implement Fuse.js or Algolia for fuzzy search
- [ ] Add "similar episodes" recommendations
- [ ] Create topic clusters for exploration
- [ ] Add "On This Day" feature showing episodes by date

### 3.2 Reading Experience
- [ ] Highlight/annotate functionality
- [ ] Export selection as quote
- [ ] Share deep links to specific paragraphs
- [ ] Reading progress indicator

### 3.3 User Features (Optional)
- [ ] Favorites/bookmarks (localStorage)
- [ ] Reading history
- [ ] Custom playlists
- [ ] Notes per episode

### 3.4 API Access
- [ ] Public JSON API for episodes
- [ ] RSS feed for new additions
- [ ] Embed widget for external sites

---

## Technical Architecture

### Data Layer
```
/transcripts/
  /{show-slug}/
    /raw/
      YYYY-MM-DD-title.md
    /polished/
      YYYY-MM-DD-title.md

/audio/
  metadata.json  # Maps episode IDs to audio URLs

/data/
  episodes.json  # Generated index of all episodes
  shows.json     # Show metadata
  topics.json    # Topic taxonomy
```

### Build Pipeline
1. Parse all transcript files
2. Extract frontmatter metadata
3. Generate `episodes.json` index
4. Build static pages for each episode
5. Generate search index
6. Deploy to CDN

### Hosting
- **Site**: Vercel or Netlify (free tier)
- **Audio**: Original URLs or Cloudflare R2 backup
- **Domain**: raypeatradio.com (or similar)

---

## Content Guidelines

### Transcript Quality
- Speaker labels should be accurate names (not "Speaker A")
- Common mistranscriptions fixed (Dr. Pete → Dr. Peat)
- Paragraph breaks at natural pauses
- Chapter markers for long episodes (if available)

### Metadata Completeness
- Every episode needs: title, show, date, duration
- Audio URL highly desirable
- Topics optional but helpful for discovery

---

## Success Metrics

### MVP Launch
- [ ] 100+ episodes browsable
- [ ] Full-text search working
- [ ] Audio playback for 50%+ episodes
- [ ] Mobile-responsive design

### Growth
- [ ] All 176+ episodes indexed
- [ ] Topic tagging complete
- [ ] Search usage analytics
- [ ] User feedback mechanism

---

## Open Questions

1. **Domain**: raypeatradio.com? peatarchive.org? Other?
2. **Audio hosting**: Keep original URLs or self-host?
3. **User accounts**: Needed for bookmarks, or localStorage sufficient?
4. **Moderation**: Allow community corrections/annotations?
5. **Legal**: Any copyright concerns with hosting transcripts?

---

## Immediate Next Steps

1. **Audit transcripts**: Run script to verify frontmatter consistency
2. **Extract audio URLs**: Scrape Toxinless Forum
3. **Choose tech stack**: Astro vs Next.js
4. **Design mockups**: Figma or quick HTML prototype
5. **Build MVP**: Home page + episode detail + search

---

## File Structure for Frontend

```
ray-peat-radio/
├── README.md
├── CLAUDE.md
├── docs/
│   ├── PROJECT-REQUIREMENTS.md  # This file
│   └── transcription-progress.md
├── transcripts/           # Existing transcript data
├── contexts/              # Show speaker info
├── frontend/              # New web app
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── layouts/
│   │   └── styles/
│   ├── public/
│   ├── astro.config.mjs
│   └── package.json
├── scripts/               # Build/processing scripts
│   ├── build-index.ts     # Generate episodes.json
│   ├── extract-audio.ts   # Scrape audio URLs
│   └── validate.ts        # Check frontmatter
└── data/                  # Generated data files
    ├── episodes.json
    ├── shows.json
    └── search-index.json
```

---

## Reference Links

- **Source**: [Toxinless Forum Ray Peat Archive](https://toxinless.com/)
- **Inspiration**: [Podcast Transcripts Sites](https://podscripts.co/), [Notion](https://notion.so)
- **Tech**: [Astro](https://astro.build), [Fuse.js](https://fusejs.io), [Plyr](https://plyr.io)
