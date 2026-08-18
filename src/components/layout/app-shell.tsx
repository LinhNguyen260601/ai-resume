import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { FilePlus2, LayoutGrid, Menu, Sparkles, Upload, X } from 'lucide-react'
import { cn } from '#/lib/utils'

type NavItem = {
  label: string
  to: string
  icon: typeof LayoutGrid
}

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutGrid },
  { label: 'Upload CV', to: '/upload', icon: Upload },
  { label: 'New Job', to: '/jobs/new', icon: FilePlus2 },
]

function AppLogo() {
  return (
    <Link
      to="/dashboard"
      className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground"
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
        <Sparkles className="size-4" strokeWidth={1.5} />
      </span>
      ResumeAI
    </Link>
  )
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&.active]:bg-primary/15 [&.active]:text-primary"
          activeProps={{ className: 'active' }}
        >
          <item.icon className="size-4" strokeWidth={1.5} />
          {item.label}
        </Link>
      ))}
    </nav>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background lg:flex lg:h-screen">
      <aside className="glass-card sticky top-0 z-40 hidden h-screen w-64 shrink-0 flex-col gap-8 border-r border-border/60 px-4 py-6 lg:flex">
        <AppLogo />
        <NavLinks />
      </aside>

      <div className="flex min-h-screen flex-1 flex-col lg:h-screen lg:min-h-0">
        <header className="glass-nav is-scrolled sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between px-4 lg:hidden">
          <AppLogo />
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="flex size-9 items-center justify-center rounded-xl text-foreground"
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? (
              <X className="size-5" strokeWidth={1.5} />
            ) : (
              <Menu className="size-5" strokeWidth={1.5} />
            )}
          </button>
        </header>

        <div
          className={cn(
            'glass-card shrink-0 border-b border-border/60 px-4 py-4 lg:hidden',
            mobileOpen ? 'block' : 'hidden',
          )}
        >
          <NavLinks onNavigate={() => setMobileOpen(false)} />
        </div>

        <main className="relative min-h-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
