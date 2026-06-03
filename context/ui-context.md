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

- **Main page**: Full-viewport layout with header at top, color columns filling the center, and a floating regenerate bar at the bottom center
- **Header**: Fixed top glass-pill bar with brand logo (left), action buttons (right)
- **Color columns**: Equal-width flex columns spanning full height, each with interactive overlays
- **Favorites sidebar**: Slide-in from right, fixed width glass-card panel
- **Modals**: Portal-rendered centered overlays with backdrop blur, focus trapping via `useAccessibleModal`
- **AI prompt**: Floating glass-card with animated glow border, positioned below the header
- **Regenerate bar**: Bottom-center floating glass-pill with history arrows and action buttons

## Background Effects

Body background uses two subtle radial gradients (top-left purple, bottom-right blue) with `background-attachment: fixed` on the dark base.

## Icons

Lucide React. Stroke-based icons only. Sizes: `h-4 w-4` for inline, `h-5 w-5` for buttons. All icon-only buttons must have `title` and `aria-label`.

## Animations

- Framer Motion for page transitions and sidebar slide-in/out
- CSS `@keyframes` for logo gradient color-cycling on hover (6 animations, all respect `prefers-reduced-motion`)
- CSS `@keyframes glow-spin` for the AI prompt border animation (8s rotation)
- `RegenerateButton` rotates the refresh icon on each palette generation
