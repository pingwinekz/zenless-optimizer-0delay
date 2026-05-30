# Characters tab — simple character edit modal

Replace the full-screen `CharacterEditor` on the Characters page with a small modal like Fribbels HSR (`CharacterModal.tsx`), editing **only mindscape and wengine** (key + phase).

---

## References

| Role | Location |
|------|----------|
| HSR modal (target UX) | `fribbels-hsr-optimizer/src/lib/overlays/modals/CharacterModal.tsx` |
| HSR save handler (Characters tab) | `fribbels-hsr-optimizer/src/lib/tabs/tabCharacters/characterTabController.ts` → `onCharacterModalOk` |
| ZZZ current editor (too large) | `libs/zzz/formula-ui/src/char/CharacterEditor.tsx` |
| ZZZ characters page | `libs/zzz/page-characters/src/index.tsx` |
| Mindscape UI | `libs/zzz/ui/src/Character/CharacterProfilePieces.tsx` → `CharacterCompactMindscapeSelector` |
| Wengine pick | `libs/zzz/ui/src/Wengine/WengineSelectionModal.tsx` |
| Wengine equip pattern | `libs/zzz/formula-ui/src/char/CharacterEditor.tsx` (`EquippedGrid` setWengine), `initialWengine` from `@genshin-optimizer/zzz/db` |

**Keep full `CharacterEditor` on Optimize tab** (`libs/zzz/page-optimize/src/CharacterOptDisplay.tsx`) — do not remove or break it.

---

## Current vs target

| | Current (ZZZ) | Target (HSR-like) |
|---|---------------|-------------------|
| Open edit | `navigate('/characters/:characterKey')` + route match | Local modal state (no route required for edit) |
| Wrapper | `CharCalcProvider` + full `CharacterEditor` modal | Small `Modal` ~400px, no calc provider |
| Fields | Level, potential, skills, core, discs, wengine grid, stats, delete | **Mindscape** + **Wengine** (+ phase) only |
| Persist | Live `database.*.set` on each control | **Cancel / Save** (apply on Save, like HSR) |
| Add character | `CharacterSingleSelectionModal` → navigate to full editor | Selection modal → **simple edit modal** (optional: skip edit if defaults OK) |

---

## Scope

### In scope

- New `CharacterEditModal` on Characters page
- Mindscape (0–6)
- Wengine: select engine **key** from inventory modal + **phase** (1–5), HSR superimposition equivalent
- Cancel / Save
- Wire menu, row edit, preview edit to open simple modal
- Remove Characters-page dependency on route `/characters/:characterKey` for editing

### Out of scope

- Disc editing, skills, level, potential, core (discs/skills stay on preview / optimize / discs tab)
- Delete character from edit modal (keep delete on row menu / preview; HSR deletes from menu too)
- Changing Optimize tab’s full `CharacterEditor`
- HSR teammate set selection (`showSetSelection`)

---

## Phase 1 — `CharacterEditModal` component

**Create:** `libs/zzz/page-characters/src/CharacterEditModal.tsx` (or `libs/zzz/ui/src/Character/CharacterEditModal.tsx` if reuse planned — prefer `page-characters` first).

**UI structure** (mirror HSR `CharacterModal`):

```
Modal (size ~400, centered)
├── Header: character name (read-only) + optional portrait/icon
├── Section "Mindscape"
│   └── SegmentedControl M0–M6  (prefer over compact switcher for HSR-like simplicity)
│       OR CharacterCompactMindscapeSelector if product wants existing ZZZ control
├── Section "Wengine"
│   ├── Button / select opening WengineSelectionModal (filter by character specialty)
│   └── SegmentedControl P1–P5 (phase on equipped instance)
├── Footer: Cancel | Save
```

**Form state** (`useForm` or `useState`):

```ts
type CharacterEditForm = {
  mindscape: number
  wengineKey: WengineKey | null  // template key, not DB id
  wenginePhase: number           // 1–5
}
```

**Initialize on open** from `database.chars.get(characterKey)` + `database.wengines.get(character.equippedWengine)`.

**Validation on Save** (like HSR requires light cone):

- Wengine key required (or allow empty with warning — match product; HSR errors if missing)
- Mindscape in 0..6, phase in 1..5

---

## Phase 2 — Save logic (`onCharacterEditOk`)

**Create:** `characterEditController.ts` (or inline in modal) with single `onSave(form, characterKey)`:

1. **Mindscape:** `database.chars.set(characterKey, { mindscape: form.mindscape })`
2. **Wengine:**
   - If same key as current equipped instance → only update `phase` on existing `equippedWengine` id
   - If key changed:
     - Unequip current: `database.wengines.set(oldId, { location: '' })` if present
     - Find existing unassigned wengine with that `key` in inventory, or `database.wengines.new(initialWengine(key))`
     - `database.wengines.set(newId, { location: characterKey, phase: form.wenginePhase })`
     - `database.chars.set(characterKey, { equippedWengine: newId })` (if not auto-linked by data manager)
3. Refresh focus: `useCharacterTabStore.getState().setFocusCharacter(characterKey)`
4. Close modal

**Verify** against `CharacterDataManager` equip/unequip behavior so you do not duplicate or fight existing location sync.

---

## Phase 3 — Wire Characters page

**File:** `libs/zzz/page-characters/src/index.tsx`

1. Replace route-driven editor block:
   - Remove: `useMatch('/characters/:characterKey')`, `navigate` on edit, `CharCalcProvider` + `CharacterEditor` for edit
   - Add: `const [editCharacterKey, setEditCharacterKey] = useState<CharacterKey | null>(null)`
2. `editCharacter(ck)` → `setEditCharacterKey(ck)` (ensure `database.chars.getOrCreate(ck)` first)
3. Render `<CharacterEditModal characterKey={editCharacterKey} onClose={() => setEditCharacterKey(null)} />`
4. **Add character:** `CharacterSingleSelectionModal` onSelect → `setEditCharacterKey(ck)` instead of `navigate('/characters/...')`
5. Remove mount effect that `navigate`s to `optCharKey` via `/characters/:key` — use `setFocusCharacter(optCharKey)` only (or open edit modal only if explicitly desired)

**Optional:** Drop nested route `characters/*` param handling entirely if nothing else uses it; keep route as `/characters` only in `App.tsx`.

---

## Phase 4 — i18n & polish

- Keys under `page_characters` (or `modals` mirroring HSR `EditCharacter`):
  - `editCharacter.title`, `mindscape`, `wengine`, `phase`, `save`, `cancel`
  - Validation: `noWengineSelected`
- Modal uses `HeaderText` or Mantine `Text` fw={600} like HSR section headers
- `size={400}`, `centered`, `gap={10}` between sections

---

## Phase 5 — QA

- [ ] Edit from row menu, preview edit button, character menu → same modal
- [ ] Save updates list subtitle (M / P) and preview wengine strip
- [ ] Cancel discards unsaved changes
- [ ] Add new character → simple modal (not full editor)
- [ ] Optimize tab still opens full `CharacterEditor`
- [ ] `yarn run mini-ci` on affected projects

---

## HSR → ZZZ field map

| HSR `CharacterModal` | ZZZ simple modal |
|----------------------|------------------|
| `characterEidolon` 0–6 | `mindscape` 0–6 |
| `LightConeSelect` | `WengineSelectionModal` (by `WengineKey`) |
| `lightConeSuperimposition` 1–5 | `wengine.phase` 1–5 |
| `CharacterSelect` (add flow) | Keep `CharacterSingleSelectionModal` separately |
| `onOk` → persist | `onCharacterEditOk` → `database` |

---

## Starter prompt (one phase)

```
Read libs/zzz/page-characters/AGENTS-CHARACTER-EDIT.md.

Implement Phase 1–3: CharacterEditModal (mindscape + wengine + phase only),
Save/Cancel, wire page-characters/index.tsx, remove route-based CharacterEditor on Characters tab.

Reference HSR: fribbels-hsr-optimizer/src/lib/overlays/modals/CharacterModal.tsx
Do not change libs/zzz/formula-ui CharacterEditor or page-optimize usage.

Run yarn run mini-ci. Do not commit unless asked.
```

---

## Progress

- [ ] Phase 1 — Modal UI
- [ ] Phase 2 — Save logic
- [ ] Phase 3 — Page wiring
- [ ] Phase 4 — i18n
- [ ] Phase 5 — QA
