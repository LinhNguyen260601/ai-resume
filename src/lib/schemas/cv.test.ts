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

  it('coerces null optional fields to undefined', () => {
    const result = cvContentSchema.safeParse({
      personal: {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        linkedin: null,
        summary: 'Software engineer',
      },
      experience: [
        {
          id: '1',
          company: 'Acme',
          title: 'Engineer',
          location: null,
          startDate: '2020',
          bullets: [],
        },
      ],
      education: [],
      skills: { technical: ['TypeScript'] },
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.personal.linkedin).toBeUndefined()
      expect(result.data.experience[0].location).toBeUndefined()
    }
  })

  it('defaults missing summary to empty string', () => {
    const result = cvContentSchema.safeParse({
      personal: {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
      },
      experience: [],
      education: [],
      skills: { technical: ['TypeScript'] },
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.personal.summary).toBe('')
    }
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
