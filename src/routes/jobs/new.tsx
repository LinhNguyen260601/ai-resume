import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion, useReducedMotion } from 'motion/react'
import { JobForm } from '#/components/jobs/job-form'
import { useJobForm } from '#/hooks/use-job-form'

export const Route = createFileRoute('/jobs/new')({
  component: NewJobPage,
  head: function newJobHead() {
    return {
      meta: [{ title: 'New Job — ResumeAI' }],
    }
  },
})

function NewJobPage() {
  const navigate = useNavigate()
  const shouldReduceMotion = useReducedMotion()
  const form = useJobForm({
    onCreated(jobId) {
      void navigate({ to: '/tailor/$jobId', params: { jobId } })
    },
  })

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden bg-background px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-24 top-10 size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-16 top-40 size-64 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col gap-8">
        <motion.div
          className="shrink-0 flex flex-col gap-2"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-3xl font-bold tracking-[-0.02em]">New job</h1>
          <p className="text-muted-foreground">
            Paste a posting or fetch from a URL, then continue to tailor your
            CV.
          </p>
        </motion.div>

        <motion.div
          className="flex min-h-0 flex-1 flex-col"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.08,
            duration: 0.45,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <JobForm {...form} />
        </motion.div>
      </div>
    </main>
  )
}
