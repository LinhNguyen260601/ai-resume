import { array, email, object, string } from 'zod'
import type { infer as zodInfer } from 'zod'

export const experienceEntrySchema = object({
  id: string(),
  company: string(),
  title: string(),
  location: string().optional(),
  startDate: string(),
  endDate: string().optional(),
  bullets: array(string()),
})

export const cvContentSchema = object({
  personal: object({
    fullName: string(),
    email: email(),
    phone: string().optional(),
    location: string().optional(),
    linkedin: string().optional(),
    website: string().optional(),
    summary: string(),
  }),
  experience: array(experienceEntrySchema),
  education: array(
    object({
      id: string(),
      institution: string(),
      degree: string(),
      field: string().optional(),
      graduationDate: string().optional(),
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
      issuer: string().optional(),
      date: string().optional(),
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
