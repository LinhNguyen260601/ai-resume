import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useBaseCvs } from '#/hooks/use-base-cvs'
import { tailorCvForJob } from '#/server/tailor'

type UseTailorCvOptions = {
  jobId: string
  onTailored: (tailoredCvId: string) => void
}

export function useTailorCv({ jobId, onTailored }: UseTailorCvOptions) {
  const baseCvs = useBaseCvs()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const tailor = useMutation({
    mutationFn: async (baseCvId: string) =>
      tailorCvForJob({ data: { baseCvId, jobPostingId: jobId } }),
    onSuccess(row) {
      setError(null)
      onTailored(row.id)
    },
    onError(err: Error) {
      setError(err.message || 'Could not tailor CV')
    },
  })

  function onSelect(id: string) {
    setSelectedId(id)
    if (error) setError(null)
  }

  function onSubmit() {
    if (!selectedId) {
      setError('Choose a base CV first')
      return
    }
    tailor.mutate(selectedId)
  }

  return {
    baseCvs,
    selectedId,
    error,
    isTailoring: tailor.isPending,
    onSelect,
    onSubmit,
  }
}
