import { auth as getClerkAuth } from '@clerk/tanstack-react-start/server'
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
  const auth = await getClerkAuth()
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
