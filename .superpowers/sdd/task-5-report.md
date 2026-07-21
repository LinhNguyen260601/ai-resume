# Task 5 Report: Upload Route Page

## Status

DONE_WITH_CONCERNS

## Implementation

- Added `src/routes/upload.tsx` with the `/upload` file route and page title.
- Wired `useCvUpload` into the dropzone, progress, parsed-summary review, and
  re-parse flow.
- Wired `useBaseCvs` into the previous uploads list and invalidates the query
  after confirmation before highlighting the newest item.
- Added the specified ResumeAI violet/cyan background orbs, tight heading
  tracking, glass-based child components, and staged page-enter motion.
- Regenerated `src/routeTree.gen.ts`; `/upload` is present in all generated
  route maps and root children.

## Query Provider Check

- Confirmed `getRouter()` creates a per-router `QueryClient` and calls
  `setupRouterSsrQueryIntegration`.
- Confirmed the installed `@tanstack/react-router-ssr-query` integration wraps
  the router with `QueryClientProvider` by default, so `useBaseCvs` and
  `useCvUpload` receive the required provider.

## Verification

- `bun run generate-routes`: passed.
- `bun run test`: passed, 7 test files and 20 tests.
- `bun run build`: passed for client and SSR bundles.
- `bunx prettier --check src/routes/upload.tsx`: passed.
- `git diff --check`: passed.
- IDE diagnostics: no errors in `src/routes/upload.tsx` or
  `src/routeTree.gen.ts`.
- `bunx tsc --noEmit`: blocked only by three pre-existing unused imports in
  `src/router.tsx` (`ReactNode`, `QueryClient`, and `TanstackQueryProvider`).

## Self-Review

- Searched `src/routes/upload.tsx` for arrow functions and anonymous
  `onClick`/`onFile` wrappers; no matches were found.
- All upload and review actions are routed through named handlers.
- Business logic remains in hooks and the CV summary model; the route only
  orchestrates state and presentation.
- Upload errors remain inline through `Dropzone`; no toast behavior was added.
- No server functions were changed.

## Manual Smoke

- Not run because the task marks browser smoke as optional and a configured
  upload API environment was not established for this subtask.

## Concerns

- Full TypeScript verification remains blocked by the unrelated
  `src/router.tsx` unused imports listed above.
- The production build reports an existing large-chunk warning for the upload
  route bundle; the build still completes successfully.

## Important Review Fixes

- Added `useReducedMotion` handling so all three upload-route entry animations
  use `initial={false}` when reduced motion is preferred.
- Added route regressions covering reduced-motion rendering and the base CV
  query error state.
- Replaced the misleading empty state on query failure with a styled,
  accessible alert.
- Removed the three unused imports from `src/router.tsx`.

## Fix Verification

- `bun run test`: passed, 8 test files and 22 tests.
- `bunx tsc --noEmit`: passed with no diagnostics.
- `bunx prettier --check src/routes/upload.tsx src/routes/-upload.test.tsx src/router.tsx`:
  passed.
- `git diff --check`: passed.
