import { describe, expect, it } from 'vitest'
import {
  applyScrapeToForm,
  buildCreateJobPostingInput,
  validateJobForm,
  validateScrapeUrl,
} from './job-form'

describe('validateScrapeUrl', () => {
  it('rejects empty url', () => {
    expect(validateScrapeUrl('')).toBe('Enter a job posting URL')
  })

  it('rejects invalid url', () => {
    expect(validateScrapeUrl('not-a-url')).toBe('Enter a valid URL')
  })

  it('accepts https url', () => {
    expect(validateScrapeUrl('https://example.com/jobs/1')).toBeNull()
  })
})

describe('validateJobForm', () => {
  it('requires extracted text', () => {
    expect(
      validateJobForm({
        sourceType: 'paste',
        sourceUrl: '',
        extractedText: '   ',
        companyName: '',
        jobTitle: '',
      }),
    ).toBe('Job description is required')
  })

  it('accepts paste with text', () => {
    expect(
      validateJobForm({
        sourceType: 'paste',
        sourceUrl: '',
        extractedText: 'We are hiring…',
        companyName: 'Acme',
        jobTitle: 'Engineer',
      }),
    ).toBeNull()
  })

  it('rejects invalid source url when source is url', () => {
    expect(
      validateJobForm({
        sourceType: 'url',
        sourceUrl: 'bad',
        extractedText: 'Job body',
        companyName: '',
        jobTitle: '',
      }),
    ).toBe('Enter a valid URL')
  })
})

describe('buildCreateJobPostingInput', () => {
  it('maps paste values and omits empty optionals', () => {
    expect(
      buildCreateJobPostingInput({
        sourceType: 'paste',
        sourceUrl: 'https://ignored.example',
        extractedText: '  Hello role  ',
        companyName: '  ',
        jobTitle: '  Engineer ',
      }),
    ).toEqual({
      source_type: 'paste',
      extracted_text: 'Hello role',
      source_url: undefined,
      company_name: undefined,
      job_title: 'Engineer',
    })
  })

  it('includes source_url for url source', () => {
    expect(
      buildCreateJobPostingInput({
        sourceType: 'url',
        sourceUrl: 'https://example.com/jobs/1',
        extractedText: 'Body',
        companyName: 'Acme',
        jobTitle: 'Role',
      }),
    ).toEqual({
      source_type: 'url',
      source_url: 'https://example.com/jobs/1',
      extracted_text: 'Body',
      company_name: 'Acme',
      job_title: 'Role',
    })
  })
})

describe('applyScrapeToForm', () => {
  it('fills text and meta from scrape result', () => {
    expect(
      applyScrapeToForm(
        {
          sourceType: 'url',
          sourceUrl: 'https://example.com/jobs/1',
          extractedText: '',
          companyName: '',
          jobTitle: 'Keep me if missing',
        },
        {
          extracted_text: 'Scraped JD',
          company_name: 'Acme',
          job_title: undefined,
        },
      ),
    ).toEqual({
      sourceType: 'url',
      sourceUrl: 'https://example.com/jobs/1',
      extractedText: 'Scraped JD',
      companyName: 'Acme',
      jobTitle: 'Keep me if missing',
    })
  })
})
