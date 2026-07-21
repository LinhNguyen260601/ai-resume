import { describe, expect, it } from 'vitest'
import { cvUploadSchema } from './cv-upload'

describe('cvUploadSchema', () => {
  it('accepts a valid PDF file', () => {
    const file = new File(['content'], 'resume.pdf', {
      type: 'application/pdf',
    })
    const formData = new FormData()
    formData.append('file', file)

    const result = cvUploadSchema.safeParse(formData)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.file.name).toBe('resume.pdf')
  })

  it('rejects missing file', () => {
    const formData = new FormData()
    const result = cvUploadSchema.safeParse(formData)
    expect(result.success).toBe(false)
  })

  it('rejects unsupported mime type', () => {
    const file = new File(['content'], 'resume.txt', { type: 'text/plain' })
    const formData = new FormData()
    formData.append('file', file)

    const result = cvUploadSchema.safeParse(formData)
    expect(result.success).toBe(false)
  })
})
