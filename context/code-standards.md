# Code Standards

## General

- Keep modules small and single-purpose
- Use barrel exports (`index.ts`) for all component, hook, and utility directories
- Move complex logic out of components into custom hooks
- Prefer named exports over default exports
- Import from directory paths (`@/components`, `@/hooks`, `@/utils`)

## TypeScript

- Strict mode is enabled throughout the project
- Avoid `any` — use explicit interfaces or `unknown` with type guards
- Define `interface` or `type` for all component props
- Validate external input (API request/response) with type guards at system boundaries

## React / Next.js

- Client Components (`"use client"`) for all interactive components
- Server Components only in `layout.tsx` (root layout is the only server component)
- Route handlers in `src/app/api/` for server-side logic (AI generation)
- Keep components as "view-only" — move effects and state transformations to hooks

## State Management

- Single Zustand store at `src/store/usePaletteStore.ts`
- Use targeted selectors: `const colors = usePaletteStore(s => s.colors)` — never destructure the whole store
- Use `persist` middleware only for data that should survive page reloads (favorites)
- Keep store actions pure and focused — complex derived state in selectors or hooks
- Any action that creates or applies the current editor palette must enforce the 2–8 color invariant before updating `colors`
- URL hash restore and favorite palette application are system boundaries and must reject invalid HEX values or unsupported palette sizes
- Semantic role data is user-assigned on `ColorItem.role`, not derived from palette position. New colors, URL hash restores, duplicates, and favorite-applied palettes must default to `role: null`.
- Role assignment must keep role keys unique within the current palette so semantic exports cannot produce duplicate token names.
- Palette role definitions live in `paletteRoles`, are persisted to localStorage, and must keep normalized labels unique.
- Deleting a role must clear matching `ColorItem.role` values from the current palette and palette history snapshots.
- Export formatting must deduplicate generated token names because custom role labels can collide with numbered fallback names.
- All palette export formats must be implemented in `src/utils/export.ts` and reuse the same token-entry generation path so CSS, JSON, Style Dictionary, Tailwind, and shadcn outputs stay aligned.
- WCAG contrast calculations must use relative luminance and contrast ratio utilities from `src/utils/colors.ts`; do not reuse the YIQ `getContrastColor()` helper for accessibility scoring.
- Color harmony generation must use pure utilities in `src/utils/colors.ts` and apply through store actions so locks, roles, URL hash, and palette history stay consistent.
- Palette quality scoring must remain a pure derived calculation in `src/utils/colors.ts`; do not persist score state or make components own scoring formulas.
- Live preview components must derive UI tokens from current colors and semantic roles at render time; do not persist preview-specific token state.
- Color blindness simulation must use pure utilities from `src/utils/colors.ts` and remain preview-only; never mutate current palette colors or export simulated colors unless explicitly requested.
- AI refinement must call the server-side palette generation route with the current palette context, preserve palette size, preserve locked colors, and apply results through the store rather than mutating component state.
- Update `src/utils/roles.ts` whenever default roles or role token-name normalization changes.

## Styling

- Use CSS variables from `globals.css` — no hardcoded hex values in components
- Use `cn()` utility (`clsx` + `twMerge`) for conditional class merging
- Follow Tailwind class ordering convention: Position → Display → Spacing → Size → Typography → Visuals → Transitions
- Use custom utilities (`glass-card`, `glass-pill`, `ai-glow`) for consistent glass-morphism effects
- Avoid arbitrary Tailwind values unless absolutely necessary

## Component Conventions

- All components use named exports via barrel `index.ts`
- Props interfaces are defined in the same file as the component
- Icon-only buttons must have `title` and `aria-label`
- Use semantic HTML (`main`, `header`, `section`, `button`)
- Modals use portal rendering and the `useAccessibleModal` hook

## API Routes

- Validate and parse request input before any logic runs
- Return consistent response shapes (e.g. `{ colors: string[] }`)
- Use type guards for all external input validation
- Server-side only — no client-side direct API calls to external services

## Tooling

- `npm run lint` must run ESLint directly (`eslint .`) with the Next.js flat config exports; do not use the removed `next lint` command
- Run `npm run build`, `npm run lint`, and `npx prettier --check .` before delivering implementation changes

## File Organization

- `src/app/` — Next.js pages, layouts, API routes, global CSS
- `src/components/` — Feature components (one per file, named after component)
- `src/components/ui/` — Reusable UI primitives (Button)
- `src/hooks/` — Custom hooks (one concern per file)
- `src/store/` — Zustand store definitions
- `src/utils/` — Pure utility functions (color math, formatting, classnames)
- `src/lib/` — Third-party library wrappers (currently empty)
- `context/` — AI workflow context files
- `.docs/` — Strategy and task documentation
