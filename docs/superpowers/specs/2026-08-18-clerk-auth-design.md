# Clerk Authentication & Authorization — Design

**Goal:** Replace the single hardcoded `DEFAULT_PROFILE_ID` with real per-user
identity via Clerk, so every profile-scoped table (`base_cvs`, `job_postings`,
`tailored_cvs`) is correctly isolated per signed-in user.

**Context:** The MVP was built single-user: `getDefaultProfileId()` in
`src/lib/supabase.ts` reads `VITE_DEFAULT_PROFILE_ID` from env and every
server function (`src/server/cv.ts`, `src/server/jobs.ts`,
`src/server/tailor.ts`, `src/server/tailored.ts`) uses it directly to scope
queries. There is one `profiles` row, seeded by migration. This spec replaces
that with Clerk-backed multi-user auth.

## Decisions

- **Profile linkage:** keep the existing `profiles` table and its FK
  relationships to `base_cvs` / `job_postings` / `tailored_cvs` untouched. Add
  a unique `clerk_user_id text` column. A profile row is created the first
  time a Clerk user is seen (find-or-create), not provisioned in advance.
- **Auth wiring:** global gate. The whole app is wrapped in Clerk's provider;
  a root-level check redirects any signed-out visitor to Clerk's hosted
  sign-in — no route is reachable unauthenticated. No public landing page in
  this phase.
- **Authorization model:** app-layer scoping only, no Postgres RLS policies in
  this phase. Every server function resolves the current user's `profile.id`
  through one shared helper and scopes its own queries with it.
- **Storage:** no changes. Uploads/exports stay keyed by `profile.id` in the
  storage path, exactly as already implemented.

## Architecture

- Add `@clerk/tanstack-react-start` (Clerk's official TanStack Start SDK).
- `src/routes/__root.tsx`: wrap `RootDocument` in `<ClerkProvider>`; add a
  `beforeLoad` on the root route that calls Clerk's `getAuth()`/equivalent
  and throws a redirect to Clerk's sign-in flow when there's no session.
  Clerk's own server-function middleware guards server functions
  independently, since a server function can be invoked directly and must
  not rely solely on the route guard.
- `src/db/schema.ts`: add `clerkUserId: text('clerk_user_id').notNull().unique()`
  to `profiles`. New Drizzle migration.
- `supabase/migrations/`: new migration adding the column + unique index. The
  existing seed row (`00000000-0000-0000-0000-000000000001`) is left in place
  but orphaned — no data migration/backfill is in scope (single dev-only
  profile so far, per current state).
- New `src/lib/auth.ts`:
  - `getCurrentProfile(): Promise<Profile>` — resolves the Clerk user id from
    request context, selects the matching `profiles` row by `clerk_user_id`;
    if none exists, inserts one (`display_name` from Clerk's user name/email)
    and returns it. Uses `onConflictDoNothing` on `clerk_user_id` plus a
    re-select to handle a first-request race safely.
  - Throws a typed `UnauthorizedError` when there is no Clerk session at all
    (defense for direct server-function invocation).
- `src/lib/supabase.ts`: remove `getDefaultProfileId()` entirely.
- `src/constants/environments.ts`: remove `DEFAULT_PROFILE_ID`; add whatever
  Clerk env vars its SDK requires (publishable key, secret key).
- Every call site of `getDefaultProfileId()` in `src/server/cv.ts`,
  `src/server/jobs.ts`, `src/server/tailor.ts`, `src/server/tailored.ts` is
  replaced with `await getCurrentProfile()` and uses `.id` from the result.

## Data Flow

1. Signed-out visitor requests any route → root `beforeLoad` finds no Clerk
   session → redirects to Clerk's hosted sign-in.
2. User signs in → redirected back → session cookie set.
3. Client calls a server function (e.g. `parseCvUpload`) → handler calls
   `getCurrentProfile()` → resolves Clerk user id → finds or creates the
   matching `profiles` row → uses `profile.id` exactly where
   `getDefaultProfileId()` was used before.
4. Storage paths continue to use `profile.id`, unchanged.

## Error Handling

- No Clerk session reaching a server function → `getCurrentProfile()` throws
  `UnauthorizedError`; server functions let it propagate as a 401-equivalent.
- Concurrent first-ever requests from the same new user → unique constraint
  on `clerk_user_id` + `onConflictDoNothing` + re-select prevents duplicate
  profile rows.

## Testing

- Unit test `getCurrentProfile()`'s find-or-create logic against a mocked
  Supabase client: existing profile found, no profile → created, concurrent
  insert conflict → re-select path.
- Update existing server function tests to mock `getCurrentProfile()` instead
  of the old default-id constant/env var.
- Manual smoke test: sign in as two different Clerk test users, confirm each
  only sees their own base CVs / job postings / tailored CVs / dashboard
  entries.

## Out of Scope

- Postgres RLS policies (deferred; app-layer scoping only for now).
- Signed/short-lived storage URLs (existing per-profile path scoping is kept).
- A public/marketing landing page for signed-out users (global gate instead).
- Data backfill/migration of the old seeded default profile's rows to a real
  user — that profile's CVs/jobs are effectively orphaned test data.
