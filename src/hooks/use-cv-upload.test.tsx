/** @vitest-environment jsdom */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { parseCvUpload } from '#/server/cv'
import { useCvUpload } from '#/hooks/use-cv-upload'

vi.mock('#/server/cv', () => ({
  parseCvUpload: vi.fn(),
}))

const mockedParse = vi.mocked(parseCvUpload)

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
  return Wrapper
}

function pdfFile() {
  return new File(['pdf'], 'resume.pdf', { type: 'application/pdf' })
}

describe('useCvUpload', () => {
  beforeEach(function resetMocks() {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    mockedParse.mockReset()
  })

  afterEach(function restoreTimers() {
    vi.useRealTimers()
  })

  it('rejects invalid files without calling the server', async () => {
    const onConfirmed = vi.fn()
    const { result } = renderHook(() => useCvUpload({ onConfirmed }), {
      wrapper: createWrapper(),
    })

    const bad = new File(['x'], 'notes.txt', { type: 'text/plain' })
    act(function callHandleFile() {
      result.current.handleFile(bad)
    })

    expect(result.current.error).toBe('Only PDF and DOCX allowed')
    expect(result.current.stage).toBe('idle')
    expect(mockedParse).not.toHaveBeenCalled()
  })

  it('moves to review on success and clears on looks good', async () => {
    const onConfirmed = vi.fn()
    mockedParse.mockResolvedValue({
      baseCv: {
        id: 'cv-1',
        file_name: 'resume.pdf',
        created_at: '2026-07-21T00:00:00.000Z',
      },
      content: {
        personal: {
          fullName: 'Ada',
          email: 'ada@example.com',
          summary: 'x',
          phone: undefined,
          location: undefined,
          linkedin: undefined,
          website: undefined,
        },
        experience: [],
        education: [],
        skills: { technical: ['TS'] },
      },
    })

    const { result } = renderHook(() => useCvUpload({ onConfirmed }), {
      wrapper: createWrapper(),
    })

    act(function startUpload() {
      result.current.handleFile(pdfFile())
    })
    expect(result.current.stage).toBe('uploading')

    await act(async function flushSuccess() {
      await vi.runAllTimersAsync()
    })

    await waitFor(function assertReview() {
      expect(result.current.stage).toBe('review')
      expect(result.current.result?.content.personal.fullName).toBe('Ada')
    })

    await act(async function confirm() {
      await result.current.handleLooksGood()
    })

    expect(result.current.stage).toBe('idle')
    expect(result.current.result).toBeNull()
    expect(onConfirmed).toHaveBeenCalledTimes(1)
  })

  it('re-parses using the same file', async () => {
    const onConfirmed = vi.fn()
    mockedParse.mockResolvedValue({
      baseCv: {
        id: 'cv-1',
        file_name: 'resume.pdf',
        created_at: '2026-07-21T00:00:00.000Z',
      },
      content: {
        personal: {
          fullName: 'Ada',
          email: 'ada@example.com',
          summary: 'x',
          phone: undefined,
          location: undefined,
          linkedin: undefined,
          website: undefined,
        },
        experience: [],
        education: [],
        skills: { technical: [] },
      },
    })

    const { result } = renderHook(() => useCvUpload({ onConfirmed }), {
      wrapper: createWrapper(),
    })
    const file = pdfFile()

    act(function firstUpload() {
      result.current.handleFile(file)
    })
    await act(async function flushFirst() {
      await vi.runAllTimersAsync()
    })
    await waitFor(function assertFirstReview() {
      expect(result.current.stage).toBe('review')
    })

    await act(async function reparse() {
      result.current.handleReParse()
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(mockedParse).toHaveBeenCalledTimes(2)
  })

  it('sets inline error and idle on mutation failure', async () => {
    const onConfirmed = vi.fn()
    mockedParse.mockRejectedValue(new Error('Low text quality'))

    const { result } = renderHook(() => useCvUpload({ onConfirmed }), {
      wrapper: createWrapper(),
    })

    act(function startUpload() {
      result.current.handleFile(pdfFile())
    })
    await act(async function flushError() {
      await vi.runAllTimersAsync()
    })

    await waitFor(function assertError() {
      expect(result.current.stage).toBe('idle')
      expect(result.current.error).toBe('Low text quality')
    })
  })
})
