import {
  CV_UPLOAD_MAX_BYTES,
  CV_UPLOAD_MIME_TYPES,
} from '#/lib/schemas/cv-upload'

export function validateCvUploadFile(file: File): string | null {
  if (!(CV_UPLOAD_MIME_TYPES as readonly string[]).includes(file.type)) {
    return 'Only PDF and DOCX allowed'
  }
  if (file.size > CV_UPLOAD_MAX_BYTES) {
    return 'File too large (max 10MB)'
  }
  return null
}
