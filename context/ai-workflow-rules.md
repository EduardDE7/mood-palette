# AI Workflow Rules

## Approach

Build this project incrementally. Context files define what
to build, how to build it, and the current state of progress.
Always implement against these specs — do not infer or invent
behavior from scratch.

## Scoping Rules

- Work on one feature unit at a time
- Prefer small, verifiable increments over large changes
- Do not combine unrelated system boundaries in a single step

## When to Split Work

Split an implementation step if it combines:

- UI component changes and store logic changes
- Multiple unrelated components or features
- Behavior not clearly defined in the context files

If a change cannot be verified end to end quickly,
the scope is too broad — split it.

## Handling Missing Requirements

- Do not invent product behavior not defined in the context files
- If a requirement is ambiguous, resolve it in the relevant
  context file before implementing
- If a requirement is missing, add it as an open question
  in `progress-tracker.md` before continuing

## Protected Files

Do not modify the following unless explicitly instructed:

- `src/components/ui/` — shadcn-style UI primitives (Button)
- `src/app/globals.css` — CSS variable tokens and custom utilities
- `.env` — Contains `GROQ_API_KEY` secret

## Keeping Docs in Sync

Update the relevant context file whenever implementation changes:

- System architecture or boundaries (`architecture.md`)
- Storage model decisions (`architecture.md`)
- Code conventions or standards (`code-standards.md`)
- Feature scope (`project-overview.md`)
- UI design tokens (`ui-context.md`)

## Before Moving to the Next Unit

1. The current unit works end to end within its defined scope
2. No invariant defined in `architecture.md` was violated
3. `progress-tracker.md` reflects the completed work
4. `npm run build` passes without errors
5. `npm run lint` passes without errors

## Project-Specific Conventions

- Use Zustand targeted selectors — never destructure the full store
- All components must use named exports via barrel `index.ts`
- Import from directory paths (`@/components`, `@/hooks`, `@/utils`)
- Move complex logic to custom hooks, keep components as view-only
- All interactive icon-only buttons need `title` + `aria-label`
- HEX values are always uppercase `#RRGGBB` — enforce via `normalizeHex()`
- Run `npm run format` before committing if Prettier is configured
