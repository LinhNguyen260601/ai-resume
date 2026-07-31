import { assertPublicUrl } from '#/lib/ssrf'
import { describe, it, expect } from 'vitest'

describe('assertPublicUrl', () => {
  it('blocks localhost', () => {
    expect(() => assertPublicUrl('http://localhost/jobs')).toThrow()
  })
  it('allows public URLs', () => {
    expect(assertPublicUrl('https://example.com/jobs').hostname).toBe(
      'example.com',
    )
  })
})
