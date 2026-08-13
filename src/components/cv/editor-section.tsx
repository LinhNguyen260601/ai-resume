import { Field, FieldGroup, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import type { CvContent } from '#/lib/schemas/cv'

type PersonalField = keyof CvContent['personal']

export type EditorSectionProps = {
  personal: CvContent['personal']
  disabled: boolean
  onFieldChange: (field: PersonalField, value: string) => void
  onSummaryChange: (value: string) => void
}

export function EditorSection({
  personal,
  disabled,
  onFieldChange,
  onSummaryChange,
}: EditorSectionProps) {
  return (
    <FieldGroup>
      <Field orientation="responsive">
        <Field>
          <FieldLabel htmlFor="personal-fullName">Full name</FieldLabel>
          <Input
            id="personal-fullName"
            value={personal.fullName}
            disabled={disabled}
            onChange={(event) =>
              onFieldChange('fullName', event.target.value)
            }
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="personal-email">Email</FieldLabel>
          <Input
            id="personal-email"
            type="email"
            value={personal.email}
            disabled={disabled}
            onChange={(event) => onFieldChange('email', event.target.value)}
          />
        </Field>
      </Field>

      <Field orientation="responsive">
        <Field>
          <FieldLabel htmlFor="personal-phone">Phone</FieldLabel>
          <Input
            id="personal-phone"
            value={personal.phone ?? ''}
            disabled={disabled}
            placeholder="Optional"
            onChange={(event) => onFieldChange('phone', event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="personal-location">Location</FieldLabel>
          <Input
            id="personal-location"
            value={personal.location ?? ''}
            disabled={disabled}
            placeholder="Optional"
            onChange={(event) =>
              onFieldChange('location', event.target.value)
            }
          />
        </Field>
      </Field>

      <Field orientation="responsive">
        <Field>
          <FieldLabel htmlFor="personal-linkedin">LinkedIn</FieldLabel>
          <Input
            id="personal-linkedin"
            value={personal.linkedin ?? ''}
            disabled={disabled}
            placeholder="Optional"
            onChange={(event) =>
              onFieldChange('linkedin', event.target.value)
            }
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="personal-website">Website</FieldLabel>
          <Input
            id="personal-website"
            value={personal.website ?? ''}
            disabled={disabled}
            placeholder="Optional"
            onChange={(event) => onFieldChange('website', event.target.value)}
          />
        </Field>
      </Field>

      <Field>
        <FieldLabel htmlFor="personal-summary">Summary</FieldLabel>
        <Textarea
          id="personal-summary"
          rows={4}
          value={personal.summary}
          disabled={disabled}
          onChange={(event) => onSummaryChange(event.target.value)}
        />
      </Field>
    </FieldGroup>
  )
}
