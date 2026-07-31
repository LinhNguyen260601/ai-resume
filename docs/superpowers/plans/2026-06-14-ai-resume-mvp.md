# AI Resume Builder MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a TanStack Start web app that uploads CVs, scrapes/pastes job descriptions, AI-tailors content with Gemini 2.5 Flash, lets users edit inline, and exports PDFs via 4 templates.

**Architecture:** TanStack Start server functions handle AI, scraping, and PDF generation. Supabase stores structured CV JSON and uploaded files. React templates render live preview; Playwright generates WYSIWYG PDFs.

**Tech Stack:** TanStack Start, TanStack Router, TanStack Query, TanStack Form, Supabase, Gemini 2.5 Flash, Playwright, Tailwind CSS, shadcn/ui, Zod

**Spec:** `docs/superpowers/specs/2026-06-14-ai-resume-design.md`

---

## File Map

| Path                                         | Responsibility                                      |
| -------------------------------------------- | --------------------------------------------------- |
| `src/lib/schemas/cv.ts`                      | `CvContent` Zod schema + TypeScript types           |
| `src/lib/supabase.ts`                        | Server-side Supabase client (service role)          |
| `src/lib/gemini.ts`                          | Gemini client + structured JSON helpers             |
| `src/lib/pdf-extract.ts`                     | Extract text from PDF/DOCX buffers                  |
| `src/lib/url-scrape.ts`                      | Fetch URL, Readability extraction, SSRF guard       |
| `src/lib/templates.ts`                       | Template registry (id → component)                  |
| `src/server/cv.ts`                           | `parseCvUpload` server function                     |
| `src/server/jobs.ts`                         | `scrapeJobUrl`, `createJobPosting` server functions |
| `src/server/tailor.ts`                       | `tailorCvForJob` server function                    |
| `src/server/export.ts`                       | `exportPdf` server function                         |
| `src/templates/*.tsx`                        | Four CV template React components                   |
| `src/components/cv/*`                        | Editor field components                             |
| `src/components/upload/Dropzone.tsx`         | File upload UI                                      |
| `src/components/jobs/JobForm.tsx`            | Paste/URL job form                                  |
| `src/routes/index.tsx`                       | Dashboard                                           |
| `src/routes/upload.tsx`                      | Upload page                                         |
| `src/routes/jobs/new.tsx`                    | New job page                                        |
| `src/routes/tailor/$jobId.tsx`               | Base CV picker + tailor trigger                     |
| `src/routes/editor/$tailoredCvId.tsx`        | Editor + live preview                               |
| `src/routes/export/$tailoredCvId.tsx`        | Template picker + download                          |
| `supabase/migrations/001_initial_schema.sql` | DB schema + seed profile                            |

---

### Task 1: Scaffold TanStack Start project

**Files:**

- Create: project root via CLI
- Create: `.env.example`
- Modify: `package.json` (add deps in Task 2)

- [ ] **Step 1: Scaffold with TanStack CLI**

Run from `d:/AI-resume` parent or use `--target-dir`:

```bash
cd d:/AI-resume
npx @tanstack/cli@latest create . --add-ons tanstack-query --yes --force
```

Expected: TanStack Start project with `src/routes/`, Tailwind enabled.

- [ ] **Step 2: Verify dev server starts**

```bash
npm install
npm run dev
```

Expected: App at `http://localhost:3000`

- [ ] **Step 3: Create** `.env.example`

```bash
# .env.example
VITE_GEMINI_API_KEY=
VITE_SUPABASE_URL=
VITE_SUPABASE_SERVICE_ROLE_KEY=
VITE_DEFAULT_PROFILE_ID=
```

---

### Task 2: Install dependencies

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Install runtime dependencies**

```bash
npm install @google/generative-ai @supabase/supabase-js zod pdf-parse mammoth @mozilla/readability cheerio playwright uuid
npm install -D @types/uuid
```

- [ ] **Step 2: Install Playwright browsers**

```bash
npx playwright install chromium
```

- [ ] **Step 3: Initialize shadcn/ui**

```bash
npx shadcn@latest init -y
npx shadcn@latest add button card tabs input textarea label toast sonner separator badge
```

Expected: `src/components/ui/` populated with shadcn components.

---

### Task 3: Database schema

**Files:**

- Create: `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: Write migration SQL**

```sql
-- supabase/migrations/001_initial_schema.sql
create extension if not exists "uuid-ossp";

create table profiles (
  id uuid primary key default uuid_generate_v4(),
  display_name text not null default 'Default User',
  created_at timestamptz not null default now()
);

create table base_cvs (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references profiles(id) on delete cascade,
  file_path text not null,
  file_name text not null,
  content jsonb not null,
  created_at timestamptz not null default now()
);

create table job_postings (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references profiles(id) on delete cascade,
  source_type text not null check (source_type in ('paste', 'url')),
  source_url text,
  raw_text text,
  extracted_text text not null,
  company_name text,
  job_title text,
  created_at timestamptz not null default now()
);

create table tailored_cvs (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references profiles(id) on delete cascade,
  base_cv_id uuid not null references base_cvs(id) on delete cascade,
  job_posting_id uuid not null references job_postings(id) on delete cascade,
  content jsonb not null,
  template_id text not null default 'modern',
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_base_cvs_profile on base_cvs(profile_id);
create index idx_job_postings_profile on job_postings(profile_id);
create index idx_tailored_cvs_profile on tailored_cvs(profile_id);

-- Seed single user profile; copy this UUID to VITE_DEFAULT_PROFILE_ID in .env
insert into profiles (id, display_name)
values ('00000000-0000-0000-0000-000000000001', 'Default User');
```

- [ ] **Step 2: Apply migration via Supabase**

Run in Supabase SQL Editor or:

```bash
npx supabase db push
```

- [ ] **Step 3: Create Storage buckets**

In Supabase dashboard → Storage, create:

- `cv-uploads` (private)
- `cv-exports` (private)

- [ ] **Step 4: Set** `.env`

```bash
VITE_DEFAULT_PROFILE_ID=00000000-0000-0000-0000-000000000001
```

---

### Task 4: Core schemas and types

**Files:**

- Create: `src/lib/schemas/cv.ts`
- Test: `src/lib/schemas/cv.test.ts`

- [x] **Step 1: Write failing test**

```typescript
// src/lib/schemas/cv.test.ts
import { describe, it, expect } from 'vitest'
import { cvContentSchema } from './cv'

describe('cvContentSchema', () => {
  it('parses minimal valid CV', () => {
    const result = cvContentSchema.safeParse({
      personal: {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        summary: 'Software engineer',
      },
      experience: [],
      education: [],
      skills: { technical: ['TypeScript'] },
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing email', () => {
    const result = cvContentSchema.safeParse({
      personal: { fullName: 'Jane', summary: '' },
      experience: [],
      education: [],
      skills: { technical: [] },
    })
    expect(result.success).toBe(false)
  })
})
```

- [x] **Step 2: Run test to verify it fails**

```bash
npm run test -- src/lib/schemas/cv.test.ts
```

Expected: FAIL — module not found

- [x] **Step 3: Implement schema**

```typescript
// src/lib/schemas/cv.ts
import { z } from 'zod'

export const experienceEntrySchema = z.object({
  id: z.string(),
  company: z.string(),
  title: z.string(),
  location: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  bullets: z.array(z.string()),
})

export const cvContentSchema = z.object({
  personal: z.object({
    fullName: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    location: z.string().optional(),
    linkedin: z.string().optional(),
    website: z.string().optional(),
    summary: z.string(),
  }),
  experience: z.array(experienceEntrySchema),
  education: z.array(
    z.object({
      id: z.string(),
      institution: z.string(),
      degree: z.string(),
      field: z.string().optional(),
      graduationDate: z.string().optional(),
      bullets: z.array(z.string()).optional(),
    }),
  ),
  skills: z.object({
    technical: z.array(z.string()),
    soft: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
  }),
  certifications: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        issuer: z.string().optional(),
        date: z.string().optional(),
      }),
    )
    .optional(),
  projects: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        bullets: z.array(z.string()).optional(),
      }),
    )
    .optional(),
})

export type CvContent = z.infer<typeof cvContentSchema>
```

- [x] **Step 4: Run test to verify it passes**

```bash
npm run test -- src/lib/schemas/cv.test.ts
```

Expected: PASS

---

### Task 5: Supabase and Gemini clients

**Files:**

- Create: `src/lib/supabase.ts`
- Create: `src/lib/gemini.ts`

- [x] **Step 1: Supabase server client**

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export function createServerSupabase() {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase env vars')
  return createClient(url, key)
}

export function getDefaultProfileId() {
  const id = process.env.VITE_DEFAULT_PROFILE_ID
  if (!id) throw new Error('Missing VITE_DEFAULT_PROFILE_ID')
  return id
}
```

- [x] **Step 2: Gemini client**

```typescript
// src/lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai'

export function createGemini() {
  const apiKey = process.env.VITE_GEMINI_API_KEY
  if (!apiKey) throw new Error('Missing VITE_GEMINI_API_KEY')
  return new GoogleGenerativeAI(apiKey)
}

export async function generateStructuredJson<T>(
  prompt: string,
  schemaDescription: string,
): Promise<T> {
  const genAI = createGemini()
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' },
  })
  const result = await model.generateContent(
    `${prompt}\n\nRespond with JSON matching this schema:\n${schemaDescription}`,
  )
  const text = result.response.text()
  return JSON.parse(text) as T
}
```

---

### Task 6: PDF/DOCX text extraction

**Files:**

- Create: `src/lib/pdf-extract.ts`
- Test: `src/lib/pdf-extract.test.ts`

- [x] **Step 1: Implement extraction**

```typescript
// src/lib/pdf-extract.ts
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

export async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  if (mimeType === 'application/pdf') {
    const data = await pdfParse(buffer)
    return data.text
  }
  if (
    mimeType ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  }
  throw new Error(`Unsupported file type: ${mimeType}`)
}

export function isLowTextQuality(text: string): boolean {
  const trimmed = text.replace(/\s+/g, ' ').trim()
  return trimmed.length < 100
}
```

- [x] **Step 2: Write test for low-text detection**

```typescript
// src/lib/pdf-extract.test.ts
import { describe, it, expect } from 'vitest'
import { isLowTextQuality } from './pdf-extract'

describe('isLowTextQuality', () => {
  it('flags short text', () => {
    expect(isLowTextQuality('hello')).toBe(true)
  })
  it('accepts long text', () => {
    expect(isLowTextQuality('a'.repeat(200))).toBe(false)
  })
})
```

---

### Task 7: URL scraping with SSRF guard

**Files:**

- Create: `src/lib/ssrf.ts`
- Create: `src/lib/url-scrape.ts`
- Test: `src/lib/ssrf.test.ts`

- [x] **Step 1: SSRF guard**

```typescript
// src/lib/ssrf.ts
import { URL } from 'url'

const BLOCKED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', '::1']

export function assertPublicUrl(input: string): URL {
  const parsed = new URL(input)
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only HTTP(S) URLs allowed')
  }
  if (BLOCKED_HOSTS.includes(parsed.hostname)) {
    throw new Error('Private URLs not allowed')
  }
  if (/^10\.|^172\.(1[6-9]|2\d|3[01])\.|^192\.168\./.test(parsed.hostname)) {
    throw new Error('Private IPs not allowed')
  }
  return parsed
}
```

- [x] **Step 2: URL scrape**

```typescript
// src/lib/url-scrape.ts
import { Readability } from '@mozilla/readability'
import { parseHTML } from 'linkedom'
import { assertPublicUrl } from './ssrf'

export async function fetchAndExtractJobText(url: string): Promise<string> {
  assertPublicUrl(url)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)
  const res = await fetch(url, {
    signal: controller.signal,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AIResumeBot/1.0)' },
  })
  clearTimeout(timeout)
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
  const html = await res.text()
  if (html.length > 5_000_000) throw new Error('Response too large')
  const { document } = parseHTML(html)
  const article = new Readability(document).parse()
  return article?.textContent?.trim() ?? ''
}
```

Note: install `linkedom` for server-side DOM: `npm install linkedom`

- [x] **Step 3: SSRF test**

```typescript
// src/lib/ssrf.test.ts
import { describe, it, expect } from 'vitest'
import { assertPublicUrl } from './ssrf'

describe('assertPublicUrl', () => {
  it('blocks localhost', () => {
    expect(() => assertPublicUrl('http://localhost/jobs')).toThrow()
  })
  it('allows public URLs', () => {
    expect(assertPublicUrl('https://example.com/jobs').hostname).toBe(
      'example.com',
    )
  })
})
```

---

### Task 8: CV upload server function

**Files:**

- Create: `src/server/cv.ts`

- [ ] **Step 1: Implement** `parseCvUpload`

```typescript
// src/server/cv.ts
import { createServerFn } from '@tanstack/react-start'
import { v4 as uuid } from 'uuid'
import { cvContentSchema } from '../lib/schemas/cv'
import { createServerSupabase, getDefaultProfileId } from '../lib/supabase'
import { generateStructuredJson } from '../lib/gemini'
import { extractTextFromFile, isLowTextQuality } from '../lib/pdf-extract'

const CV_SCHEMA_DESC = `{
  personal: { fullName, email, phone?, location?, linkedin?, website?, summary },
  experience: [{ id, company, title, location?, startDate, endDate?, bullets[] }],
  education: [{ id, institution, degree, field?, graduationDate?, bullets?[] }],
  skills: { technical[], soft?[], languages?[] },
  certifications?: [{ id, name, issuer?, date? }],
  projects?: [{ id, name, description, bullets?[] }]
}`

export const parseCvUpload = createServerFn({ method: 'POST' })
  .validator((data: FormData) => data)
  .handler(async ({ data }) => {
    const file = data.get('file') as File | null
    if (!file) throw new Error('No file provided')

    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]
    if (!allowed.includes(file.type))
      throw new Error('Only PDF and DOCX allowed')
    if (file.size > 10 * 1024 * 1024)
      throw new Error('File too large (max 10MB)')

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

    const supabase = createServerSupabase()
    const profileId = getDefaultProfileId()
    const fileId = uuid()
    const ext = file.type === 'application/pdf' ? 'pdf' : 'docx'
    const filePath = `${profileId}/${fileId}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('cv-uploads')
      .upload(filePath, buffer, { contentType: file.type })
    if (uploadError) throw uploadError

    const { data: row, error } = await supabase
      .from('base_cvs')
      .insert({
        profile_id: profileId,
        file_path: filePath,
        file_name: file.name,
        content,
      })
      .select('id, file_name, created_at')
      .single()
    if (error) throw error

    return { baseCv: row, content }
  })

export const listBaseCvs = createServerFn({ method: 'GET' }).handler(
  async () => {
    const supabase = createServerSupabase()
    const { data, error } = await supabase
      .from('base_cvs')
      .select('id, file_name, content, created_at')
      .eq('profile_id', getDefaultProfileId())
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
)
```

---

### Task 9: Upload page

**Files:**

- Create: `src/components/upload/Dropzone.tsx`
- Create: `src/routes/upload.tsx`

- [ ] **Step 1: Dropzone component**

```tsx
// src/components/upload/Dropzone.tsx
import { useCallback, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { parseCvUpload } from '../../server/cv'
import { Button } from '../ui/button'
import { toast } from 'sonner'

export function Dropzone({ onSuccess }: { onSuccess: () => void }) {
  const [dragging, setDragging] = useState(false)

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData()
      form.append('file', file)
      return parseCvUpload({ data: form })
    },
    onSuccess: () => {
      toast.success('CV uploaded and parsed')
      onSuccess()
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const handleFile = useCallback((file: File) => upload.mutate(file), [upload])

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-12 text-center ${dragging ? 'border-primary bg-muted' : 'border-muted-foreground/30'}`}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) handleFile(file)
      }}
    >
      <p className="mb-4 text-muted-foreground">
        Drag & drop PDF or DOCX, or click to browse
      </p>
      <Button disabled={upload.isPending} asChild>
        <label className="cursor-pointer">
          {upload.isPending ? 'Parsing…' : 'Choose file'}
          <input
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
          />
        </label>
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Upload route**

```tsx
// src/routes/upload.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Dropzone } from '../components/upload/Dropzone'
import { listBaseCvs } from '../server/cv'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

export const Route = createFileRoute('/upload')({
  component: UploadPage,
})

function UploadPage() {
  const { data, refetch } = useQuery({
    queryKey: ['baseCvs'],
    queryFn: () => listBaseCvs(),
  })

  return (
    <div className="container max-w-2xl py-8 space-y-8">
      <h1 className="text-2xl font-bold">Upload CV</h1>
      <Dropzone onSuccess={() => refetch()} />
      <div className="space-y-3">
        <h2 className="font-semibold">Previous uploads</h2>
        {data?.map((cv) => (
          <Card key={cv.id}>
            <CardHeader>
              <CardTitle className="text-base">{cv.file_name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {
                (cv.content as { personal: { fullName: string } }).personal
                  .fullName
              }
              {' · '}
              {new Date(cv.created_at).toLocaleDateString()}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

---

### Task 10: Job posting server functions

**Files:**

- Create: `src/server/jobs.ts`

- [ ] **Step 1: Implement scrape + create**

```typescript
// src/server/jobs.ts
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { createServerSupabase, getDefaultProfileId } from '../lib/supabase'
import { generateStructuredJson } from '../lib/gemini'
import { fetchAndExtractJobText } from '../lib/url-scrape'

const jobMetaSchema = z.object({
  company_name: z.string().optional(),
  job_title: z.string().optional(),
  extracted_text: z.string(),
})

export const scrapeJobUrl = createServerFn({ method: 'POST' })
  .validator((data: { url: string }) => data)
  .handler(async ({ data }) => {
    let text = await fetchAndExtractJobText(data.url)
    if (text.length < 100) {
      text = await generateStructuredJson<string>(
        `Extract the job description from this HTML snippet. Return JSON: { "extracted_text": "..." }\n\n${text}`,
        '{ extracted_text: string }',
      ).then((r: unknown) => (r as { extracted_text: string }).extracted_text)
    }
    const meta = await generateStructuredJson<{
      company_name?: string
      job_title?: string
    }>(
      `Extract company name and job title from this posting:\n\n${text}`,
      '{ company_name?: string, job_title?: string }',
    )
    return { extracted_text: text, ...meta }
  })

export const createJobPosting = createServerFn({ method: 'POST' })
  .validator(
    (data: {
      source_type: 'paste' | 'url'
      source_url?: string
      extracted_text: string
      company_name?: string
      job_title?: string
    }) =>
      jobMetaSchema.parse({ ...data, extracted_text: data.extracted_text }) &&
      data,
  )
  .handler(async ({ data }) => {
    const supabase = createServerSupabase()
    const { data: row, error } = await supabase
      .from('job_postings')
      .insert({
        profile_id: getDefaultProfileId(),
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
    const supabase = createServerSupabase()
    const { data, error } = await supabase
      .from('job_postings')
      .select('*')
      .eq('profile_id', getDefaultProfileId())
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
)
```

---

### Task 11: New job page

**Files:**

- Create: `src/components/jobs/JobForm.tsx`
- Create: `src/routes/jobs/new.tsx`

- [ ] **Step 1: JobForm with paste/URL tabs**

Build `JobForm.tsx` with:

- Tabs: "Paste text" | "From URL"
- URL tab: input + Fetch button → calls `scrapeJobUrl` → populates editable textarea
- Fields: company name, job title (pre-filled from scrape)
- Submit calls `createJobPosting` → navigate to `/tailor/$jobId`

- [ ] **Step 2: Route at** `src/routes/jobs/new.tsx`

Wire up form with TanStack Router `useNavigate` to redirect on success.

---

### Task 12: AI tailor server function

**Files:**

- Create: `src/server/tailor.ts`

- [ ] **Step 1: Implement tailor**

```typescript
// src/server/tailor.ts
import { createServerFn } from '@tanstack/react-start'
import { cvContentSchema } from '../lib/schemas/cv'
import { createServerSupabase, getDefaultProfileId } from '../lib/supabase'
import { generateStructuredJson } from '../lib/gemini'

export const tailorCvForJob = createServerFn({ method: 'POST' })
  .validator((data: { baseCvId: string; jobPostingId: string }) => data)
  .handler(async ({ data }) => {
    const supabase = createServerSupabase()

    const [{ data: baseCv }, { data: job }] = await Promise.all([
      supabase
        .from('base_cvs')
        .select('content')
        .eq('id', data.baseCvId)
        .single(),
      supabase
        .from('job_postings')
        .select('*')
        .eq('id', data.jobPostingId)
        .single(),
    ])
    if (!baseCv || !job) throw new Error('CV or job not found')

    const tailored = await generateStructuredJson<unknown>(
      `Tailor this CV for the job posting below.
Rules:
- Do NOT invent roles, companies, or skills not in the original CV
- Rewrite bullets to align with job keywords
- Reorder skills to prioritize relevant ones
- Adjust summary for this role

CV JSON:
${JSON.stringify(baseCv.content)}

Job posting:
${job.extracted_text}`,
      cvContentSchema.toString(),
    )
    const content = cvContentSchema.parse(tailored)
    const title = `${job.job_title ?? 'Role'} at ${job.company_name ?? 'Company'}`

    const { data: row, error } = await supabase
      .from('tailored_cvs')
      .insert({
        profile_id: getDefaultProfileId(),
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

- [ ] **Step 2: Tailor route** `src/routes/tailor/$jobId.tsx`

- List base CVs (radio select)
- "Tailor CV" button → `tailorCvForJob` → navigate to `/editor/$tailoredCvId`

---

### Task 13: CV editor

**Files:**

- Create: `src/components/cv/EditorSection.tsx`
- Create: `src/components/cv/ExperienceEditor.tsx`
- Create: `src/components/cv/CvPreview.tsx`
- Create: `src/server/tailored.ts` (get + update)
- Create: `src/routes/editor/$tailoredCvId.tsx`

- [ ] **Step 1: CRUD server functions**

```typescript
// src/server/tailored.ts
import { createServerFn } from '@tanstack/react-start'
import { cvContentSchema } from '../lib/schemas/cv'
import { createServerSupabase } from '../lib/supabase'

export const getTailoredCv = createServerFn({ method: 'GET' })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const supabase = createServerSupabase()
    const { data: row, error } = await supabase
      .from('tailored_cvs')
      .select('*, job_postings(company_name, job_title)')
      .eq('id', data.id)
      .single()
    if (error) throw error
    return row
  })

export const updateTailoredCv = createServerFn({ method: 'POST' })
  .validator(
    (data: { id: string; content: unknown; template_id?: string }) => data,
  )
  .handler(async ({ data }) => {
    const content = cvContentSchema.parse(data.content)
    const supabase = createServerSupabase()
    const { error } = await supabase
      .from('tailored_cvs')
      .update({
        content,
        template_id: data.template_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.id)
    if (error) throw error
    return { ok: true }
  })
```

- [ ] **Step 2: Editor page — split layout**

Left: TanStack Form fields for personal, summary, experience (with add/remove bullet buttons), education, skills.

Right: `CvPreview` renders selected template with current form values.

- [ ] **Step 3: Auto-save**

Debounce 1s → `updateTailoredCv` mutation via TanStack Query.

- [ ] **Step 4: Template switcher in top bar**

Dropdown changes `template_id` and preview instantly.

---

### Task 14: CV templates

**Files:**

- Create: `src/templates/classic.tsx`
- Create: `src/templates/modern.tsx`
- Create: `src/templates/creative.tsx`
- Create: `src/templates/compact.tsx`
- Create: `src/lib/templates.ts`

- [ ] **Step 1: Template registry**

```typescript
// src/lib/templates.ts
import { ClassicTemplate } from '../templates/classic'
import { ModernTemplate } from '../templates/modern'
import { CreativeTemplate } from '../templates/creative'
import { CompactTemplate } from '../templates/compact'
import type { CvContent } from './schemas/cv'
import type { ComponentType } from 'react'

export const TEMPLATES = [
  { id: 'classic', name: 'Classic Professional', component: ClassicTemplate },
  { id: 'modern', name: 'Modern Minimal', component: ModernTemplate },
  { id: 'creative', name: 'Creative', component: CreativeTemplate },
  { id: 'compact', name: 'Compact', component: CompactTemplate },
] as const

export type TemplateId = (typeof TEMPLATES)[number]['id']

export function getTemplateComponent(
  id: TemplateId,
): ComponentType<{ content: CvContent }> {
  return TEMPLATES.find((t) => t.id === id)?.component ?? ModernTemplate
}
```

- [ ] **Step 2: Implement four template components**

Each accepts `{ content: CvContent }` and renders print-friendly HTML with Tailwind. Use semantic sections with `break-inside-avoid` on experience blocks.

- [ ] **Step 3: CvPreview wrapper**

```tsx
// src/components/cv/CvPreview.tsx
import { getTemplateComponent, type TemplateId } from '../../lib/templates'
import type { CvContent } from '../../lib/schemas/cv'

export function CvPreview({
  content,
  templateId,
}: {
  content: CvContent
  templateId: TemplateId
}) {
  const Template = getTemplateComponent(templateId)
  return (
    <div
      className="bg-white shadow-lg mx-auto"
      style={{ width: '210mm', minHeight: '297mm' }}
    >
      <Template content={content} />
    </div>
  )
}
```

---

### Task 15: PDF export

**Files:**

- Create: `src/server/export.ts`
- Create: `src/routes/export/$tailoredCvId.tsx`

- [ ] **Step 1: Export server function**

```typescript
// src/server/export.ts
import { createServerFn } from '@tanstack/react-start'
import { chromium } from 'playwright'
import { getTailoredCv } from './tailored'
import { getTemplateComponent } from '../lib/templates'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'

export const exportPdf = createServerFn({ method: 'POST' })
  .validator((data: { tailoredCvId: string; templateId: string }) => data)
  .handler(async ({ data }) => {
    const cv = await getTailoredCv({ data: { id: data.tailoredCvId } })
    const Template = getTemplateComponent(data.templateId as 'modern')
    const html = renderToStaticMarkup(
      createElement(Template, { content: cv.content }),
    )
    const fullHtml = `<!DOCTYPE html><html><head>
      <meta charset="utf-8">
      <script src="https://cdn.tailwindcss.com"></script>
      <style>@media print { .experience-block { break-inside: avoid; } }</style>
    </head><body>${html}</body></html>`

    const browser = await chromium.launch()
    try {
      const page = await browser.newPage()
      await page.setContent(fullHtml, { waitUntil: 'networkidle' })
      const pdf = await page.pdf({ format: 'A4', printBackground: true })
      return { pdf: pdf.toString('base64'), filename: `${cv.title}.pdf` }
    } finally {
      await browser.close()
    }
  })
```

- [ ] **Step 2: Export page**

Grid of 4 template thumbnails, live preview, "Download PDF" decodes base64 and triggers browser download.

---

### Task 16: Dashboard and layout

**Files:**

- Modify: `src/routes/__root.tsx`
- Modify: `src/routes/index.tsx`
- Create: `src/components/layout/AppShell.tsx`

- [ ] **Step 1: AppShell with nav links**

Links: Dashboard, Upload CV, New Job

- [ ] **Step 2: Dashboard lists recent tailored CVs**

Query `tailored_cvs` joined with job info. Cards link to editor. Empty state with guided CTAs.

- [ ] **Step 3: Add Sonner toaster to root layout**

---

### Task 17: Manual verification

- [ ] **Step 1: End-to-end smoke test**

1. Upload a text-based PDF CV
2. Create job via paste
3. Create job via URL (public job board)
4. Tailor → edit a bullet → confirm auto-save
5. Switch templates → export PDF → verify layout

- [ ] **Step 2: Run unit tests**

```bash
npm run test
```

Expected: All schema, SSRF, and pdf-extract tests pass.

---

## Spec Coverage Checklist

| Spec requirement           | Task             |
| -------------------------- | ---------------- |
| Upload PDF/DOCX            | Task 8–9         |
| Paste + URL job input      | Task 10–11       |
| AI parse + tailor (Gemini) | Task 8, 12       |
| Inline editor + reorder    | Task 13          |
| 4 templates                | Task 14          |
| PDF export (Playwright)    | Task 15          |
| Supabase storage + DB      | Task 3, 8        |
| Single-user / profile_id   | Task 3, 5        |
| SSRF + file validation     | Task 7, 8        |
| Dashboard                  | Task 16          |
| Deferred features excluded | N/A in this plan |

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-14-ai-resume-mvp.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — fresh subagent per task, review between tasks
2. **Inline Execution** — implement tasks in this session with checkpoints

Which approach would you like?
