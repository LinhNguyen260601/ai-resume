import { custom, instanceof as instanceOf, object } from 'zod'
import type { infer as zodInfer } from 'zod'

export const CV_UPLOAD_MAX_BYTES = 10 * 1024 * 1024

export const CV_UPLOAD_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const

const cvUploadFileSchema = custom<File>((value) => value instanceof File, {
  error: 'No file provided',
}).superRefine((file, ctx) => {
  if (!(CV_UPLOAD_MIME_TYPES as readonly string[]).includes(file.type)) {
    ctx.addIssue({ code: 'custom', message: 'Only PDF and DOCX allowed' })
  }
  if (file.size > CV_UPLOAD_MAX_BYTES) {
    ctx.addIssue({ code: 'custom', message: 'File too large (max 10MB)' })
  }
})

export const cvUploadSchema = instanceOf(FormData)
  .transform((formData) => ({ file: formData.get('file') }))
  .pipe(object({ file: cvUploadFileSchema }))

export type CvUploadInput = zodInfer<typeof cvUploadSchema>
