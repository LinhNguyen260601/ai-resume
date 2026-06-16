# ResumeAI — Agent Instructions

## Skills (required)

This project uses agent skills in **`.agents/skills/`**. You must apply them automatically — the user should not have to `@`-mention skills on every prompt.

**Workflow for every request:**

1. Infer the task type from the user's message and open files.
2. Match against skill descriptions in `.agents/skills/*/SKILL.md` frontmatter.
3. **Read** every matching skill file before planning, coding, or answering.
4. Execute using those skill workflows. Project UI also follows `docs/design-system.md`.

If unsure whether a skill applies, read it anyway — false positives are cheaper than skipping relevant guidance.

## Installed skills

| Skill | Use when |
|-------|----------|
| `shadcn` | shadcn/ui components, registries, `components.json` |
| `design-taste-frontend` | Landing pages, portfolios, marketing UI, redesigns |
| `image-to-code` | Visual reference → implementation, hero/section fidelity |
| `stitch-design-taste` | Google Stitch `DESIGN.md` generation |
| `tanstack-start-best-practices` | Full-stack TanStack Start (server fns, SSR, auth) |
| `tanstack-router-best-practices` | Routing, loaders, search params, navigation |
| `tanstack-query-best-practices` | Data fetching, cache, mutations |
| `tanstack-integration-best-practices` | Router + Query + Start integration |
| `playwright-cli` | Browser automation and Playwright testing |
| `full-output-enforcement` | Complete files/artifacts, no placeholders |
| `web-quality-audit` | Full Lighthouse-style audit (performance, a11y, SEO, best practices) |
| `performance` | Speed, load time, bundle size, runtime efficiency |
| `core-web-vitals` | LCP, INP, CLS, layout shifts, page experience |
| `accessibility` | WCAG 2.2, a11y audit, keyboard/screen reader support |
| `seo` | Meta tags, structured data, sitemap, search visibility |
| `best-practices` | Security, compatibility, code quality, vulnerability checks |

Manage skills: `npx skills add`, `npx skills check`, `npx skills update`. See `skills-lock.json`.

## Stack defaults

- **UI:** shadcn + ResumeAI design system (`.cursor/rules/design-system.mdc`)
- **App:** TanStack Start / Router / Query — use the matching TanStack skills above
- **Package runner:** prefer `bun` when present in the project
