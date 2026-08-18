import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { cvContentSchema } from '#/lib/schemas/cv'
import type { TemplateId } from '#/lib/schemas/tailored-cv'
import { downloadBase64File } from '#/lib/download-file'
import { tailoredCvQueryKey } from '#/lib/query-keys'
import { exportPdf } from '#/server/export'
import { getTailoredCv } from '#/server/tailored'

type UseExportCvOptions = {
  tailoredCvId: string
}

async function fetchTailoredCv(id: string) {
  return getTailoredCv({ data: { id } })
}

export function useExportCv({ tailoredCvId }: UseExportCvOptions) {
  const query = useQuery({
    queryKey: tailoredCvQueryKey(tailoredCvId),
    queryFn: () => fetchTailoredCv(tailoredCvId),
  })

  const [templateOverride, setTemplateOverride] = useState<TemplateId | null>(
    null,
  )

  const download = useMutation({
    mutationFn: (templateId: TemplateId) =>
      exportPdf({ data: { tailoredCvId, templateId } }),
    onSuccess(result) {
      downloadBase64File(result.pdf, result.filename, 'application/pdf')
    },
  })

  const content = query.data ? cvContentSchema.parse(query.data.content) : null
  const templateId = (templateOverride ??
    query.data?.template_id ??
    'modern') as TemplateId

  return {
    isLoading: query.isLoading,
    isError: query.isError,
    content,
    title: query.data?.title ?? null,
    templateId,
    setTemplateId: setTemplateOverride,
    isDownloading: download.isPending,
    downloadError: download.isError,
    onDownload: () => download.mutate(templateId),
  }
}
