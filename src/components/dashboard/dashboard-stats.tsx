import { FileStack, FileText, Sparkles } from 'lucide-react'
import { useCountUp } from '#/hooks/use-count-up'

type StatDef = {
  id: string
  label: string
  value: number
  icon: typeof Sparkles
}

function StatCard({ label, value, icon: Icon }: StatDef) {
  const count = useCountUp(value, true, 900)

  return (
    <div className="glass-card flex items-center gap-4 rounded-2xl px-5 py-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
        <Icon className="size-5" strokeWidth={1.5} />
      </span>
      <div>
        <p className="gradient-text-stat text-2xl font-bold tracking-tight">
          {count}
        </p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

type DashboardStatsProps = {
  baseCvCount: number
  jobCount: number
  tailoredCvCount: number
}

export function DashboardStats({
  baseCvCount,
  jobCount,
  tailoredCvCount,
}: DashboardStatsProps) {
  const stats: StatDef[] = [
    { id: 'base', label: 'Base CVs', value: baseCvCount, icon: FileStack },
    { id: 'jobs', label: 'Job postings', value: jobCount, icon: FileText },
    {
      id: 'tailored',
      label: 'Tailored CVs',
      value: tailoredCvCount,
      icon: Sparkles,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <StatCard key={stat.id} {...stat} />
      ))}
    </div>
  )
}
