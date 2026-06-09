# Plan — Pando engine on GPU (WebGPU + WGSL)

Author: opencode
Status: draft, awaiting approval

## 1. Goal

Port the inner loop of the Pando + game-opt optimizer to GPU using WebGPU and WGSL, so the per-build evaluation runs in massively-parallel fashion on the device's GPU instead of per-core on the CPU. JS path stays authoritative; GPU is opt-in.

## 2. Background — how it works today

Three layers, all on CPU:

1. **`@genshin-optimizer/pando/engine`** (`libs/pando/engine/`)
   - Symbolic expression tree (15 ops: `const`, `sum`, `prod`, `min`, `max`, `sumfrac`, `subscript`, `lookup`, `thres`, `match`, `tag`, `dtag`, `vtag`, `read`, `custom`).
   - `Calculator._compute` (`libs/pando/engine/src/node/calc.ts:60`) is a recursive interpreter with `Int32Array`-backed tag trie (`tag/keys.ts`, `tag/dedup.ts`, `tag/subset.ts`).
   - For optimization, the tag system is **detached** by `detach()` (`libs/pando/engine/src/node/transform.ts:33`) and the resulting tag-free AST is **JIT'd to a JS source string** by `executionStr()` (`libs/pando/engine/src/node/transform.ts:350`) + `new Function(...)` (`libs/pando/engine/src/node/transform.ts:251`).
   - This is the hot loop: a generated function `(_: Record<string, number>[]) => number[]` evaluated against every candidate build.

2. **`@genshin-optimizer/game-opt/solver`** (`libs/game-opt/solver/`)
   - `Solver` (`libs/game-opt/solver/src/solver.ts:22`) fans out subworks to N Web Workers.
   - `Worker` (`libs/game-opt/solver/src/worker.ts:23`) runs the inner loop via `compile(nodes, minimum, topN, 'q', candidates.length)` (`libs/game-opt/solver/src/worker.ts:85`) — a `new Function`-based evaluator.
   - `splitSubwork` (`libs/game-opt/solver/src/split.ts:7`) recursively prunes/splits when the cartesian product exceeds `splitThreshold = 2_000_000` (`libs/game-opt/solver/src/common.ts:3`).
   - `setOptThreshold` is broadcast to workers during the run; each worker keeps its own top-N and asks the master to bump the threshold when it finds better builds.

3. **App bindings** (`libs/zzz/solver/src/index.ts:36`)
   - ZZZ packs 7 slots (1 wengine + 6 discs) into `Candidate<string>[][7]` and feeds them in.
   - The objective + stat-filter constraints are detached into Pando nodes; everything else runs unchanged.

## 3. Where the win lives

The hot loop is "evaluate the same ~tens-of-nodes AST against millions of independent candidate builds." That is **embarrassingly parallel and SIMD-friendly** — exactly the shape GPUs want. Realistic target: 10–100x for the inner loop on a consumer GPU, dominated by memory bandwidth.

## 4. Decisions (locked)

- **Target:** WebGPU + WGSL, browser-only.
- **Strategy:** new opt-in GPU solver; CPU path stays authoritative.
- **Top-N:** threshold streaming (GPU evaluates all, JS post-filters and re-feeds a tighter threshold).
- **Custom ops:** `addCustomOperation` gains an optional `wgsl` field.

## 5. Final shape

- New `Backend` interface in pando engine with two impls: existing JS path and a new GPU path.
- IR walker is shared; codegen moves under `backend/js/` and `backend/wgsl/`.
- New `libs/game-opt/solver-gpu/` mirrors the JS solver but uses the WGSL backend.
- UI in `apps/zzz-frontend/` gains a backend selector; auto-detect via `navigator.gpu`.

## 6. Backend interface

`libs/pando/engine/src/backend/types.ts`:

```ts
export interface Backend {
  readonly kind: 'js' | 'wgsl'
  /** Compile detached/tag-free nodes into a callable evaluator */
  compile(
    nodes: AnyTagFree[],
    dynTagCat: string,
    candidates: PackedCandidates
  ): CompiledEvaluator
}
export interface CompiledEvaluator {
  /** One build's worth of input. CPU: Record; GPU: dispatched internally */
  evaluate(input: unknown): number | string | (number | string)[]
  /** Tear down any GPU resources */
  dispose(): void
}
export interface PackedCandidates {
  /** Column id (integer) -> typed array (CPU) or storage buffer view (GPU) */
  columns: Record<number, Float32Array | Uint32Array>
  /** String -> stable integer id (for dynTag strings) */
  qIds: Record<string, number>
  /** Number of slots (e.g. 7 for zzz) */
  slotCount: number
  /** Per-slot candidate counts */
  slotSizes: number[]
}
```

## 7. Move existing codegen under the JS backend

- `libs/pando/engine/src/node/transform.ts:223` (`compile`) → `libs/pando/engine/src/backend/js/compile.ts`.
- `compileDiff` and `executionStr` (`transform.ts:350`) likewise.
- Behavior unchanged, just relocated. The IR walker stays shared so both backends lower the same AST.

## 8. WGSL backend (`libs/pando/engine/src/backend/wgsl/`)

- `compile.ts` — entry point. Walks the IR once, emits one WGSL compute shader.
- `lower/` — one file per op family:
  - `arithmetic.ts` — `sum`/`prod`/`min`/`max`/`sumfrac` → reductions + `fma`.
  - `branching.ts` — `thres`/`match` → `select`.
  - `read.ts` — `read` becomes a load from a per-`q` column of the candidates buffer.
  - `subscript.ts` / `lookup.ts` — table access; tables live in a small read-only storage buffer populated from `ex`.
  - `custom.ts` — calls into a `CustomFn` map populated at `addCustomOperation` time (see §9).
- `dispatch.ts` — acquire device, upload buffers, dispatch in chunks, download results.
- `pack.ts` — flatten `candidates` into columnar typed arrays (see §10).

Each candidate column is its own `array<f32>` storage buffer, one per `q` id. Builds are dispatched as a 1D grid; each invocation picks `id = global_id.x`, reads one row per slot, evaluates the AST in registers, writes `(value, ids…)` to an output buffer if it passes constraints.

`@workgroup_size(64)` to start. `ids` are encoded as `vec4<u32>` packed in the input (slot ≤ 4 fits one vec4; zzz has 7 slots → two vec4s or a tiny `array<u32, 7>`).

## 9. Custom ops (`libs/pando/engine/src/util/custom.ts`)

Extend `CustomInfo` (`util/custom.ts:10`) with:

```ts
wgsl?: {
  /** WGSL function body, no surrounding `fn`. Args named x0..xN (f32). */
  body: string
  /** Whether the op returns a string (disables GPU unless string interning is provided) */
  returnsString?: boolean
}
```

WGSL lowering calls `<name>_fn(x0, x1, …)`; the body is pasted into the generated shader. If a node uses a `custom` op without a `wgsl` field, the GPU backend refuses the compile and the caller falls back to JS.

Inventory needed before implementation: `grep -rn "addCustomOperation" libs/`. Game-specific custom ops (zzz damage formulas, etc.) must be updated in lockstep.

## 10. Candidate packer (`libs/pando/engine/src/backend/wgsl/pack.ts`)

- Take the existing `candidates: Candidate[][]`.
- Collect all string keys → assign dense integer ids (column ids).
- For each `q`, build a single `Float32Array` of length `totalSlots * maxCandidates`; unused slots padded with a sentinel (NaN — WGSL propagates; simple).
- String candidates go through a separate `Uint32Array` → string lookup on the JS side post-eval. The hot loop doesn't return strings, so this is a small concern.

## 11. New opt-in GPU solver (`libs/game-opt/solver-gpu/`)

Mirrors `libs/game-opt/solver/` but uses the WGSL backend.

- `gpuSolver.ts` — same `SolverConfig` interface as `solver.ts:9`.
- `gpuWorker.ts` — owns a `GPUDevice`, runs `backend.compile(...)` once per subwork, dispatches, streams results back.
- Reuse `workerHandle.ts` message protocol verbatim so UI code doesn't change.
- **Threshold streaming:**
  1. Dispatch evaluates every build, writes `(value, ids…)` for those that pass constraints into an output buffer.
  2. Main thread downloads, sorts desc, takes top-N, computes new threshold.
  3. Main thread re-dispatches with the tighter threshold; repeat.
  4. Stop when threshold doesn't move or `progress.remaining == 0`.
- **`splitThreshold` semantics change:** a single big GPU dispatch beats many small ones. Default to "don't split on GPU" and use a chunk cap of `min(totalBuilds, 2^20)` per dispatch.

## 12. Hookup

- `libs/zzz/solver/src/index.ts:36` (`createSolverConfig`) — accept an optional `backend: 'js' | 'wgsl'` (default `'js'`). Thread it to whichever solver you instantiate.
- `apps/zzz-frontend/` — UI toggle or auto-detect (`await navigator.gpu?.requestAdapter()`) to pick the backend at solver-start time.

## 13. Tests

- `libs/pando/engine/src/backend/wgsl/compile.spec.ts` — cross-validate every `transform.spec.ts` test against the WGSL backend using buffer readback. Gated behind `globalThis.GPUDevice` detection; skipped in headless CI.
- `libs/game-opt/solver-gpu/gpuWorker.spec.ts` — small known-input problem; compare top-N output to JS solver output within FP tolerance (`1e-5`).
- `libs/game-opt/solver-gpu/benchmark.spec.ts` — large problem; assert GPU is at least 5x faster than JS (perf gate; not blocking on low-end devices).

## 14. Phased rollout

1. **Skeleton** — add `Backend` interface, move existing codegen under `backend/js/`, all tests still pass.
2. **WGSL lowering** — implement `compile` for the pure-arithmetic subset (`const`/`sum`/`prod`/`min`/`max`/`sumfrac`/`thres`/`match`/`subscript`/`read`). Add WGSL body for any engine-internal custom ops (none currently — easy).
3. **GPU solver prototype** — WGSL backend + `gpuWorker` + threshold streaming, no UI hookup yet. Cross-test against JS solver.
4. **Custom op shim** — add `wgsl` field; document; update zzz custom ops.
5. **UI hookup** — backend selector in zzz-frontend, feature-detect.
6. **Tune & ship** — bench, fix perf cliffs, write a doc page under `libs/game-opt/solver-gpu/README.md` covering the supported subset and the WebGPU browser matrix.

## 15. Risks to track

- **WebGPU availability:** still partial on Safari (16.4+ stable, but limited) and Firefox (flag). JS fallback is the safety net.
- **WGSL debugging is painful** — no printf. Plan for a "dump all per-build values to a download" debug mode during development.
- **Bitwise equality vs FP reordering** — the JS code is `sum(... + ...)`; WGSL may reorder. Tolerance tests must allow reorder, not strict equality.
- **Subwork / progress semantics** — current `progress.remaining/computed/failed/skipped` is per-build, not per-chunk. The GPU solver must map chunk results back to per-build counts so the existing UI keeps working.
- **Buffer size limits** — WebGPU caps storage buffer at 128 MB by default (`maxStorageBufferBindingSize`). The packer must chunk if a column is huge; the GPU solver can hold the candidates as one buffer and re-dispatch in batches.
- **Per-build `ids` overflow:** 7 slots × `u32` = 28 bytes/build output. At `2^20` builds/dispatch that's ~28 MB output buffer per dispatch, easy to fit.

## 16. Open question

Before implementation begins, want me to sketch the WGSL shader for the arithmetic ops so you can sanity-check the lowering, or is the textual plan enough to move into implementation?

## 17. Files to create / move

```
libs/pando/engine/
  src/
    backend/
      types.ts                         (new) Backend interface
      js/
        compile.ts                     (moved from node/transform.ts)
        compileDiff.ts                 (moved from node/transform.ts)
        executionStr.ts                (moved from node/transform.ts)
        index.ts
      wgsl/
        compile.ts                     (new) WGSL compile entry
        dispatch.ts                    (new) device + dispatch
        pack.ts                        (new) candidate packer
        lower/
          arithmetic.ts                (new)
          branching.ts                 (new)
          read.ts                      (new)
          subscript.ts                 (new)
          lookup.ts                    (new)
          custom.ts                    (new)
        compile.spec.ts                (new) cross-validate
    util/
      custom.ts                        (extended with wgsl field)
    node/
      transform.ts                     (slimmed — IR walker + delegation)

libs/game-opt/solver-gpu/              (new package)
  src/
    gpuSolver.ts
    gpuWorker.ts
    gpuWorker.spec.ts
    benchmark.spec.ts
    README.md
    project.json
    package.json
    tsconfig.json
    tsconfig.lib.json
    tsconfig.spec.json
    vitest.config.ts

apps/zzz-frontend/
  ... (UI toggle or auto-detect)
```

## 18. Verification

- `bun nx test pando-engine` — JS path unchanged.
- `bun nx test game-opt-solver` — JS solver unchanged.
- `bun nx test game-opt-solver-gpu` — WGSL backend specs (skipped if no device).
- `bun nx typecheck pando-engine game-opt-solver-gpu` — strict types still hold.
- `bun biome ci` + `bun nx eslint:lint pando-engine game-opt-solver-gpu --max-warnings=0` — lint clean.
- Manual smoke test in `apps/zzz-frontend` against a real build problem; compare top-N output to JS solver.
