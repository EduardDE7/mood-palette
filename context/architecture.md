# Architecture Context

## Stack

| Layer      | Technology                       | Role                                        |
| ---------- | -------------------------------- | ------------------------------------------- |
| Framework  | Next.js 16 + TypeScript          | React framework (App Router, Turbopack)     |
| UI         | Tailwind CSS v4 + clsx           | Utility-first styling, class merging        |
| State      | Zustand 5 + persist              | Global state with localStorage persistence  |
| Animation  | Framer Motion 12                 | Transitions and micro-interactions          |
| DnD        | @dnd-kit/core + sortable         | Drag-and-drop palette and favorites reorder |
| Icons      | Lucide React                     | Stroke-based icon set                       |
| AI Backend | Groq API (openai/gpt-oss-120b)   | Natural language palette generation         |
| Build      | Turbopack (dev) / Webpack (prod) | Fast dev HMR / production build             |
| Linting    | ESLint 9 CLI + Prettier          | Code quality and formatting                 |

## System Boundaries

- `src/app/` — Next.js App Router: root layout, main page, API routes, globals.css
- `src/components/` — All React components (UI primitives in `ui/`, feature components at root)
- `src/hooks/` — Custom hooks for logic separation (DnD, modals, keyboard shortcuts, AI generation)
- `src/store/` — Single Zustand store (`usePaletteStore`) for all global state
- `src/utils/` — Pure utility functions (color math, classnames, reorder, export formatting)
- `src/lib/` — Reserved for auth/library code (currently empty placeholder)
- `public/` — Static assets (logo SVG, screenshots)
- `context/` — AI workflow context files (this directory)
- `db/migrations/` — Reserved for database migrations (currently empty placeholder)

## Storage Model

- **localStorage**: Favorite colors, named favorite palettes, and palette role definitions (via Zustand `persist` middleware, key: `palette-favorites`)
- **URL Hash**: Current palette colors for sharing (e.g. `#FF0000-00FF00-0000FF`). Hash payloads must contain 2–8 valid 6-digit HEX colors; invalid hashes are replaced by a generated palette. Manual semantic roles are not stored in the hash, so restored hash palettes start with no roles assigned.
- **In-memory only**: Current palette colors, manual role assignments, latest 20 palette history snapshots, generation count, lock states

## External APIs

- **Groq API** (`POST https://api.groq.com/openai/v1/chat/completions`): AI palette generation. Uses `openai/gpt-oss-120b` model. Requires `GROQ_API_KEY` env var. Server-side only via Next.js API route.

## Invariants

1. Current palette size is always between 2 and 8 colors — enforced in store actions, URL hash restore, favorite palette application, and API validation
2. HEX values are always normalized to uppercase `#RRGGBB` format via `normalizeHex()`
3. Locked colors are never overwritten by random generation or AI generation
4. Only `favorites`, `favoritePalettes`, and `paletteRoles` are persisted to localStorage — current palette and history are session-only
5. URL hash always reflects the current palette state for shareability, including the initial generated palette
6. All interactive icon-only buttons must have `aria-label` and `title` attributes
7. DnD operations validate payloads with type guards before executing mutations
8. Palette history is capped to the latest 20 snapshots and restores snapshots by index without persisting them to localStorage
9. Semantic palette roles are manually assigned by the user per color; new, restored, duplicated, and favorite-applied colors start with no role. A role can be assigned to at most one current color at a time, and unassigned colors export as numbered support tokens.
10. Palette role definitions are user-manageable: users can create, rename, and delete roles. Role labels must be non-empty and unique after normalization.
11. Deleting a palette role must clear that role from the current palette and all in-memory palette history snapshots so deleted roles cannot reappear through history restore.
12. WCAG contrast checks are derived from assigned semantic roles only; missing foreground/background, primary/background, or accent/background roles show a missing state instead of falling back to palette position.
13. Harmony tools apply through the palette store, preserve color IDs, locks, and roles, update only unlocked HEX values, and commit through palette history and URL hash updates.
14. Palette quality scoring is derived from the current palette only and is not persisted. The score combines contrast, hue balance, saturation spread, duplicate similarity, and muddy/neon tone health.
15. Live preview is derived from current colors and assigned semantic roles only. Missing semantic roles use current-palette fallback swatches, and preview token state is not persisted.
16. Export formatting is centralized in `src/utils/export.ts` and supports CSS variables, Tailwind config, flat JSON, Style Dictionary tokens, Tailwind v4 `@theme`, and shadcn-compatible theme blocks using the same semantic token naming rules.
17. Color blindness simulation is a preview-only transform for deuteranopia, protanopia, and tritanopia; it must not mutate palette colors, role assignments, URL hash, history, or export output.
18. AI refinement uses the existing palette as source material, preserves the current palette size, preserves locked colors exactly at their indices, and applies through `applyGeneratedPalette()` so IDs, roles, history, and URL hash stay consistent.
