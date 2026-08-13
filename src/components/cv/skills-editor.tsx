import { Field, FieldGroup, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { skillsToText } from '#/models/cv-editor'
import type { CvContent } from '#/lib/schemas/cv'

type SkillsField = keyof CvContent['skills']

export type SkillsEditorProps = {
  skills: CvContent['skills']
  disabled: boolean
  onChangeText: (field: SkillsField, text: string) => void
}

export function SkillsEditor({
  skills,
  disabled,
  onChangeText,
}: SkillsEditorProps) {
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="skills-technical">Technical skills</FieldLabel>
        <Input
          id="skills-technical"
          value={skillsToText(skills.technical)}
          disabled={disabled}
          placeholder="TypeScript, React, PostgreSQL"
          onChange={(event) => onChangeText('technical', event.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="skills-soft">Soft skills</FieldLabel>
        <Input
          id="skills-soft"
          value={skillsToText(skills.soft)}
          disabled={disabled}
          placeholder="Leadership, Communication"
          onChange={(event) => onChangeText('soft', event.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="skills-languages">Languages</FieldLabel>
        <Input
          id="skills-languages"
          value={skillsToText(skills.languages)}
          disabled={disabled}
          placeholder="English, Spanish"
          onChange={(event) => onChangeText('languages', event.target.value)}
        />
      </Field>
    </FieldGroup>
  )
}
