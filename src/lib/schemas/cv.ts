import { array, email, object, string } from 'zod'
import type { infer as zodInfer } from 'zod'

// LLM output frequently emits `null` for absent fields; coerce it to
// `undefined` so `.optional()` semantics hold and the output type stays `string | undefined`.
const optionalString = () =>
  string()
    .nullish()
    .transform((value) => value ?? undefined)

export const experienceEntrySchema = object({
  id: string(),
  company: string(),
  title: string(),
  location: optionalString(),
  startDate: string(),
  endDate: optionalString(),
  bullets: array(string()),
})

export const cvContentSchema = object({
  personal: object({
    fullName: string(),
    email: email(),
    phone: optionalString(),
    location: optionalString(),
    linkedin: optionalString(),
    website: optionalString(),
    summary: string()
      .nullish()
      .transform((value) => value ?? ''),
  }),
  experience: array(experienceEntrySchema),
  education: array(
    object({
      id: string(),
      institution: string(),
      degree: string(),
      field: optionalString(),
      graduationDate: optionalString(),
      bullets: array(string()).optional(),
    }),
  ),
  skills: object({
    technical: array(string()),
    soft: array(string()).optional(),
    languages: array(string()).optional(),
  }),
  certifications: array(
    object({
      id: string(),
      name: string(),
      issuer: optionalString(),
      date: optionalString(),
    }),
  ).optional(),
  projects: array(
    object({
      id: string(),
      name: string(),
      description: string(),
      bullets: array(string()).optional(),
    }),
  ).optional(),
})

export type CvContent = zodInfer<typeof cvContentSchema>
