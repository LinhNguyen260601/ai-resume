import { v4 as uuid } from 'uuid'
import type { CvContent } from '#/lib/schemas/cv'

type PersonalField = keyof CvContent['personal']
type ExperienceEntry = CvContent['experience'][number]
type ExperienceField = 'company' | 'title' | 'location' | 'startDate' | 'endDate'
type EducationEntry = CvContent['education'][number]
type EducationField = 'institution' | 'degree' | 'field' | 'graduationDate'
type SkillsField = keyof CvContent['skills']

export function updatePersonalField(
  content: CvContent,
  field: PersonalField,
  value: string,
): CvContent {
  return {
    ...content,
    personal: { ...content.personal, [field]: value },
  }
}

export function updateSummary(content: CvContent, value: string): CvContent {
  return updatePersonalField(content, 'summary', value)
}

function createEmptyExperience(): ExperienceEntry {
  return {
    id: uuid(),
    company: '',
    title: '',
    location: undefined,
    startDate: '',
    endDate: undefined,
    bullets: [],
  }
}

export function addExperience(content: CvContent): CvContent {
  return {
    ...content,
    experience: [...content.experience, createEmptyExperience()],
  }
}

export function removeExperience(content: CvContent, id: string): CvContent {
  return {
    ...content,
    experience: content.experience.filter((entry) => entry.id !== id),
  }
}

export function updateExperienceField(
  content: CvContent,
  id: string,
  field: ExperienceField,
  value: string,
): CvContent {
  return {
    ...content,
    experience: content.experience.map((entry) =>
      entry.id === id ? { ...entry, [field]: value } : entry,
    ),
  }
}

export function addExperienceBullet(
  content: CvContent,
  id: string,
): CvContent {
  return {
    ...content,
    experience: content.experience.map((entry) =>
      entry.id === id ? { ...entry, bullets: [...entry.bullets, ''] } : entry,
    ),
  }
}

export function updateExperienceBullet(
  content: CvContent,
  id: string,
  index: number,
  value: string,
): CvContent {
  return {
    ...content,
    experience: content.experience.map((entry) =>
      entry.id === id
        ? {
            ...entry,
            bullets: entry.bullets.map((bullet, i) =>
              i === index ? value : bullet,
            ),
          }
        : entry,
    ),
  }
}

export function removeExperienceBullet(
  content: CvContent,
  id: string,
  index: number,
): CvContent {
  return {
    ...content,
    experience: content.experience.map((entry) =>
      entry.id === id
        ? { ...entry, bullets: entry.bullets.filter((_, i) => i !== index) }
        : entry,
    ),
  }
}

function createEmptyEducation(): EducationEntry {
  return {
    id: uuid(),
    institution: '',
    degree: '',
    field: undefined,
    graduationDate: undefined,
  }
}

export function addEducation(content: CvContent): CvContent {
  return {
    ...content,
    education: [...content.education, createEmptyEducation()],
  }
}

export function removeEducation(content: CvContent, id: string): CvContent {
  return {
    ...content,
    education: content.education.filter((entry) => entry.id !== id),
  }
}

export function updateEducationField(
  content: CvContent,
  id: string,
  field: EducationField,
  value: string,
): CvContent {
  return {
    ...content,
    education: content.education.map((entry) =>
      entry.id === id ? { ...entry, [field]: value } : entry,
    ),
  }
}

export function skillsToText(list: string[] | undefined): string {
  return (list ?? []).join(', ')
}

export function updateSkillsText(
  content: CvContent,
  field: SkillsField,
  text: string,
): CvContent {
  const list = text
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
  return {
    ...content,
    skills: { ...content.skills, [field]: list },
  }
}
