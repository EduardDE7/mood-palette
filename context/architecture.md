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
| Linting    | ESLint 9 + Prettier              | Code quality and formatting                 |

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

- **localStorage**: Favorite colors and named favorite palettes (via Zustand `persist` middleware, key: `palette-favorites`)
- **URL Hash**: Current palette state for sharing (e.g. `#FF0000-00FF00-0000FF`)
- **In-memory only**: Current palette colors, history, generation count, lock states

## External APIs

- **Groq API** (`POST https://api.groq.com/openai/v1/chat/completions`): AI palette generation. Uses `openai/gpt-oss-120b` model. Requires `GROQ_API_KEY` env var. Server-side only via Next.js API route.

## Invariants

1. Palette size is always between 2 and 8 colors — enforced in store actions and API validation
2. HEX values are always normalized to uppercase `#RRGGBB` format via `normalizeHex()`
3. Locked colors are never overwritten by random generation or AI generation
4. Only `favorites` and `favoritePalettes` are persisted to localStorage — current palette and history are session-only
5. URL hash always reflects the current palette state for shareability
6. All interactive icon-only buttons must have `aria-label` and `title` attributes
7. DnD operations validate payloads with type guards before executing mutations
