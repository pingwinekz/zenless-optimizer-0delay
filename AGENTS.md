# Zenless Zone Zero Optimizer - Developer Guide

## Quick Commands

```bash
# Dev server
yarn run nx serve zzz-frontend

# Run all tests
yarn run nx run-many -t test

# Run tests for specific project
yarn run nx test {project-name}

# Lint
yarn run nx run-many --target=eslint:lint --max-warnings=0

# Typecheck
yarn run nx run-many -t typecheck

# Format check (uses Biome, not Prettier)
yarn biome ci

# Format fix
biome format --write --changed

# Generate data files (requires submodules)
yarn run nx run-many -t gen-file

# Mini CI (format -> typecheck -> lint -> test)
yarn run mini-ci
```

## Architecture

- **App**: `zzz-frontend` in `/apps`
- **Libs**: `zzz`, `common`, `pando`, `game-opt` in `/libs`
  - `zzz/formula` - ZZZ implementation of Pando calculation engine
  - `pando/engine` - calculation engine shared across games
  - `game-opt` - game-agnostic UI components, solver, formula helpers
  - `common` - shared utilities, UI components, database

## Key Conventions

- Uses **yarn** (v3.4.1), not npm
- Uses **Biome** for formatting, not Prettier or ESLint
- Uses **Vitest** for unit tests
- Uses **Nx** for monorepo orchestration
- Git submodules for datamine data (`libs/zzz/dm/`)

## Data Generation

Before running `gen-file`, ensure submodules are initialized:
```bash
git submodule update --init
# or use: yarn reload-dm
```

## CI Order

CI runs in this order: `lint -> test -> format -> typecheck -> gen-file`

Use `yarn run mini-ci` to run the critical path locally.