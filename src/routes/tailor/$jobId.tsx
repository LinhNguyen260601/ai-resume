import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/tailor/$jobId')({
  component: TailorJobPlaceholder,
  head: function tailorHead() {
    return {
      meta: [{ title: 'Tailor CV — ResumeAI' }],
    }
  },
})

function TailorJobPlaceholder() {
  const { jobId } = Route.useParams()

  return (
    <main className="relative min-h-screen bg-background px-4 py-10">
      <div className="relative mx-auto max-w-2xl flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-[-0.02em]">Tailor CV</h1>
        <p className="text-muted-foreground">
          Job posting saved. Tailoring for this role is coming next.
        </p>
        <p className="text-sm text-muted-foreground">Job ID: {jobId}</p>
      </div>
    </main>
  )
}
