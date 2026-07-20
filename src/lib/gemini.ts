import { GoogleGenerativeAI } from '@google/generative-ai'
import { ENVIRONMENTS } from '#/constants'

const { GEMINI_API_KEY } = ENVIRONMENTS

export function createGemini() {
  if (!GEMINI_API_KEY) throw new Error('Missing GEMINI_API_KEY')
  return new GoogleGenerativeAI(GEMINI_API_KEY)
}

export async function generateStructuredJson<T>(
  prompt: string,
  schemaDescription: string,
): Promise<T> {
  const genAI = createGemini()
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' },
  })
  const result = await model.generateContent(
    `${prompt}\n\nRespond with JSON matching this schema:\n${schemaDescription}`,
  )
  const text = result.response.text()
  return JSON.parse(text) as T
}
