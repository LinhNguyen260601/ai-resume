import { config } from 'dotenv'

config({ path: ['.env.local'] })

const { readFileSync } = await import('node:fs')
const { basename, extname } = await import('node:path')
const { parseCvUploadFromFormData } = await import('#/server/cv')

const MIME_BY_EXT: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.docx':
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

async function main() {
  const filePath = process.argv[2]
  if (!filePath) {
    console.error('Usage: bun run upload:cv <path-to-pdf-or-docx>')
    process.exit(1)
  }

  const ext = extname(filePath).toLowerCase()
  const mimeType = MIME_BY_EXT[ext]
  if (!mimeType) {
    console.error('Only .pdf and .docx files are supported')
    process.exit(1)
  }

  const buffer = readFileSync(filePath)
  const file = new File([buffer], basename(filePath), { type: mimeType })
  const formData = new FormData()
  formData.append('file', file)

  console.log(`Uploading ${file.name} (${(file.size / 1024).toFixed(1)} KB)...`)

  const result = await parseCvUploadFromFormData(formData)

  console.log('\nUpload successful!')
  console.log('Base CV:', result.baseCv)
  console.log('\nParsed content preview:')
  console.log(JSON.stringify(result.content, null, 2))
}

main().catch((error) => {
  console.error(
    'Upload failed:',
    error instanceof Error ? error.message : error,
  )
  process.exit(1)
})
