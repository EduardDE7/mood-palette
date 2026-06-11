# UI Context

## Theme

Dark-only design. No light mode. The design language is a dark glassmorphism workspace — near-black backgrounds with subtle purple radial gradients, layered translucent surfaces, and vivid accent colors for interactive elements.

## Colors

All color tokens are defined as HSL CSS custom properties in `globals.css`. Components must use these tokens — no hardcoded hex values.

| Role             | CSS Variable         | HSL Value         |
| ---------------- | -------------------- | ----------------- |
| Page background  | `--background`       | `280 6% 7%`       |
| Surface          | `--card`             | `280 6% 10%`      |
| Primary text     | `--foreground`       | `0 0% 100%`       |
| Muted text       | `--muted-foreground` | `280 5% 65%`      |
| Primary accent   | `--primary`          | `260 90% 70%`     |
| Secondary accent | `--accent`           | `359 100% 68%`    |
| Border           | `--border`           | `0 0% 100% / 0.1` |
| Input            | `--input`            | `280 6% 25%`      |
| Ring             | `--ring`             | `260 90% 70%`     |
| Muted surface    | `--muted`            | `280 6% 15%`      |
| Popover          | `--popover`          | `280 6% 10%`      |

## Typography

| Role    | Font   | Variable        | Weights       |
| ------- | ------ | --------------- | ------------- |
| UI text | Ubuntu | `--font-ubuntu` | 400, 500, 700 |

Loaded via `next/font/google`. Applied as `font-sans` utility class.

## Border Radius

| Context          | Token         | Value                |
| ---------------- | ------------- | -------------------- |
| Base radius      | `--radius`    | `0.75rem` (12px)     |
| Large (cards)    | `--radius-lg` | `var(--radius)`      |
| Medium (buttons) | `--radius-md` | `calc(radius - 2px)` |
| Small (chips)    | `--radius-sm` | `calc(radius - 4px)` |

## Custom Utilities

- **`glass-card`** — Translucent card: `bg-card/60`, `backdrop-blur(24px)`, border. Used for modals and sidebar panels.
- **`glass-pill`** — Translucent pill: `bg-muted/40`, `backdrop-blur(12px)`, border. Used for header and floating bars.
- **`ai-glow`** — Animated rotating conic gradient border (primary + accent). Uses `@property --glow-angle` for CSS animation. Intensity increases on `:focus-within`.

## Component Library

Custom components built on Tailwind CSS. Base primitive: `Button` in `src/components/ui/button.tsx` with 9 variants (`default`, `header`, `white`, `outline`, `ghost`, `link`, `action`, `danger`, `premium`) and 5 sizes (`default`, `sm`, `lg`, `icon`, `xl`). Class merging via `cn()` utility (clsx + tailwind-merge).

## Layout Patterns

- **Main page**: Full-viewport layout with header at top, color columns filling the center, and a regenerate bar at the bottom
- **Header**: Fixed top glass-pill bar on desktop; full-width, square, in-flow bar on mobile with brand logo (left), action buttons (right)
- **Color columns**: Equal-width flex columns spanning full height, each with interactive overlays
- **Manual role selector**: Compact uppercase selector above each HEX label; defaults to "No role" and lets the user assign one semantic role per color
- **Role manager modal**: Portal modal opened from color columns for creating, renaming, and deleting roles
- **Contrast checker panel**: Compact WCAG panel for assigned foreground/background, primary/background, and accent/background role pairs; appears bottom-left on desktop and in-flow above regenerate controls on mobile
- **Harmony tools panel**: Compact panel for selecting a base swatch and applying complementary, analogous, triadic, monochrome, or split complementary harmony; appears bottom-right on desktop and in-flow above regenerate controls on mobile
- **Palette quality indicator**: Quiet desktop header pill with a 0–100 score and a popover breakdown for contrast, hue balance, saturation spread, duplicate similarity, and muddy/neon warnings
- **Live preview panel**: Mini product UI preview with sidebar, card, input, buttons, status chip, chart, and normal/deuteranopia/protanopia/tritanopia simulation controls; appears top-left on desktop and in-flow above analysis controls on mobile
- **Mobile shades strip**: In-flow shades overview that expands directly under the selected mobile color block; each shade opens a bottom sheet with color values and an apply action
- **Favorites sidebar**: Slide-in from right, fixed width glass-card panel
- **Modals**: Portal-rendered centered overlays with backdrop blur, focus trapping via `useAccessibleModal`
- **Export modal**: Wrapped format selector supporting CSS, Tailwind config, JSON, `tokens.json`, Tailwind v4, and shadcn theme outputs
- **AI prompt**: Floating glass-card with animated glow border, positioned below the header; supports generation from text plus compact refinement command chips for the current palette
- **Regenerate bar**: Bottom-center floating glass-pill on desktop; full-width, square, in-flow control bar on mobile

## Background Effects

Body background uses two subtle radial gradients (top-left purple, bottom-right blue) with `background-attachment: fixed` on the dark base.

## Icons

Lucide React. Stroke-based icons only. Sizes: `h-4 w-4` for inline, `h-5 w-5` for buttons. All icon-only buttons must have `title` and `aria-label`.

## Animations

- Framer Motion for page transitions and sidebar slide-in/out
- CSS `@keyframes` for logo gradient color-cycling on hover (6 animations, all respect `prefers-reduced-motion`)
- CSS `@keyframes glow-spin` for the AI prompt border animation (8s rotation)
- `RegenerateButton` rotates the refresh icon on each palette generation
