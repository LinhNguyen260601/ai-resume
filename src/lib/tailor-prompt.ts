import type { CvContent } from '#/lib/schemas/cv'

export function buildTailorCvPrompt(
  cvContent: CvContent,
  jobText: string,
): string {
  return `Tailor this CV for the job posting below.

Rules:
- Do NOT invent roles, companies, or skills not in the original CV
- Rewrite bullets to align with job keywords
- Reorder skills to prioritize relevant ones
- Adjust summary for this role
- Preserve all id fields exactly as given

CV JSON:
${JSON.stringify(cvContent)}

Job posting:
${jobText}`
}
