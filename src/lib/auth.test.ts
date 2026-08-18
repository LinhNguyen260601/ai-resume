import { describe, expect, it, vi, beforeEach } from 'vitest'

const mockGetAuth = vi.fn()
vi.mock('@clerk/tanstack-react-start/server', () => ({
  auth: () => mockGetAuth(),
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
