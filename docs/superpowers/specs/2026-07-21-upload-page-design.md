# Upload Page Design

**Date:** 2026-07-21  
**Status:** Approved for planning  
**Route:** `/upload`  
**Related:** [AI Resume Design](./2026-06-14-ai-resume-design.md), MVP Task 9

## Goal

Let users upload a base CV (PDF/DOCX, max 10MB), see staged progress while the server parses and structures it with AI, confirm a parsed summary, and browse previous uploads — with purposeful motion and named handlers only.

## Decisions

| Topic | Choice |
|-------|--------|
| Scope | Design-spec UX: progress stages + post-parse summary (not Task 9 toast-only) |
| Looks good | Dismiss review state; invalidate previous-uploads list |
| Re-parse | Re-run upload/parse with the same in-memory `File` |
| Architecture | Hook-orchestrated + thin presentational components |
| Progress accuracy | Client-staged around one `parseCvUpload` call (no SSE yet) |
| Errors | Inline under dropzone (no toast dependency for this page) |
| App shell | Out of scope; standalone page layout for now |
| Animation | `motion` — enter, drag glow, progress steps, review spring, list stagger |

## Coding constraint

No anonymous functions for event handlers, mutation callbacks, or state updates.

- Prefer named functions: `function handleDrop(event: DragEvent) { ... }`
- Mutation options use named callbacks: `function handleUploadSuccess(data) { ... }`
- List rendering uses a named function: `function renderCvItem(cv) { ... }`
- Avoid `onClick={() => ...}`, `setState` wrappers without a named function, and inline arrow callbacks in hooks

## Architecture

```
src/routes/upload.tsx              → route + page composition
src/hooks/use-cv-upload.ts         → file, stage, mutation, named actions
src/hooks/use-base-cvs.ts          → listBaseCvs query + invalidate
src/components/upload/
  dropzone.tsx                     → idle drag/drop + file pick
  upload-progress.tsx              → staged progress UI
  parsed-cv-summary.tsx            → review card + Looks good / Re-parse
  previous-uploads-list.tsx        → history list
src/server/cv.ts                   → existing parseCvUpload, listBaseCvs (unchanged)
```

Domain/data stay outside React views. Hooks orchestrate; components render.

### Upload stages

```
idle → uploading → parsing → structuring → review
         ↑______________ Re-parse _______________|
review → idle (+ invalidate list) on Looks good
any busy/idle → idle + error message on failure
```

Stage advances are timed client-side while `parseCvUpload` runs. On success, jump to `review`. On error, return to `idle` with an inline message.

## UI

### Idle — Dropzone

- Dashed glass surface; copy: drag PDF/DOCX or choose file
- Accept `.pdf`, `.docx`; client hint for 10MB (server still validates)
- Dragging: cyan/violet border + glow pulse
- Primary CTA: Choose file (disabled while busy)

### Busy — Progress

Steps (in order):

1. Uploading  
2. Parsing  
3. Structuring (AI) — sparkle icon

Active step: shimmer / glow. Completed steps: check + success color.

### Review — Parsed summary

Show:

- Full name from `content.personal.fullName`
- Experience count (`content.experience.length`)
- Skill count (technical + soft + languages)

Actions:

- **Looks good** — primary CTA; clear review; invalidate `['baseCvs']`
- **Re-parse** — secondary / AI chip with Sparkles; re-mutate same `File`

### Previous uploads

- List below: file name, full name, created date
- Empty: short hint (“No CVs yet”)
- Staggered enter; brief highlight when list refreshes after Looks good

### Layout / visual

- ResumeAI palette (dark base, glass cards, CTA gradient, AI glow)
- Container ~`max-w-2xl`, page title “Upload CV”
- No full app sidebar in this slice

## Motion

| Moment | Behavior |
|--------|----------|
| Page enter | Fade + slight rise: title → dropzone → list |
| Drag | Border/glow pulse toward primary/cyan |
| Progress | Steps animate active → complete; shimmer on structuring |
| Review | Spring-in from below on success |
| List | Staggered fade-in; soft highlight on new/refreshed items |
| CTAs | Hover glow; light press scale |

Use existing `motion` patterns (see landing `ScrollReveal`). Prefer reduced-motion respect via `prefers-reduced-motion` where practical.

## Data flow

1. User selects or drops a file → `useCvUpload.handleFile(file)`  
2. Hook stores `File`, sets stage to `uploading`, starts mutation  
3. `mutationFn` builds `FormData`, calls `parseCvUpload({ data: form })`  
4. While pending, stages tick uploading → parsing → structuring  
5. Success → stage `review`, hold `{ baseCv, content }`  
6. Looks good → reset to idle, `queryClient.invalidateQueries({ queryKey: ['baseCvs'] })`  
7. Re-parse → `mutate(lastFile)` again  
8. `useBaseCvs` powers the previous-uploads list via `listBaseCvs`

## Error handling

| Case | UX |
|------|----|
| Wrong type / too large (client or server) | Inline error; stay idle |
| Low text quality / AI / storage failure | Inline error with server message; stay idle |
| Network / unexpected | Inline generic or `Error.message` |

Dropzone remains usable after error.

## Testing (lightweight)

- Hook: stage transitions on success/error; Looks good clears review; Re-parse reuses last file  
- Optional component smoke: dropzone renders accept attributes  
- Manual: upload PDF/DOCX, watch progress → review → Looks good → list updates; Re-parse; bad file shows error

## Out of scope

- App shell / sidebar navigation  
- Real server-streamed progress  
- Toast library  
- Editing parsed JSON on this page  
- Navigating to Dashboard / New Job after confirm  

## Success criteria

- `/upload` works end-to-end against existing server functions  
- Progress + review + previous list match this spec  
- Motion feels intentional, not noisy  
- All handlers are named functions  
- Design system colors/components used consistently
