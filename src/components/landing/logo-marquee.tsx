const companies = [
  'Google',
  'Meta',
  'Amazon',
  'Microsoft',
  'Apple',
  'Netflix',
  'Spotify',
  'Stripe',
] as const

export function LogoMarquee() {
  const doubled = [...companies, ...companies]

  return (
    <section className="border-y border-border/60 py-10">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
        <p className="mb-6 text-center text-sm font-medium text-muted-foreground">
          Trusted by job seekers at
        </p>
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-background to-transparent" />
          <div className="marquee-track flex w-max items-center gap-12">
            {doubled.map((name, i) => (
              <span
                key={`${name}-${i}`}
                className="shrink-0 text-xl font-bold tracking-tight text-muted-foreground/40 grayscale select-none"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
