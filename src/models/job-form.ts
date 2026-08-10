import type { CreateJobPostingInput, JobMeta } from '#/types/job'

export type JobFormValues = {
  sourceType: 'paste' | 'url'
  sourceUrl: string
  extractedText: string
  companyName: string
  jobTitle: string
}

export const emptyJobFormValues: JobFormValues = {
  sourceType: 'paste',
  sourceUrl: '',
  extractedText: '',
  companyName: '',
  jobTitle: '',
}

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export function validateScrapeUrl(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return 'Enter a job posting URL'
  if (!isValidHttpUrl(trimmed)) return 'Enter a valid URL'
  return null
}

export function validateJobForm(values: JobFormValues): string | null {
  if (!values.extractedText.trim()) return 'Job description is required'
  if (values.sourceType === 'url' && values.sourceUrl.trim()) {
    if (!isValidHttpUrl(values.sourceUrl.trim())) return 'Enter a valid URL'
  }
  return null
}

export function buildCreateJobPostingInput(
  values: JobFormValues,
): CreateJobPostingInput {
  const companyName = values.companyName.trim()
  const jobTitle = values.jobTitle.trim()
  const sourceUrl = values.sourceUrl.trim()

  return {
    source_type: values.sourceType,
    extracted_text: values.extractedText.trim(),
    source_url:
      values.sourceType === 'url' && sourceUrl ? sourceUrl : undefined,
    company_name: companyName || undefined,
    job_title: jobTitle || undefined,
  }
}

export function applyScrapeToForm(
  values: JobFormValues,
  meta: JobMeta,
): JobFormValues {
  return {
    ...values,
    sourceType: 'url',
    extractedText: meta.extracted_text,
    companyName: meta.company_name ?? values.companyName,
    jobTitle: meta.job_title ?? values.jobTitle,
  }
}
