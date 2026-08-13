/** @vitest-environment jsdom */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { downloadBase64File } from '#/lib/download-file'
import { exportPdf } from '#/server/export'
import { getTailoredCv } from '#/server/tailored'
import { useExportCv } from '#/hooks/use-export-cv'

vi.mock('#/server/tailored', () => ({
  getTailoredCv: vi.fn(),
}))
vi.mock('#/server/export', () => ({
  exportPdf: vi.fn(),
}))
vi.mock('#/lib/download-file', () => ({
  downloadBase64File: vi.fn(),
}))

const mockedGet = vi.mocked(getTailoredCv)
const mockedExport = vi.mocked(exportPdf)
const mockedDownload = vi.mocked(downloadBase64File)

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
  return Wrapper
}

const CONTENT = {
  personal: { fullName: 'Ada', email: 'ada@example.com', summary: '' },
  experience: [],
  education: [],
  skills: { technical: [] },
}

describe('useExportCv', () => {
  beforeEach(() => {
    mockedGet.mockReset()
    mockedExport.mockReset()
    mockedDownload.mockReset()
  })

  it('loads the tailored CV and defaults the template to the saved one', async () => {
    mockedGet.mockResolvedValue({
      id: 'cv-1',
      content: CONTENT,
      template_id: 'creative',
      title: 'Engineer at Acme',
      job_postings: [{ company_name: 'Acme', job_title: 'Engineer' }],
    })

    const { result } = renderHook(() => useExportCv({ tailoredCvId: 'cv-1' }), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.content?.personal.fullName).toBe('Ada')
    })

    expect(result.current.templateId).toBe('creative')
    expect(result.current.title).toBe('Engineer at Acme')
  })

  it('downloads the exported pdf using the selected template', async () => {
    mockedGet.mockResolvedValue({
      id: 'cv-1',
      content: CONTENT,
      template_id: 'modern',
      title: 'Engineer at Acme',
      job_postings: [],
    })
    mockedExport.mockResolvedValue({ pdf: 'aGVsbG8=', filename: 'cv.pdf' })

    const { result } = renderHook(() => useExportCv({ tailoredCvId: 'cv-1' }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.content).not.toBeNull()
    })

    act(() => {
      result.current.setTemplateId('compact')
    })

    await act(async () => {
      result.current.onDownload()
    })

    await waitFor(() => {
      expect(mockedExport).toHaveBeenCalledWith({
        data: { tailoredCvId: 'cv-1', templateId: 'compact' },
      })
    })
    expect(mockedDownload).toHaveBeenCalledWith(
      'aGVsbG8=',
      'cv.pdf',
      'application/pdf',
    )
  })
})
