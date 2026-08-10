/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { JobForm } from '#/components/jobs/job-form'
import { emptyJobFormValues } from '#/models/job-form'

afterEach(function cleanupDom() {
  cleanup()
})

describe('JobForm', function jobFormSuite() {
  it('shows paste fields by default and url fields when sourceType is url', function sourceTabs() {
    const { rerender } = render(
      <JobForm
        values={emptyJobFormValues}
        error={null}
        isScraping={false}
        isSubmitting={false}
        onSourceTypeChange={vi.fn()}
        onChange={vi.fn()}
        onScrape={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByLabelText('Job description')).toBeTruthy()
    expect(screen.queryByLabelText('Job posting URL')).toBeNull()

    rerender(
      <JobForm
        values={{ ...emptyJobFormValues, sourceType: 'url' }}
        error={null}
        isScraping={false}
        isSubmitting={false}
        onSourceTypeChange={vi.fn()}
        onChange={vi.fn()}
        onScrape={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByLabelText('Job posting URL')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Fetch' })).toBeTruthy()
  })

  it('calls onScrape from the url tab fetch button', function scrapeFromUrl() {
    const onScrape = vi.fn()
    render(
      <JobForm
        values={{ ...emptyJobFormValues, sourceType: 'url' }}
        error={null}
        isScraping={false}
        isSubmitting={false}
        onSourceTypeChange={vi.fn()}
        onChange={vi.fn()}
        onScrape={onScrape}
        onSubmit={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Fetch' }))
    expect(onScrape).toHaveBeenCalledTimes(1)
  })

  it('submits the form', function submitForm() {
    const onSubmit = vi.fn()
    render(
      <JobForm
        values={{
          ...emptyJobFormValues,
          extractedText: 'Hiring a designer',
        }}
        error={null}
        isScraping={false}
        isSubmitting={false}
        onSourceTypeChange={vi.fn()}
        onChange={vi.fn()}
        onScrape={vi.fn()}
        onSubmit={onSubmit}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('shows an error alert', function showError() {
    render(
      <JobForm
        values={emptyJobFormValues}
        error="Job description is required"
        isScraping={false}
        isSubmitting={false}
        onSourceTypeChange={vi.fn()}
        onChange={vi.fn()}
        onScrape={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByRole('alert').textContent).toContain(
      'Job description is required',
    )
  })

  it('focuses the url description when fetch is blocked', function focusOnBlockedFetch() {
    render(
      <JobForm
        values={{ ...emptyJobFormValues, sourceType: 'url' }}
        error={"Couldn't fetch — paste manually"}
        isScraping={false}
        isSubmitting={false}
        onSourceTypeChange={vi.fn()}
        onChange={vi.fn()}
        onScrape={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )

    expect(document.activeElement).toBe(
      screen.getByLabelText('Job description'),
    )
  })

  it('previews fetched job description as markdown', function previewMarkdown() {
    render(
      <JobForm
        values={{
          ...emptyJobFormValues,
          sourceType: 'url',
          extractedText: '## Role\n\nBuild resumes with AI',
        }}
        error={null}
        isScraping={false}
        isSubmitting={false}
        onSourceTypeChange={vi.fn()}
        onChange={vi.fn()}
        onScrape={vi.fn()}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Role' })).toBeTruthy()
    expect(screen.getByText('Build resumes with AI')).toBeTruthy()
  })
})
