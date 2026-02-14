# train-mustarddata

Korean train schedule static site (train.mustarddata.com). Next.js 16, static export to GitHub Pages.

## Commands

```bash
npm run dev          # Local dev server
npm run build        # Static export build (output: 'export')
npm run lint         # ESLint
npm run fetch-data   # Fetch train data from TAGO API (requires TRAIN_API_KEY env var)
```

## Architecture

**Static-first**: All pages pre-rendered at build time via `generateStaticParams()`. No SSR — deployed to GitHub Pages.

**Data flow**:
```
scripts/fetch-train-data.ts (TAGO TrainInfoService API)
  → data/*.json (stations.json + 4 route files)
  → src/lib/data.ts (module-level Map cache, never invalidated during build)
  → src/lib/slugs.ts (lazy slug↔stationId maps)
  → src/app/*/schedule/**/page.tsx (static generation)
  → Static HTML
```

**Data fetching strategy**: Hub-based — 51 major stations queried against all 347 stations, then reverse routes. Respects TAGO API daily limit of ~10,000 calls. Run manually, not part of build.

## Train Types

| Type | Color | Route File | Includes |
|------|-------|-----------|----------|
| KTX | `emerald-600` | `routes-ktx.json` | KTX, KTX-이음, KTX-산천 |
| SRT | `purple-600` | `routes-srt.json` | SRT |
| ITX | `sky-600` | `routes-itx.json` | ITX-새마을, ITX-청춘, ITX-마음 |
| 무궁화호 | `orange-600` | `routes-mugunghwa.json` | 무궁화호, 누리로, 새마을, 통근열차 |

These colors are used consistently across badges (`globals.css`), tabs (`SearchForm.tsx`), hero gradients, and backgrounds.

## Routing / Slug System

Three route levels per train type:
- `/KTX/schedule/` — list all stations
- `/KTX/schedule/[station]/` — routes from a station (e.g., `/KTX/schedule/서울역/`)
- `/KTX/schedule/route/[route]/` — specific route (e.g., `/KTX/schedule/route/서울역-부산역/`)

**Slug rules** (`src/lib/slug-utils.ts`):
- Strip parentheticals: `울산(통도사)` → `울산`
- Remove whitespace and special chars
- Append `역` if missing: `서울` → `서울역`
- Route slugs join with `-`: `서울역-부산역`

Slugs are URL-encoded in params, decoded in page components. Duplicate station names get stationId suffix.

## Key Files

| Path | Purpose |
|------|---------|
| `src/lib/data.ts` | Data loading with module-level `Map` cache; route merging/dedup |
| `src/lib/slugs.ts` | Lazy slug↔stationId bidirectional maps |
| `src/lib/slug-utils.ts` | Slug generation (normalize, create) |
| `src/lib/types.ts` | TypeScript interfaces (`Station`, `RouteSchedule`, `TrainSchedule`) |
| `src/lib/station-info.ts` | Hardcoded metadata for ~40 major stations (address, phone, facilities) |
| `src/components/SearchForm.tsx` | Client component — train type tabs, station selection |
| `scripts/fetch-train-data.ts` | TAGO API data collector |
| `data/metadata.json` | Last update time, station/route counts |

## Conventions

- **Server components by default**; client components (`'use client'`) only for interactivity (SearchForm, ListClient, Header)
- `trailingSlash: true` in Next.js config — all URLs end with `/`
- Charges formatted as Korean won via `formatCharge()` (e.g., `59,800원`), zero/negative → `요금 미제공`
- Path alias: `@/*` → `./src/*`
- Tailwind CSS v4 with PostCSS plugin

## Station Name Display Rules

`data/stations.json` stores names WITHOUT `역` suffix (e.g., "용산", "서울"). Use `withYeok()` from `slug-utils.ts` for all user-facing text.

```typescript
// Display (title, H1, H2, meta, OG, JSON-LD, breadcrumb, footer)
const name = withYeok(station.stationName);  // "용산" → "용산역"

// Data lookup (getStationInfo, getStationGuide, etc.) — keep raw
getStationInfo(station.stationName);          // uses raw name
```

Never use `station.stationName` directly in UI text — always wrap with `withYeok()`.

## Cross-Train-Type Changes

When modifying any of the 4 train type pages, **always apply the same change to all 4**:
- `src/app/KTX/schedule/` (emerald)
- `src/app/SRT/schedule/` (purple)
- `src/app/ITX/schedule/` (sky)
- `src/app/mugunghwa/schedule/` (orange)

Each has `[station]/page.tsx` (station detail) and `route/[route]/page.tsx` (route detail) — 8 files total. The `stations/[station]/page.tsx` (unified station page) is a 9th file that may also need changes.

## Obsidian Documentation

Project docs live in Obsidian vault at `Daniel/SideJob/Mustarddata/train/`. Update after significant changes:
- `train MOC.md` — checklist of completed work
- `train 개발 로그.md` — detailed changelog
- `train 기술 구현.md` — technical implementation details
- `train SEO 설정.md` — SEO configuration
- `train 페이지 구성.md` — page structure

**Important**: `obsidian_patch_content` with heading targets does not work. Use `obsidian_delete_file` + `obsidian_append_content` to rewrite files.
