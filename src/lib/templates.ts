import type { ComponentType } from 'react'
import type { CvContent } from '#/lib/schemas/cv'
import type { TemplateId } from '#/lib/schemas/tailored-cv'
import { ClassicTemplate } from '#/templates/classic-template'
import { CompactTemplate } from '#/templates/compact-template'
import { CreativeTemplate } from '#/templates/creative-template'
import { ModernTemplate } from '#/templates/modern-template'

const TEMPLATE_COMPONENTS: Record<
  TemplateId,
  ComponentType<{ content: CvContent }>
> = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  creative: CreativeTemplate,
  compact: CompactTemplate,
}

export function getTemplateComponent(id: TemplateId) {
  return TEMPLATE_COMPONENTS[id]
}
