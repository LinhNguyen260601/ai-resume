import { describe, it, expect } from 'vitest'
import { isLowTextQuality } from './pdf-extract'

describe('isLowTextQuality', () => {
  it('flags short text', () => {
    expect(isLowTextQuality('hello')).toBe(true)
  })
  it('accepts long text', () => {
    expect(isLowTextQuality('a'.repeat(200))).toBe(false)
  })
})
