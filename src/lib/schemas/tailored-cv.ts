import { enum as zenum, object, uuid } from 'zod'
import type { infer as zodInfer } from 'zod'
import { cvContentSchema } from '#/lib/schemas/cv'

export const templateIdSchema = zenum([
  'classic',
  'modern',
  'creative',
  'compact',
])

export const getTailoredCvSchema = object({
  id: uuid(),
})

export const updateTailoredCvSchema = object({
  id: uuid(),
  content: cvContentSchema,
  template_id: templateIdSchema.optional(),
})

export type GetTailoredCvInput = zodInfer<typeof getTailoredCvSchema>
export type UpdateTailoredCvInput = zodInfer<typeof updateTailoredCvSchema>
export type TemplateId = zodInfer<typeof templateIdSchema>

export const TEMPLATE_OPTIONS: { id: TemplateId; label: string }[] = [
  { id: 'classic', label: 'Classic Professional' },
  { id: 'modern', label: 'Modern Minimal' },
  { id: 'creative', label: 'Creative' },
  { id: 'compact', label: 'Compact' },
]
