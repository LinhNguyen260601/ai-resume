import { describe, expect, it } from 'vitest'
import type { CvContent } from '#/lib/schemas/cv'
import { summarizeCvContent } from './cv-summary'

function makeContent(overrides: Partial<CvContent> = {}): CvContent {
  return {
    personal: {
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      summary: 'Mathematician',
    },
    experience: [
      {
        id: '1',
        company: 'Analytical Engines',
        title: 'Engineer',
        startDate: '1840',
        bullets: ['Wrote notes'],
      },
    ],
    education: [],
    skills: {
      technical: ['Math', 'Logic'],
      soft: ['Communication'],
      languages: ['English'],
    },
    ...overrides,
  }
}

describe('summarizeCvContent', () => {
  it('returns name, experience count, and combined skill count', () => {
    const stats = summarizeCvContent(makeContent())
    expect(stats).toEqual({
      fullName: 'Ada Lovelace',
      experienceCount: 1,
      skillCount: 4,
    })
  })

  it('treats missing soft/languages as empty', () => {
    const stats = summarizeCvContent(
      makeContent({
        skills: { technical: ['Math'] },
      }),
    )
    expect(stats.skillCount).toBe(1)
  })
})
