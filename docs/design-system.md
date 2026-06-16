# ResumeAI — Design System

**Product:** ResumeAI — AI-powered CV/resume builder that tailors your resume to any job description.  
**Platform:** Desktop-first web app (1440px max content width), responsive down to mobile.  
**Audience:** Job seekers who want fast, smart CV customization with AI.

---

## Visual Identity

### Vibe

Modern AI SaaS — futuristic but approachable, confident, energetic. **Not** corporate-boring.

### Style Pillars

| Pillar | Description |
|--------|-------------|
| **Glass surfaces** | Soft glassmorphism cards on a rich dark base |
| **Mesh gradients** | Subtle gradient orbs / mesh in backgrounds (decorative, low opacity) |
| **Glow accents** | Purple-cyan outer glow on primary CTAs and AI actions |
| **Motion-ready** | Hover glows, shimmer on AI buttons — elements should feel alive |

---

## Color Palette

Use these values exactly. Do not substitute similar colors.

### Core

| Token | Hex | Usage |
|-------|-----|-------|
| `--background` | `#0B0F19` | Page background (deep midnight navy) |
| `--surface` | `#151B2B` @ 80% opacity | Cards, panels, glass surfaces |
| `--border` | `#2A3448` | 1px borders on surfaces |
| `--primary` | `#8B5CF6` | Primary accent (electric violet) |
| `--secondary` | `#22D3EE` | Secondary accent (cyan) |
| `--gradient-cta` | `linear-gradient(90deg, #8B5CF6, #22D3EE)` | Primary buttons, hero CTAs |

### Semantic

| Token | Hex | Usage |
|-------|-----|-------|
| `--success` | `#34D399` | Success states, confirmations |
| `--warning` | `#FBBF24` | Warnings, pending states |
| `--error` | `#F87171` | Errors, destructive feedback |

### Text

| Token | Hex | Usage |
|-------|-----|-------|
| `--text-primary` | `#F8FAFC` | Headings, body, primary labels |
| `--text-secondary` | `#94A3B8` | Descriptions, secondary labels |
| `--text-muted` | `#64748B` | Placeholders, hints, disabled text |

### Effects

| Token | Value | Usage |
|-------|-------|-------|
| `--glow-ai` | `0 0 24px rgba(139, 92, 246, 0.35), 0 0 48px rgba(34, 211, 238, 0.15)` | Primary buttons, AI action chips |
| `--input-bg` | `#1E293B` | Input fill |
| `--input-focus` | `#22D3EE` | Input focus ring |

### Tailwind / CSS Variable Mapping

```css
:root {
  --background: #0B0F19;
  --foreground: #F8FAFC;
  --card: rgba(21, 27, 43, 0.8);
  --card-foreground: #F8FAFC;
  --border: #2A3448;
  --primary: #8B5CF6;
  --primary-foreground: #F8FAFC;
  --secondary: #22D3EE;
  --secondary-foreground: #0B0F19;
  --muted: #64748B;
  --muted-foreground: #94A3B8;
  --accent: #8B5CF6;
  --destructive: #F87171;
  --success: #34D399;
  --warning: #FBBF24;
  --input: #1E293B;
  --ring: #22D3EE;
  --radius: 1rem; /* rounded-2xl for cards */
}
```

---

## Typography

**Font stack:** `"Inter", "Geist", ui-sans-serif, system-ui, sans-serif`

| Scale | Size | Weight | Letter-spacing | Line-height | Usage |
|-------|------|--------|----------------|-------------|-------|
| Display | 36–48px | 700 | -0.02em | 1.1 | Hero headings |
| H1 | 30px | 700 | -0.02em | 1.2 | Page titles |
| H2 | 24px | 600 | -0.02em | 1.25 | Section headings |
| H3 | 20px | 600 | -0.02em | 1.3 | Card titles |
| Body | 14–16px | 400 | 0 | 1.5–1.6 | Paragraphs, form labels |
| Small | 12–13px | 400–500 | 0 | 1.4 | Captions, badges, hints |

**Rules:**
- Headings: bold, tight letter-spacing (`tracking-tight` / `-0.02em`)
- Body: 14–16px with comfortable line-height
- Never use pure white (`#FFFFFF`) — use `--text-primary` (`#F8FAFC`)

---

## Layout & Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Desktop (default) | 1440px | Primary design target; sidebar expanded |
| Tablet | 768–1023px | Sidebar collapsible; content stacks where needed |
| Mobile | < 768px | Sidebar hidden behind drawer; single-column layout |

**Page structure:**
- Left sidebar (fixed, collapsible on mobile)
- Main content area with optional top bar
- Max content width: 1440px, centered with horizontal padding (`px-6` desktop, `px-4` mobile)

---

## Components

### Buttons

#### Primary
- Background: `--gradient-cta` (violet → cyan, left to right)
- Text: `#F8FAFC`, semibold
- Border-radius: `rounded-xl`
- Shadow: `--glow-ai`
- Hover: increase glow intensity, slight brightness lift
- Active: scale `0.98`

#### Secondary (Ghost)
- Background: transparent
- Border: 1px solid `#8B5CF6`
- Text: `#F8FAFC`
- Hover: `rgba(139, 92, 246, 0.1)` fill

#### AI Action (Pill Chip)
- Shape: fully rounded pill (`rounded-full`)
- Background: `rgba(21, 27, 43, 0.8)` with violet border
- Icon: sparkle/wand (Lucide `Sparkles` or `Wand2`), 16px
- Glow: subtle `--glow-ai` on hover
- Label: 13–14px, medium weight

#### Destructive
- Background: transparent or `#F87171` at 10% opacity
- Border/text: `#F87171`

### Cards

- Border-radius: `rounded-2xl`
- Background: `rgba(21, 27, 43, 0.8)` with `backdrop-blur-md`
- Border: 1px solid `#2A3448`
- Shadow: `0 4px 24px rgba(0, 0, 0, 0.25)`
- Padding: `p-6` (desktop), `p-4` (mobile)

### Inputs

- Background: `#1E293B`
- Border: 1px solid `#2A3448`
- Border-radius: `rounded-lg`
- Text: `#F8FAFC`; placeholder: `#64748B`
- Focus: 2px ring `#22D3EE`, border-color `#22D3EE`
- Height: 40–44px for single-line inputs

### Tabs (Segmented Control)

- Container: pill-shaped track, `#1E293B` background, `rounded-full`, `p-1`
- Active tab: `#151B2B` glass surface or gradient underline variant
- Inactive tab: `#94A3B8` text
- Active tab text: `#F8FAFC`

### Badges & Chips

- Shape: `rounded-full`, small (`px-2.5 py-0.5`)
- Font: 12px, medium
- Variants:
  - **Default:** `#2A3448` bg, `#94A3B8` text
  - **Primary:** `rgba(139, 92, 246, 0.15)` bg, `#8B5CF6` text
  - **Success:** `rgba(52, 211, 153, 0.15)` bg, `#34D399` text
  - **Template name:** cyan tint `rgba(34, 211, 238, 0.15)` bg, `#22D3EE` text

### Icons

- Library: Lucide (line style)
- Stroke width: 1.5px (`strokeWidth={1.5}`)
- Default size: 20px; inline with text: 16px; nav: 20px

---

## Navigation

### Left Sidebar

| Element | Spec |
|---------|------|
| Width | 256px expanded, 64px collapsed |
| Background | `#151B2B` @ 80% + blur, right border `#2A3448` |
| Logo | "ResumeAI" wordmark + small sparkle mark |
| Nav items | Dashboard, Upload CV, New Job, My CVs |
| Active item | Violet left border or glow, `#F8FAFC` text |
| Inactive item | `#94A3B8` text, hover `#F8FAFC` |

**Mobile:** Sidebar becomes off-canvas drawer; hamburger in top bar.

### Top Bar (Content Pages)

- Height: 56–64px
- Left: breadcrumb trail (`#94A3B8` separators, last item `#F8FAFC`)
- Right (optional): AI status indicator — e.g. green dot + "Gemini ready" in `#94A3B8`

---

## Brand Motifs

Use sparingly — decorative only, never interfere with readability.

1. **Neural-network dot pattern** — very low opacity (~3–5%) overlay on page backgrounds
2. **Gradient orbs** — soft violet/cyan blurs in corners (`blur-3xl`, opacity 10–20%)
3. **Sparkle icon** — required on all AI-powered actions (tailor, rewrite, suggest, parse)

---

## Motion & Interaction

| Interaction | Animation |
|-------------|-----------|
| Button hover | Glow intensifies over 200ms ease |
| AI button hover | Optional shimmer sweep (1.5s loop on idle AI CTAs) |
| Card hover | Subtle border brighten to `#3B4A63`, 150ms |
| Sidebar collapse | Width transition 250ms ease-in-out |
| Page enter | Fade + 8px upward slide, 300ms |
| Focus ring | Instant cyan ring, no delay |

Prefer `transition-colors`, `transition-shadow`, and `transition-transform`. Avoid bouncy or playful easing — use `ease-out` or `cubic-bezier(0.4, 0, 0.2, 1)`.

---

## Design System Reference Screen

Build a single route (e.g. `/design-system`) as the master theme reference. Include:

### Section 1 — Color Swatches
Grid of all palette tokens with hex labels: background, surface, primary, secondary, gradient CTA preview, success/warning/error, text primary/secondary/muted.

### Section 2 — Typography Scale
Live samples of Display, H1–H3, Body, Small with size/weight annotations.

### Section 3 — Buttons
Row of: Primary (gradient + glow), Secondary (ghost violet), AI Action chip (sparkle icon), Destructive, Disabled states.

### Section 4 — Form Inputs
Text input (default + focused), textarea, select, checkbox, with focus ring demo.

### Section 5 — Cards
Glass card with title, body text, and nested AI action chip.

### Section 6 — Tabs
Pill segmented control with 3–4 tabs, one active.

### Section 7 — Badges
All badge variants: default, primary, success, template name.

### Section 8 — Navigation Preview
Mini sidebar mock (logo + 4 nav items, one active) + top bar with breadcrumb and "Gemini ready" indicator.

### Background Treatment
Page uses `#0B0F19` base with subtle gradient orbs and optional dot pattern at ≤5% opacity.

---

## shadcn/ui Integration

When adding shadcn components, override theme tokens in `globals.css` to match this system. Install via:

```bash
bun dlx shadcn@latest add button
```

Map shadcn semantic tokens to ResumeAI tokens (see CSS variables above). Customize component variants:

- `Button` → add `gradient` and `ai-action` variants
- `Badge` → match pill styles above
- `Card` → glass surface + `rounded-2xl`
- `Input` → dark fill + cyan focus ring

---

## Do's and Don'ts

| Do | Don't |
|----|-------|
| Use exact hex values from this doc | Invent new accent colors |
| Add sparkle icon to AI actions | Use generic buttons for AI features |
| Keep glass surfaces at 80% opacity | Use flat opaque gray cards |
| Use gradient CTA for primary actions | Use solid blue or green CTAs |
| Maintain dark theme throughout | Introduce light-mode surfaces in MVP |
| Use Lucide icons at 1.5px stroke | Mix icon libraries or filled icons |

---

## File References

| File | Purpose |
|------|---------|
| `docs/design-system.md` | This document — source of truth |
| `src/styles/globals.css` | CSS custom properties |
| `src/routes/design-system.tsx` | Visual reference screen |
| `.cursor/rules/design-system.mdc` | AI agent enforcement rules |
