import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Spinner } from '#/components/ui/spinner'
import { CvPreview } from '#/components/cv/cv-preview'
import { EditorSection } from '#/components/cv/editor-section'
import { EducationEditor } from '#/components/cv/education-editor'
import { ExperienceEditor } from '#/components/cv/experience-editor'
import { SkillsEditor } from '#/components/cv/skills-editor'
import { useTailoredCv } from '#/hooks/use-tailored-cv'
import type { SaveStatus } from '#/hooks/use-tailored-cv'
import { TEMPLATE_OPTIONS } from '#/lib/schemas/tailored-cv'
import type { TemplateId } from '#/lib/schemas/tailored-cv'

export const Route = createFileRoute('/editor/$tailoredCvId')({
  component: EditorPage,
  head: function editorHead() {
    return {
      meta: [{ title: 'Edit CV — ResumeAI' }],
    }
  },
})

const saveStatusLabel: Record<SaveStatus, string> = {
  idle: '',
  pending: 'Unsaved changes',
  saving: 'Saving…',
  saved: 'Saved',
  error: 'Could not save',
}

function EditorPage() {
  const { tailoredCvId } = Route.useParams()
  // Keyed so navigating between tailored CVs remounts this subtree instead
  // of reusing the hook instance — see .cursor/rules/you-might-not-need-an-effect.mdc
  // ("Reset all state when an ID/prop changes" -> remount with key).
  return <EditorPageContent key={tailoredCvId} tailoredCvId={tailoredCvId} />
}

function EditorPageContent({ tailoredCvId }: { tailoredCvId: string }) {
  const editor = useTailoredCv({ tailoredCvId })

  if (editor.isError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <p
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          Unable to load this tailored CV. Please try again.
        </p>
      </main>
    )
  }

  if (editor.isLoading || !editor.content) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <Spinner />
      </main>
    )
  }

  const { content } = editor

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-background">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-lg font-semibold tracking-[-0.02em]">
            {editor.title ?? 'Edit CV'}
          </h1>
          {editor.companyName || editor.jobTitle ? (
            <p className="text-sm text-muted-foreground">
              {[editor.jobTitle, editor.companyName]
                .filter(Boolean)
                .join(' at ')}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          {editor.saveStatus !== 'idle' ? (
            <Badge
              variant={
                editor.saveStatus === 'error' ? 'destructive' : 'outline'
              }
            >
              {editor.saveStatus === 'saving' ? (
                <Spinner data-icon="inline-start" />
              ) : null}
              {saveStatusLabel[editor.saveStatus]}
            </Badge>
          ) : null}

          <Select
            value={editor.templateId}
            onValueChange={(value) => editor.setTemplateId(value as TemplateId)}
          >
            <SelectTrigger aria-label="Template" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {TEMPLATE_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-2">
        <div className="min-h-0 overflow-y-auto px-6 py-6">
          <div className="mx-auto flex max-w-xl flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal details</CardTitle>
              </CardHeader>
              <CardContent>
                <EditorSection
                  personal={content.personal}
                  disabled={false}
                  onFieldChange={editor.updatePersonalField}
                  onSummaryChange={editor.updateSummary}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <ExperienceEditor
                  entries={content.experience}
                  disabled={false}
                  onAdd={editor.addExperience}
                  onRemove={editor.removeExperience}
                  onFieldChange={editor.updateExperienceField}
                  onAddBullet={editor.addExperienceBullet}
                  onUpdateBullet={editor.updateExperienceBullet}
                  onRemoveBullet={editor.removeExperienceBullet}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Education</CardTitle>
              </CardHeader>
              <CardContent>
                <EducationEditor
                  entries={content.education}
                  disabled={false}
                  onAdd={editor.addEducation}
                  onRemove={editor.removeEducation}
                  onFieldChange={editor.updateEducationField}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <SkillsEditor
                  skills={content.skills}
                  disabled={false}
                  onChangeText={editor.updateSkillsText}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="min-h-0 overflow-y-auto bg-muted/30 px-6 py-6">
          <CvPreview content={content} templateId={editor.templateId} />
        </div>
      </div>
    </main>
  )
}
