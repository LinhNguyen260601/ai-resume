/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { JobDescriptionMarkdown } from './job-description-markdown'

afterEach(function cleanupDom() {
  cleanup()
})

describe('JobDescriptionMarkdown', function markdownSuite() {
  it('renders markdown headings and lists', function renderMarkdown() {
    render(
      <JobDescriptionMarkdown
        content={`# Senior Engineer

- TypeScript
- React`}
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'Senior Engineer' }),
    ).toBeTruthy()
    expect(screen.getByText('TypeScript')).toBeTruthy()
    expect(screen.getByText('React')).toBeTruthy()
  })

  it('shows empty label when content is blank', function emptyState() {
    render(<JobDescriptionMarkdown content="   " emptyLabel="Nothing yet" />)
    expect(screen.getByText('Nothing yet')).toBeTruthy()
  })
})
