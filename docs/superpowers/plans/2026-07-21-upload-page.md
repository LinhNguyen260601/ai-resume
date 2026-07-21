# Upload Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `/upload` with drag-and-drop CV upload, client-staged progress, parsed summary confirmation, previous-uploads list, and purposeful `motion` animations.

**Architecture:** Thin presentational components under `src/components/upload/`; orchestration in `useCvUpload` and `useBaseCvs`; domain helpers for summary stats and client file checks; existing `parseCvUpload` / `listBaseCvs` server functions unchanged.

**Tech Stack:** TanStack Start/Router/Query, React 19, `motion`, shadcn Button/Card, Vitest + Testing Library, ResumeAI design tokens in `src/styles.css`.

## Global Constraints

- No anonymous event handlers, mutation callbacks, or setState wrappers — every callback is a named `function`.
- Named list render helpers (e.g. `function renderCvItem(cv) { ... }`), not inline arrows in JSX props where avoidable.
- ResumeAI palette only (`#0B0F19`, glass cards, CTA gradient, AI glow); AI actions use Lucide `Sparkles`.
- Max file 10MB; MIME PDF or DOCX only (`CV_UPLOAD_MAX_BYTES`, `CV_UPLOAD_MIME_TYPES`).
- Errors are inline (no toast library).
- No app shell/sidebar in this plan.
- Prefer `#/` import alias; kebab-case component filenames matching the repo.
- Commits use Conventional Commits; only commit when the user requests it — plan steps still show suggested messages.

## File Structure

| File | Responsibility |
|------|----------------|
| `src/models/cv-summary.ts` | Pure summary stats from `CvContent` |
| `src/models/cv-upload-file.ts` | Pure client-side file validation messages |
| `src/hooks/use-cv-upload.ts` | Upload mutation, stages, last file, review/error, named actions |
| `src/hooks/use-base-cvs.ts` | List query + invalidate helper |
| `src/components/upload/dropzone.tsx` | Drag/drop + file input UI |
| `src/components/upload/upload-progress.tsx` | Three-step progress UI |
| `src/components/upload/parsed-cv-summary.tsx` | Review card + actions |
| `src/components/upload/previous-uploads-list.tsx` | History list |
| `src/routes/upload.tsx` | Page composition + enter motion |
| `src/lib/query-keys.ts` | Shared query key for base CVs |
| Tests colocated as `*.test.ts` / `*.test.tsx` |

---

### Task 1: Domain helpers — CV summary + client file validation

**Files:**
- Create: `src/models/cv-summary.ts`
- Create: `src/models/cv-summary.test.ts`
- Create: `src/models/cv-upload-file.ts`
- Create: `src/models/cv-upload-file.test.ts`

**Interfaces:**
- Consumes: `CvContent` from `#/lib/schemas/cv`; `CV_UPLOAD_*` from `#/lib/schemas/cv-upload`
- Produces:
  - `type CvSummaryStats = { fullName: string; experienceCount: number; skillCount: number }`
  - `function summarizeCvContent(content: CvContent): CvSummaryStats`
  - `function validateCvUploadFile(file: File): string | null` — `null` if ok, else error message

- [ ] **Step 1: Write failing tests for summary + validation**

```typescript
// src/models/cv-summary.test.ts
import { describe, expect, it } from 'vitest'
import type { CvContent } from '#/lib/schemas/cv'
import { summarizeCvContent } from './cv-summary'

function makeContent(overrides: Partial<CvContent> = {}): CvContent {
  return {
    personal: {
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      summary: 'Mathematician',
    },
    experience: [
      {
        id: '1',
        company: 'Analytical Engines',
        title: 'Engineer',
        startDate: '1840',
        bullets: ['Wrote notes'],
      },
    ],
    education: [],
    skills: {
      technical: ['Math', 'Logic'],
      soft: ['Communication'],
      languages: ['English'],
    },
    ...overrides,
  }
}

describe('summarizeCvContent', () => {
  it('returns name, experience count, and combined skill count', () => {
    const stats = summarizeCvContent(makeContent())
    expect(stats).toEqual({
      fullName: 'Ada Lovelace',
      experienceCount: 1,
      skillCount: 4,
    })
  })

  it('treats missing soft/languages as empty', () => {
    const stats = summarizeCvContent(
      makeContent({
        skills: { technical: ['Math'] },
      }),
    )
    expect(stats.skillCount).toBe(1)
  })
})
```

```typescript
// src/models/cv-upload-file.test.ts
import { describe, expect, it } from 'vitest'
import { validateCvUploadFile } from './cv-upload-file'

describe('validateCvUploadFile', () => {
  it('returns null for a valid PDF under 10MB', () => {
    const file = new File(['x'], 'cv.pdf', { type: 'application/pdf' })
    expect(validateCvUploadFile(file)).toBeNull()
  })

  it('rejects unsupported mime type', () => {
    const file = new File(['x'], 'cv.txt', { type: 'text/plain' })
    expect(validateCvUploadFile(file)).toBe('Only PDF and DOCX allowed')
  })

  it('rejects files over 10MB', () => {
    const file = new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'big.pdf', {
      type: 'application/pdf',
    })
    expect(validateCvUploadFile(file)).toBe('File too large (max 10MB)')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun run test src/models/cv-summary.test.ts src/models/cv-upload-file.test.ts`

Expected: FAIL (modules not found / exports missing)

- [ ] **Step 3: Implement domain helpers**

```typescript
// src/models/cv-summary.ts
import type { CvContent } from '#/lib/schemas/cv'

export type CvSummaryStats = {
  fullName: string
  experienceCount: number
  skillCount: number
}

export function summarizeCvContent(content: CvContent): CvSummaryStats {
  const soft = content.skills.soft?.length ?? 0
  const languages = content.skills.languages?.length ?? 0
  return {
    fullName: content.personal.fullName,
    experienceCount: content.experience.length,
    skillCount: content.skills.technical.length + soft + languages,
  }
}
```

```typescript
// src/models/cv-upload-file.ts
import {
  CV_UPLOAD_MAX_BYTES,
  CV_UPLOAD_MIME_TYPES,
} from '#/lib/schemas/cv-upload'

export function validateCvUploadFile(file: File): string | null {
  if (!(CV_UPLOAD_MIME_TYPES as readonly string[]).includes(file.type)) {
    return 'Only PDF and DOCX allowed'
  }
  if (file.size > CV_UPLOAD_MAX_BYTES) {
    return 'File too large (max 10MB)'
  }
  return null
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun run test src/models/cv-summary.test.ts src/models/cv-upload-file.test.ts`

Expected: PASS

- [ ] **Step 5: Commit (when user requests)**

```bash
git add src/models/cv-summary.ts src/models/cv-summary.test.ts src/models/cv-upload-file.ts src/models/cv-upload-file.test.ts
git commit -m "$(cat <<'EOF'
feat(upload): add cv summary and client file validation helpers

EOF
)"
```

---

### Task 2: Query key + `useBaseCvs`

**Files:**
- Create: `src/lib/query-keys.ts`
- Create: `src/hooks/use-base-cvs.ts`

**Interfaces:**
- Consumes: `listBaseCvs` from `#/server/cv`
- Produces:
  - `export const baseCvsQueryKey = ['baseCvs'] as const`
  - `function useBaseCvs()` → `{ data, isLoading, isError, error, invalidate }`
  - `invalidate(): Promise<void>` calls `queryClient.invalidateQueries({ queryKey: baseCvsQueryKey })`

- [ ] **Step 1: Add query key module**

```typescript
// src/lib/query-keys.ts
export const baseCvsQueryKey = ['baseCvs'] as const
```

- [ ] **Step 2: Implement `useBaseCvs` with named queryFn**

```typescript
// src/hooks/use-base-cvs.ts
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { baseCvsQueryKey } from '#/lib/query-keys'
import { listBaseCvs } from '#/server/cv'

async function fetchBaseCvs() {
  return listBaseCvs()
}

export function useBaseCvs() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: baseCvsQueryKey,
    queryFn: fetchBaseCvs,
  })

  async function invalidate() {
    await queryClient.invalidateQueries({ queryKey: baseCvsQueryKey })
  }

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    invalidate,
  }
}
```

- [ ] **Step 3: Commit (when user requests)**

```bash
git add src/lib/query-keys.ts src/hooks/use-base-cvs.ts
git commit -m "$(cat <<'EOF'
feat(upload): add base Cvs query hook and shared query key

EOF
)"
```

---

### Task 3: `useCvUpload` hook (stages, mutation, named actions)

**Files:**
- Create: `src/hooks/use-cv-upload.ts`
- Create: `src/hooks/use-cv-upload.test.tsx`

**Interfaces:**
- Consumes: `parseCvUpload` from `#/server/cv`; `validateCvUploadFile`; `CvContent`
- Produces:
  - `export type UploadStage = 'idle' | 'uploading' | 'parsing' | 'structuring' | 'review'`
  - `export type ParseCvUploadResult = { baseCv: { id: string; file_name: string; created_at: string }; content: CvContent }`
  - `function useCvUpload(options: { onConfirmed: () => void | Promise<void> })`
  - Return: `{ stage, error, result, isBusy, handleFile, handleLooksGood, handleReParse, clearError }`
  - Stage timing while pending: after start → `uploading`; `STAGE_PARSING_MS = 400` → `parsing`; `STAGE_STRUCTURING_MS = 900` → `structuring`. Clear timers on settle/unmount. On success → `review`. On error → `idle` + message.

- [ ] **Step 1: Write failing hook tests**

```tsx
// src/hooks/use-cv-upload.test.tsx
/** @vitest-environment jsdom */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'

vi.mock('#/server/cv', () => ({
  parseCvUpload: vi.fn(),
}))

import { parseCvUpload } from '#/server/cv'
import { useCvUpload } from './use-cv-upload'

const mockedParse = vi.mocked(parseCvUpload)

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
  return Wrapper
}

function pdfFile() {
  return new File(['pdf'], 'resume.pdf', { type: 'application/pdf' })
}

describe('useCvUpload', () => {
  beforeEach(function resetMocks() {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    mockedParse.mockReset()
  })

  afterEach(function restoreTimers() {
    vi.useRealTimers()
  })

  it('rejects invalid files without calling the server', async () => {
    const onConfirmed = vi.fn()
    const { result } = renderHook(() => useCvUpload({ onConfirmed }), {
      wrapper: createWrapper(),
    })

    const bad = new File(['x'], 'notes.txt', { type: 'text/plain' })
    act(function callHandleFile() {
      result.current.handleFile(bad)
    })

    expect(result.current.error).toBe('Only PDF and DOCX allowed')
    expect(result.current.stage).toBe('idle')
    expect(mockedParse).not.toHaveBeenCalled()
  })

  it('moves to review on success and clears on looks good', async () => {
    const onConfirmed = vi.fn()
    mockedParse.mockResolvedValue({
      baseCv: {
        id: 'cv-1',
        file_name: 'resume.pdf',
        created_at: '2026-07-21T00:00:00.000Z',
      },
      content: {
        personal: {
          fullName: 'Ada',
          email: 'ada@example.com',
          summary: 'x',
        },
        experience: [],
        education: [],
        skills: { technical: ['TS'] },
      },
    })

    const { result } = renderHook(() => useCvUpload({ onConfirmed }), {
      wrapper: createWrapper(),
    })

    act(function startUpload() {
      result.current.handleFile(pdfFile())
    })
    expect(result.current.stage).toBe('uploading')

    await act(async function flushSuccess() {
      await vi.runAllTimersAsync()
    })

    await waitFor(function assertReview() {
      expect(result.current.stage).toBe('review')
      expect(result.current.result?.content.personal.fullName).toBe('Ada')
    })

    await act(async function confirm() {
      await result.current.handleLooksGood()
    })

    expect(result.current.stage).toBe('idle')
    expect(result.current.result).toBeNull()
    expect(onConfirmed).toHaveBeenCalledTimes(1)
  })

  it('re-parses using the same file', async () => {
    const onConfirmed = vi.fn()
    mockedParse.mockResolvedValue({
      baseCv: {
        id: 'cv-1',
        file_name: 'resume.pdf',
        created_at: '2026-07-21T00:00:00.000Z',
      },
      content: {
        personal: {
          fullName: 'Ada',
          email: 'ada@example.com',
          summary: 'x',
        },
        experience: [],
        education: [],
        skills: { technical: [] },
      },
    })

    const { result } = renderHook(() => useCvUpload({ onConfirmed }), {
      wrapper: createWrapper(),
    })
    const file = pdfFile()

    act(function firstUpload() {
      result.current.handleFile(file)
    })
    await act(async function flushFirst() {
      await vi.runAllTimersAsync()
    })
    await waitFor(function assertFirstReview() {
      expect(result.current.stage).toBe('review')
    })

    act(function reparse() {
      result.current.handleReParse()
    })
    expect(mockedParse).toHaveBeenCalledTimes(2)
  })

  it('sets inline error and idle on mutation failure', async () => {
    const onConfirmed = vi.fn()
    mockedParse.mockRejectedValue(new Error('Low text quality'))

    const { result } = renderHook(() => useCvUpload({ onConfirmed }), {
      wrapper: createWrapper(),
    })

    act(function startUpload() {
      result.current.handleFile(pdfFile())
    })
    await act(async function flushError() {
      await vi.runAllTimersAsync()
    })

    await waitFor(function assertError() {
      expect(result.current.stage).toBe('idle')
      expect(result.current.error).toBe('Low text quality')
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test src/hooks/use-cv-upload.test.tsx`

Expected: FAIL (hook module missing)

- [ ] **Step 3: Implement `useCvUpload`**

```typescript
// src/hooks/use-cv-upload.ts
import { useEffect, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import type { CvContent } from '#/lib/schemas/cv'
import { validateCvUploadFile } from '#/models/cv-upload-file'
import { parseCvUpload } from '#/server/cv'

export type UploadStage =
  | 'idle'
  | 'uploading'
  | 'parsing'
  | 'structuring'
  | 'review'

export type ParseCvUploadResult = {
  baseCv: { id: string; file_name: string; created_at: string }
  content: CvContent
}

export const STAGE_PARSING_MS = 400
export const STAGE_STRUCTURING_MS = 900

type UseCvUploadOptions = {
  onConfirmed: () => void | Promise<void>
}

async function uploadCvFile(file: File) {
  const form = new FormData()
  form.append('file', file)
  return parseCvUpload({ data: form }) as Promise<ParseCvUploadResult>
}

export function useCvUpload({ onConfirmed }: UseCvUploadOptions) {
  const [stage, setStage] = useState<UploadStage>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ParseCvUploadResult | null>(null)
  const lastFileRef = useRef<File | null>(null)
  const parsingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const structuringTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function clearStageTimers() {
    if (parsingTimerRef.current !== null) {
      clearTimeout(parsingTimerRef.current)
      parsingTimerRef.current = null
    }
    if (structuringTimerRef.current !== null) {
      clearTimeout(structuringTimerRef.current)
      structuringTimerRef.current = null
    }
  }

  function startStageTimers() {
    clearStageTimers()
    setStage('uploading')
    parsingTimerRef.current = setTimeout(function advanceToParsing() {
      setStage('parsing')
    }, STAGE_PARSING_MS)
    structuringTimerRef.current = setTimeout(function advanceToStructuring() {
      setStage('structuring')
    }, STAGE_STRUCTURING_MS)
  }

  function handleUploadSuccess(data: ParseCvUploadResult) {
    clearStageTimers()
    setResult(data)
    setError(null)
    setStage('review')
  }

  function handleUploadError(err: Error) {
    clearStageTimers()
    setResult(null)
    setError(err.message || 'Upload failed')
    setStage('idle')
  }

  const mutation = useMutation({
    mutationFn: uploadCvFile,
    onSuccess: handleUploadSuccess,
    onError: handleUploadError,
  })

  function beginUpload(file: File) {
    const validationError = validateCvUploadFile(file)
    if (validationError) {
      setError(validationError)
      setStage('idle')
      return
    }
    lastFileRef.current = file
    setError(null)
    setResult(null)
    startStageTimers()
    mutation.mutate(file)
  }

  function handleFile(file: File) {
    beginUpload(file)
  }

  function handleReParse() {
    const file = lastFileRef.current
    if (!file) return
    beginUpload(file)
  }

  async function handleLooksGood() {
    setResult(null)
    setError(null)
    setStage('idle')
    await onConfirmed()
  }

  function clearError() {
    setError(null)
  }

  useEffect(function cleanupTimersOnUnmount() {
    return function onUnmount() {
      clearStageTimers()
    }
  }, [])

  const isBusy =
    stage === 'uploading' || stage === 'parsing' || stage === 'structuring'

  return {
    stage,
    error,
    result,
    isBusy,
    handleFile,
    handleLooksGood,
    handleReParse,
    clearError,
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun run test src/hooks/use-cv-upload.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit (when user requests)**

```bash
git add src/hooks/use-cv-upload.ts src/hooks/use-cv-upload.test.tsx
git commit -m "$(cat <<'EOF'
feat(upload): add useCvUpload hook with staged progress

EOF
)"
```

---

### Task 4: Presentational upload components

**Files:**
- Create: `src/components/upload/dropzone.tsx`
- Create: `src/components/upload/upload-progress.tsx`
- Create: `src/components/upload/parsed-cv-summary.tsx`
- Create: `src/components/upload/previous-uploads-list.tsx`
- Modify: `src/styles.css` (add `.ai-shimmer` if missing)

**Interfaces:**
- Consumes: `UploadStage`, `CvSummaryStats`, Button/Card, `motion`, Lucide icons
- Produces: `Dropzone`, `UploadProgress`, `ParsedCvSummary`, `PreviousUploadsList` with the props shown in the code blocks below

- [ ] **Step 1: Implement `Dropzone` with named handlers and drag glow**

```tsx
// src/components/upload/dropzone.tsx
import { useState } from 'react'
import { motion } from 'motion/react'
import { Upload } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

type DropzoneProps = {
  disabled: boolean
  error: string | null
  onFile: (file: File) => void
}

export function Dropzone({ disabled, error, onFile }: DropzoneProps) {
  const [dragging, setDragging] = useState(false)

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    if (disabled) return
    setDragging(true)
  }

  function handleDragLeave() {
    setDragging(false)
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    if (disabled) return
    const file = event.dataTransfer.files[0]
    if (file) onFile(file)
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) onFile(file)
    event.target.value = ''
  }

  return (
    <motion.div
      animate={
        dragging
          ? { boxShadow: '0 0 0 1px #22D3EE, var(--glow-ai)' }
          : { boxShadow: '0 0 0 0 transparent' }
      }
      transition={{ duration: 0.2 }}
      className={cn(
        'rounded-2xl border-2 border-dashed bg-card/80 p-12 text-center backdrop-blur-md',
        dragging ? 'border-secondary' : 'border-border',
        disabled && 'pointer-events-none opacity-60',
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Upload className="mx-auto mb-4 size-8 text-secondary" aria-hidden />
      <p className="mb-2 text-foreground">
        Drag &amp; drop PDF or DOCX, or choose a file
      </p>
      <p className="mb-6 text-sm text-muted-foreground">Max 10MB</p>
      <Button className="btn-gradient rounded-xl" disabled={disabled} asChild>
        <label className="cursor-pointer">
          Choose file
          <input
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="sr-only"
            disabled={disabled}
            onChange={handleInputChange}
          />
        </label>
      </Button>
      {error ? (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </motion.div>
  )
}
```

- [ ] **Step 2: Implement `UploadProgress` + shimmer CSS**

```tsx
// src/components/upload/upload-progress.tsx
import { Check, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import type { UploadStage } from '#/hooks/use-cv-upload'
import { cn } from '#/lib/utils'

const STEPS = [
  { id: 'uploading', label: 'Uploading' },
  { id: 'parsing', label: 'Parsing' },
  { id: 'structuring', label: 'Structuring', ai: true },
] as const

type BusyStage = Exclude<UploadStage, 'idle' | 'review'>

type UploadProgressProps = {
  stage: BusyStage
}

function stepIndex(stage: BusyStage) {
  return STEPS.findIndex(function findStep(step) {
    return step.id === stage
  })
}

export function UploadProgress({ stage }: UploadProgressProps) {
  const activeIndex = stepIndex(stage)

  function renderStep(step: (typeof STEPS)[number], index: number) {
    const done = index < activeIndex
    const active = index === activeIndex

    return (
      <motion.li
        key={step.id}
        layout
        className={cn(
          'flex items-center gap-3 rounded-xl border px-4 py-3',
          active && 'border-secondary/50 shadow-[var(--glow-ai)]',
          done && 'border-success/40',
          !active && !done && 'border-border opacity-60',
        )}
        animate={active ? { scale: 1.02 } : { scale: 1 }}
      >
        <span
          className={cn(
            'flex size-8 items-center justify-center rounded-full border',
            done && 'border-success text-success',
            active && 'border-secondary text-secondary',
          )}
        >
          {done ? <Check className="size-4" /> : null}
          {!done && step.ai ? <Sparkles className="size-4" /> : null}
          {!done && !step.ai ? (
            <span className="text-xs font-semibold">{index + 1}</span>
          ) : null}
        </span>
        <span className="text-sm font-medium">{step.label}</span>
        {active && step.ai ? (
          <span className="ai-shimmer ml-auto h-2 w-16 rounded-full" />
        ) : null}
      </motion.li>
    )
  }

  return (
    <ol className="space-y-3" aria-live="polite" aria-busy="true">
      {STEPS.map(renderStep)}
    </ol>
  )
}
```

Append to `src/styles.css` (near other animations):

```css
.ai-shimmer {
  background: linear-gradient(
    90deg,
    rgba(139, 92, 246, 0.2),
    rgba(34, 211, 238, 0.55),
    rgba(139, 92, 246, 0.2)
  );
  background-size: 200% 100%;
  animation: ai-shimmer 1.2s ease-in-out infinite;
}

@keyframes ai-shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ai-shimmer {
    animation: none;
  }
}
```

- [ ] **Step 3: Implement `ParsedCvSummary`**

```tsx
// src/components/upload/parsed-cv-summary.tsx
import { Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import type { CvSummaryStats } from '#/models/cv-summary'

type ParsedCvSummaryProps = {
  stats: CvSummaryStats
  fileName: string
  onLooksGood: () => void
  onReParse: () => void
}

export function ParsedCvSummary({
  stats,
  fileName,
  onLooksGood,
  onReParse,
}: ParsedCvSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
    >
      <Card className="rounded-2xl border-border bg-card/80 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-xl tracking-[-0.02em]">
            {stats.fullName}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{fileName}</p>
        </CardHeader>
        <CardContent className="flex gap-6 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">
              {stats.experienceCount}
            </span>{' '}
            roles
          </p>
          <p>
            <span className="font-medium text-foreground">
              {stats.skillCount}
            </span>{' '}
            skills
          </p>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-3">
          <Button
            type="button"
            className="btn-gradient rounded-xl"
            onClick={onLooksGood}
          >
            Looks good
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-primary/50"
            onClick={onReParse}
          >
            <Sparkles className="size-4" />
            Re-parse
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
```

- [ ] **Step 4: Implement `PreviousUploadsList`**

```tsx
// src/components/upload/previous-uploads-list.tsx
import { motion } from 'motion/react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { cvContentSchema } from '#/lib/schemas/cv'
import { summarizeCvContent } from '#/models/cv-summary'
import { cn } from '#/lib/utils'

export type BaseCvListItem = {
  id: string
  file_name: string
  content: unknown
  created_at: string
}

type PreviousUploadsListProps = {
  items: BaseCvListItem[] | undefined
  isLoading: boolean
  highlightNewest: boolean
}

function displayName(content: unknown) {
  const parsed = cvContentSchema.safeParse(content)
  if (!parsed.success) return 'Unknown'
  return summarizeCvContent(parsed.data).fullName
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString()
}

export function PreviousUploadsList({
  items,
  isLoading,
  highlightNewest,
}: PreviousUploadsListProps) {
  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading uploads…</p>
  }

  if (!items || items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No CVs yet — upload your first base CV above.
      </p>
    )
  }

  function renderCvItem(cv: BaseCvListItem, index: number) {
    const isNewest = highlightNewest && index === 0
    return (
      <motion.div
        key={cv.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{
          opacity: 1,
          y: 0,
          boxShadow: isNewest ? 'var(--glow-ai)' : 'none',
        }}
        transition={{ delay: index * 0.05, duration: 0.35 }}
      >
        <Card
          className={cn(
            'rounded-2xl border-border bg-card/80 backdrop-blur-md',
            isNewest && 'border-secondary/40',
          )}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{cv.file_name}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {displayName(cv.content)}
            {' · '}
            {formatDate(cv.created_at)}
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return <div className="space-y-3">{items.map(renderCvItem)}</div>
}
```

- [ ] **Step 5: Commit (when user requests)**

```bash
git add src/components/upload src/styles.css
git commit -m "$(cat <<'EOF'
feat(upload): add dropzone, progress, summary, and list UI

EOF
)"
```

---

### Task 5: Upload route page

**Files:**
- Create: `src/routes/upload.tsx`
- Modify: `src/routeTree.gen.ts` (via `bun run generate-routes`)

**Interfaces:**
- Consumes: all hooks/components from Tasks 2–4
- Produces: `createFileRoute('/upload')` with `UploadPage`

- [ ] **Step 1: Implement the route**

```tsx
// src/routes/upload.tsx
import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { Dropzone } from '#/components/upload/dropzone'
import { ParsedCvSummary } from '#/components/upload/parsed-cv-summary'
import { PreviousUploadsList } from '#/components/upload/previous-uploads-list'
import { UploadProgress } from '#/components/upload/upload-progress'
import { useBaseCvs } from '#/hooks/use-base-cvs'
import { useCvUpload } from '#/hooks/use-cv-upload'
import type { UploadStage } from '#/hooks/use-cv-upload'
import { summarizeCvContent } from '#/models/cv-summary'

export const Route = createFileRoute('/upload')({
  component: UploadPage,
  head: function uploadHead() {
    return {
      meta: [{ title: 'Upload CV — ResumeAI' }],
    }
  },
})

function isBusyStage(
  stage: UploadStage,
): stage is 'uploading' | 'parsing' | 'structuring' {
  return (
    stage === 'uploading' || stage === 'parsing' || stage === 'structuring'
  )
}

function UploadPage() {
  const [highlightNewest, setHighlightNewest] = useState(false)
  const baseCvs = useBaseCvs()

  async function handleConfirmed() {
    await baseCvs.invalidate()
    setHighlightNewest(true)
  }

  const upload = useCvUpload({ onConfirmed: handleConfirmed })

  function handleFile(file: File) {
    setHighlightNewest(false)
    upload.handleFile(file)
  }

  function handleLooksGood() {
    void upload.handleLooksGood()
  }

  function handleReParse() {
    upload.handleReParse()
  }

  const summary =
    upload.result !== null
      ? summarizeCvContent(upload.result.content)
      : null

  return (
    <main className="relative min-h-screen bg-background px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-24 top-10 size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-16 top-40 size-64 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-2xl space-y-8">
        <motion.h1
          className="text-3xl font-bold tracking-[-0.02em]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          Upload CV
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          {upload.stage === 'idle' || upload.stage === 'review' ? (
            <Dropzone
              disabled={upload.isBusy}
              error={upload.error}
              onFile={handleFile}
            />
          ) : null}

          {isBusyStage(upload.stage) ? (
            <UploadProgress stage={upload.stage} />
          ) : null}

          {upload.stage === 'review' && summary && upload.result ? (
            <div className="mt-6">
              <ParsedCvSummary
                stats={summary}
                fileName={upload.result.baseCv.file_name}
                onLooksGood={handleLooksGood}
                onReParse={handleReParse}
              />
            </div>
          ) : null}
        </motion.div>

        <motion.section
          className="space-y-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-lg font-semibold tracking-[-0.02em]">
            Previous uploads
          </h2>
          <PreviousUploadsList
            items={baseCvs.data}
            isLoading={baseCvs.isLoading}
            highlightNewest={highlightNewest}
          />
        </motion.section>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Regenerate route tree**

Run: `bun run generate-routes`

Expected: `src/routeTree.gen.ts` includes `/upload`

- [ ] **Step 3: Typecheck / unit tests**

Run: `bun run test && bunx tsc --noEmit`

Expected: PASS

- [ ] **Step 4: Manual smoke (dev server)**

Run: `bun run dev`

Visit `http://localhost:3000/upload` and verify:

1. Page enter motion
2. Invalid file → inline error
3. Valid PDF/DOCX → progress steps → review summary
4. Re-parse restarts progress
5. Looks good → list refreshes with highlight

- [ ] **Step 5: Commit (when user requests)**

```bash
git add src/routes/upload.tsx src/routeTree.gen.ts
git commit -m "$(cat <<'EOF'
feat(upload): add /upload page with progress and review flow

EOF
)"
```

---

## Self-Review

| Spec requirement | Task |
|------------------|------|
| Dropzone PDF/DOCX 10MB | 1, 4 |
| Progress uploading → parsing → structuring | 3, 4 |
| Review summary + Looks good / Re-parse | 3, 4, 5 |
| Previous uploads list | 2, 4, 5 |
| Motion (enter, drag, progress, review, list) | 4, 5 |
| Named handlers only | Global + all tasks |
| Inline errors, no toast | 3, 4 |
| Server fns unchanged | Tasks use existing APIs |

**Placeholder scan:** none intentional.  
**Type consistency:** `UploadStage`, `ParseCvUploadResult`, `CvSummaryStats`, `baseCvsQueryKey`, `onConfirmed` / `invalidate` aligned across tasks.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-21-upload-page.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — fresh subagent per task, review between tasks
2. **Inline Execution** — run tasks in this session with executing-plans checkpoints

Which approach?
