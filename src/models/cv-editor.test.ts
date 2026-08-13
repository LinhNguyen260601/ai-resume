import { describe, expect, it, vi } from 'vitest'
import type { CvContent } from '#/lib/schemas/cv'

vi.mock('uuid', function mockUuid() {
  let count = 0
  return { v4: () => `generated-${++count}` }
})

const {
  addEducation,
  addExperience,
  addExperienceBullet,
  removeEducation,
  removeExperience,
  removeExperienceBullet,
  skillsToText,
  updateEducationField,
  updateExperienceBullet,
  updateExperienceField,
  updatePersonalField,
  updateSkillsText,
  updateSummary,
} = await import('./cv-editor')

const BASE_CONTENT: CvContent = {
  personal: {
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    phone: undefined,
    location: undefined,
    linkedin: undefined,
    website: undefined,
    summary: 'Software engineer',
  },
  experience: [
    {
      id: 'exp-1',
      company: 'Acme',
      title: 'Engineer',
      location: undefined,
      startDate: '2020',
      endDate: undefined,
      bullets: ['Built things'],
    },
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'State University',
      degree: 'BS',
      field: undefined,
      graduationDate: undefined,
    },
  ],
  skills: { technical: ['TypeScript', 'React'] },
}

describe('updatePersonalField', () => {
  it('updates a single personal field without mutating the original', () => {
    const result = updatePersonalField(BASE_CONTENT, 'fullName', 'Ada Doe')
    expect(result.personal.fullName).toBe('Ada Doe')
    expect(BASE_CONTENT.personal.fullName).toBe('Jane Doe')
  })
})

describe('updateSummary', () => {
  it('replaces the summary text', () => {
    const result = updateSummary(BASE_CONTENT, 'Backend specialist')
    expect(result.personal.summary).toBe('Backend specialist')
  })
})

describe('addExperience', () => {
  it('appends a blank experience entry with a generated id', () => {
    const result = addExperience(BASE_CONTENT)
    expect(result.experience).toHaveLength(2)
    expect(result.experience[1]).toMatchObject({
      id: 'generated-1',
      company: '',
      title: '',
      bullets: [],
    })
    expect(BASE_CONTENT.experience).toHaveLength(1)
  })
})

describe('removeExperience', () => {
  it('removes the entry matching the given id', () => {
    const result = removeExperience(BASE_CONTENT, 'exp-1')
    expect(result.experience).toHaveLength(0)
  })

  it('is a no-op when the id is not found', () => {
    const result = removeExperience(BASE_CONTENT, 'missing')
    expect(result.experience).toHaveLength(1)
  })
})

describe('updateExperienceField', () => {
  it('updates a field on the matching experience entry only', () => {
    const withSecond = addExperience(BASE_CONTENT)
    const result = updateExperienceField(
      withSecond,
      'exp-1',
      'company',
      'Globex',
    )
    expect(result.experience[0].company).toBe('Globex')
    expect(result.experience[1].company).toBe('')
  })
})

describe('experience bullets', () => {
  it('adds, updates, and removes bullets on the matching entry', () => {
    const added = addExperienceBullet(BASE_CONTENT, 'exp-1')
    expect(added.experience[0].bullets).toEqual(['Built things', ''])

    const updated = updateExperienceBullet(added, 'exp-1', 1, 'Shipped things')
    expect(updated.experience[0].bullets).toEqual([
      'Built things',
      'Shipped things',
    ])

    const removed = removeExperienceBullet(updated, 'exp-1', 0)
    expect(removed.experience[0].bullets).toEqual(['Shipped things'])
  })
})

describe('addEducation', () => {
  it('appends a blank education entry with a generated id', () => {
    const result = addEducation(BASE_CONTENT)
    expect(result.education).toHaveLength(2)
    expect(result.education[1].id).toMatch(/^generated-/)
    expect(result.education[1]).toMatchObject({
      institution: '',
      degree: '',
    })
  })
})

describe('removeEducation', () => {
  it('removes the entry matching the given id', () => {
    const result = removeEducation(BASE_CONTENT, 'edu-1')
    expect(result.education).toHaveLength(0)
  })
})

describe('updateEducationField', () => {
  it('updates a field on the matching education entry only', () => {
    const result = updateEducationField(
      BASE_CONTENT,
      'edu-1',
      'degree',
      'MS',
    )
    expect(result.education[0].degree).toBe('MS')
  })
})

describe('skillsToText / updateSkillsText', () => {
  it('joins a skills array into comma-separated text', () => {
    expect(skillsToText(['TypeScript', 'React'])).toBe('TypeScript, React')
    expect(skillsToText(undefined)).toBe('')
  })

  it('parses comma-separated text back into a trimmed, non-empty array', () => {
    const result = updateSkillsText(
      BASE_CONTENT,
      'soft',
      'Communication,  Leadership ,, ',
    )
    expect(result.skills.soft).toEqual(['Communication', 'Leadership'])
    expect(result.skills.technical).toEqual(['TypeScript', 'React'])
  })
})
