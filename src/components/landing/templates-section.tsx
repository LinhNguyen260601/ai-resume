import { useState } from 'react'

import { cn } from '#/lib/utils.ts'
import { ScrollReveal } from '#/components/landing/scroll-reveal'

const templates = [
  {
    id: 'classic',
    name: 'Classic',
    accent: 'from-slate-400/20 to-slate-600/20',
  },
  { id: 'modern', name: 'Modern', accent: 'from-primary/25 to-secondary/25' },
  {
    id: 'creative',
    name: 'Creative',
    accent: 'from-violet-500/20 to-fuchsia-500/20',
  },
  { id: 'compact', name: 'Compact', accent: 'from-cyan-500/20 to-teal-500/20' },
] as const

export function TemplatesSection() {
  const [active, setActive] = useState<string>('modern')

  return (
    <section id="templates" className="py-24 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
        <ScrollReveal className="mx-auto mb-12 max-w-xl text-center">
          <h2 className="text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl">
            Templates that get interviews
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mx-auto flex w-max max-w-full gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onMouseEnter={() => setActive(template.id)}
                onFocus={() => setActive(template.id)}
                className={cn(
                  'group flex shrink-0 snap-center flex-col items-center gap-4 transition-transform duration-300',
                  active === template.id && 'scale-[1.03]',
                )}
              >
                <div
                  className={cn(
                    'glass-card w-[200px] overflow-hidden rounded-2xl border-2 p-4 transition-all duration-300 sm:w-[240px]',
                    active === template.id
                      ? 'border-primary/60 shadow-[0_0_32px_rgba(139,92,246,0.25)]'
                      : 'border-border hover:border-primary/30',
                  )}
                >
                  <div
                    className={cn(
                      'aspect-3/4 rounded-lg bg-linear-to-br p-4',
                      template.accent,
                    )}
                  >
                    <div className="mb-3 h-3 w-2/3 rounded bg-foreground/20" />
                    <div className="mb-4 h-1.5 w-1/2 rounded bg-foreground/10" />
                    <div className="flex flex-col gap-1.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="h-1 rounded bg-foreground/10"
                          style={{ width: `${100 - i * 8}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <span
                  className={cn(
                    'text-sm font-medium transition-colors',
                    active === template.id
                      ? 'text-foreground'
                      : 'text-muted-foreground',
                  )}
                >
                  {template.name}
                </span>
              </button>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
