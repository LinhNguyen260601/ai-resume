import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Download } from 'lucide-react'
import { CvPreview } from '#/components/cv/cv-preview'
import { TemplatePicker } from '#/components/export/template-picker'
import { Button } from '#/components/ui/button'
import { Spinner } from '#/components/ui/spinner'
import { useExportCv } from '#/hooks/use-export-cv'

export const Route = createFileRoute('/export/$tailoredCvId')({
  component: ExportPage,
  head: function exportHead() {
    return {
      meta: [{ title: 'Export CV — ResumeAI' }],
    }
  },
})

function ExportPage() {
  const { tailoredCvId } = Route.useParams()
  return <ExportPageContent key={tailoredCvId} tailoredCvId={tailoredCvId} />
}

function ExportPageContent({ tailoredCvId }: { tailoredCvId: string }) {
  const cv = useExportCv({ tailoredCvId })

  if (cv.isError) {
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

  if (cv.isLoading || !cv.content) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <Spinner />
      </main>
    )
  }

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-background">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon-sm" asChild>
            <Link
              to="/editor/$tailoredCvId"
              params={{ tailoredCvId }}
              aria-label="Back to editor"
            >
              <ArrowLeft className="size-4" aria-hidden />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold tracking-[-0.02em]">
            {cv.title ?? 'Export CV'}
          </h1>
        </div>

        <Button
          className="btn-gradient rounded-xl"
          disabled={cv.isDownloading}
          onClick={cv.onDownload}
        >
          {cv.isDownloading ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <Download className="size-4" aria-hidden />
          )}
          Download PDF
        </Button>
      </header>

      {cv.downloadError ? (
        <p
          role="alert"
          className="mx-6 mt-4 shrink-0 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          Could not export the PDF. Please try again.
        </p>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-6">
          <TemplatePicker
            templateId={cv.templateId}
            disabled={cv.isDownloading}
            onSelect={cv.setTemplateId}
          />
          <CvPreview content={cv.content} templateId={cv.templateId} />
        </div>
      </div>
    </main>
  )
}
