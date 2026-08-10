export const JOB_FETCH_BLOCKED_MESSAGE = "Couldn't fetch — paste manually"

export function jobFetchFailureMessage(status: number): string {
  if (status === 401 || status === 403 || status === 429) {
    return JOB_FETCH_BLOCKED_MESSAGE
  }
  return `Fetch failed: ${status}`
}
