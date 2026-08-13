export function formatDateRange(
  startDate: string,
  endDate: string | undefined,
) {
  return `${startDate} — ${endDate?.trim() ? endDate : 'Present'}`
}
