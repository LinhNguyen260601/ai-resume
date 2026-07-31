import { useLayoutEffect, useRef, useState } from 'react'
import { JobDescriptionMarkdown } from '#/components/jobs/job-description-markdown'
import { Button } from '#/components/ui/button'
import { Field, FieldLabel } from '#/components/ui/field'
import { Textarea } from '#/components/ui/textarea'
import { cn } from '#/lib/utils'

type JobDescriptionFieldProps = {
  id: string
  value: string
  disabled?: boolean
  placeholder?: string
  emptyPreviewLabel?: string
  forceEdit?: boolean
  onChange: (value: string) => void
}

export function JobDescriptionField({
  id,
  value,
  disabled,
  placeholder,
  emptyPreviewLabel,
  forceEdit = false,
  onChange,
}: JobDescriptionFieldProps) {
  // null = no explicit choice yet; derive edit vs preview from value.
  const [userMode, setUserMode] = useState<'edit' | 'preview' | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const mode: 'edit' | 'preview' = forceEdit
    ? 'edit'
    : (userMode ?? (value.trim() ? 'preview' : 'edit'))

  // Focus is a DOM sync — a valid Effect use.
  useLayoutEffect(() => {
    if (forceEdit) {
      textareaRef.current?.focus()
    }
  }, [forceEdit])

  return (
    <Field>
      <div className="flex items-center justify-between gap-3">
        <FieldLabel htmlFor={mode === 'edit' ? id : undefined}>
          Job description
        </FieldLabel>
        <div
          role="group"
          aria-label="Job description view"
          className="inline-flex rounded-full bg-muted p-0.75"
        >
          <Button
            type="button"
            size="xs"
            variant="ghost"
            disabled={disabled || forceEdit}
            className={cn(
              'rounded-full px-3',
              mode === 'edit' && 'bg-background text-foreground shadow-sm',
            )}
            aria-pressed={mode === 'edit'}
            onClick={() => setUserMode('edit')}
          >
            Edit
          </Button>
          <Button
            type="button"
            size="xs"
            variant="ghost"
            disabled={disabled || forceEdit}
            className={cn(
              'rounded-full px-3',
              mode === 'preview' && 'bg-background text-foreground shadow-sm',
            )}
            aria-pressed={mode === 'preview'}
            onClick={() => setUserMode('preview')}
          >
            Preview
          </Button>
        </div>
      </div>

      {mode === 'edit' ? (
        <Textarea
          ref={textareaRef}
          id={id}
          rows={10}
          className="max-h-64 resize-y overflow-y-auto field-sizing-fixed"
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          aria-label="Job description"
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <div
          role="region"
          aria-label="Job description preview"
          className="max-h-64 overflow-y-auto rounded-md border border-input bg-input/30 px-3 py-2"
        >
          <JobDescriptionMarkdown
            content={value}
            emptyLabel={emptyPreviewLabel}
          />
        </div>
      )}
    </Field>
  )
}
