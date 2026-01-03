# Frontend Implementation Plan

## Design Direction: Warm Neobrutalist (Design 2)

Based on `stitch_home_landing_page (2)/code.html`

### Color Palette
```
primary:          #f0c742  (golden yellow)
background-light: #f8f8f6  (warm off-white)
background-dark:  #221e10  (warm dark brown)
ink:              #1b180d  (near-black brown)
ink-light:        #5c5541  (muted brown)
paper:            #fcfbf8  (cream white)
paper-dim:        #f3f0e7  (dimmed cream)
```

### Typography
- **Display**: Space Grotesk (bold, uppercase headers)
- **Body**: Noto Sans (readable body text)
- **Mono**: For metadata, dates, categories

### Neobrutalist Elements
- 2px black borders
- Hard shadows: `4px 4px 0px 0px #1b180d`
- Hover states: translate + shadow change
- Riso grain texture overlay (optional)
- Dashed dividers

---

## MVP Pages (4 total)

### 1. Encyclopedia Browse (`/encyclopedia`)
**Source design**: `stitch_home_landing_page (3)/code.html`

Components:
- [ ] Header with nav (shared)
- [ ] Breadcrumb
- [ ] Search/filter input
- [ ] Sidebar: Categories, Verdict filters
- [ ] Entry list with verdict badges (Pro-Metabolic, Anti-Metabolic, Contextual)
- [ ] Pagination

Data source: Static JSON or API from backend

### 2. Encyclopedia Entry (`/encyclopedia/[id]`)
**Source design**: `stitch_home_landing_page (1)/code.html`

Components:
- [ ] Hero with title, subtitle, verdict card (tilted)
- [ ] Properties sidebar (tags)
- [ ] Main article content (markdown rendered)
- [ ] Related references (podcast/article links)
- [ ] Caution/warning boxes

Data source: Markdown files from `data/encyclopedia/`

### 3. Podcasts Browse (`/podcasts`)
**Source design**: Adapt from episode card designs

Components:
- [ ] Show cards with external links
- [ ] Episode list by show
- [ ] Date/duration metadata
- [ ] Filter by show

Data source: `episodes.json` + `shows.ts`

### 4. Episode Detail (`/episode/[slug]`)
**Source design**: `stitch_home_landing_page` and `(2)` episode cards

Components:
- [ ] Episode header with show branding
- [ ] Inline audio player (simple)
- [ ] Transcript display (polished/raw toggle)
- [ ] Section navigation
- [ ] External link to original show

Data source: Transcript markdown files

---

## Shared Components

### Layout
- `Header` - Logo, nav, search button
- `Footer` - About, external links, credits
- `Breadcrumb` - Navigation path

### UI Elements
- `VerdictBadge` - YES/NO/CONTEXT with colors
- `Card` - Neobrutalist card wrapper
- `Button` - Primary/secondary with hard shadows
- `Tag` - Category/property tags

---

## Implementation Order

1. **Design System** (30 min)
   - Update `tailwind.config.ts` with warm palette
   - Add custom shadows, fonts
   - Create `globals.css` with shared styles

2. **Shared Layout** (30 min)
   - Header component
   - Footer component
   - Root layout wrapper

3. **Encyclopedia Browse** (1-2 hrs)
   - Static data first
   - Sidebar filters
   - Entry list

4. **Encyclopedia Entry** (1-2 hrs)
   - Dynamic route
   - Markdown rendering
   - Verdict card

5. **Podcasts Browse** (1 hr)
   - Show cards
   - Episode list

6. **Episode Detail** (1-2 hrs)
   - Transcript display
   - Simple audio player
   - Polished/raw toggle

---

## Data Requirements

### Encyclopedia
```typescript
interface EncyclopediaEntry {
  id: string;
  title: string;
  verdict: 'YES' | 'NO' | 'CONTEXT';
  verdict_summary: string;
  category: string;
  excerpt: string;
  content: string; // markdown
}
```

### Episodes
```typescript
interface Episode {
  slug: string;
  title: string;
  show: string;
  date: string;
  duration?: string;
  audioUrl?: string;
  transcriptPath: string;
}
```

---

## Files to Create/Modify

```
frontend/src/
├── app/
│   ├── layout.tsx              # Update with new design
│   ├── globals.css             # Design system styles
│   ├── page.tsx                # Home (later)
│   ├── encyclopedia/
│   │   ├── page.tsx            # Browse page
│   │   └── [id]/
│   │       └── page.tsx        # Entry page
│   ├── podcasts/
│   │   └── page.tsx            # Browse page
│   └── episode/
│       └── [slug]/
│           └── page.tsx        # Detail page
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── ui/
│   │   ├── Card.tsx
│   │   ├── Button.tsx
│   │   ├── VerdictBadge.tsx
│   │   └── Tag.tsx
│   └── encyclopedia/
│       ├── EntryCard.tsx
│       └── Sidebar.tsx
└── data/
    ├── shows.ts               # Already exists
    └── encyclopedia.ts        # Entry metadata
```

---

## External Links (MVP Requirement)

Each page should prominently link to:
- RayPeat.com (articles, newsletters)
- Original podcast show sites
- KMUD Radio archive

Format: Clear "Visit Original" buttons, not hidden in footer
