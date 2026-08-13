import { describe, expect, it } from 'vitest'
import { toPdfFilename } from '#/models/cv-export'

describe('toPdfFilename', () => {
  it('appends .pdf to a plain title', () => {
    expect(toPdfFilename('Frontend Engineer at Acme')).toBe(
      'Frontend Engineer at Acme.pdf',
    )
  })

  it('strips characters unsafe for filenames', () => {
    expect(toPdfFilename('Backend/API: Engineer? "Lead"')).toBe(
      'BackendAPI Engineer Lead.pdf',
    )
  })

  it('falls back to CV.pdf for a blank title', () => {
    expect(toPdfFilename('   ')).toBe('CV.pdf')
  })
})
