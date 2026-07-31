import type { JobFormValues } from '#/models/job-form'
import {
  applyScrapeToForm,
  buildCreateJobPostingInput,
  emptyJobFormValues,
  validateJobForm,
  validateScrapeUrl,
} from '#/models/job-form'
import { JOB_FETCH_BLOCKED_MESSAGE } from '#/lib/job-fetch-errors'
import { createJobPosting, scrapeJobUrl } from '#/server/jobs'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'

type UseJobFormOptions = {
  onCreated: (jobId: string) => void
}

function scrapeErrorMessage(err: Error): string {
  const message = err.message || ''
  if (
    message === JOB_FETCH_BLOCKED_MESSAGE ||
    /Fetch failed: (401|403|429)\b/.test(message)
  ) {
    return JOB_FETCH_BLOCKED_MESSAGE
  }
  return message || 'Could not fetch job posting'
}

export function useJobForm({ onCreated }: UseJobFormOptions) {
  const [values, setValues] = useState<JobFormValues>(emptyJobFormValues)
  const [error, setError] = useState<string | null>(null)

  const scrape = useMutation({
    mutationFn: async (url: string) => scrapeJobUrl({ data: { url } }),
    onSuccess(meta) {
      setValues((current) => applyScrapeToForm(current, meta))
      setError(null)
    },
    onError(err: Error) {
      setError(scrapeErrorMessage(err))
    },
  })

  const create = useMutation({
    mutationFn: async (input: ReturnType<typeof buildCreateJobPostingInput>) =>
      createJobPosting({ data: input }) as Promise<{ id: string }>,
    onSuccess(row) {
      setError(null)
      onCreated(row.id)
    },
    onError(err: Error) {
      setError(err.message || 'Could not save job posting')
    },
  })

  function onChange(patch: Partial<JobFormValues>) {
    setValues((current) => ({ ...current, ...patch }))
    if (error) setError(null)
  }

  function onSourceTypeChange(sourceType: JobFormValues['sourceType']) {
    onChange({ sourceType })
  }

  function onScrape() {
    const validationError = validateScrapeUrl(values.sourceUrl)
    if (validationError) {
      setError(validationError)
      return
    }
    scrape.mutate(values.sourceUrl.trim())
  }

  function onSubmit() {
    const validationError = validateJobForm(values)
    if (validationError) {
      setError(validationError)
      return
    }
    create.mutate(buildCreateJobPostingInput(values))
  }

  return {
    values,
    error,
    isScraping: scrape.isPending,
    isSubmitting: create.isPending,
    onSourceTypeChange,
    onChange,
    onScrape,
    onSubmit,
  }
}
