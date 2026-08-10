import { describe, expect, it } from 'vitest'
import { tailorCvForJobSchema } from '#/lib/schemas/tailor'

describe('tailorCvForJobSchema', () => {
  it('accepts valid uuids', () => {
    const result = tailorCvForJobSchema.safeParse({
      baseCvId: '11111111-1111-4111-8111-111111111111',
      jobPostingId: '22222222-2222-4222-8222-222222222222',
    })
    expect(result.success).toBe(true)
  })

  it('rejects a non-uuid baseCvId', () => {
    const result = tailorCvForJobSchema.safeParse({
      baseCvId: 'not-a-uuid',
      jobPostingId: '22222222-2222-4222-8222-222222222222',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a missing jobPostingId', () => {
    const result = tailorCvForJobSchema.safeParse({
      baseCvId: '11111111-1111-4111-8111-111111111111',
    })
    expect(result.success).toBe(false)
  })
})
