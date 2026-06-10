# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- Complete — Core application is fully functional

## Current Goal

- Maintain and extend existing features; context files now adapted for AI workflow

## Completed

- Core palette editor (generate, lock, edit, reorder, undo/redo)
- Color shades viewer (21 shades per color)
- Favorites system with named palettes (localStorage persistence)
- Favorites DnD between palettes
- AI palette generation via Groq API
- Export to CSS, Tailwind, and JSON formats
- Shareable URLs via hash routing
- Glass-morphism dark UI with animations
- Accessibility (keyboard shortcuts, focus trapping, aria attributes)
- Maintenance fixes:
  - Current palette size invariant hardened across URL hash restore, initial generation, favorite save, and favorite palette application
  - Initial random palette now writes a shareable URL hash immediately
  - Header mobile icon buttons now include explicit `title` and `aria-label`
  - Lint pipeline updated for Next.js 16 via ESLint CLI and flat config exports
- Custom Button component with 9 variants
- Brand logo with animated gradient SVG
- Modals: ExportModal, SavePaletteModal, SaveFavoriteColorModal
- FavoritesSidebar with inline rename and expand/collapse
- Mobile responsiveness:
  - Vertical stacking of color columns on mobile (< 768px)
  - DnD strategy switches to vertical on mobile
  - Mobile action bar: horizontal row of icon buttons at bottom of each color column
  - Desktop action buttons: vertical sidebar (visible on hover)
  - Touch-friendly: drag activation distance increased to 15px
  - Responsive header: icon-only buttons on mobile, logo text hidden
  - Favorites sidebar: bottom sheet on mobile (slides up), side drawer on desktop
  - Visual drag handle on bottom sheet sidebar
  - Regenerate button: viewport-width on mobile
  - Modal padding and font sizes adjusted for small screens
  - AiPalettePrompt textarea min-height reduced on mobile with spacing
  - Scrollbar hidden on mobile (`scrollbar-width: none` + webkit)
  - `useMediaQuery` hook: SSR-safe via `useSyncExternalStore`
  - HEX input: `inputMode`, `autoCapitalize`, `autoCorrect` attributes for mobile KB
  - Copy button: always visible on mobile with `opacity-80`
  - Shades overlay: reduced padding on mobile, larger text
  - Mobile header and regenerate controls are full-width, square, and participate in layout flow instead of overlapping content
  - Header shadow removed and surface opacity increased to avoid color bleed/glow over bright palette columns
  - Mobile Add Color action scrolls the palette list to the newly appended color
  - Mobile color blocks grow to fill available screen height when there are only a few colors
  - Mobile color shades strip expands directly under the selected color block, can be toggled closed, and opens shade detail bottom sheets
  - Mobile shades strip label block removed so shade swatches use the full width
  - Mobile shades strip supports horizontal touch scrolling with fixed-width swatches
  - Mobile shades strip opens horizontally centered around the base color
  - h-screen fallback for browsers without dvh support

## In Progress

- None currently

## Next Up

- [Future features to be defined — auth system, database persistence, image-based palette extraction]

## Open Questions

- Should the auth system use Clerk, NextAuth, or a custom solution?
- Should favorites be synced to a backend database?
- Should there be a public gallery for sharing palettes?
- Should the app support image-based palette extraction?

## Architecture Decisions

- **Single Zustand store** over multiple stores: the app state is tightly coupled (palette, history, favorites), one store keeps it simple
- **localStorage persistence only**: no backend yet — favorites survive page reloads via Zustand persist middleware
- **Groq API for AI generation**: chosen for speed and low cost over OpenAI or Anthropic
- **No shadcn CLI**: custom Button component built manually for specific variant needs
- **URL hash for sharing**: lightweight, no server needed, palette instantly restorable

## Session Notes

- Context files (`context/`) have been adapted to the actual Palettrix project as of June 2026
- Placeholder directories exist for future auth and database features: `src/lib/auth/`, `src/app/api/auth/`, `db/migrations/`
- `.env` contains `GROQ_API_KEY` — required for AI palette generation
- June 2026 maintenance pass fixed palette invariant regressions, restored lint execution, and documented guardrails in `architecture.md` and `code-standards.md`
