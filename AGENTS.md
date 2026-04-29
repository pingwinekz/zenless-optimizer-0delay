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

## Adding New Characters, Wengines, or Discs

### 1. Update dm (data source)
- **File**: `libs/zzz/dm/src/dm/character/consts.ts`
- Add new character ID mappings (e.g., `'1541': 'Promeia'`)
- Run `yarn nx run zzz-dm:get-hakushin` to fetch new data from hakushin

### 2. Update consts (type definitions)
- **File**: `libs/zzz/consts/src/character.ts`
- Add new character keys to `allCharacterKeys`
- **File**: `libs/zzz/consts/src/wengine.ts`
- Add new wengine keys to `allWengineKeys`

### 3. Generate stats data
- Run `yarn nx run zzz-stats:gen-file`

### 4. Generate character/wengine maps
- Run `yarn nx generate @genshin-optimizer/zzz/stats:gen-all-maps`
- This creates TypeScript mapping files in `libs/zzz/stats/src/mappedStats/`

### 5. Add asset images
- **Characters**: Create folder `libs/zzz/assets/src/gen/chars/[Name]/`
  - Download images: icon, circle, select, full, trap (use interknot as fallback)
  - Create `index.ts` with imports
- **Wengines**: Create folder `libs/zzz/assets/src/gen/wengines/[Name]/`
  - Download icon and big images
  - Create `index.ts` with imports
- Run `yarn nx run zzz-assets:gen-file`

### 6. Final generation
- Run `yarn run nx run-many -t gen-file` to regenerate all data

## CI Order

CI runs in this order: `lint -> test -> format -> typecheck -> gen-file`

Use `yarn run mini-ci` to run the critical path locally.