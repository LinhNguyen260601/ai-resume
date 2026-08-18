import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import type { BaseCvListItem } from '#/components/upload/previous-uploads-list'
import { formatDate } from '#/lib/format-date'
import { cvContentSchema } from '#/lib/schemas/cv'
import { cn } from '#/lib/utils'
import { summarizeCvContent } from '#/models/cv-summary'

type BaseCvPickerProps = {
  items: BaseCvListItem[] | undefined
  isLoading: boolean
  selectedId: string | null
  disabled: boolean
  onSelect: (id: string) => void
}

function displayName(content: unknown) {
  const parsed = cvContentSchema.safeParse(content)
  if (!parsed.success) return 'Unknown'
  return summarizeCvContent(parsed.data).fullName
}

export function BaseCvPicker({
  items,
  isLoading,
  selectedId,
  disabled,
  onSelect,
}: BaseCvPickerProps) {
  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading CVs…</p>
  }

  if (!items || items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No base CVs yet — upload one first.
      </p>
    )
  }

  return (
    <div role="radiogroup" aria-label="Base CV" className="space-y-3">
      {items.map((cv) => {
        const isSelected = cv.id === selectedId
        return (
          <Card
            key={cv.id}
            role="radio"
            aria-checked={isSelected}
            tabIndex={disabled ? -1 : 0}
            className={cn(
              'cursor-pointer rounded-2xl border-border bg-card/80 backdrop-blur-md transition-colors',
              isSelected && 'border-primary ring-1 ring-primary',
              disabled && 'pointer-events-none opacity-60',
            )}
            onClick={() => onSelect(cv.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onSelect(cv.id)
              }
            }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{cv.file_name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {displayName(cv.content)}
              {' · '}
              {formatDate(cv.created_at)}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
