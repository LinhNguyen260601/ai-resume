import { createServerFn } from '@tanstack/react-start'
import { CV_SCHEMA_DESC, cvContentSchema } from '#/lib/schemas/cv'
import { tailorCvForJobSchema } from '#/lib/schemas/tailor'
import { generateStructuredJson } from '#/lib/gemini'
import { getCurrentProfile } from '#/lib/auth'
import { createServerSupabase } from '#/lib/supabase'
import { buildTailorCvPrompt } from '#/lib/tailor-prompt'

export const tailorCvForJob = createServerFn({ method: 'POST' })
  .validator(tailorCvForJobSchema)
  .handler(async ({ data }) => {
    const profile = await getCurrentProfile()
    const supabase = createServerSupabase()

    const [baseCvResult, jobResult] = await Promise.all([
      supabase
        .from('base_cvs')
        .select('content')
        .eq('id', data.baseCvId)
        .eq('profile_id', profile.id)
        .single(),
      supabase
        .from('job_postings')
        .select('extracted_text, company_name, job_title')
        .eq('id', data.jobPostingId)
        .eq('profile_id', profile.id)
        .single(),
    ])
    if (baseCvResult.error) throw baseCvResult.error
    if (jobResult.error) throw jobResult.error

    const baseCv = baseCvResult.data
    const job = jobResult.data
    const baseCvContent = cvContentSchema.parse(baseCv.content)

    const tailored = await generateStructuredJson<unknown>(
      buildTailorCvPrompt(baseCvContent, job.extracted_text),
      CV_SCHEMA_DESC,
    )
    const content = cvContentSchema.parse(tailored)
    const title = `${job.job_title ?? 'Role'} at ${job.company_name ?? 'Company'}`

    const { data: row, error } = await supabase
      .from('tailored_cvs')
      .insert({
        profile_id: profile.id,
        base_cv_id: data.baseCvId,
        job_posting_id: data.jobPostingId,
        content,
        title,
        template_id: 'modern',
      })
      .select('id')
      .single()
    if (error) throw error
    return row
  })
