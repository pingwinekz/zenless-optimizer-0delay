# Zenless Optimizer

[Zenless Optimizer](https://pingwinekz.github.io/zenless-optimizer-0delay/) is a helper website for the online action-rpg gacha game [Zenless Zone Zero](https://zenless.hoyoverse.com/). It provides disc optimization and character building tools.

Built with React, TypeScript, Nx, Mantine UI, and Vite.

## Structure

- `app/` — frontend application
- `packages/` — shared libraries (common/, game-opt/, pando/)
- `app/src/<module>/` — ZZZ-specific source code (db, formula, solver, pages, dm, stats, etc.)
- Data from git submodules under `app/src/dm/` (ZenlessData, HakushinData)

## Development

```bash
bun install                    # Install dependencies
bun nx serve zzz-frontend      # Dev server on :4200
bun nx build zzz-frontend      # Build for production
bun run mini-ci                # Pre-push verification
```
