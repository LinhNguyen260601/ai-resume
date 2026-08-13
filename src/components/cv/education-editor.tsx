import { Plus, Trash2 } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import type { CvContent } from '#/lib/schemas/cv'

type EducationField = 'institution' | 'degree' | 'field' | 'graduationDate'

export type EducationEditorProps = {
  entries: CvContent['education']
  disabled: boolean
  onAdd: () => void
  onRemove: (id: string) => void
  onFieldChange: (id: string, field: EducationField, value: string) => void
}

export function EducationEditor({
  entries,
  disabled,
  onAdd,
  onRemove,
  onFieldChange,
}: EducationEditorProps) {
  return (
    <div className="flex flex-col gap-6">
      {entries.map((entry, entryIndex) => (
        <div
          key={entry.id}
          className="rounded-xl border border-border bg-card/60 p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Education {entryIndex + 1}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={disabled}
              aria-label="Remove education"
              onClick={() => onRemove(entry.id)}
            >
              <Trash2 aria-hidden />
            </Button>
          </div>

          <FieldGroup>
            <Field orientation="responsive">
              <Field>
                <FieldLabel htmlFor={`education-${entry.id}-institution`}>
                  Institution
                </FieldLabel>
                <Input
                  id={`education-${entry.id}-institution`}
                  value={entry.institution}
                  disabled={disabled}
                  onChange={(event) =>
                    onFieldChange(entry.id, 'institution', event.target.value)
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`education-${entry.id}-degree`}>
                  Degree
                </FieldLabel>
                <Input
                  id={`education-${entry.id}-degree`}
                  value={entry.degree}
                  disabled={disabled}
                  onChange={(event) =>
                    onFieldChange(entry.id, 'degree', event.target.value)
                  }
                />
              </Field>
            </Field>

            <Field orientation="responsive">
              <Field>
                <FieldLabel htmlFor={`education-${entry.id}-field`}>
                  Field of study
                </FieldLabel>
                <Input
                  id={`education-${entry.id}-field`}
                  value={entry.field ?? ''}
                  disabled={disabled}
                  placeholder="Optional"
                  onChange={(event) =>
                    onFieldChange(entry.id, 'field', event.target.value)
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`education-${entry.id}-graduation`}>
                  Graduation date
                </FieldLabel>
                <Input
                  id={`education-${entry.id}-graduation`}
                  value={entry.graduationDate ?? ''}
                  disabled={disabled}
                  placeholder="Optional"
                  onChange={(event) =>
                    onFieldChange(
                      entry.id,
                      'graduationDate',
                      event.target.value,
                    )
                  }
                />
              </Field>
            </Field>
          </FieldGroup>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        className="w-fit"
        disabled={disabled}
        onClick={onAdd}
      >
        <Plus data-icon="inline-start" aria-hidden />
        Add education
      </Button>
    </div>
  )
}
