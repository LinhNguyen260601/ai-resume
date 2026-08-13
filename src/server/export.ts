import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServerFn } from '@tanstack/react-start'
import { chromium } from 'playwright'
import { exportPdfSchema } from '#/lib/schemas/export'
import { cvContentSchema } from '#/lib/schemas/cv'
import type { TemplateId } from '#/lib/schemas/tailored-cv'
import { getTemplateComponent } from '#/lib/templates'
import { getTailoredCv } from '#/server/tailored'
import { toPdfFilename } from '#/models/cv-export'

// A4 at 96 CSS px/inch, so text wraps the same way it does in the app's
// on-screen preview (also rendered at 210mm) instead of the browser's
// default viewport width.
const A4_WIDTH_PX = 794
const A4_HEIGHT_PX = 1123

function buildPrintableHtml(bodyMarkup: string) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>${bodyMarkup}</body>
</html>`
}

export const exportPdf = createServerFn({ method: 'POST' })
  .validator(exportPdfSchema)
  .handler(async ({ data }) => {
    const tailoredCv = await getTailoredCv({ data: { id: data.tailoredCvId } })
    const content = cvContentSchema.parse(tailoredCv.content)
    const templateId = (data.templateId ??
      tailoredCv.template_id ??
      'modern') as TemplateId

    const Template = getTemplateComponent(templateId)
    const bodyMarkup = renderToStaticMarkup(
      createElement(Template, { content }),
    )
    const html = buildPrintableHtml(bodyMarkup)

    const browser = await chromium.launch()
    try {
      const page = await browser.newPage({
        viewport: { width: A4_WIDTH_PX, height: A4_HEIGHT_PX },
      })
      await page.setContent(html, { waitUntil: 'networkidle' })
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
      })
      return {
        pdf: pdf.toString('base64'),
        filename: toPdfFilename(tailoredCv.title),
      }
    } finally {
      await browser.close()
    }
  })
