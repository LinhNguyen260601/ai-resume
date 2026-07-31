import type {
  createJobPostingSchema,
  jobMetaSchema,
  scrapeJobUrlSchema,
} from '#/lib/schemas/job'
import type { infer as zodInfer } from 'zod'

export type ScrapeJobUrlInput = zodInfer<typeof scrapeJobUrlSchema>
export type CreateJobPostingInput = zodInfer<typeof createJobPostingSchema>
export type JobMeta = zodInfer<typeof jobMetaSchema>
