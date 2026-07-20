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
