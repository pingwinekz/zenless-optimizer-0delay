# Gacha Optimizer — AGENTS.md

## Repo overview

Nx v20.5 monorepo (yarn 3.4.1, `nodeLinker: node-modules`). Three optimizer websites (Genshin, Zenless, Star Rail) share code under `libs/`. Currently only `apps/zzz-frontend` (the Zenless Optimizer) is actively built/deployed.

## Key commands

```sh
# Dev server (localhost:4200)
yarn nx serve zzz-frontend

# Full local validation (run before pushing)
yarn run mini-ci
# Equivalent to:
#   biome format --write
#   nx affected -t typecheck
#   nx affected -t eslint:lint --max-warnings=0
#   CI=true nx affected -t test

# Run all tests
yarn test                           # nx run-many -t test

# Single-package test (example)
npx nx test zzz-formula

# Lint all (no auto-fix, zero warnings enforced)
npx nx run-many --target=eslint:lint --fix=false --max-warnings=0

# Typecheck all
npx nx run-many --target=typecheck

# Format check (CI, no write)
yarn biome ci

# Auto-format
yarn biome format --write

# Full build
yarn nx build zzz-frontend          # production build

# Data generation pipeline
yarn gen-file                       # nx run-many -t gen-file
# Requires submodules (see below)
```

## CI pipeline order (`.github/workflows/ci.yml`)

1. `eslint:lint` (all, no auto-fix, zero warnings)
2. `typecheck` (all)
3. `test` (all)
4. `nx build zzz-frontend`
5. `gen-file` then assert `git status --porcelain` is clean
6. `biome ci` (format check)

## Deployment

- Static site on GitHub Pages.
- Deploy includes `NX_SHOW_DEV_COMPONENTS=true` env var:
  ```
  NX_SHOW_DEV_COMPONENTS=true npx nx build zzz-frontend
  ```
- Build output dir: `dist/apps/zzz-frontend`

## Data pipeline

Game data comes from external datamines via git submodules:

```sh
yarn reload-dm                     # git submodule update --init
yarn update-dm                     # git submodule update --remote
```

Submodules at `libs/*/dm/*`. The `load-dm` Nx target syncs them, then `gen-file` runs custom executors/generators across `zzz-dm`, `zzz-stats`, `zzz-formula`, `zzz-formula-ui`, `zzz-assets`, `zzz-assets-data`, `zzz-dm-localization`, `zzz-localization`. Generated `*_gen.json` artifacts are tracked in git.

## Code conventions

| Tool | Notes |
|------|-------|
| **Formatter** | Biome (not Prettier). Settings: indent 2 spaces, single quotes, semicolons `asNeeded`, trailing commas `es5`, lineWidth 80. VCS git mode with `useIgnoreFile`. |
| **Linter** | ESLint via `@nx/eslint/plugin`. `no-unused-vars` = warn (ignore `_` prefix). `no-unused-imports` = error. `no-explicit-any` off. `no-non-null-assertion` off. `consistent-type-imports`/`consistent-type-exports` = warn. |
| **TypeScript** | Strict mode. Path aliases `@genshin-optimizer/*` → `libs/*/src/index.ts`. Target `es2015`, module `esnext`. |
| **Testing** | Mix of Jest (default via `@nx/jest:jest`) and Vitest (for some libs like `pando-engine`, `game-opt-solver`). Vitest configs are `vitest.config.ts` files. |

## Architecture notes

- **Only active app**: `apps/zzz-frontend` (React + MUI + Emotion). The GI and SR frontends have been removed.
- **Library organization**: `libs/common/*` (shared), `libs/pando/engine` (calc engine), `libs/game-opt/*` (game-agnostic solver/formula), `libs/zzz/*` (Zenless-specific implementations).
- All packages use `@genshin-optimizer/<scope>/<name>` import paths.

## PR checklist (from `.github/pull_request_template.md`)

Before requesting review:
- [ ] Comment hard-to-understand code
- [ ] Update English translations for front-end changes
- [ ] Run `yarn run mini-ci`
- [ ] Update deployment scripts if adding new lib/app
