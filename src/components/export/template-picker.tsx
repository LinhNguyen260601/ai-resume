import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { TEMPLATE_OPTIONS } from '#/lib/schemas/tailored-cv'
import type { TemplateId } from '#/lib/schemas/tailored-cv'
import { cn } from '#/lib/utils'

type TemplatePickerProps = {
  templateId: TemplateId
  disabled: boolean
  onSelect: (id: TemplateId) => void
}

export function TemplatePicker({
  templateId,
  disabled,
  onSelect,
}: TemplatePickerProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Template"
      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
    >
      {TEMPLATE_OPTIONS.map((option) => {
        const isSelected = option.id === templateId
        return (
          <Card
            key={option.id}
            role="radio"
            aria-checked={isSelected}
            tabIndex={disabled ? -1 : 0}
            className={cn(
              'cursor-pointer rounded-2xl border-border bg-card/80 backdrop-blur-md transition-colors',
              isSelected && 'border-primary ring-1 ring-primary',
              disabled && 'pointer-events-none opacity-60',
            )}
            onClick={() => onSelect(option.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onSelect(option.id)
              }
            }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{option.label}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              {option.id}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
