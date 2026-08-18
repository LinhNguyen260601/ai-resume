import { ENVIRONMENTS } from '#/constants'
import { createClient } from '@supabase/supabase-js'

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = ENVIRONMENTS

export function createServerSupabase() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY)
    throw new Error('Missing Supabase env vars')
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
}
