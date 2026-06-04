# Project: Gacha Optimizer (genshin-optimizer)

Monorepo for gacha-game optimizer websites (Genshin Impact, Zenless Zone Zero). Built with React, TypeScript, Nx, Mantine UI, and Vite.

## Structure

- `apps/zzz-frontend/` — only active frontend app (Zenless Zone Zero optimizer)
- `libs/zzz/` — ZZZ-specific libraries (27 packages: db, formula, solver, pages, dm, stats, etc.)
- `libs/game-opt/` — shared game-optimizer logic (engine, formula, solver, sheet-ui)
- `libs/pando/` — Pando calculation engine (shared across games)
- `libs/common/` — shared utilities (database, UI, pipeline, localization, plugin, etc.)
- `tools/` — build scripts and publish tooling

Data comes from git submodules under `libs/*/dm/` (GenshinData, StarRailData, ZenlessData, HakushinData). See `.gitmodules`.

Path aliases: `@genshin-optimizer/<scope>/<name>` → `libs/<scope>/<name>/src/index.ts` (defined in `tsconfig.base.json`).

## Commands

Package manager: **bun**. Use `bun`, not `npm` or `yarn`.

### Local CI (pre-push verification)

```
bun run mini-ci
```

Runs: biome format → typecheck → eslint → test (in that order, all via `nx affected`).

### Individual commands

```bash
bun nx serve zzz-frontend               # Dev server
bun nx build zzz-frontend               # Build frontend
bun nx graph                            # Dependency graph
npx nx run-many --target=typecheck      # Typecheck all
npx nx run-many --target=eslint:lint --max-warnings=0  # Lint all
npx nx run-many --target=test           # Test all
npx nx run-many -t gen-file             # Regenerate generated files
bun biome ci                            # Biome format check
bun biome format --write                # Auto-format
```

### Single package

```bash
npx nx test <project-name>              # e.g. npx nx test zzz-stats
npx nx typecheck <project-name>
npx nx eslint:lint <project-name>
```

### Data submodules

```bash
bun run reload-dm   # git submodule update --init
bun run update-dm   # git submodule update --remote
```

## CI Pipeline (`.github/workflows/ci.yml`)

Runs on push/PR to master: install → lint → typecheck → test → build zzz-frontend → gen-file check → biome format check. Order matters; lint runs first.

## Code Style

- **Formatter**: Biome (single quotes, trailing commas es5, 2-space indent, LF, 80 char line width)
- **Linter**: ESLint with `@nx/typescript` rules, unused-imports plugin, module boundary enforcement
- **TypeScript**: strict mode with `exactOptionalPropertyTypes`, `noImplicitReturns`, `noPropertyAccessFromIndexSignature`
- **Testing**: Jest for most libs; Vitest for `pando_engine`. Run `npx nx test <project>` for a single package.
- **UI framework**: Mantine v9 (migrated from MUI — see `mui-to-mantine-migration-plan.md` in root)
- **State**: Zustand
- **i18n**: i18next with browser language detection

## Custom Agents

The following custom subagents are available (invoke with `@agent-name`):

- **@backend-developer**: MUST use for all server-side logic, API design, database schemas, auth, and backend systems
- **@frontend-developer**: MUST delegate to for all UI/UX work: components, styling, accessibility, browser APIs
- **@fullstack-developer**: USE for end-to-end features spanning both frontend and backend systems together
- **@websocket-engineer**: MUST use for WebSockets, SSE, real-time communication, and event-driven architectures
- **@typescript-pro**: MUST use for strict typing, generics, utility types, type definitions, and TS config
- **@javascript-pro**: MUST use for JS/ES2024+ patterns, async, module systems, and runtime optimization
- **@react-specialist**: MUST use for React 18+ hooks, server components, Suspense, and state management
- **@vue-expert**: MUST delegate to for Vue 3 Composition API, Pinia, Vue Router, Nuxt, and Vue ecosystem
- **@angular-architect**: MUST use for all Angular 15+ work: signals, standalone components, RxJS, NgRx
- **@nextjs-developer**: MUST delegate to for Next.js App Router, Server Actions, RSC, SSR, and deployment
- **@devops-engineer**: MUST delegate to for CI/CD, Docker, deployment, infrastructure, and environment config
- **@code-reviewer**: USE PROACTIVELY for code review, security audit, performance analysis, best-practice checks
- **@build-engineer**: MUST use for webpack, vite, esbuild, gradle, maven build configs and pipeline optimization
- **@dependency-manager**: USE for auditing, updating, managing dependencies — security, compatibility, bundle size
- **@docs-writer**: MUST use for generating and maintaining all project documentation — README, API docs, guides
- **@git-workflow-manager**: USE for git branching, commit hygiene, rebasing, merging, and workflow automation
- **@test-writer**: MUST delegate to for writing, running, debugging tests — unit, integration, e2e
- **@technical-writer**: USE for technical documentation, API guides, tutorials, and developer onboarding content

## Subagent Routing Rules

Follow these rules when deciding which subagent to delegate work to:

- Do NOT attempt to do specialized work yourself — ALWAYS delegate to the appropriate subagent
- For server-side/backend work, ALWAYS delegate to `@backend-developer`
- For UI/frontend work in React, Vue, Angular, ALWAYS delegate to the respective framework subagent
- For code review or quality analysis, ALWAYS use `@code-reviewer`
- For testing tasks, ALWAYS delegate to `@test-writer`
- For documentation, ALWAYS use `@docs-writer` or `@technical-writer`
- For build tooling or bundler config, ALWAYS use `@build-engineer`
- For git operations or branch management, ALWAYS use `@git-workflow-manager`
- For dependency management or audits, ALWAYS use `@dependency-manager`
- For devops/CI/CD or deployment, ALWAYS use `@devops-engineer`
- For real-time communication features, ALWAYS use `@websocket-engineer`
- When a task spans both frontend and backend, delegate to `@fullstack-developer`
- For any type-system or TypeScript concerns, delegate to `@typescript-pro`
- For pure JavaScript or runtime optimization, delegate to `@javascript-pro`
- Use `@explore` ONLY for quick read-only file lookups and codebase exploration
- Use `@general` for tasks that do not clearly match any specialized subagent

## Available Skills

The following skills are installed and will be loaded on demand:

- **git-release**: Release notes and version bumps
- **test-patterns**: Test generation following project conventions
- **dependency-audit**: Audit dependencies for vulnerabilities and license issues
- **changelog-generate**: Changelog generation from commit history
- **ci-pipeline**: CI pipeline configuration and optimization

## Conventions

- Use conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- Write meaningful commit messages that explain the "why"
- Keep PRs focused on a single concern

## Gotchas

- `gen-file` targets depend on `load-dm` (submodule data). Run `bun run reload-dm` before generating if submodules are empty.
- `zzz-frontend` build depends on `common-localization` and `zzz-localization` (implicit deps in `project.json`).
- The `mini-ci` command uses `nx affected` — it only checks packages changed since master. For full checks, use `nx run-many`.
- Biome formatting is checked separately from ESLint linting in CI. Both must pass.
- `.nxignore` controls which files Nx watches; `dist/` and coverage dirs are excluded.

