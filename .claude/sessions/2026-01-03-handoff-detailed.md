# Ray Peat EncycloPEATia - Detailed Technical Handoff
## Date: 2026-01-03
## Session: Restoration from commit 255893f

## Session Context
User was frustrated with Claude Sonnet 4 making a mess while trying to restore the EncycloPEATia design. They switched to Opus to clean things up. The main complaint: inconsistent UI with some pages using proper EncycloPEATia design while others had Windows 95 or dark Blakean themes.

## Technical Debt Analysis

### 1. CSS Variable Conflicts
Found THREE different variable systems:

**System A: Proper EncycloPEATia (in globals.css)**
```css
--color-primary: #FFD93D
--color-accent: #6B5B95  
--color-paper: #FFF8E1
--color-surface: #FFFEF7
--color-ink: #2C2C2C
--color-ink-muted: #6B6B6B
```

**System B: Undefined Variables (in components)**
```css
var(--background)    /* DOESN'T EXIST */
var(--foreground)    /* DOESN'T EXIST */
var(--border)        /* DOESN'T EXIST */
var(--card)          /* DOESN'T EXIST */
var(--muted)         /* DOESN'T EXIST */
var(--hover)         /* DOESN'T EXIST */
```

**System C: Hardcoded Win95 (in topics page)**
```css
#000080  /* Navy blue */
#c0c0c0  /* Silver */
#808080  /* Gray */
#008080  /* Teal background */
```

### 2. File-by-File Issues

#### `/src/app/topics/page.tsx` - COMPLETE REBUILD NEEDED
- 500+ lines of Windows 95 UI
- Custom Win95Button component
- Custom Win95Window component  
- Hardcoded colors everywhere
- MS Sans Serif font family

#### `/src/components/Sidebar.tsx` - VARIABLE FIXES
```typescript
// Current (BROKEN)
className="bg-[var(--card)] border-[var(--border)]"

// Should be
className="bg-surface border-ink"
```

#### `/src/components/EpisodeTable.tsx` - VARIABLE FIXES
Same issue as Sidebar

#### `/src/app/layout.tsx` - VARIABLE FIXES
```typescript
// Current (BROKEN)
style={{ background: "var(--background)", color: "var(--foreground)" }}

// Should be
className="bg-paper text-ink"
```

### 3. Backup Files to Delete
```
/page copy.tsx
/.env 2
/backend/rag/.env 2
/frontend/src/app/ask/page copy.tsx
```

## API Implementation Status

### Working Endpoints ✅
- `GET /api/episode/[slug]` - Fetches episode with transcripts
- `POST /api/ask` - Placeholder (returns dummy response)

### Broken/Missing Endpoints ❌
- `POST /api/search` - Returns empty array
- `GET /api/stats` - Returns placeholder message
- `/api/topics/*` - Exists but tied to Win95 UI

### Backend FastAPI Status
```python
# /backend/main.py
- ✅ Health check endpoints
- ✅ CORS configuration  
- ❌ RAG implementation (all placeholders)
- ❌ Vector search (Qdrant not connected)
- ❌ LLM integration (Gemini not connected)
```

## Data Structure

### Episodes JSON Structure
```json
{
  "slug": "ask-the-herb-doctor/polished/2022-11-18-...",
  "title": "Episode Title",
  "show": "Ask the Herb Doctor",
  "date": "2022-11-18T00:00:00.000Z",
  "audioUrl": "https://www.toxinless.com/kmud-221118.mp3",
  "speakers": ["Dr. Raymond Peat"],
  "filePath": "ask-the-herb-doctor/polished/...",
  "rawFilePath": "ask-the-herb-doctor/raw/..."
}
```

### Show Data (`/src/data/shows.ts`)
```typescript
{
  id: "ask-the-herb-doctor",
  name: "Ask Your Herb Doctor",
  host: "Andrew Murray & Sarah Johanneson Murray",
  description: "...",
  externalUrl: "https://www.kmud.org/",
  color: "#2a9d8f",
  icon: "radio",
  yearsActive: "2008-2022"
}
```

## Component Architecture

### Context Providers
1. **PlayerContext** - Global audio playback state
   - Current episode
   - Playback controls
   - Progress tracking

### Shared Components
1. **AudioPlayer** - Fixed bottom player ✅
2. **Sidebar** - Navigation (has CSS issues)
3. **EpisodeTable** - Episode list (has CSS issues)

## Git History
- Started from commit 255893f (had proper Ask Peat design)
- Created branch restore-from-255893f
- Merged with conflict resolution
- Applied Railway deployment fixes

## Testing Checklist
- [ ] All pages use bg-paper background
- [ ] No transparent/undefined CSS variables
- [ ] Material Design icons everywhere
- [ ] Consistent border-2 border-ink
- [ ] shadow-hard on interactive elements
- [ ] Topics page rebuilt with EncycloPEATia design
- [ ] Encyclopedia page implemented
- [ ] RAG search connected to backend

## Performance Considerations
- 248 episodes load on initial page
- 770+ transcript files in filesystem
- No pagination implemented
- AudioPlayer persists across navigation

## Security Notes
- API endpoints have no authentication
- CORS allows all origins (*)  
- No rate limiting
- Placeholder API responses

## Migration Path
1. **Phase 1**: Fix CSS variables (2 hours)
2. **Phase 2**: Rebuild topics page (4 hours)
3. **Phase 3**: Implement encyclopedia (6 hours)
4. **Phase 4**: Connect RAG backend (8 hours)

## Deployment Pipeline
```bash
git push origin main
# Railway auto-deploys
# No build errors expected if Node >= 20.9.0
```

## Common Commands
```bash
# Local development
cd frontend && npm run dev

# Check for old UI patterns
grep -r "var(--" src/
grep -r "#000080\|#c0c0c0" src/
grep -r "Win95\|Windows 95" src/

# Find backup files
find . -name "* copy.*" -o -name "* 2"
```

## Final Notes
The user wanted a clean, consistent EncycloPEATia design across all pages. We achieved this for Ask Peat, Podcasts, and Episode pages. Topics page remains completely Windows 95 themed and several components use non-existent CSS variables. The project works but needs cleanup for production quality.