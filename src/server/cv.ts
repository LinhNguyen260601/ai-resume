import { createServerFn } from '@tanstack/react-start'
import { v4 as uuid } from 'uuid'
import { cvContentSchema } from '#/lib/schemas/cv'
import { cvUploadSchema } from '#/lib/schemas/cv-upload'
import { createServerSupabase, getDefaultProfileId } from '#/lib/supabase'
import { generateStructuredJson } from '#/lib/gemini'
import { extractTextFromFile, isLowTextQuality } from '#/lib/pdf-extract'

const CV_SCHEMA_DESC = `{
  personal: { fullName, email, phone?, location?, linkedin?, website?, summary },
  experience: [{ id, company, title, location?, startDate, endDate?, bullets[] }],
  education: [{ id, institution, degree, field?, graduationDate?, bullets?[] }],
  skills: { technical[], soft?[], languages?[] },
  certifications?: [{ id, name, issuer?, date? }],
  projects?: [{ id, name, description, bullets?[] }]
}`

export async function parseCvUploadFromFormData(data: FormData) {
  const { file } = cvUploadSchema.parse(data)
  return parseCvUploadFile(file)
}

async function parseCvUploadFile(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer())
  const rawText = await extractTextFromFile(buffer, file.type)
  if (isLowTextQuality(rawText)) {
    throw new Error(
      'Low text quality — file may be scanned/image-only. Try exporting as text-based PDF.',
    )
  }

  const parsed = await generateStructuredJson<unknown>(
    `Extract and structure this CV text into JSON. Use UUIDs for id fields. Do not invent information.\n\n${rawText}`,
    CV_SCHEMA_DESC,
  )
  const content = cvContentSchema.parse(parsed)

  const supabase = createServerSupabase()
  const profileId = getDefaultProfileId()
  const fileId = uuid()
  const ext = file.type === 'application/pdf' ? 'pdf' : 'docx'
  const filePath = `${profileId}/${fileId}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('cv-uploads')
    .upload(filePath, buffer, { contentType: file.type })
  if (uploadError) throw uploadError

  const { data: row, error } = await supabase
    .from('base_cvs')
    .insert({
      profile_id: profileId,
      file_path: filePath,
      file_name: file.name,
      content,
    })
    .select('id, file_name, created_at')
    .single()
  if (error) throw error

  return { baseCv: row, content }
}

export const parseCvUpload = createServerFn({ method: 'POST' })
  .validator(cvUploadSchema)
  .handler(async ({ data }) => parseCvUploadFile(data.file))

export const listBaseCvs = createServerFn({ method: 'GET' }).handler(async () => {
  const supabase = createServerSupabase()
  const { data, error } = await supabase
    .from('base_cvs')
    .select('id, file_name, content, created_at')
    .eq('profile_id', getDefaultProfileId())
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
})
