import { enum as zenum, object, string, url } from 'zod'

// LLM output frequently emits `null` for absent fields; coerce it to
// `undefined` so `.optional()` semantics hold.
const optionalString = () =>
  string()
    .nullish()
    .transform((value) => value ?? undefined)

export const scrapeJobUrlSchema = object({
  url: url(),
})

export const jobMetaSchema = object({
  company_name: optionalString(),
  job_title: optionalString(),
  extracted_text: string().min(1),
})

export const createJobPostingSchema = object({
  source_type: zenum(['paste', 'url']),
  source_url: url().optional(),
  extracted_text: string().min(1),
  company_name: optionalString(),
  job_title: optionalString(),
})

export const extractedTextSchema = object({
  extracted_text: string().min(1),
})

export const jobTitleCompanySchema = object({
  company_name: string().nullish(),
  job_title: string().nullish(),
})
