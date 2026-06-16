import { ScrollReveal } from '#/components/landing/scroll-reveal'
import { useCountUp } from '#/hooks/use-count-up'
import { useEffect, useRef, useState } from 'react'

const stats = [
  {
    id: 'time',
    prefix: '< ',
    target: 2,
    suffix: ' min',
    label: 'average tailor time',
    decimals: 0,
  },
  {
    id: 'templates',
    prefix: '',
    target: 4,
    suffix: '',
    label: 'pro templates',
    decimals: 0,
  },
  {
    id: 'control',
    prefix: '',
    target: 100,
    suffix: '%',
    label: 'you control every edit',
    decimals: 0,
  },
] as const

function StatCounter({
  prefix,
  target,
  suffix,
  label,
  decimals,
  isActive,
}: {
  prefix: string
  target: number
  suffix: string
  label: string
  decimals: number
  isActive: boolean
}) {
  const value = useCountUp(target, isActive, 1500, decimals)

  return (
    <div className="flex flex-col items-center gap-2 px-6 py-4 text-center">
      <span className="gradient-text-stat text-4xl font-bold tracking-tight sm:text-5xl">
        {prefix}
        {value}
        {suffix}
      </span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  )
}

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsActive(true)
      },
      { threshold: 0.4 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="py-16 lg:py-20">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
        <ScrollReveal>
          <div
            ref={ref}
            className="glass-card grid grid-cols-1 divide-y divide-border rounded-2xl sm:grid-cols-3 sm:divide-x sm:divide-y-0"
          >
            {stats.map((stat) => (
              <StatCounter
                key={stat.id}
                prefix={stat.prefix}
                target={stat.target}
                suffix={stat.suffix}
                label={stat.label}
                decimals={stat.decimals}
                isActive={isActive}
              />
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
