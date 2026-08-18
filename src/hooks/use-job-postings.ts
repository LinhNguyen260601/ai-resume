import { useQuery } from '@tanstack/react-query'
import { jobPostingsQueryKey } from '#/lib/query-keys'
import { listJobPostings } from '#/server/jobs'

async function fetchJobPostings() {
  return listJobPostings()
}

export function useJobPostings() {
  const query = useQuery({
    queryKey: jobPostingsQueryKey,
    queryFn: fetchJobPostings,
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  }
}
