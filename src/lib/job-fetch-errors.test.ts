import { describe, expect, it } from 'vitest'
import {
  JOB_FETCH_BLOCKED_MESSAGE,
  jobFetchFailureMessage,
} from './job-fetch-errors'

describe('jobFetchFailureMessage', () => {
  it('returns paste-manually copy for blocked statuses', () => {
    expect(jobFetchFailureMessage(403)).toBe(JOB_FETCH_BLOCKED_MESSAGE)
    expect(jobFetchFailureMessage(401)).toBe(JOB_FETCH_BLOCKED_MESSAGE)
    expect(jobFetchFailureMessage(429)).toBe(JOB_FETCH_BLOCKED_MESSAGE)
  })

  it('returns status detail for other failures', () => {
    expect(jobFetchFailureMessage(500)).toBe('Fetch failed: 500')
    expect(jobFetchFailureMessage(404)).toBe('Fetch failed: 404')
  })
})
