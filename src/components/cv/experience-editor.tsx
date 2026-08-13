import { Plus, Trash2 } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import type { CvContent } from '#/lib/schemas/cv'

type ExperienceField = 'company' | 'title' | 'location' | 'startDate' | 'endDate'

export type ExperienceEditorProps = {
  entries: CvContent['experience']
  disabled: boolean
  onAdd: () => void
  onRemove: (id: string) => void
  onFieldChange: (id: string, field: ExperienceField, value: string) => void
  onAddBullet: (id: string) => void
  onUpdateBullet: (id: string, index: number, value: string) => void
  onRemoveBullet: (id: string, index: number) => void
}

export function ExperienceEditor({
  entries,
  disabled,
  onAdd,
  onRemove,
  onFieldChange,
  onAddBullet,
  onUpdateBullet,
  onRemoveBullet,
}: ExperienceEditorProps) {
  return (
    <div className="flex flex-col gap-6">
      {entries.map((entry, entryIndex) => (
        <div
          key={entry.id}
          className="rounded-xl border border-border bg-card/60 p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Experience {entryIndex + 1}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={disabled}
              aria-label="Remove experience"
              onClick={() => onRemove(entry.id)}
            >
              <Trash2 aria-hidden />
            </Button>
          </div>

          <FieldGroup>
            <Field orientation="responsive">
              <Field>
                <FieldLabel htmlFor={`experience-${entry.id}-company`}>
                  Company
                </FieldLabel>
                <Input
                  id={`experience-${entry.id}-company`}
                  value={entry.company}
                  disabled={disabled}
                  onChange={(event) =>
                    onFieldChange(entry.id, 'company', event.target.value)
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`experience-${entry.id}-title`}>
                  Title
                </FieldLabel>
                <Input
                  id={`experience-${entry.id}-title`}
                  value={entry.title}
                  disabled={disabled}
                  onChange={(event) =>
                    onFieldChange(entry.id, 'title', event.target.value)
                  }
                />
              </Field>
            </Field>

            <Field orientation="responsive">
              <Field>
                <FieldLabel htmlFor={`experience-${entry.id}-start`}>
                  Start date
                </FieldLabel>
                <Input
                  id={`experience-${entry.id}-start`}
                  value={entry.startDate}
                  disabled={disabled}
                  onChange={(event) =>
                    onFieldChange(entry.id, 'startDate', event.target.value)
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`experience-${entry.id}-end`}>
                  End date
                </FieldLabel>
                <Input
                  id={`experience-${entry.id}-end`}
                  value={entry.endDate ?? ''}
                  disabled={disabled}
                  placeholder="Present"
                  onChange={(event) =>
                    onFieldChange(entry.id, 'endDate', event.target.value)
                  }
                />
              </Field>
            </Field>

            <Field>
              <FieldLabel htmlFor={`experience-${entry.id}-location`}>
                Location
              </FieldLabel>
              <Input
                id={`experience-${entry.id}-location`}
                value={entry.location ?? ''}
                disabled={disabled}
                placeholder="Optional"
                onChange={(event) =>
                  onFieldChange(entry.id, 'location', event.target.value)
                }
              />
            </Field>

            <Field>
              <FieldLabel>Bullets</FieldLabel>
              <div className="flex flex-col gap-2">
                {entry.bullets.map((bullet, bulletIndex) => (
                  <div key={bulletIndex} className="flex gap-2">
                    <Input
                      aria-label={`Bullet ${bulletIndex + 1}`}
                      value={bullet}
                      disabled={disabled}
                      onChange={(event) =>
                        onUpdateBullet(
                          entry.id,
                          bulletIndex,
                          event.target.value,
                        )
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={disabled}
                      aria-label="Remove bullet"
                      onClick={() => onRemoveBullet(entry.id, bulletIndex)}
                    >
                      <Trash2 aria-hidden />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                disabled={disabled}
                onClick={() => onAddBullet(entry.id)}
              >
                <Plus data-icon="inline-start" aria-hidden />
                Add bullet
              </Button>
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
        Add experience
      </Button>
    </div>
  )
}
