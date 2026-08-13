import { describe, expect, it } from 'vitest'
import { exportPdfSchema } from '#/lib/schemas/export'

const VALID_ID = '11111111-1111-4111-8111-111111111111'

describe('exportPdfSchema', () => {
  it('accepts a valid id without a template override', () => {
    expect(exportPdfSchema.safeParse({ tailoredCvId: VALID_ID }).success).toBe(
      true,
    )
  })

  it('accepts a valid id with a known template id', () => {
    const result = exportPdfSchema.safeParse({
      tailoredCvId: VALID_ID,
      templateId: 'compact',
    })
    expect(result.success).toBe(true)
  })

  it('rejects a non-uuid id', () => {
    expect(exportPdfSchema.safeParse({ tailoredCvId: 'nope' }).success).toBe(
      false,
    )
  })

  it('rejects an unknown template id', () => {
    const result = exportPdfSchema.safeParse({
      tailoredCvId: VALID_ID,
      templateId: 'flashy',
    })
    expect(result.success).toBe(false)
  })
})
