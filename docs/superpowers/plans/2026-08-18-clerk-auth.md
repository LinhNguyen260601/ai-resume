# Clerk Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hardcoded `DEFAULT_PROFILE_ID` single-user model with real per-user identity via Clerk, so every profile-scoped table is correctly isolated per signed-in user.

**Architecture:** `@clerk/tanstack-react-start` wraps the app and gates every route behind sign-in at the root loader. A new `getCurrentProfile()` helper resolves the Clerk session to a `profiles` row (find-or-create keyed by a new `clerk_user_id` column) and becomes the single choke point every server function uses instead of `getDefaultProfileId()`.

**Tech Stack:** TanStack Start/Router, `@clerk/tanstack-react-start`, Supabase (service-role client, unchanged), Drizzle (schema/migrations), Vitest.

**Spec:** `docs/superpowers/specs/2026-08-18-clerk-auth-design.md`

## Global Constraints

- App-layer scoping only — no Postgres RLS policies in this phase.
- No public/marketing landing page — signed-out visitors are redirected to Clerk's hosted sign-in from every route.
- Storage paths keep using `profile.id`, unchanged from current behavior.
- No data backfill for the old seeded default profile (`00000000-0000-0000-0000-000000000001`) — it's left orphaned.
- `VITE_DEFAULT_PROFILE_ID` / `getDefaultProfileId()` are deleted entirely, no fallback path.

---

### Task 1: Install Clerk and add env vars

**Files:**
- Modify: `package.json`
- Modify: `src/constants/environments.ts`
- Modify: `.env.example` (create if it doesn't exist)

**Interfaces:**
- Produces: `ENVIRONMENTS.CLERK_PUBLISHABLE_KEY: string | undefined`, `ENVIRONMENTS.CLERK_SECRET_KEY: string | undefined`

- [ ] **Step 1: Install the Clerk TanStack Start SDK**

```bash
npm install @clerk/tanstack-react-start
```

- [ ] **Step 2: Add Clerk env vars to `environments.ts`**

Read current file first, then add alongside the existing entries (remove `DEFAULT_PROFILE_ID` in this same edit since it's being replaced):

```typescript
// src/constants/environments.ts
function readEnv(key: string): string | undefined {
  const metaEnv = import.meta.env as
    | Record<string, string | undefined>
    | undefined
  return metaEnv?.[key] ?? process.env[key]
}

export const ENVIRONMENTS = {
  GEMINI_API_KEY: readEnv('VITE_GEMINI_API_KEY'),
  GEMINI_MODEL: readEnv('VITE_GEMINI_MODEL') ?? 'gemini-flash-latest',
  SUPABASE_URL: readEnv('VITE_SUPABASE_URL'),
  SUPABASE_SERVICE_ROLE_KEY: readEnv('VITE_SUPABASE_SERVICE_ROLE_KEY'),
  CLERK_PUBLISHABLE_KEY: readEnv('VITE_CLERK_PUBLISHABLE_KEY'),
  CLERK_SECRET_KEY: readEnv('CLERK_SECRET_KEY'),
} as const
```

- [ ] **Step 3: Document the new env vars**

Create or update `.env.example`, adding (leave any existing unrelated vars untouched, just remove `VITE_DEFAULT_PROFILE_ID` if present and add):

```bash
VITE_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/constants/environments.ts .env.example
git commit -m "chore: add Clerk dependency and env vars"
```

---

### Task 2: Add `clerk_user_id` to the `profiles` table

**Files:**
- Modify: `src/db/schema.ts`
- Create: `supabase/migrations/0001_<generated_name>.sql` (name chosen by drizzle-kit)

**Interfaces:**
- Produces: `profiles.clerkUserId: string` (Drizzle field `clerkUserId`, DB column `clerk_user_id`), unique.

- [ ] **Step 1: Add the column to the Drizzle schema**

Edit `src/db/schema.ts`, in the `profiles` table definition:

```typescript
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkUserId: text('clerk_user_id').notNull().unique(),
  displayName: text('display_name').notNull().default('Default User'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})
```

- [ ] **Step 2: Generate the migration**

```bash
npm run db:generate
```

Expected: a new file under `supabase/migrations/` adding the `clerk_user_id` column with a `not null` + unique constraint. Since the existing seed row has no Clerk user, this will fail to apply against a database that already has that row — see Step 3.

- [ ] **Step 3: Adjust the generated migration to drop the stale seed row**

Open the newly generated migration file and add a line before the `ALTER TABLE` that adds the column, so the old single-user seed data doesn't block the `NOT NULL` constraint:

```sql
DELETE FROM "profiles" WHERE "clerk_user_id" IS NULL;
```

(Drizzle's generated `ALTER TABLE ... ADD COLUMN ... NOT NULL` would otherwise fail on the existing seeded row with no value to backfill. Deleting it is safe per the plan's constraint that this data is orphaned test data with no backfill required — cascade deletes will also remove any `base_cvs`/`job_postings`/`tailored_cvs` rows tied to it.)

- [ ] **Step 4: Apply the migration**

```bash
npm run db:migrate
```

Expected: migration succeeds, `profiles` table now has a required unique `clerk_user_id` column and is empty.

- [ ] **Step 5: Commit**

```bash
git add src/db/schema.ts supabase/migrations/
git commit -m "feat(db): add clerk_user_id to profiles"
```

---

### Task 3: `getCurrentProfile()` auth helper

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/lib/auth.test.ts`
- Modify: `src/lib/supabase.ts` (remove `getDefaultProfileId`)

**Interfaces:**
- Consumes: `createServerSupabase()` from `#/lib/supabase`; `getAuth` from `@clerk/tanstack-react-start/server`
- Produces:
  - `class UnauthorizedError extends Error`
  - `async function getCurrentProfile(): Promise<{ id: string; clerkUserId: string; displayName: string; createdAt: string }>`

- [ ] **Step 1: Write failing tests for the find-or-create logic**

```typescript
// src/lib/auth.test.ts
import { describe, expect, it, vi, beforeEach } from 'vitest'

const mockGetAuth = vi.fn()
vi.mock('@clerk/tanstack-react-start/server', () => ({
  getAuth: () => mockGetAuth(),
}))

const mockSingle = vi.fn()
const mockSelect = vi.fn(() => ({
  eq: vi.fn(() => ({ single: mockSingle })),
}))
const mockInsertSingle = vi.fn()
const mockInsert = vi.fn(() => ({
  select: vi.fn(() => ({ single: mockInsertSingle })),
}))
const mockFrom = vi.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
}))
vi.mock('#/lib/supabase', () => ({
  createServerSupabase: () => ({ from: mockFrom }),
}))

const { getCurrentProfile, UnauthorizedError } = await import('./auth')

describe('getCurrentProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws UnauthorizedError when there is no Clerk session', async () => {
    mockGetAuth.mockResolvedValue({ userId: null })
    await expect(getCurrentProfile()).rejects.toThrow(UnauthorizedError)
  })

  it('returns the existing profile when one matches clerk_user_id', async () => {
    mockGetAuth.mockResolvedValue({ userId: 'user_123' })
    mockSingle.mockResolvedValue({
      data: { id: 'profile-1', clerk_user_id: 'user_123', display_name: 'Jane', created_at: '2026-01-01' },
      error: null,
    })
    const profile = await getCurrentProfile()
    expect(profile.id).toBe('profile-1')
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('creates a profile when none exists yet', async () => {
    mockGetAuth.mockResolvedValue({
      userId: 'user_456',
      sessionClaims: { name: 'New User' },
    })
    mockSingle.mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'no rows' },
    })
    mockInsertSingle.mockResolvedValue({
      data: { id: 'profile-2', clerk_user_id: 'user_456', display_name: 'New User', created_at: '2026-01-01' },
      error: null,
    })
    const profile = await getCurrentProfile()
    expect(profile.id).toBe('profile-2')
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ clerk_user_id: 'user_456', display_name: 'New User' }),
    )
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test -- --run src/lib/auth.test.ts
```

Expected: FAIL — `src/lib/auth.ts` does not exist yet.

- [ ] **Step 3: Implement `getCurrentProfile()`**

```typescript
// src/lib/auth.ts
import { getAuth } from '@clerk/tanstack-react-start/server'
import { createServerSupabase } from '#/lib/supabase'

export class UnauthorizedError extends Error {
  constructor() {
    super('No authenticated Clerk session')
    this.name = 'UnauthorizedError'
  }
}

export interface Profile {
  id: string
  clerkUserId: string
  displayName: string
  createdAt: string
}

function toProfile(row: {
  id: string
  clerk_user_id: string
  display_name: string
  created_at: string
}): Profile {
  return {
    id: row.id,
    clerkUserId: row.clerk_user_id,
    displayName: row.display_name,
    createdAt: row.created_at,
  }
}

export async function getCurrentProfile(): Promise<Profile> {
  const auth = await getAuth()
  if (!auth.userId) throw new UnauthorizedError()

  const supabase = createServerSupabase()

  const existing = await supabase
    .from('profiles')
    .select('id, clerk_user_id, display_name, created_at')
    .eq('clerk_user_id', auth.userId)
    .single()

  if (existing.data) return toProfile(existing.data)

  const displayName =
    (auth.sessionClaims?.name as string | undefined) ?? 'ResumeAI User'

  const inserted = await supabase
    .from('profiles')
    .insert({ clerk_user_id: auth.userId, display_name: displayName })
    .select('id, clerk_user_id, display_name, created_at')
    .single()

  if (inserted.data) return toProfile(inserted.data)

  // Concurrent first-request race: another request inserted the row first.
  const retried = await supabase
    .from('profiles')
    .select('id, clerk_user_id, display_name, created_at')
    .eq('clerk_user_id', auth.userId)
    .single()
  if (retried.error || !retried.data) throw retried.error ?? new Error('Failed to resolve profile')
  return toProfile(retried.data)
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm run test -- --run src/lib/auth.test.ts
```

Expected: PASS (3 tests)

- [ ] **Step 5: Remove `getDefaultProfileId` from `src/lib/supabase.ts`**

Read the file first, then remove the function so nothing can silently fall back to it:

```typescript
// src/lib/supabase.ts
import { ENVIRONMENTS } from '#/constants'
import { createClient } from '@supabase/supabase-js'

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = ENVIRONMENTS

export function createServerSupabase() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY)
    throw new Error('Missing Supabase env vars')
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
}
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/auth.ts src/lib/auth.test.ts src/lib/supabase.ts
git commit -m "feat(auth): add getCurrentProfile find-or-create helper"
```

---

### Task 4: Wire `getCurrentProfile()` into `src/server/cv.ts`

**Files:**
- Modify: `src/server/cv.ts`

**Interfaces:**
- Consumes: `getCurrentProfile()` from `#/lib/auth`

- [ ] **Step 1: Replace `getDefaultProfileId` usages**

Read the current file (shown in context above), then apply:

```typescript
import { createServerFn } from '@tanstack/react-start'
import { v4 as uuid } from 'uuid'
import { CV_SCHEMA_DESC, cvContentSchema } from '#/lib/schemas/cv'
import { cvUploadSchema } from '#/lib/schemas/cv-upload'
import { getCurrentProfile } from '#/lib/auth'
import { createServerSupabase } from '#/lib/supabase'
import { generateStructuredJson } from '#/lib/gemini'
import { extractTextFromFile, isLowTextQuality } from '#/lib/pdf-extract'

export async function parseCvUploadFromFormData(data: FormData) {
  const { file } = cvUploadSchema.parse(data)
  return parseCvUploadFile(file)
}

async function parseCvUploadFile(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer())
  const rawText = await extractTextFromFile(buffer, file.type)
  if (isLowTextQuality(rawText)) {
    throw new Error(
      'Low text quality — file may be scanned/image-only. Try exporting as text-based PDF.',
    )
  }

  const parsed = await generateStructuredJson<unknown>(
    `Extract and structure this CV text into JSON. Use UUIDs for id fields. Do not invent information.\n\n${rawText}`,
    CV_SCHEMA_DESC,
  )
  const content = cvContentSchema.parse(parsed)

  const profile = await getCurrentProfile()
  const supabase = createServerSupabase()
  const fileId = uuid()
  const ext = file.type === 'application/pdf' ? 'pdf' : 'docx'
  const filePath = `${profile.id}/${fileId}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('cv-uploads')
    .upload(filePath, buffer, { contentType: file.type })
  if (uploadError) throw uploadError

  const { data: row, error } = await supabase
    .from('base_cvs')
    .insert({
      profile_id: profile.id,
      file_path: filePath,
      file_name: file.name,
      content,
    })
    .select('id, file_name, created_at')
    .single()
  if (error) throw error

  return { baseCv: row, content }
}

export const parseCvUpload = createServerFn({ method: 'POST' })
  .validator(cvUploadSchema)
  .handler(async ({ data }) => parseCvUploadFile(data.file))

export const listBaseCvs = createServerFn({ method: 'GET' }).handler(
  async () => {
    const profile = await getCurrentProfile()
    const supabase = createServerSupabase()
    const { data, error } = await supabase
      .from('base_cvs')
      .select('id, file_name, content, created_at')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
)
```

- [ ] **Step 2: Run existing tests touching this file**

```bash
npm run test -- --run src/routes/-upload.test.tsx src/hooks/use-cv-upload.test.tsx src/components/upload/upload-components.test.tsx
```

Expected: PASS. If any test directly imported `getDefaultProfileId` or mocked `#/lib/supabase`'s old export, update the mock to mock `#/lib/auth`'s `getCurrentProfile` instead, returning `{ id: 'profile-1', clerkUserId: 'user_1', displayName: 'Test', createdAt: '2026-01-01' }`.

- [ ] **Step 3: Commit**

```bash
git add src/server/cv.ts
git commit -m "refactor(cv): use getCurrentProfile instead of default profile id"
```

---

### Task 5: Wire `getCurrentProfile()` into `src/server/jobs.ts`

**Files:**
- Modify: `src/server/jobs.ts`

**Interfaces:**
- Consumes: `getCurrentProfile()` from `#/lib/auth`

- [ ] **Step 1: Replace `getDefaultProfileId` usages**

```typescript
import { generateStructuredJson } from '#/lib/gemini'
import {
  buildJobMarkdownPrompt,
  JOB_MARKDOWN_SCHEMA_DESC,
} from '#/lib/job-markdown'
import {
  createJobPostingSchema,
  extractedTextSchema,
  jobMetaSchema,
  scrapeJobUrlSchema,
} from '#/lib/schemas/job'
import { getCurrentProfile } from '#/lib/auth'
import { createServerSupabase } from '#/lib/supabase'
import { fetchAndExtractJobText } from '#/lib/url-scrape'
import { createServerFn } from '@tanstack/react-start'

export const scrapeJobUrl = createServerFn({ method: 'POST' })
  .validator(scrapeJobUrlSchema)
  .handler(async ({ data }) => {
    let text = await fetchAndExtractJobText(data.url)

    if (text.length < 100) {
      const recovered = await generateStructuredJson<unknown>(
        `Extract the job description from this HTML snippet. Return JSON: { "extracted_text": "..." }\n\n${text}`,
        '{ extracted_text: string }',
      )
      text = extractedTextSchema.parse(recovered).extracted_text
    }

    const formatted = await generateStructuredJson<unknown>(
      buildJobMarkdownPrompt(text),
      JOB_MARKDOWN_SCHEMA_DESC,
    )

    return jobMetaSchema.parse(formatted)
  })

export const createJobPosting = createServerFn({ method: 'POST' })
  .validator(createJobPostingSchema)
  .handler(async ({ data }) => {
    const profile = await getCurrentProfile()
    const supabase = createServerSupabase()
    const { data: row, error } = await supabase
      .from('job_postings')
      .insert({
        profile_id: profile.id,
        source_type: data.source_type,
        source_url: data.source_url ?? null,
        raw_text: data.extracted_text,
        extracted_text: data.extracted_text,
        company_name: data.company_name ?? null,
        job_title: data.job_title ?? null,
      })
      .select('id')
      .single()
    if (error) throw error
    return row
  })

export const listJobPostings = createServerFn({ method: 'GET' }).handler(
  async () => {
    const profile = await getCurrentProfile()
    const supabase = createServerSupabase()
    const { data, error } = await supabase
      .from('job_postings')
      .select('*')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
)
```

- [ ] **Step 2: Run existing tests touching this file**

```bash
npm run test -- --run src/routes/jobs/-new.test.tsx
```

Expected: PASS (update any mock of `#/lib/supabase`'s old `getDefaultProfileId` export to mock `#/lib/auth`'s `getCurrentProfile` as in Task 4 Step 2).

- [ ] **Step 3: Commit**

```bash
git add src/server/jobs.ts
git commit -m "refactor(jobs): use getCurrentProfile instead of default profile id"
```

---

### Task 6: Wire `getCurrentProfile()` into `src/server/tailor.ts` and `src/server/tailored.ts`

**Files:**
- Modify: `src/server/tailor.ts`
- Modify: `src/server/tailored.ts`

**Interfaces:**
- Consumes: `getCurrentProfile()` from `#/lib/auth`

- [ ] **Step 1: Update `tailor.ts`**

The current version reads `base_cvs` and `job_postings` by id only, with no profile scoping on the read — this task also closes that gap so a tailored CV can never be built by reading another user's base CV or job posting:

```typescript
// src/server/tailor.ts
import { createServerFn } from '@tanstack/react-start'
import { CV_SCHEMA_DESC, cvContentSchema } from '#/lib/schemas/cv'
import { tailorCvForJobSchema } from '#/lib/schemas/tailor'
import { generateStructuredJson } from '#/lib/gemini'
import { getCurrentProfile } from '#/lib/auth'
import { createServerSupabase } from '#/lib/supabase'
import { buildTailorCvPrompt } from '#/lib/tailor-prompt'

export const tailorCvForJob = createServerFn({ method: 'POST' })
  .validator(tailorCvForJobSchema)
  .handler(async ({ data }) => {
    const profile = await getCurrentProfile()
    const supabase = createServerSupabase()

    const [baseCvResult, jobResult] = await Promise.all([
      supabase
        .from('base_cvs')
        .select('content')
        .eq('id', data.baseCvId)
        .eq('profile_id', profile.id)
        .single(),
      supabase
        .from('job_postings')
        .select('extracted_text, company_name, job_title')
        .eq('id', data.jobPostingId)
        .eq('profile_id', profile.id)
        .single(),
    ])
    if (baseCvResult.error) throw baseCvResult.error
    if (jobResult.error) throw jobResult.error

    const baseCv = baseCvResult.data
    const job = jobResult.data
    const baseCvContent = cvContentSchema.parse(baseCv.content)

    const tailored = await generateStructuredJson<unknown>(
      buildTailorCvPrompt(baseCvContent, job.extracted_text),
      CV_SCHEMA_DESC,
    )
    const content = cvContentSchema.parse(tailored)
    const title = `${job.job_title ?? 'Role'} at ${job.company_name ?? 'Company'}`

    const { data: row, error } = await supabase
      .from('tailored_cvs')
      .insert({
        profile_id: profile.id,
        base_cv_id: data.baseCvId,
        job_posting_id: data.jobPostingId,
        content,
        title,
        template_id: 'modern',
      })
      .select('id')
      .single()
    if (error) throw error
    return row
  })
```

- [ ] **Step 2: Update `tailored.ts`**

```typescript
// src/server/tailored.ts
import { createServerFn } from '@tanstack/react-start'
import {
  getTailoredCvSchema,
  updateTailoredCvSchema,
} from '#/lib/schemas/tailored-cv'
import { getCurrentProfile } from '#/lib/auth'
import { createServerSupabase } from '#/lib/supabase'

export const getTailoredCv = createServerFn({ method: 'GET' })
  .validator(getTailoredCvSchema)
  .handler(async ({ data }) => {
    const profile = await getCurrentProfile()
    const supabase = createServerSupabase()
    const { data: row, error } = await supabase
      .from('tailored_cvs')
      .select('id, content, template_id, title, job_postings(company_name, job_title)')
      .eq('id', data.id)
      .eq('profile_id', profile.id)
      .single()
    if (error) throw error
    return row
  })

export const listTailoredCvs = createServerFn({ method: 'GET' }).handler(
  async () => {
    const profile = await getCurrentProfile()
    const supabase = createServerSupabase()
    const { data, error } = await supabase
      .from('tailored_cvs')
      .select(
        'id, title, template_id, created_at, updated_at, job_postings(company_name, job_title)',
      )
      .eq('profile_id', profile.id)
      .order('updated_at', { ascending: false })
    if (error) throw error
    return data
  },
)

export const updateTailoredCv = createServerFn({ method: 'POST' })
  .validator(updateTailoredCvSchema)
  .handler(async ({ data }) => {
    const profile = await getCurrentProfile()
    const supabase = createServerSupabase()
    const { error } = await supabase
      .from('tailored_cvs')
      .update({
        content: data.content,
        ...(data.template_id ? { template_id: data.template_id } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.id)
      .eq('profile_id', profile.id)
    if (error) throw error
    return { ok: true }
  })
```

- [ ] **Step 3: Run existing tests touching these files**

```bash
npm run test -- --run src/hooks/use-tailored-cv.test.tsx src/hooks/use-export-cv.test.tsx src/models/cv-editor.test.ts
```

Expected: PASS (update mocks of `#/lib/supabase`'s old export as in Task 4 Step 2 if any exist).

- [ ] **Step 4: Commit**

```bash
git add src/server/tailor.ts src/server/tailored.ts
git commit -m "refactor(tailor): use getCurrentProfile and scope base_cv/job reads to owner"
```

---

### Task 7: Wrap the app in `ClerkProvider` and gate routes at the root

**Files:**
- Modify: `src/routes/__root.tsx`

**Interfaces:**
- Consumes: `ClerkProvider` from `@clerk/tanstack-react-start`; `getAuth` from `@clerk/tanstack-react-start/server`; `ENVIRONMENTS.CLERK_PUBLISHABLE_KEY` from `#/constants`

- [ ] **Step 1: Add `beforeLoad` auth check and `ClerkProvider`**

Read the current `src/routes/__root.tsx` (shown in context above) first, then apply:

```typescript
// src/routes/__root.tsx
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  redirect,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { ClerkProvider } from '@clerk/tanstack-react-start'
import { getAuth } from '@clerk/tanstack-react-start/server'
import { createServerFn } from '@tanstack/react-start'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

const fetchAuthState = createServerFn({ method: 'GET' }).handler(async () => {
  const auth = await getAuth()
  return { isSignedIn: Boolean(auth.userId) }
})

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async ({ location }) => {
    if (location.pathname.startsWith('/sign-in')) return
    const { isSignedIn } = await fetchAuthState()
    if (!isSignedIn) {
      throw redirect({ to: '/sign-in', search: { redirect: location.href } })
    }
  },
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'ResumeAI — AI-Powered CV Builder',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        href: '/favicon.svg',
        type: 'image/svg+xml',
      },
      {
        rel: 'icon',
        href: '/favicon.ico',
        sizes: '32x32',
      },
      {
        rel: 'apple-touch-icon',
        href: '/logo192.png',
      },
      {
        rel: 'manifest',
        href: '/manifest.json',
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <HeadContent />
        </head>
        <body>
          {children}
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
              TanStackQueryDevtools,
            ]}
          />
          <Scripts />
        </body>
      </html>
    </ClerkProvider>
  )
}
```

Note: `location.pathname.startsWith('/sign-in')` is the escape hatch so the sign-in route itself doesn't redirect to itself — Task 8 creates that route at `/sign-in`.

- [ ] **Step 2: Commit**

```bash
git add src/routes/__root.tsx
git commit -m "feat(auth): gate all routes behind Clerk sign-in at the root loader"
```

---

### Task 8: Sign-in route

**Files:**
- Create: `src/routes/sign-in.tsx`

**Interfaces:**
- Consumes: `SignIn` from `@clerk/tanstack-react-start`

- [ ] **Step 1: Create the sign-in route**

```tsx
// src/routes/sign-in.tsx
import { createFileRoute } from '@tanstack/react-router'
import { SignIn } from '@clerk/tanstack-react-start'
import { z } from 'zod'

const signInSearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/sign-in')({
  validateSearch: signInSearchSchema,
  component: SignInPage,
})

function SignInPage() {
  const { redirect } = Route.useSearch()
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0F19]">
      <SignIn forceRedirectUrl={redirect ?? '/dashboard'} />
    </div>
  )
}
```

- [ ] **Step 2: Regenerate the route tree**

```bash
npm run generate-routes
```

Expected: `src/routeTree.gen.ts` updates to include `/sign-in`.

- [ ] **Step 3: Commit**

```bash
git add src/routes/sign-in.tsx src/routeTree.gen.ts
git commit -m "feat(auth): add Clerk sign-in route"
```

---

### Task 9: Manual verification

- [ ] **Step 1: Set up a Clerk dev instance**

Create a free Clerk application at the Clerk dashboard, copy the publishable and secret keys into `.env.local` as `VITE_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.

- [ ] **Step 2: Run the full test suite**

```bash
npm run test
```

Expected: all tests pass, including the new `src/lib/auth.test.ts`.

- [ ] **Step 3: End-to-end smoke test with two users**

1. Start the dev server (`npm run dev`), visit any route while signed out — confirm redirect to `/sign-in`.
2. Sign in as Clerk test user A, upload a CV, create a job, tailor it. Confirm a `profiles` row was created with the matching `clerk_user_id`.
3. Sign out, sign in as Clerk test user B. Confirm the dashboard, upload history, and job list are empty for B (no data from A is visible).
4. Have B upload their own CV and confirm it appears only for B.
5. Sign back in as A, confirm A's data is still there and B's is not visible.

- [ ] **Step 4: Confirm storage paths are still per-profile**

Check the Supabase Storage dashboard for `cv-uploads` — confirm each user's files are under their own `profile.id` folder (a different UUID per user, not the old default id).
