import { TEMPLATE_OPTIONS } from '#/lib/schemas/tailored-cv'
import type { listTailoredCvs } from '#/server/tailored'

type TailoredCvRow = Awaited<ReturnType<typeof listTailoredCvs>>[number]

export type DashboardCvItem = {
  id: string
  title: string
  roleLabel: string
  templateId: string
  templateLabel: string
  updatedAt: string
}

function templateLabelFor(templateId: string) {
  return (
    TEMPLATE_OPTIONS.find((option) => option.id === templateId)?.label ??
    templateId
  )
}

type JobPostingSummary = {
  job_title: string | null
  company_name: string | null
}

export function toDashboardCvItem(row: TailoredCvRow): DashboardCvItem {
  // Supabase's generated types claim this is always a populated array, but at
  // runtime the join can return an array, a single object, or null/undefined —
  // the generated types don't reflect that, so we widen it back explicitly.
  const jobPostingsData = row.job_postings as
    | JobPostingSummary[]
    | JobPostingSummary
    | null
    | undefined
  const job = Array.isArray(jobPostingsData)
    ? jobPostingsData[0]
    : jobPostingsData
  const roleLabel = [job?.job_title, job?.company_name]
    .filter(Boolean)
    .join(' at ')

  return {
    id: row.id,
    title: row.title,
    roleLabel,
    templateId: row.template_id,
    templateLabel: templateLabelFor(row.template_id),
    updatedAt: row.updated_at,
  }
}
