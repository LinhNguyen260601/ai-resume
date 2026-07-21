import { validateCvUploadFile } from '#/models/cv-upload-file'
import { describe, expect, it } from 'vitest'

describe('validateCvUploadFile', () => {
  it('returns null for a valid PDF under 10MB', () => {
    const file = new File(['x'], 'cv.pdf', { type: 'application/pdf' })
    expect(validateCvUploadFile(file)).toBeNull()
  })

  it('rejects unsupported mime type', () => {
    const file = new File(['x'], 'cv.txt', { type: 'text/plain' })
    expect(validateCvUploadFile(file)).toBe('Only PDF and DOCX allowed')
  })

  it('rejects files over 10MB', () => {
    const file = new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'big.pdf', {
      type: 'application/pdf',
    })
    expect(validateCvUploadFile(file)).toBe('File too large (max 10MB)')
  })
})
