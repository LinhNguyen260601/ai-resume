import { object, uuid } from 'zod'
import type { infer as zodInfer } from 'zod'

export const tailorCvForJobSchema = object({
  baseCvId: uuid(),
  jobPostingId: uuid(),
})

export type TailorCvForJobInput = zodInfer<typeof tailorCvForJobSchema>
