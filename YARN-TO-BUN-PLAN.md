# Yarn → Bun Migration Plan

## Why

- Faster `bun install` (10-20x faster than yarn)
- Built-in test runner (`bun test`) — can replace Jest/Vitest later
- Simpler toolchain
- Nx works fine with bun

## What Stays

- **Nx** — stays as the task orchestrator (`nx affected`, `nx run-many`, etc.)
- **Vite** — stays as the build tool
- **All dependencies** — stay the same, just installed by bun instead of yarn

## What Changes

| Before | After |
|---|---|
| `.yarnrc.yml` | Delete |
| `.yarn/` directory | Delete (contains yarn releases, plugins, patches) |
| `yarn.lock` | Delete (replaced by `bun.lock`) |
| `package.json` `packageManager` | Remove |
| `package.json` `resolutions` | Remove (bun uses `patches` instead) |
| `.gitignore` | Add `bun.lock` tracking, remove yarn entries |
| `yarn install` / `yarn add` | `bun install` / `bun add` |

## The Mantine Patches (Critical)

The project has two yarn patches on `@mantine/core@9.2.1` and `@mantine/hooks@9.2.1` (fixing React 19 strict mode ref callback issues in `SegmentedControl` and `useMergedRef`).

**Option A — Use bun's built-in patching:**
```json
{
  "patches": {
    "@mantine/core@9.2.1": ".yarn/patches/@mantine-core-9.2.1.patch",
    "@mantine/hooks@9.2.1": ".yarn/patches/@mantine-hooks-9.2.1.patch"
  }
}
```
Move patch files from `.yarn/patches/` to `patches/` and reference them in bun format.

**Option B — Use `patch-package`:**
```bash
bun add -D patch-package postinstall-postinstall
```
Add `"postinstall": "patch-package"` script, keep patches in `patches/` directory.

## Steps

1. Install bun: `curl -fsSL https://bun.sh/install | bash`
2. Delete `.yarnrc.yml`
3. Delete `.yarn/` directory
4. Delete `yarn.lock`
5. Delete `package.json` `packageManager` field
6. Delete `package.json` `resolutions` field
7. Add bun `patches` field (or switch to `patch-package`)
8. Move `.yarn/patches/*.patch` → `patches/*.patch` (if using bun patches)
9. Update `.gitignore` (add bun output, remove yarn entries)
10. Run `bun install`
11. Run `npx nx build zzz-frontend` to verify

## Verification

```bash
npx nx build zzz-frontend        # Build succeeds
npx nx typecheck zzz-frontend    # Types pass
npx nx run-many -t test          # Tests pass (or affected subset)
```
