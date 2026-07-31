import { assertPublicUrl } from '#/lib/ssrf'
import { Readability } from '@mozilla/readability'
import { parseHTML } from 'linkedom'

export async function fetchAndExtractJobText(url: string): Promise<string> {
  assertPublicUrl(url)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)
  const res = await fetch(url, {
    signal: controller.signal,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AIResumeBot/1.0)' },
  })
  clearTimeout(timeout)
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
  const html = await res.text()
  if (html.length > 5_000_000) throw new Error('Response too large')
  const { document } = parseHTML(html)
  const article = new Readability(document).parse()
  return article?.textContent?.trim() ?? ''
}
