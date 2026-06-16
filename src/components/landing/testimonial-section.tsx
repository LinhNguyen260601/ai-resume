import { ScrollReveal } from '#/components/landing/scroll-reveal'

export function TestimonialSection() {
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
        <ScrollReveal>
          <figure className="glass-card mx-auto max-w-3xl rounded-2xl p-8 sm:p-12">
            <blockquote className="text-xl font-medium leading-relaxed text-foreground sm:text-2xl">
              &ldquo;I tailored my CV for 12 applications in one evening. Every
              version felt personal.&rdquo;
            </blockquote>
            <figcaption className="mt-8 flex items-center gap-4">
              <div
                className="flex size-12 items-center justify-center rounded-full bg-linear-to-br from-primary/40 to-secondary/40 text-sm font-bold text-foreground"
                aria-hidden
              >
                SK
              </div>
              <div>
                <p className="font-semibold text-foreground">Sarah Kim</p>
                <p className="text-sm text-muted-foreground">
                  Product Designer · Recently hired
                </p>
              </div>
            </figcaption>
          </figure>
        </ScrollReveal>
      </div>
    </section>
  )
}
