import { PDFParse } from 'pdf-parse'
import mammoth from 'mammoth'

export async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  if (mimeType === 'application/pdf') {
    const parser = new PDFParse({ data: buffer })
    try {
      const data = await parser.getText()
      return data.text
    } finally {
      await parser.destroy()
    }
  }
  if (
    mimeType ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  }
  throw new Error(`Unsupported file type: ${mimeType}`)
}

export function isLowTextQuality(text: string): boolean {
  const trimmed = text.replace(/\s+/g, ' ').trim()
  return trimmed.length < 100
}