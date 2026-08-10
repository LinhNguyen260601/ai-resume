import { describe, expect, it } from 'vitest'
import { buildTailorCvPrompt } from '#/lib/tailor-prompt'
import type { CvContent } from '#/lib/schemas/cv'

const cvContent: CvContent = {
  personal: {
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    phone: undefined,
    location: undefined,
    linkedin: undefined,
    website: undefined,
    summary: 'Software engineer',
  },
  experience: [],
  education: [],
  skills: { technical: ['TypeScript'] },
}

describe('buildTailorCvPrompt', () => {
  it('includes the CV content and job text without inventing content', () => {
    const prompt = buildTailorCvPrompt(cvContent, 'We need a React engineer.')
    expect(prompt).toContain('Jane Doe')
    expect(prompt).toContain('We need a React engineer.')
    expect(prompt).toMatch(/do not invent/i)
  })
})
