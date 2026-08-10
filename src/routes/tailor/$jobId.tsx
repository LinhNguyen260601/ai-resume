import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion, useReducedMotion } from 'motion/react'
import { BaseCvPicker } from '#/components/tailor/base-cv-picker'
import { Button } from '#/components/ui/button'
import { Spinner } from '#/components/ui/spinner'
import { useTailorCv } from '#/hooks/use-tailor-cv'
import { Sparkles } from 'lucide-react'

export const Route = createFileRoute('/tailor/$jobId')({
  component: TailorJobPage,
  head: function tailorHead() {
    return {
      meta: [{ title: 'Tailor CV — ResumeAI' }],
    }
  },
})

function TailorJobPage() {
  const { jobId } = Route.useParams()
  const navigate = useNavigate()
  const shouldReduceMotion = useReducedMotion()

  const tailor = useTailorCv({
    jobId,
    onTailored(tailoredCvId) {
      void navigate({ to: '/editor/$tailoredCvId', params: { tailoredCvId } })
    },
  })

  return (
    <main className="relative min-h-screen bg-background px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-24 top-10 size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-16 top-40 size-64 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-2xl flex flex-col gap-8">
        <motion.div
          className="flex flex-col gap-2"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-3xl font-bold tracking-[-0.02em]">Tailor CV</h1>
          <p className="text-muted-foreground">
            Choose a base CV to tailor for this role.
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col gap-6"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.08,
            duration: 0.45,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {tailor.baseCvs.isError ? (
            <p
              role="alert"
              className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              Unable to load base CVs. Please try again.
            </p>
          ) : (
            <BaseCvPicker
              items={tailor.baseCvs.data}
              isLoading={tailor.baseCvs.isLoading}
              selectedId={tailor.selectedId}
              disabled={tailor.isTailoring}
              onSelect={tailor.onSelect}
            />
          )}

          {tailor.error ? (
            <p
              role="alert"
              className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {tailor.error}
            </p>
          ) : null}

          <Button
            className="btn-gradient rounded-xl w-full"
            disabled={tailor.isTailoring || !tailor.baseCvs.data?.length}
            onClick={tailor.onSubmit}
          >
            {tailor.isTailoring ? <Spinner data-icon="inline-start" /> : null}
            <Sparkles className="size-4" aria-hidden />
            Tailor CV
          </Button>
        </motion.div>
      </div>
    </main>
  )
}
