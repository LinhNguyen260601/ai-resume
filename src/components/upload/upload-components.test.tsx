/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Dropzone } from './dropzone'
import { ParsedCvSummary } from './parsed-cv-summary'
import { PreviousUploadsList } from './previous-uploads-list'
import { UploadProgress } from './upload-progress'

afterEach(function cleanupDom() {
  cleanup()
})

describe('upload presentation components', function uploadComponentsSuite() {
  it('passes a selected file to the dropzone handler', function selectFile() {
    const onFile = vi.fn()
    render(<Dropzone disabled={false} error={null} onFile={onFile} />)
    const file = new File(['cv'], 'resume.pdf', { type: 'application/pdf' })

    fireEvent.change(screen.getByLabelText('Choose file'), {
      target: { files: [file] },
    })

    expect(onFile).toHaveBeenCalledWith(file)
  })

  it('shows the active upload stage', function showUploadStage() {
    render(<UploadProgress stage="structuring" />)

    expect(screen.getByText('Uploading')).toBeTruthy()
    expect(screen.getByText('Parsing')).toBeTruthy()
    expect(screen.getByText('Structuring')).toBeTruthy()
    expect(screen.getByRole('list').getAttribute('aria-busy')).toBe('true')
  })

  it('renders parsed stats and forwards review actions', function reviewSummary() {
    const onLooksGood = vi.fn()
    const onReParse = vi.fn()
    render(
      <ParsedCvSummary
        stats={{ fullName: 'Ada Lovelace', experienceCount: 3, skillCount: 8 }}
        fileName="ada.pdf"
        onLooksGood={onLooksGood}
        onReParse={onReParse}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Looks good' }))
    fireEvent.click(screen.getByRole('button', { name: 'Re-parse' }))

    expect(screen.getByText('Ada Lovelace')).toBeTruthy()
    expect(screen.getByText('ada.pdf')).toBeTruthy()
    expect(onLooksGood).toHaveBeenCalledOnce()
    expect(onReParse).toHaveBeenCalledOnce()
  })

  it('summarizes valid previous uploads', function summarizePreviousUploads() {
    render(
      <PreviousUploadsList
        items={[
          {
            id: 'cv-1',
            file_name: 'ada.pdf',
            created_at: '2026-07-21T00:00:00.000Z',
            content: {
              personal: {
                fullName: 'Ada Lovelace',
                email: 'ada@example.com',
                summary: 'Computing pioneer',
              },
              experience: [],
              education: [],
              skills: { technical: ['TypeScript'] },
            },
          },
        ]}
        isLoading={false}
        highlightNewest
      />,
    )

    expect(screen.getByText('ada.pdf')).toBeTruthy()
    expect(screen.getByText(/Ada Lovelace/)).toBeTruthy()
  })
})
