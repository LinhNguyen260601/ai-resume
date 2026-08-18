import { createFileRoute, Link } from '@tanstack/react-router'
import { motion, useReducedMotion } from 'motion/react'
import { Sparkles } from 'lucide-react'
import { AppShell } from '#/components/layout/app-shell'
import { Button } from '#/components/ui/button'
import { DashboardStats } from '#/components/dashboard/dashboard-stats'
import { TailoredCvList } from '#/components/dashboard/tailored-cv-list'
import { useBaseCvs } from '#/hooks/use-base-cvs'
import { useJobPostings } from '#/hooks/use-job-postings'
import { useTailoredCvs } from '#/hooks/use-tailored-cvs'
import { toDashboardCvItem } from '#/models/dashboard-cv'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
  head: function dashboardHead() {
    return {
      meta: [{ title: 'Dashboard — ResumeAI' }],
    }
  },
})

function DashboardPage() {
  const shouldReduceMotion = useReducedMotion()
  const tailoredCvs = useTailoredCvs()
  const baseCvs = useBaseCvs()
  const jobPostings = useJobPostings()
  const items = tailoredCvs.data?.map(toDashboardCvItem)

  return (
    <AppShell>
      <div className="relative min-h-screen px-4 py-10 lg:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute -left-24 top-10 size-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -right-16 top-40 size-64 rounded-full bg-secondary/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl space-y-10">
          <motion.div
            className="flex flex-wrap items-center justify-between gap-4"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="size-3" strokeWidth={1.5} />
                AI ready
              </span>
              <h1 className="text-3xl font-bold tracking-[-0.02em] sm:text-4xl">
                Welcome back
              </h1>
              <p className="text-muted-foreground">
                Your tailored CVs, ready to edit or export.
              </p>
            </div>
            <Button asChild className="btn-gradient rounded-xl border-0">
              <Link to="/jobs/new">
                <Sparkles data-icon="inline-start" />
                Tailor a new CV
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.04,
              duration: 0.45,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <DashboardStats
              baseCvCount={baseCvs.data?.length ?? 0}
              jobCount={jobPostings.data?.length ?? 0}
              tailoredCvCount={tailoredCvs.data?.length ?? 0}
            />
          </motion.div>

          <motion.section
            className="space-y-4"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.08,
              duration: 0.45,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <h2 className="text-lg font-semibold tracking-[-0.02em]">
              Your tailored CVs
            </h2>
            {tailoredCvs.isError ? (
              <p
                role="alert"
                className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                Unable to load your tailored CVs. Please try again.
              </p>
            ) : (
              <TailoredCvList items={items} isLoading={tailoredCvs.isLoading} />
            )}
          </motion.section>
        </div>
      </div>
    </AppShell>
  )
}
