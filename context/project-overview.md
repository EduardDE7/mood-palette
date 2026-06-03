# Palettrix

## Overview

Palettrix is a single-page color palette generator and editor for designers and developers. It generates random palettes, supports manual editing, AI-powered generation via natural language, favorites management, and export to CSS/Tailwind/JSON. The app is built with Next.js 16 (App Router) + React 19 + Tailwind CSS v4.

## Goals

1. Generate and iterate on color palettes with instant visual feedback
2. Save and organize favorite colors and named palette collections
3. Export palettes to production-ready CSS, Tailwind, or JSON formats
4. Share palettes via URL hash

## Core User Flow

1. Open the app — a random 5-color palette is displayed
2. Press Space to regenerate unlocked colors
3. Click HEX labels to manually edit values
4. Lock colors to preserve them across regenerations
5. Click the heart icon to save a color to favorites
6. Open Favorites sidebar to organize colors into named palettes
7. Use AI prompt to generate a palette from a text description
8. Export the palette to CSS variables, Tailwind config, or JSON
9. Copy the URL to share the current palette

## Features

### Palette Generation

- Random palette generation (2–8 colors)
- Color locking (preserves locked colors during regeneration)
- Undo/redo history (Ctrl+Z / Ctrl+Shift+Z)
- Drag-and-drop color reordering
- Inline HEX editing (click to edit, right-click to copy)
- Color shades viewer (21 shades per color: tints + base + darks)
- Add, duplicate, remove colors

### AI Palette Generation

- Natural language prompts (supports any language)
- Powered by Groq API (openai/gpt-oss-120b model)
- Respects locked colors during generation
- Animated glowing border effect on the prompt input

### Favorites & Palettes

- Save individual colors to a default collection
- Create named palette groups
- Save the full current palette to a named group
- Drag-and-drop colors between palettes
- Inline rename, expand/collapse palettes
- Persisted in localStorage

### Export

- CSS custom properties format
- Tailwind config format
- JSON format
- Copy to clipboard
- Export all favorites or current palette

### Shareable URLs

- URL hash auto-updates with current palette (`#HEX1-HEX2-...`)
- Palette restores from URL on page load

### Accessibility

- Full keyboard support (Space, Ctrl+Z, Escape, arrow keys for DnD)
- `aria-label` and `title` on all interactive elements
- Semantic HTML structure
- Focus trapping in modals
- `prefers-reduced-motion` respected for animations

## Scope

### In Scope

- Single-page color palette editor
- Random palette generation
- AI-powered palette generation via Groq API
- Favorites system with named palettes (localStorage)
- Export to CSS/Tailwind/JSON
- Shareable URLs via hash routing
- Drag-and-drop reordering
- Responsive glass-morphism dark UI

### Out of Scope

- User authentication (placeholder directories exist)
- Database storage (no backend persistence beyond localStorage)
- Multi-page routing (single-page app)
- Real-time collaboration
- Image-based palette extraction
- Mobile-native app

## Success Criteria

1. User can generate, edit, lock, and reorder colors in a palette
2. User can save individual colors and named palettes, persisted across sessions
3. User can generate a palette from a natural language description
4. User can export a palette to CSS, Tailwind, or JSON and copy to clipboard
5. User can share a palette via URL and restore it on another device
