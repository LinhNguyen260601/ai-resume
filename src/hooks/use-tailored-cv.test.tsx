/** @vitest-environment jsdom */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { getTailoredCv, updateTailoredCv } from '#/server/tailored'
import { useTailoredCv } from '#/hooks/use-tailored-cv'

vi.mock('#/server/tailored', () => ({
  getTailoredCv: vi.fn(),
  updateTailoredCv: vi.fn(),
}))

const mockedGet = vi.mocked(getTailoredCv)
const mockedUpdate = vi.mocked(updateTailoredCv)

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
  }
  return Wrapper
}

describe('useTailoredCv', () => {
  beforeEach(function setup() {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    mockedGet.mockReset()
    mockedUpdate.mockReset()
    mockedUpdate.mockResolvedValue({ ok: true })
  })

  afterEach(function restoreTimers() {
    vi.useRealTimers()
  })

  it('loads and exposes the tailored CV content once the query resolves', async () => {
    mockedGet.mockResolvedValue({
      id: 'cv-1',
      content: {
        personal: { fullName: 'Ada', email: 'ada@example.com', summary: '' },
        experience: [],
        education: [],
        skills: { technical: [] },
      },
      template_id: 'creative',
      title: 'Engineer at Acme',
      job_postings: [{ company_name: 'Acme', job_title: 'Engineer' }],
    })

    const { result } = renderHook(
      () => useTailoredCv({ tailoredCvId: 'cv-1' }),
      { wrapper: createWrapper() },
    )

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.content?.personal.fullName).toBe('Ada')
    })

    expect(result.current.templateId).toBe('creative')
    expect(result.current.title).toBe('Engineer at Acme')
    expect(result.current.companyName).toBe('Acme')
    expect(result.current.jobTitle).toBe('Engineer')
  })
})
