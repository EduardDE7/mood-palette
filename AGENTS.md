# Project Rules & Architecture Standards

These rules must be followed for all code modifications and additions in this project.

## 1. Export Strategy (Barrel Exports)

- **Rule**: Use group exports from `index.ts` files (barrel exports) for all components and utilities.
- **Implementation**:
  - Each component directory must have an `index.ts`.
  - Prefer named exports over default exports.
  - Import from the directory path (e.g., `@/components` instead of `@/components/ui/button`).

## 2. Styling (shadcn Approach)

- **Rule**: Prioritize CSS variables defined in `globals.css` (or equivalent) over hardcoded Tailwind classes.
- **CSS Variables**: Use standard names like `--primary`, `--background`, `--foreground`, `--accent`, etc.
- **Component Classes**:
  - Minimize the use of arbitrary values (e.g., `bg-[#f0f0f0]`) inside component files.
  - If a specific color or spacing is needed, define it as a CSS variable first if it's reused.
  - Components should remain as "clean" as possible from non-theme-related classes.

## 3. State Management

- Use Zustand for global state.
- Keep store logic separate from UI components.
- Use `persist` middleware for values that should survive reloads (e.g., Favorites).

## 5. Import Ordering

- **Order**:
  1. React and third-party libraries (`lucide-react`, `framer-motion`).
  2. Project aliases (`@/store`, `@/components`, `@/utils`).
  3. Local relative imports.

## 6. Logic & Custom Hooks

- **Rule**: Keep components "view-only" where possible.
- **Implementation**: Move complex `useEffect` logic or data transformations into custom hooks (e.g., `useKeyboardShortcuts.ts`).
- **Benefit**: Improves testability and reuse.

## 7. Performance (Zustand)

- **Rule**: Use targeted selectors instead of destructuring the whole store.
- **Bad**: `const { colors, addColor } = usePaletteStore();`
- **Good**: `const colors = usePaletteStore(s => s.colors);`

## 8. Accessibility (A11y)

- **Rule**: All interactive icon-only buttons MUST have a descriptive `title` and `aria-label`.
- **Rule**: Use semantic HTML (`main`, `header`, `footer`, `section`) to define page structure.

## 9. Tailwind Class Consistency

- **Order**: Position → Display (Flex/Grid) → Spacing (P/M/Gap) → Size (W/H) → Typography → Visuals (BG/Border/Shadow) → Transitions.
- **Benefit**: Easier to scan and debug layout issues.

## 10. Type Safety

- **Rule**: Avoid `any` at all costs. If a type is unknown, use `unknown` and type guards.
- **Props**: Always use `interface` or `type` for component props, even for small components.

## 11. DRY (Don't Repeat Yourself)

- **Rule**: If a piece of logic (color math, regex validation, formatting) is used in 2+ places, extract it to `@/utils`.
- **Naming**: Utils should be pure functions with descriptive names (e.g., `isValidHex`, `formatColorName`).

## 12. Git & Documentation

- **Commits**: Use Conventional Commits (`feat:`, `fix:`, `refactor:`, `style:`, `chore:`).
- **JSDoc**: Use brief JSDoc for complex utility functions or non-obvious component props to help IDE intellisense.
