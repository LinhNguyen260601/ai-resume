import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  CloudUpload,
  Download,
  Link2,
  Sparkles,
} from 'lucide-react'

import { Button } from '#/components/ui/button.tsx'
import { cn } from '#/lib/utils.ts'

import { ScrollReveal } from './scroll-reveal.tsx'

const steps = [
  {
    number: '01',
    title: 'Upload your CV',
    description: 'Drop a PDF or Word file — we parse everything in seconds.',
    icon: CloudUpload,
    sparkle: false,
  },
  {
    number: '02',
    title: 'Add the job',
    description: 'Paste a job URL or description to set the target role.',
    icon: Link2,
    sparkle: false,
  },
  {
    number: '03',
    title: 'Export & apply',
    description: 'Review AI edits, tweak in the editor, download your PDF.',
    icon: Download,
    sparkle: true,
  },
] as const

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [lineVisible, setLineVisible] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setLineVisible(true)
      },
      { threshold: 0.3 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="border-y border-border/40 py-24 lg:py-32"
    >
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
        <ScrollReveal className="mx-auto mb-16 max-w-xl text-center">
          <h2 className="text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl">
            Three steps. One perfect CV.
          </h2>
        </ScrollReveal>

        <div className="relative">
          {/* Animated connector line — desktop */}
          <div
            className="absolute left-[16.67%] right-[16.67%] top-10 hidden h-0.5 overflow-hidden md:block"
            aria-hidden
          >
            <div
              className={cn(
                'h-full origin-left bg-linear-to-r from-primary to-secondary transition-transform duration-1200 ease-[cubic-bezier(0.16,1,0.3,1)]',
                lineVisible ? 'scale-x-100' : 'scale-x-0',
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <ScrollReveal key={step.number} delay={index * 0.1}>
                  <div className="relative flex flex-col items-center text-center">
                    <div className="relative z-10 mb-6 flex size-20 items-center justify-center rounded-full bg-linear-to-br from-primary to-secondary p-[2px]">
                      <div className="relative flex size-full items-center justify-center rounded-full bg-background">
                        <Icon
                          className="size-8 text-primary"
                          strokeWidth={1.5}
                        />
                        {step.sparkle ? (
                          <Sparkles
                            className="absolute -right-0.5 -top-0.5 size-4 text-secondary"
                            strokeWidth={1.5}
                          />
                        ) : null}
                      </div>
                    </div>
                    <span className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
                      Step {step.number}
                    </span>
                    <h3 className="mb-2 text-xl font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        </div>

        <ScrollReveal className="mt-16 flex justify-center" delay={0.3}>
          <Button
            size="lg"
            className="btn-gradient h-12 rounded-xl border-0 px-8 font-semibold"
          >
            Try it now — it&apos;s free
            <ArrowRight data-icon="inline-end" />
          </Button>
        </ScrollReveal>
      </div>
    </section>
  )
}
