import { useQuery } from '@tanstack/react-query'
import { tailoredCvsQueryKey } from '#/lib/query-keys'
import { listTailoredCvs } from '#/server/tailored'

async function fetchTailoredCvs() {
  return listTailoredCvs()
}

export function useTailoredCvs() {
  const query = useQuery({
    queryKey: tailoredCvsQueryKey,
    queryFn: fetchTailoredCvs,
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  }
}
