import {
  ArrowRight,
  Check,
  CirclePlay,
  FileText,
  Link2,
  Sparkles,
} from 'lucide-react'

import { Button } from '#/components/ui/button.tsx'
import { ParallaxOrbs } from '#/components/landing/parallax-orbs'

function HeroMockup() {
  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
      <div
        className="mesh-orb mesh-orb-violet absolute -left-12 top-1/4 size-64 -translate-y-1/2"
        aria-hidden
      />
      <div
        className="mesh-orb mesh-orb-cyan absolute -right-8 bottom-0 size-56"
        aria-hidden
      />

      <div className="float-mockup glass-card relative overflow-hidden rounded-2xl p-1">
        <div className="neural-dots absolute inset-0" aria-hidden />

        <div className="relative grid grid-cols-2 gap-0 overflow-hidden rounded-xl border border-border/60 bg-background/40">
          {/* Job posting panel */}
          <div className="border-r border-border/60 p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="size-2 rounded-full bg-secondary" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Job posting
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-2.5 w-3/4 rounded bg-muted/40" />
              <div className="h-2 w-full rounded bg-muted/25" />
              <div className="h-2 w-full rounded bg-muted/25" />
              <div className="mt-2 flex flex-wrap gap-1">
                {['React', 'TypeScript', 'Node.js'].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[9px] font-medium text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-1 h-2 w-5/6 rounded bg-muted/20" />
              <div className="h-2 w-2/3 rounded bg-muted/20" />
            </div>
          </div>

          {/* CV preview panel */}
          <div className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <FileText className="size-3 text-primary" strokeWidth={1.5} />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Tailored CV
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-3 w-1/2 rounded bg-linear-to-r from-primary/40 to-secondary/40" />
              <div className="h-1.5 w-1/3 rounded bg-muted/30" />
              <div className="mt-2 flex flex-col gap-1.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <Sparkles
                      className="mt-0.5 size-2 shrink-0 text-secondary"
                      strokeWidth={1.5}
                    />
                    <div className="flex-1">
                      <div className="h-1.5 w-full rounded bg-muted/25" />
                      <div className="mt-1 h-1.5 w-4/5 rounded bg-muted/20" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI connector */}
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <div
            className="sparkle-trail absolute inset-0 -z-10 rounded-full"
            aria-hidden
          />
          <div className="flex items-center gap-1 rounded-full border border-primary/40 bg-background/90 px-3 py-1.5 shadow-(--glow-ai) backdrop-blur-sm">
            <Sparkles className="size-3 text-primary" strokeWidth={1.5} />
            <span className="text-[10px] font-semibold text-foreground">
              AI Tailor
            </span>
            <Link2 className="size-3 text-secondary" strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </div>
  )
}

const trustItems = [
  'No credit card',
  'PDF & Word upload',
  '4 pro templates',
] as const

export function HeroSection() {
  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden pt-16">
      <ParallaxOrbs />
      <div className="neural-dots absolute inset-0" aria-hidden />

      <div className="relative mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:py-24">
        <div className="flex flex-col gap-6">
          <div className="hero-stagger-1">
            <span className="eyebrow-pulse inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-foreground">
              <Sparkles className="size-3.5 text-primary" strokeWidth={1.5} />
              Powered by AI
            </span>
          </div>

          <h1 className="hero-stagger-2 text-4xl font-bold leading-[1.1] tracking-[-0.02em] text-foreground sm:text-5xl lg:text-[3.25rem]">
            Your CV, perfectly <span className="text-shimmer">tailored</span>{' '}
            for every job
          </h1>

          <p className="hero-stagger-3 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Upload your resume once. Paste any job description. Let AI rewrite
            your bullets, reorder your skills, and export a stunning PDF — in
            under 2 minutes.
          </p>

          <div className="hero-stagger-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              size="lg"
              className="btn-gradient h-12 rounded-xl border-0 px-6 text-base font-semibold"
            >
              Start Tailoring Free
              <ArrowRight data-icon="inline-end" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 rounded-xl border-border bg-transparent text-muted-foreground hover:border-primary/40 hover:bg-accent hover:text-foreground"
              asChild
            >
              <a href="#how-it-works">
                <CirclePlay data-icon="inline-start" />
                See how it works
              </a>
            </Button>
          </div>

          <div className="hero-stagger-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
            {trustItems.map((item) => (
              <span
                key={item}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Check className="size-4 text-success" strokeWidth={1.5} />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="hero-stagger-5 lg:pl-4">
          <HeroMockup />
        </div>
      </div>
    </section>
  )
}
