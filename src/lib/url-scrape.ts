import { assertPublicUrl } from '#/lib/ssrf'
import { jobFetchFailureMessage } from '#/lib/job-fetch-errors'
import { Readability } from '@mozilla/readability'
import { parseHTML } from 'linkedom'

/** Browser-like headers — many boards block bot-branded User-Agents. */
const FETCH_HEADERS: HeadersInit = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
}

export async function fetchAndExtractJobText(url: string): Promise<string> {
  assertPublicUrl(url)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)
  const res = await fetch(url, {
    signal: controller.signal,
    headers: FETCH_HEADERS,
    redirect: 'follow',
  })
  clearTimeout(timeout)
  if (!res.ok) throw new Error(jobFetchFailureMessage(res.status))
  const html = await res.text()
  if (html.length > 5_000_000) throw new Error('Response too large')
  const { document } = parseHTML(html)
  const article = new Readability(document).parse()
  return article?.textContent?.trim() ?? ''
}
