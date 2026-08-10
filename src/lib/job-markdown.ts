export const JOB_MARKDOWN_SCHEMA_DESC =
  '{ company_name?: string, job_title?: string, extracted_text: string }'

export function buildJobMarkdownPrompt(rawText: string): string {
  return `Format this job posting for readable display.

Rules:
- Rewrite extracted_text as clean Markdown with headings (##), bullet lists, and bold labels
- Keep sections such as About the role, Responsibilities, Requirements, Benefits when present
- Preserve all factual content; do not invent skills, duties, or benefits
- Omit site chrome: navigation, related jobs, industry tag clouds, ads, footers
- Prefer the language of the original posting
- Also extract company_name and job_title when present

Posting:
${rawText}`
}
