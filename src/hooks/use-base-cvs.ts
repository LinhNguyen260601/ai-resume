import { useQuery, useQueryClient } from '@tanstack/react-query'
import { baseCvsQueryKey } from '#/lib/query-keys'
import { listBaseCvs } from '#/server/cv'

async function fetchBaseCvs() {
  return listBaseCvs()
}

export function useBaseCvs() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: baseCvsQueryKey,
    queryFn: fetchBaseCvs,
  })

  async function invalidate() {
    await queryClient.invalidateQueries({ queryKey: baseCvsQueryKey })
  }

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    invalidate,
  }
}
