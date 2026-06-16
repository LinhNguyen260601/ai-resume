import { ScrollReveal } from '#/components/landing/scroll-reveal'
import {
  Download,
  FileUp,
  LayoutTemplate,
  Link2,
  PenLine,
  Sparkles,
} from 'lucide-react'

const features = [
  {
    id: 'parsing',
    title: 'Smart CV Parsing',
    description:
      'Upload PDF or Word — AI extracts and structures your experience automatically.',
    icon: FileUp,
    className: 'lg:col-span-2 lg:row-span-2',
    large: true,
  },
  {
    id: 'scanner',
    title: 'Job URL Scanner',
    description:
      'Paste any job link. AI fetches and extracts the full description.',
    icon: Link2,
    className: 'lg:col-span-1',
  },
  {
    id: 'tailoring',
    title: 'AI Tailoring',
    description:
      'Rewrites bullets to match keywords, reorders skills, adjusts summary.',
    icon: Sparkles,
    className: 'lg:col-span-1',
  },
  {
    id: 'editor',
    title: 'Live Editor + Preview',
    description:
      'Edit every line with a split-pane editor and real-time CV preview.',
    icon: PenLine,
    className: 'lg:col-span-2',
    wide: true,
  },
  {
    id: 'templates',
    title: '4 Pro Templates',
    description:
      'Classic, Modern, Creative, and Compact — all interview-ready.',
    icon: LayoutTemplate,
    className: 'lg:col-span-1',
  },
  {
    id: 'export',
    title: 'One-Click PDF Export',
    description: 'Download a polished, ATS-friendly PDF in seconds.',
    icon: Download,
    className: 'lg:col-span-1',
  },
] as const

function FeatureIllustration({
  id,
  large,
  wide,
}: {
  id: string
  large?: boolean
  wide?: boolean
}) {
  if (id === 'parsing') {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-primary/30 bg-background/50 p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15">
            <FileUp className="size-6 text-primary" strokeWidth={1.5} />
          </div>
          <p className="text-xs text-muted-foreground">
            Drop your CV here or click to browse
          </p>
          <div className="h-1.5 w-24 rounded-full bg-muted/30" />
        </div>
      </div>
    )
  }

  if (id === 'editor') {
    return (
      <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-border/60 bg-background/50 p-3">
        <div className="flex flex-col gap-1.5 p-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-1.5 rounded bg-muted/25" />
          ))}
        </div>
        <div className="rounded-lg border border-border/40 bg-card p-2">
          <div className="mb-2 h-2 w-1/2 rounded bg-primary/30" />
          <div className="flex flex-col gap-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-1 rounded bg-muted/20" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (id === 'templates') {
    return (
      <div className="mt-4 grid grid-cols-4 gap-1.5">
        {['C', 'M', 'Cr', 'Co'].map((label) => (
          <div
            key={label}
            className="flex aspect-3/4 items-center justify-center rounded-md border border-border/60 bg-background/60 text-[10px] font-semibold text-muted-foreground"
          >
            {label}
          </div>
        ))}
      </div>
    )
  }

  if (id === 'export') {
    return (
      <div className="mt-4 flex justify-center">
        <div className="flex size-14 items-center justify-center rounded-xl bg-linear-to-br from-primary/30 to-secondary/30 shadow-(--glow-ai)">
          <Download className="size-6 text-foreground" strokeWidth={1.5} />
        </div>
      </div>
    )
  }

  if (large || wide) return null

  return <div className="mt-4 h-16 rounded-lg bg-background/40" aria-hidden />
}

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 lg:py-32">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
        <ScrollReveal className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-wider text-primary">
            Features
          </span>
          <h2 className="text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl">
            AI that actually understands your career
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <ScrollReveal
                key={feature.id}
                delay={index * 0.1}
                className={feature.className}
              >
                <article className="feature-card-hover glass-card group flex h-full flex-col rounded-2xl p-6">
                  <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary transition-colors group-hover:bg-primary/25">
                    <Icon className="size-5" strokeWidth={1.5} />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                  <FeatureIllustration
                    id={feature.id}
                    large={'large' in feature ? feature.large : false}
                    wide={'wide' in feature ? feature.wide : false}
                  />
                </article>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
