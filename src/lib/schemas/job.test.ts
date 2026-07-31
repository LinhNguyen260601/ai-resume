import {
  createJobPostingSchema,
  jobMetaSchema,
  scrapeJobUrlSchema,
} from '#/lib/schemas/job'
import { describe, expect, it } from 'vitest'

describe('scrapeJobUrlSchema', () => {
  it('accepts a valid http(s) url', () => {
    const result = scrapeJobUrlSchema.safeParse({
      url: 'https://example.com/jobs/123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects a missing url', () => {
    const result = scrapeJobUrlSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rejects a non-url string', () => {
    const result = scrapeJobUrlSchema.safeParse({ url: 'not-a-url' })
    expect(result.success).toBe(false)
  })
})

describe('createJobPostingSchema', () => {
  it('accepts a paste posting with required text', () => {
    const result = createJobPostingSchema.safeParse({
      source_type: 'paste',
      extracted_text: 'We are hiring a senior engineer…',
      company_name: 'Acme',
      job_title: 'Senior Engineer',
    })
    expect(result.success).toBe(true)
  })

  it('accepts a url posting with optional source_url', () => {
    const result = createJobPostingSchema.safeParse({
      source_type: 'url',
      source_url: 'https://example.com/jobs/123',
      extracted_text: 'Full job description text here.',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty extracted_text', () => {
    const result = createJobPostingSchema.safeParse({
      source_type: 'paste',
      extracted_text: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid source_type', () => {
    const result = createJobPostingSchema.safeParse({
      source_type: 'email',
      extracted_text: 'Some text',
    })
    expect(result.success).toBe(false)
  })
})

describe('jobMetaSchema', () => {
  it('accepts extracted_text with optional company and title', () => {
    const result = jobMetaSchema.safeParse({
      extracted_text: 'Job body',
      company_name: 'Acme',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.job_title).toBeUndefined()
    }
  })

  it('coerces null optional fields to undefined', () => {
    const result = jobMetaSchema.safeParse({
      extracted_text: 'Job body',
      company_name: null,
      job_title: null,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.company_name).toBeUndefined()
      expect(result.data.job_title).toBeUndefined()
    }
  })
})
