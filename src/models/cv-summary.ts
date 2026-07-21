import type { CvContent } from '#/lib/schemas/cv'

export type CvSummaryStats = {
  fullName: string
  experienceCount: number
  skillCount: number
}

export function summarizeCvContent(content: CvContent): CvSummaryStats {
  const soft = content.skills.soft?.length ?? 0
  const languages = content.skills.languages?.length ?? 0
  return {
    fullName: content.personal.fullName,
    experienceCount: content.experience.length,
    skillCount: content.skills.technical.length + soft + languages,
  }
}
