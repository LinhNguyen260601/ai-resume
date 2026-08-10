import { describe, expect, it } from 'vitest'
import { buildJobMarkdownPrompt } from './job-markdown'

describe('buildJobMarkdownPrompt', () => {
  it('asks for markdown structure without inventing content', () => {
    const prompt = buildJobMarkdownPrompt('We need a React engineer.')
    expect(prompt).toContain('We need a React engineer.')
    expect(prompt).toMatch(/markdown/i)
    expect(prompt).toMatch(/do not invent/i)
    expect(prompt).toMatch(/headings|bullet|# /i)
  })
})
