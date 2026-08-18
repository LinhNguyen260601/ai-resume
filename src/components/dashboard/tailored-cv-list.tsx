import { Link } from '@tanstack/react-router'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowUpRight, FileText, Sparkles, Upload } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { formatDate } from '#/lib/format-date'
import type { DashboardCvItem } from '#/models/dashboard-cv'

function EmptyState() {
  return (
    <Card className="rounded-2xl border-dashed border-border/60 bg-card/60 backdrop-blur-md">
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <span className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Sparkles className="size-6" strokeWidth={1.5} />
        </span>
        <div className="space-y-1">
          <p className="font-semibold text-foreground">No tailored CVs yet</p>
          <p className="text-sm text-muted-foreground">
            Upload a base CV, then tailor it to a job to see it here.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild className="btn-gradient rounded-xl border-0">
            <Link to="/upload">
              <Upload data-icon="inline-start" />
              Upload CV
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="rounded-xl border border-primary/30"
          >
            <Link to="/jobs/new">
              <FileText data-icon="inline-start" />
              New Job
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

type TailoredCvListProps = {
  items: DashboardCvItem[] | undefined
  isLoading: boolean
}

export function TailoredCvList({ items, isLoading }: TailoredCvListProps) {
  const shouldReduceMotion = useReducedMotion()

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading CVs…</p>
  }

  if (!items || items.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: shouldReduceMotion ? 0 : index * 0.05,
            duration: shouldReduceMotion ? 0 : 0.35,
          }}
        >
          <Link
            to="/editor/$tailoredCvId"
            params={{ tailoredCvId: item.id }}
            className="group block h-full"
          >
            <Card className="relative h-full overflow-hidden rounded-2xl border-border bg-card/80 backdrop-blur-md transition-all hover:border-primary/40 hover:shadow-(--glow-ai)">
              <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary to-secondary opacity-70" />
              <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                <CardTitle className="text-base">{item.title}</CardTitle>
                <ArrowUpRight
                  className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  strokeWidth={1.5}
                />
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                {item.roleLabel ? (
                  <p className="text-foreground/80">{item.roleLabel}</p>
                ) : null}
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    variant="outline"
                    className="border-primary/30 text-primary"
                  >
                    <Sparkles className="size-3" strokeWidth={1.5} />
                    {item.templateLabel}
                  </Badge>
                  <span>Updated {formatDate(item.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
