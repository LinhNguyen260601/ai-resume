import { createServerFn } from '@tanstack/react-start'
import {
  getTailoredCvSchema,
  updateTailoredCvSchema,
} from '#/lib/schemas/tailored-cv'
import { getCurrentProfile } from '#/lib/auth'
import { createServerSupabase } from '#/lib/supabase'

export const getTailoredCv = createServerFn({ method: 'GET' })
  .validator(getTailoredCvSchema)
  .handler(async ({ data }) => {
    const profile = await getCurrentProfile()
    const supabase = createServerSupabase()
    const { data: row, error } = await supabase
      .from('tailored_cvs')
      .select('id, content, template_id, title, job_postings(company_name, job_title)')
      .eq('id', data.id)
      .eq('profile_id', profile.id)
      .single()
    if (error) throw error
    return row
  })

export const listTailoredCvs = createServerFn({ method: 'GET' }).handler(
  async () => {
    const profile = await getCurrentProfile()
    const supabase = createServerSupabase()
    const { data, error } = await supabase
      .from('tailored_cvs')
      .select(
        'id, title, template_id, created_at, updated_at, job_postings(company_name, job_title)',
      )
      .eq('profile_id', profile.id)
      .order('updated_at', { ascending: false })
    if (error) throw error
    return data
  },
)

export const updateTailoredCv = createServerFn({ method: 'POST' })
  .validator(updateTailoredCvSchema)
  .handler(async ({ data }) => {
    const profile = await getCurrentProfile()
    const supabase = createServerSupabase()
    const { error } = await supabase
      .from('tailored_cvs')
      .update({
        content: data.content,
        ...(data.template_id ? { template_id: data.template_id } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.id)
      .eq('profile_id', profile.id)
    if (error) throw error
    return { ok: true }
  })
