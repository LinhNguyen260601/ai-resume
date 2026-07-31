import { JobDescriptionField } from '#/components/jobs/job-description-field'
import { Button } from '#/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '#/components/ui/input-group'
import { Spinner } from '#/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { JOB_FETCH_BLOCKED_MESSAGE } from '#/lib/job-fetch-errors'
import type { JobFormValues } from '#/models/job-form'
import { Sparkles } from 'lucide-react'

export type JobFormProps = {
  values: JobFormValues
  error: string | null
  isScraping: boolean
  isSubmitting: boolean
  onSourceTypeChange: (sourceType: JobFormValues['sourceType']) => void
  onChange: (patch: Partial<JobFormValues>) => void
  onScrape: () => void
  onSubmit: () => void
}

export function JobForm({
  values,
  error,
  isScraping,
  isSubmitting,
  onSourceTypeChange,
  onChange,
  onScrape,
  onSubmit,
}: JobFormProps) {
  const busy = isScraping || isSubmitting
  const forceDescriptionEdit = error === JOB_FETCH_BLOCKED_MESSAGE

  function handleSubmit(event: React.ChangeEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form
      className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-md"
      onSubmit={handleSubmit}
    >
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <Tabs
          value={values.sourceType}
          onValueChange={(value) => {
            if (value === 'paste' || value === 'url') onSourceTypeChange(value)
          }}
        >
          <TabsList className="rounded-full">
            <TabsTrigger className="rounded-full" value="paste">
              Paste text
            </TabsTrigger>
            <TabsTrigger className="rounded-full" value="url">
              From URL
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <FieldGroup>
              <TabsContent value="paste" className="mt-0">
                <JobDescriptionField
                  id="job-description"
                  value={values.extractedText}
                  disabled={busy}
                  placeholder="Paste the full job posting…"
                  emptyPreviewLabel="Paste a posting, then switch to Preview"
                  onChange={(extractedText) => onChange({ extractedText })}
                />
              </TabsContent>

              <TabsContent value="url" className="mt-0 flex flex-col gap-4">
                <Field>
                  <FieldLabel htmlFor="job-url">Job posting URL</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id="job-url"
                      type="url"
                      value={values.sourceUrl}
                      disabled={busy}
                      placeholder="https://…"
                      onChange={(event) =>
                        onChange({ sourceUrl: event.target.value })
                      }
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        type="button"
                        variant="secondary"
                        disabled={busy}
                        onClick={onScrape}
                      >
                        {isScraping ? (
                          <Spinner data-icon="inline-start" />
                        ) : null}
                        Fetch
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                </Field>

                <JobDescriptionField
                  id="job-description-url"
                  value={values.extractedText}
                  disabled={busy}
                  forceEdit={forceDescriptionEdit}
                  placeholder="Fetched text appears here — edit as needed"
                  emptyPreviewLabel="Fetch a posting to preview it here"
                  onChange={(extractedText) => onChange({ extractedText })}
                />
              </TabsContent>

              <Field>
                <FieldLabel htmlFor="company-name">Company name</FieldLabel>
                <Input
                  id="company-name"
                  value={values.companyName}
                  disabled={busy}
                  placeholder="Optional"
                  onChange={(event) =>
                    onChange({ companyName: event.target.value })
                  }
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="job-title">Job title</FieldLabel>
                <Input
                  id="job-title"
                  value={values.jobTitle}
                  disabled={busy}
                  placeholder="Optional"
                  onChange={(event) =>
                    onChange({ jobTitle: event.target.value })
                  }
                />
              </Field>
            </FieldGroup>
          </div>
        </Tabs>

        {error ? (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </p>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-border px-6 py-4">
        <Button
          type="submit"
          className="btn-gradient rounded-xl w-full"
          disabled={busy}
        >
          {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
          <Sparkles className="size-4" aria-hidden />
          Continue
        </Button>
      </div>
    </form>
  )
}
