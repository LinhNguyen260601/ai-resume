import { useState } from 'react'
import { ArrowRight, Menu, Sparkles, X } from 'lucide-react'

import { Button } from '#/components/ui/button.tsx'
import { cn } from '#/lib/utils.ts'
import { useScrolled } from '#/hooks/use-scrolled'

type NavLink = {
  label: string
  href: string
  badge?: string
}

const navLinks: NavLink[] = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Templates', href: '#templates' },
  { label: 'Pricing', href: '#pricing', badge: 'Coming soon' },
]

export function LandingNavbar() {
  const isScrolled = useScrolled()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header
      className={cn(
        'glass-nav fixed inset-x-0 top-0 z-50',
        isScrolled && 'is-scrolled',
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-6 lg:px-10">
        <a
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Sparkles className="size-4" strokeWidth={1.5} />
          </span>
          ResumeAI
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="nav-link-landing flex items-center gap-2 text-sm font-medium"
            >
              {link.label}
              {link.badge ? (
                <span className="rounded-full border border-border bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {link.badge}
                </span>
              ) : null}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="hidden rounded-xl border border-transparent text-muted-foreground hover:border-primary/30 hover:text-foreground sm:inline-flex"
          >
            Log in
          </Button>
          <Button
            size="sm"
            className="btn-gradient hidden rounded-xl border-0 px-4 font-semibold sm:inline-flex"
          >
            Get Started Free
            <ArrowRight data-icon="inline-end" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl md:hidden"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? (
              <X className="size-5" strokeWidth={1.5} />
            ) : (
              <Menu className="size-5" strokeWidth={1.5} />
            )}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          'glass-card border-t border-border/60 md:hidden',
          mobileOpen ? 'block' : 'hidden',
        )}
      >
        <nav className="mx-auto flex max-w-[1440px] flex-col gap-1 px-6 py-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="nav-link-landing flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium"
              onClick={() => setMobileOpen(false)}
            >
              <span>{link.label}</span>
              {link.badge ? (
                <span className="rounded-full border border-border bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {link.badge}
                </span>
              ) : null}
            </a>
          ))}
          <div className="mt-3 flex flex-col gap-2 border-t border-border/40 pt-4">
            <Button
              variant="ghost"
              className="w-full rounded-xl justify-center border border-border/60"
            >
              Log in
            </Button>
            <Button className="btn-gradient w-full rounded-xl border-0 font-semibold">
              Get Started Free
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>
        </nav>
      </div>
    </header>
  )
}
