import { ScrollReveal } from '#/components/landing/scroll-reveal'
import { Badge } from '#/components/ui/badge.tsx'

export function PricingTeaser() {
  return (
    <section id="pricing" className="py-16">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
        <ScrollReveal className="glass-card mx-auto max-w-lg rounded-2xl p-8 text-center">
          <Badge
            variant="outline"
            className="mb-4 border-primary/30 text-primary"
          >
            Coming soon
          </Badge>
          <h2 className="text-xl font-semibold text-foreground">
            Simple pricing for every job search
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Free tier at launch. Pro plans for power applicants — stay tuned.
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}
