import { object, uuid } from 'zod'
import type { infer as zodInfer } from 'zod'
import { templateIdSchema } from '#/lib/schemas/tailored-cv'

export const exportPdfSchema = object({
  tailoredCvId: uuid(),
  templateId: templateIdSchema.optional(),
})

export type ExportPdfInput = zodInfer<typeof exportPdfSchema>
