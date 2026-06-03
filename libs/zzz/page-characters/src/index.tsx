import {
  useDataEntryBase,
  useDataManagerKeys,
} from '@genshin-optimizer/common/database-ui'

import { filterFunction, sortFunction } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import {
  CharacterMenu,
  CharacterRow,
  CharacterSingleSelectionModal,
  DragOverlayRow,
  StatHighlightContext,
  characterFilterConfigs,
  characterSortConfigs,
  characterSortMap,
  precomputedCssVars,
  useCharacterTabStore,
} from '@genshin-optimizer/zzz/ui'
import { CharacterEditModal } from './CharacterEditModal'
import { CharacterPreview } from './CharacterPreview'
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  type DropAnimation,
  PointerSensor,
  TouchSensor,
  closestCenter,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Box, Flex, SegmentedControl } from '@mantine/core'
import { useMergedRef } from '@mantine/hooks'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import {
  Suspense,
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { FilterBar } from './FilterBar'
import { getCharacterShowcaseColor } from './color/characterShowcaseColors'
import { DEFAULT_CONFIG } from './color/colorPipelineConfig'
import { oklchCharacterListColor } from './color/colorUtilsOklch'
import { cardTotalW, defaultGap, parentH } from './constantsUi'
const dropAnimationDuration = 200

const dropAnimationConfig: DropAnimation = {
  duration: dropAnimationDuration,
  easing: 'ease',
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: '0' } },
  }),
}

export default function PageCharacter() {
  const { database } = useDatabaseContext()
  const navigate = useNavigate()
  const displayCharacter = useDataEntryBase(database.displayCharacter)
  const focusCharacter = useCharacterTabStore((s) => s.focusCharacter)
  const setFocusCharacter = useCharacterTabStore((s) => s.setFocusCharacter)
  const [searchTerm, setSearchTerm] = useState('')
  const deferredSearchTerm = useDeferredValue(searchTerm)

  const [statHighlight, setStatHighlight] = useState('')
  const statHLContextObj = useMemo(
    () => ({ statHighlight, setStatHighlight }),
    [statHighlight, setStatHighlight]
  )

  const [editCharacterKey, setEditCharacterKey] = useState<CharacterKey | null>(
    null
  )

  const [newCharacter, setnewCharacter] = useState(false)

  const editCharacter = useCallback(
    (characterKey: CharacterKey | null) => {
      if (characterKey === null) return
      const character = database.chars.get(characterKey)
      if (!character) {
        database.chars.getOrCreate(characterKey)
      }
      setEditCharacterKey(characterKey)
    },
    [database.chars]
  )

  const deleteCharacter = useCallback(
    (charKey: CharacterKey) => {
      if (!window.confirm(`Remove ${charKey}?`)) return
      database.chars.remove(charKey)
      if (editCharacterKey === charKey) {
        setEditCharacterKey(null)
      }
      if (focusCharacter === charKey) {
        setFocusCharacter(null)
      }
    },
    [database.chars, editCharacterKey, focusCharacter, setFocusCharacter]
  )

  const charKeys = useDataManagerKeys(database.chars)

  const filteredCharKeys = useMemo(() => {
    const { attribute, specialtyType, rarity, sortType, ascending } =
      displayCharacter
    return charKeys
      .filter(
        filterFunction(
          { attribute, specialtyType, rarity, name: deferredSearchTerm },
          characterFilterConfigs(database)
        )
      )
      .sort(
        sortFunction(
          characterSortMap[sortType] ?? [],
          ascending,
          characterSortConfigs(database),
          ['new', 'custom']
        )
      )
  }, [displayCharacter, charKeys, deferredSearchTerm, database])

  // Sync visual order to customSortOrder so the optimizer priority matches
  // what the user sees on the characters page.
  // The set() call is deferred via setTimeout to prevent React from detecting
  // a synchronous nested update when useSyncExternalStore's forceStoreRerender
  // flushes immediately outside React's execution context.
  const syncedOrderRef = useRef('')
  useEffect(() => {
    const current = database.displayCharacter.get().customSortOrder
    const serialized = filteredCharKeys.join(',')
    if (syncedOrderRef.current === serialized) return
    if (
      current.length !== filteredCharKeys.length ||
      current.some((ck, i) => ck !== filteredCharKeys[i])
    ) {
      syncedOrderRef.current = serialized
      const next = [...filteredCharKeys]
      setTimeout(() => {
        database.displayCharacter.set({ customSortOrder: next })
      }, 0)
    }
  }, [filteredCharKeys, database.displayCharacter])

  const { specialtyType, attribute, rarity } = displayCharacter

  // DnD state
  const gridRef = useRef<HTMLDivElement>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    gridRef.current?.setAttribute('data-dragging-active', '')
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      gridRef.current?.removeAttribute('data-dragging-active')

      // Suppress row transitions for one paint to prevent "float from top" glitch
      const container = gridRef.current
      if (container) {
        container.setAttribute('data-suppress-transition', 'true')
        requestAnimationFrame(() =>
          container.removeAttribute('data-suppress-transition')
        )
      }

      setTimeout(() => setActiveId(null), dropAnimationDuration)

      const { active, over } = event
      if (!over || active.id === over.id) return

      const existing = displayCharacter.customSortOrder
      const currentOrder =
        existing && existing.length > 0 ? existing : [...charKeys]

      const oldIndex = currentOrder.indexOf(active.id as string)
      const newIndex = currentOrder.indexOf(over.id as string)
      if (oldIndex === -1 || newIndex === -1) return

      const reordered = [...currentOrder]
      const [moved] = reordered.splice(oldIndex, 1)
      reordered.splice(newIndex, 0, moved)
      database.displayCharacter.set({
        sortType: 'custom',
        customSortOrder: reordered,
      })
    },
    [charKeys, displayCharacter.customSortOrder, database.displayCharacter]
  )

  const handleDragCancel = useCallback(() => {
    gridRef.current?.removeAttribute('data-dragging-active')
    setTimeout(() => setActiveId(null), dropAnimationDuration)
  }, [])

  const itemIds = useMemo(
    () => filteredCharKeys as string[],
    [filteredCharKeys]
  )

  const density = useCharacterTabStore((s) => s.density)
  const setDensity = useCharacterTabStore((s) => s.setDensity)

  const rowCssVars = useMemo(() => precomputedCssVars[density], [density])

  // Sync focus from optimizer's optCharKey on mount (HSR tab activation pattern)
  useEffect(() => {
    const optCharKey = database.dbMeta.get().optCharKey
    if (optCharKey) {
      setFocusCharacter(optCharKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Local focus for instant click feedback
  const [localFocus, setLocalFocus] = useState<CharacterKey | null>(null)
  useEffect(() => {
    setLocalFocus(null)
  }, [focusCharacter])
  const displayFocus = localFocus ?? focusCharacter

  const rankMap = useMemo(
    () => new Map(filteredCharKeys.map((ck, i) => [ck, i])),
    [filteredCharKeys]
  )

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <StatHighlightContext.Provider value={statHLContextObj}>
        <CharacterEditModal
          characterKey={editCharacterKey}
          onClose={() => setEditCharacterKey(null)}
        />
      </StatHighlightContext.Provider>
      <Suspense fallback={false}>
        <CharacterSingleSelectionModal
          show={newCharacter}
          onHide={() => setnewCharacter(false)}
          onSelect={(ck) => {
            editCharacter(ck)
            setnewCharacter(false)
          }}
          newFirst={true}
        />
      </Suspense>

      {/* Root flex: fixed-width row matching HSR CharacterTab */}
      <Flex style={{ width: 1640, height: '100%' }} gap={defaultGap}>
        {/* Left: CharacterMenu + Grid + Density */}
        <Box
          miw={300}
          style={{
            flex: '0 0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            width: 300,
          }}
        >
          {/* Character Menu */}
          <CharacterMenu
            hasFocus={!!focusCharacter}
            onAdd={() => setnewCharacter(true)}
            onEdit={() => {
              if (focusCharacter) editCharacter(focusCharacter)
            }}
            onDelete={() => {
              if (focusCharacter) deleteCharacter(focusCharacter)
            }}
            onOptimize={() => {
              if (focusCharacter) {
                database.dbMeta.set({ optCharKey: focusCharacter })
                navigate(`/optimize?character=${focusCharacter}`)
              }
            }}
          />

          {/* Character Grid with DnD + OverlayScrollbars */}
          <OverlayScrollbarsComponent
            style={{
              height: parentH,
              border: '1px solid var(--layer-2)',
              borderRadius: 'var(--mantine-radius-sm)',
            }}
            data-container-border="true"
            options={{ scrollbars: { autoHide: 'move', autoHideDelay: 500 } }}
            tabIndex={0}
          >
            <Box
              ref={gridRef}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--cr-row-gap, 1px)',
                width: '100%',
                ...rowCssVars,
              }}
            >
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
              >
                <SortableContext
                  items={itemIds}
                  strategy={verticalListSortingStrategy}
                >
                  {filteredCharKeys.map((charKey) => (
                    <SortableCharacterRow
                      key={charKey}
                      characterKey={charKey}
                      isFocused={charKey === displayFocus}
                      rank={rankMap.get(charKey) ?? 0}
                      onClick={() => {
                        setLocalFocus(charKey)
                        setFocusCharacter(charKey)
                      }}
                      onDoubleClick={() => {
                        setFocusCharacter(charKey)
                        database.dbMeta.set({ optCharKey: charKey })
                        navigate(`/optimize?character=${charKey}`)
                      }}
                      onEdit={(ck) => editCharacter(ck)}
                      onDelete={(ck) => deleteCharacter(ck)}
                      isDragging={activeId === charKey}
                    />
                  ))}
                </SortableContext>
                <DragOverlay
                  dropAnimation={dropAnimationConfig}
                  modifiers={[restrictToVerticalAxis]}
                >
                  {activeId && (
                    <DragOverlayRow
                      characterKey={activeId as CharacterKey}
                      rank={rankMap.get(activeId as CharacterKey) ?? 0}
                    />
                  )}
                </DragOverlay>
              </DndContext>
            </Box>
          </OverlayScrollbarsComponent>

          {/* Density toggle */}
          <SegmentedControl
            data={[
              { value: 'default', label: 'Default' },
              { value: 'compact', label: 'Compact' },
            ]}
            value={density}
            onChange={(v) => setDensity(v as 'default' | 'compact')}
            fullWidth
            size="xs"
          />
        </Box>

        {/* Right: Filter toggles + Preview */}
        <Box
          style={{
            width: cardTotalW,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            position: 'relative',
          }}
        >
          <FilterBar
            specialtyType={specialtyType}
            onSpecialtyChange={(v) =>
              database.displayCharacter.set({ specialtyType: v })
            }
            attribute={attribute}
            onAttributeChange={(v) =>
              database.displayCharacter.set({ attribute: v })
            }
            rarity={rarity}
            onRarityChange={(v) => database.displayCharacter.set({ rarity: v })}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          {/* CharacterPreview — always visible */}
          <CharacterPreview
            characterKey={focusCharacter}
            onEdit={
              focusCharacter ? () => editCharacter(focusCharacter) : undefined
            }
            onDelete={
              focusCharacter ? () => deleteCharacter(focusCharacter) : undefined
            }
          />
        </Box>
      </Flex>
    </Box>
  )
}

const SortableCharacterRow = memo(function SortableCharacterRow({
  characterKey,
  isFocused,
  rank,
  onClick,
  onDoubleClick,
  onEdit,
  onDelete,
  isDragging,
}: {
  characterKey: CharacterKey
  isFocused: boolean
  rank: number
  onClick: () => void
  onDoubleClick?: () => void
  onEdit?: (ck: CharacterKey) => void
  onDelete?: (ck: CharacterKey) => void
  isDragging: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: characterKey,
      animateLayoutChanges: () => false,
    })

  const scrollRef = useRef<HTMLDivElement>(null)
  const mergedRef = useMergedRef(setNodeRef, scrollRef)

  // Load-once via IntersectionObserver
  const [loadImages, setLoadImages] = useState(false)

  useEffect(() => {
    if (isFocused) {
      scrollRef.current?.scrollIntoView({ block: 'nearest' })
    }
  }, [isFocused])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry], obs) => {
        if (entry.isIntersecting) {
          setLoadImages(true)
          obs.disconnect()
        }
      },
      { rootMargin: '500px 0px', threshold: 0 }
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
    }
  }, [characterKey])

  const showcaseColor = useMemo(
    () =>
      oklchCharacterListColor(
        getCharacterShowcaseColor(characterKey),
        true,
        DEFAULT_CONFIG
      ),
    [characterKey]
  )

  const style = {
    transform: CSS.Translate.toString(transform),
    transition: transform ? transition : undefined,
    opacity: isDragging ? 0.4 : undefined,
  }

  const handleClick = useCallback(() => onClick(), [onClick])
  const handleDoubleClick = useCallback(
    () => onDoubleClick?.(),
    [onDoubleClick]
  )
  const handleEdit = useCallback((ck: CharacterKey) => onEdit?.(ck), [onEdit])
  const handleDelete = useCallback(
    (ck: CharacterKey) => onDelete?.(ck),
    [onDelete]
  )

  return (
    <Box ref={mergedRef} style={style} {...attributes} {...listeners}>
      <CharacterRow
        characterKey={characterKey}
        isFocused={isFocused}
        rank={rank}
        loadImages={loadImages || isFocused}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onEdit={handleEdit}
        onDelete={handleDelete}
        showcaseColor={showcaseColor}
      />
    </Box>
  )
})
export { ShowcaseDiscPanel, ShowcaseDiscCard } from './card/ShowcaseDiscPanel'
