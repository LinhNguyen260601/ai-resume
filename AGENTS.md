# ResumeAI — Agent Instructions

## Always-apply rules (required, every task)

These mirror Cursor's `alwaysApply: true` rules — read before any plan/code/answer, regardless of task type (no matching needed, unlike skills below):

- [`.cursor/rules/conventional-commits.mdc`](.cursor/rules/conventional-commits.mdc) — commit message format when drafting or writing commits
- [`.cursor/rules/modular-react.mdc`](.cursor/rules/modular-react.mdc) — view/domain/data layering for all React code
- [`.cursor/rules/design-system.mdc`](.cursor/rules/design-system.mdc) — ResumeAI UI system for all UI work

**Conditional** (read when touching `src/**/*.{ts,tsx}`): [`.cursor/rules/you-might-not-need-an-effect.mdc`](.cursor/rules/you-might-not-need-an-effect.mdc) — prefer calculate-during-render/event-handlers over `useEffect`.

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
| `supabase` | Supabase (auth, DB, RLS, migrations, CLI, MCP, Edge Functions, Storage) |
| `supabase-postgres-best-practices` | Postgres queries, schema design, indexes, performance tuning |

Manage skills: `npx skills add`, `npx skills check`, `npx skills update`. See `skills-lock.json`.

## Claude Code notes

`CLAUDE.md` is a symlink to this file — Claude Code auto-loads it and reads the same routing table and stack defaults as every other agent here. A few things specific to Claude Code:

- **Skills are natively discoverable.** `.claude/skills/<name>` symlinks to each `.agents/skills/<name>` directory, so they show up in Claude Code's Skill tool listing and can be invoked directly instead of manually `Read`-ing `SKILL.md` files. `npx skills update` keeps both in sync since it's the same file on disk.
- **The `superpowers` plugin is active** for planning, systematic debugging, and TDD workflows (`.superpowers/sdd/` holds artifacts from prior sessions). Its process skills (brainstorming, systematic-debugging, writing-plans, etc.) take priority over the stack/UI/quality skills below — see Priority order in `.cursor/rules/agent-skills.mdc`.

## Stack defaults

- **UI:** shadcn + ResumeAI design system (`.cursor/rules/design-system.mdc`)
- **App:** TanStack Start / Router / Query — use the matching TanStack skills above
- **Backend:** Supabase Postgres + Drizzle (`src/db/`) — use `supabase` and `supabase-postgres-best-practices` for DB/auth work
- **Package runner:** prefer `bun` when present in the project
