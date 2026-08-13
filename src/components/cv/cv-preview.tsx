import type { CvContent } from '#/lib/schemas/cv'
import type { TemplateId } from '#/lib/schemas/tailored-cv'
import { getTemplateComponent } from '#/lib/templates'

export type CvPreviewProps = {
  content: CvContent
  templateId?: TemplateId
}

export function CvPreview({ content, templateId = 'modern' }: CvPreviewProps) {
  const Template = getTemplateComponent(templateId)

  return (
    <div
      className="mx-auto bg-white shadow-lg"
      style={{ width: '210mm', minHeight: '297mm' }}
    >
      <Template content={content} />
    </div>
  )
}
