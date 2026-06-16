import { ArrowRight, Upload } from 'lucide-react'

import { Button } from '#/components/ui/button.tsx'
import { ParallaxOrbs } from '#/components/landing/parallax-orbs'
import { ScrollReveal } from '#/components/landing/scroll-reveal'

export function FinalCtaSection() {
  return (
    <section className="final-cta-bg relative overflow-hidden py-24 lg:py-32">
      <ParallaxOrbs
        violetClassName="mesh-orb mesh-orb-violet absolute -left-20 top-1/2 size-96 -translate-y-1/2 opacity-60"
        cyanClassName="mesh-orb mesh-orb-cyan absolute -right-20 top-1/3 size-80 opacity-60"
      />

      <div className="relative mx-auto max-w-[1440px] px-6 text-center lg:px-10">
        <ScrollReveal>
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl lg:text-5xl">
            Stop sending the same CV everywhere
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Let AI tailor it for you — then make it yours in the editor.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="btn-gradient h-14 rounded-xl border-0 px-8 text-base font-semibold"
            >
              Get Started Free
              <ArrowRight data-icon="inline-end" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-14 rounded-xl border-border/80 bg-background/20 px-8 text-base backdrop-blur-sm hover:border-primary/40 hover:bg-accent"
            >
              <Upload data-icon="inline-start" />
              Upload your CV now
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
