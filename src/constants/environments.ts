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
  DEFAULT_PROFILE_ID: readEnv('VITE_DEFAULT_PROFILE_ID'),
} as const
