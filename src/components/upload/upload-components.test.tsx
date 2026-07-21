/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createElement } from 'react'
import type { ComponentProps, ElementType } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useReducedMotion } from 'motion/react'
import { Dropzone } from './dropzone'
import { ParsedCvSummary } from './parsed-cv-summary'
import { PreviousUploadsList } from './previous-uploads-list'
import { UploadProgress } from './upload-progress'

vi.mock('motion/react', function mockMotion() {
  function createMotionComponent<T extends ElementType>(element: T) {
    return function MotionComponent({
      initial,
      animate,
      transition,
      layout,
      ...props
    }: ComponentProps<T> & {
      initial?: false | Record<string, unknown>
      animate?: Record<string, unknown>
      transition?: Record<string, unknown>
      layout?: boolean
    }) {
      return createElement(element, {
        ...props,
        'data-initial': initial === false ? 'false' : JSON.stringify(initial),
        'data-animate': JSON.stringify(animate),
        'data-transition': JSON.stringify(transition),
        'data-layout': String(Boolean(layout)),
      })
    }
  }

  return {
    motion: {
      div: createMotionComponent('div'),
      li: createMotionComponent('li'),
    },
    useReducedMotion: vi.fn(),
  }
})

const mockedUseReducedMotion = vi.mocked(useReducedMotion)

beforeEach(function resetMotionPreference() {
  mockedUseReducedMotion.mockReturnValue(false)
})

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
    expect(
      screen
        .getByText('Structuring')
        .closest('li')
        ?.getAttribute('aria-current'),
    ).toBe('step')
  })

  it('renders upload animations statically with reduced motion', function reducedMotion() {
    mockedUseReducedMotion.mockReturnValue(true)

    const { rerender } = render(
      <ParsedCvSummary
        stats={{ fullName: 'Ada Lovelace', experienceCount: 3, skillCount: 8 }}
        fileName="ada.pdf"
        onLooksGood={vi.fn()}
        onReParse={vi.fn()}
      />,
    )

    expect(
      screen.getByText('Ada Lovelace').closest('[data-initial]'),
    ).toMatchObject({
      dataset: {
        initial: 'false',
      },
    })

    rerender(<UploadProgress stage="structuring" />)
    const progressSteps = screen.getByRole('list').querySelectorAll('li')
    progressSteps.forEach(function assertStaticStep(step) {
      expect(step.getAttribute('data-animate')).toBeNull()
      expect(step.dataset.layout).toBe('false')
    })

    rerender(
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
    const previousUpload = screen.getByText('ada.pdf').closest('[data-initial]')
    expect(previousUpload?.getAttribute('data-initial')).toBe('false')
    expect(previousUpload?.getAttribute('data-transition')).toBe(
      JSON.stringify({ delay: 0, duration: 0 }),
    )

    rerender(<Dropzone disabled={false} error={null} onFile={vi.fn()} />)
    fireEvent.dragOver(
      screen.getByText(/Drag & drop/).closest('[data-animate]')!,
    )
    expect(
      screen
        .getByText(/Drag & drop/)
        .closest('[data-transition]')
        ?.getAttribute('data-transition'),
    ).toBe(JSON.stringify({ duration: 0 }))
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
