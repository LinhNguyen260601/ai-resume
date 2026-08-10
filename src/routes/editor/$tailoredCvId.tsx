import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/editor/$tailoredCvId')({
  component: EditorPlaceholder,
  head: function editorHead() {
    return {
      meta: [{ title: 'Edit CV — ResumeAI' }],
    }
  },
})

function EditorPlaceholder() {
  const { tailoredCvId } = Route.useParams()

  return (
    <main className="relative min-h-screen bg-background px-4 py-10">
      <div className="relative mx-auto max-w-2xl flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-[-0.02em]">Edit CV</h1>
        <p className="text-muted-foreground">
          Your tailored CV is ready. The editor is coming next.
        </p>
        <p className="text-sm text-muted-foreground">
          Tailored CV ID: {tailoredCvId}
        </p>
      </div>
    </main>
  )
}
