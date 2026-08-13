import { describe, expect, it } from 'vitest'
import {
  getTailoredCvSchema,
  templateIdSchema,
  updateTailoredCvSchema,
} from '#/lib/schemas/tailored-cv'

const VALID_ID = '11111111-1111-4111-8111-111111111111'

const VALID_CONTENT = {
  personal: {
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    summary: 'Software engineer',
  },
  experience: [],
  education: [],
  skills: { technical: ['TypeScript'] },
}

describe('getTailoredCvSchema', () => {
  it('accepts a valid uuid', () => {
    expect(getTailoredCvSchema.safeParse({ id: VALID_ID }).success).toBe(true)
  })

  it('rejects a non-uuid id', () => {
    expect(getTailoredCvSchema.safeParse({ id: 'nope' }).success).toBe(false)
  })
})

describe('templateIdSchema', () => {
  it('accepts each known template id', () => {
    for (const id of ['classic', 'modern', 'creative', 'compact']) {
      expect(templateIdSchema.safeParse(id).success).toBe(true)
    }
  })

  it('rejects an unknown template id', () => {
    expect(templateIdSchema.safeParse('flashy').success).toBe(false)
  })
})

describe('updateTailoredCvSchema', () => {
  it('accepts a valid update without template_id', () => {
    const result = updateTailoredCvSchema.safeParse({
      id: VALID_ID,
      content: VALID_CONTENT,
    })
    expect(result.success).toBe(true)
  })

  it('accepts a valid update with template_id', () => {
    const result = updateTailoredCvSchema.safeParse({
      id: VALID_ID,
      content: VALID_CONTENT,
      template_id: 'creative',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an invalid template_id', () => {
    const result = updateTailoredCvSchema.safeParse({
      id: VALID_ID,
      content: VALID_CONTENT,
      template_id: 'nope',
    })
    expect(result.success).toBe(false)
  })

  it('rejects malformed content', () => {
    const result = updateTailoredCvSchema.safeParse({
      id: VALID_ID,
      content: { personal: {} },
    })
    expect(result.success).toBe(false)
  })
})
