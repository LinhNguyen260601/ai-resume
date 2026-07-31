import { generateStructuredJson } from '#/lib/gemini'
import {
  createJobPostingSchema,
  extractedTextSchema,
  jobMetaSchema,
  jobTitleCompanySchema,
  scrapeJobUrlSchema,
} from '#/lib/schemas/job'
import { createServerSupabase, getDefaultProfileId } from '#/lib/supabase'
import { fetchAndExtractJobText } from '#/lib/url-scrape'
import { createServerFn } from '@tanstack/react-start'

export const scrapeJobUrl = createServerFn({ method: 'POST' })
  .validator(scrapeJobUrlSchema)
  .handler(async ({ data }) => {
    let text = await fetchAndExtractJobText(data.url)

    if (text.length < 100) {
      const recovered = await generateStructuredJson<unknown>(
        `Extract the job description from this HTML snippet. Return JSON: { "extracted_text": "..." }\n\n${text}`,
        '{ extracted_text: string }',
      )
      text = extractedTextSchema.parse(recovered).extracted_text
    }

    const meta = await generateStructuredJson<unknown>(
      `Extract company name and job title from this posting:\n\n${text}`,
      '{ company_name?: string, job_title?: string }',
    )
    const { company_name, job_title } = jobTitleCompanySchema.parse(meta)

    return jobMetaSchema.parse({
      extracted_text: text,
      company_name: company_name ?? undefined,
      job_title: job_title ?? undefined,
    })
  })

export const createJobPosting = createServerFn({ method: 'POST' })
  .validator(createJobPostingSchema)
  .handler(async ({ data }) => {
    const supabase = createServerSupabase()
    const { data: row, error } = await supabase
      .from('job_postings')
      .insert({
        profile_id: getDefaultProfileId(),
        source_type: data.source_type,
        source_url: data.source_url ?? null,
        raw_text: data.extracted_text,
        extracted_text: data.extracted_text,
        company_name: data.company_name ?? null,
        job_title: data.job_title ?? null,
      })
      .select('id')
      .single()
    if (error) throw error
    return row
  })

export const listJobPostings = createServerFn({ method: 'GET' }).handler(
  async () => {
    const supabase = createServerSupabase()
    const { data, error } = await supabase
      .from('job_postings')
      .select('*')
      .eq('profile_id', getDefaultProfileId())
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
)
