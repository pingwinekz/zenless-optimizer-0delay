import { ActionIcon, Flex } from '@mantine/core'
import { IconPin, IconPinned } from '@tabler/icons-react'
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'
import type { CellClickedEvent, ColDef, ValueFormatterParams, CellClassParams } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-balham.css'

import type { GeneratedBuild } from '@genshin-optimizer/zzz/db'
import { useCallback, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useOptimizerDisplayStore } from '../stores/useOptimizerDisplayStore'
import type { StatDisplay } from '../Sidebar/StatsViewSelect'
import {
  type EnrichedBuild,
  type BuildCombatStats,
  STAT_LABELS,
  buildRowId,
} from '../Util/buildStatsUtils'
import { DiscSetCellRenderer } from './gridCellRenderers'

// AG Grid v35+ requires explicit module registration
ModuleRegistry.registerModules([AllCommunityModule])

// ── Gradient helpers (like fribbels' gradient.ts) ──
// Gradient color from dark red (low) through neutral to green (high)
const STAT_COLORS = [
  '#5A1A06', // low  (red)
  '#343127', // mid  (neutral)
  '#38821F', // high (green)
]

function getGradientColor(value: number, min: number, max: number): string | undefined {
  if (value == null || min == null || max == null) return undefined
  if (max === min) return `#343127`
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)))
  // Interpolate between the 3 colors
  if (t < 0.5) {
    const u = t / 0.5
    return lerpColor(STAT_COLORS[0], STAT_COLORS[1], u)
  }
  const u = (t - 0.5) / 0.5
  return lerpColor(STAT_COLORS[1], STAT_COLORS[2], u)
}

function lerpColor(a: string, b: string, t: number): string {
  const ah = parseInt(a.replace('#', ''), 16)
  const bh = parseInt(b.replace('#', ''), 16)
  const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff
  const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff
  const rr = Math.round(ar + (br - ar) * t)
  const rg = Math.round(ag + (bg - ag) * t)
  const rb = Math.round(ab + (bb - ab) * t)
  return `#${((1 << 24) | (rr << 16) | (rg << 8) | rb).toString(16).slice(1)}`
}

// ── Constants ──
const GRID_WIDTH = 1302
const GRID_HEIGHT = 600
const MIN_HEIGHT = 300
const DIGITS_3 = 46
const DIGITS_4 = 52
const DIGITS_5 = 58


const GRID_CONTAINER_STYLE = {
  width: GRID_WIDTH,
  minHeight: MIN_HEIGHT,
  height: GRID_HEIGHT,
  resize: 'vertical' as const,
  overflow: 'hidden' as const,
  boxShadow: 'var(--shadow-card-flat)',
  // Dark theme CSS variables are set in ag-grid-overrides.css
} as React.CSSProperties

const defaultColDef: ColDef = {
  sortable: true,
  sortingOrder: ['desc', 'asc'],
  wrapHeaderText: true,
}

const gridOptions = {
  rowHeight: 36,
  pagination: true,
  paginationPageSize: 500,
  paginationPageSizeSelector: [100, 500, 1000],
  alwaysShowVerticalScroll: false,
  suppressDragLeaveHidesColumns: true,
  suppressScrollOnNewData: true,
  suppressMultiSort: true,
  suppressNoRowsOverlay: true,
}

const rowSelection = {
  mode: 'singleRow' as const,
  checkboxes: false,
  enableClickSelection: true,
}

// ── Value formatters ──

const formatFloor = (params: ValueFormatterParams) => {
  if (params.value == null) return ''
  return String(Math.floor(params.value))
}

const formatFlat2 = (params: ValueFormatterParams) => {
  if (params.value == null) return ''
  return params.value.toFixed(2)
}

const formatPct = (params: ValueFormatterParams) => {
  if (params.value == null) return ''
  // value stored as decimal 0-1, display as 0.0%
  return (params.value * 100).toFixed(1)
}

const formatPctNoDec = (params: ValueFormatterParams) => {
  if (params.value == null) return ''
  return (params.value * 100).toFixed(0)
}

/**
 * Build aggregated min/max for gradient coloring from the row data.
 * Updated whenever rowData changes.
 */
function buildAggregations(
  data: EnrichedBuild[],
  statDisplay: StatDisplay
): {
  min: Record<string, number>
  max: Record<string, number>
} {
  const isCombat = statDisplay === 'combat'
  const min: Record<string, number> = {}
  const max: Record<string, number> = {}
  const statKeys = isCombat
    ? ['value', 'hp', 'atk', 'def', 'impact', 'critRate', 'critDmg', 'penRatio', 'pen', 'enerRegen', 'anomProf', 'anomMas', 'dmgBonus', 'defIgn']
    : ['value', 'hp', 'atk', 'def', 'impact', 'critRate', 'critDmg', 'penRatio', 'enerRegen', 'anomProf', 'anomMas']

  for (const key of statKeys) {
    min[key] = Infinity
    max[key] = -Infinity
  }

  for (const build of data) {
    const val = build.value
    if (val < min['value']) min['value'] = val
    if (val > max['value']) max['value'] = val

    const stats = isCombat ? build.combatStats : build.baseStats
    if (!stats) continue
    for (const key of statKeys) {
      if (key === 'value') continue
      const v = (stats as any)[key]
      if (v == null || isNaN(v)) continue
      if (v < min[key]) min[key] = v
      if (v > max[key]) max[key] = v
    }
  }

  return { min, max }
}

// ── Column gradient cell style ──
function gradientCellStyle(params: CellClassParams<EnrichedBuild, number>, field: string, aggregations: { min: Record<string, number>; max: Record<string, number> }) {
  if (params.value == null) return undefined
  const min = aggregations.min[field]
  const max = aggregations.max[field]
  if (min == null || max == null) return undefined
  const color = getGradientColor(params.value, min, max)
  if (!color) return undefined
  return { '--cell-bg': color }
}

// ── Stat column definitions builder ──
function buildStatColumnDefs(
  aggregations: { min: Record<string, number>; max: Record<string, number> },
  statDisplay: StatDisplay
): ColDef<EnrichedBuild>[] {
  const isCombat = statDisplay === 'combat'
  type CombatField = keyof BuildCombatStats

  const statConfigs: { field: CombatField; formatter: (params: ValueFormatterParams) => string; width: number; baseOnly?: boolean }[] = [
    { field: 'hp', formatter: formatFloor, width: DIGITS_4 },
    { field: 'atk', formatter: formatFloor, width: DIGITS_4 },
    { field: 'def', formatter: formatFloor, width: DIGITS_4 },
    { field: 'impact', formatter: formatFloor, width: DIGITS_5 },
    { field: 'critRate', formatter: formatPct, width: DIGITS_3 },
    { field: 'critDmg', formatter: formatPct, width: DIGITS_3 },
    { field: 'penRatio', formatter: formatPct, width: DIGITS_4 },
    { field: 'pen', formatter: formatFloor, width: DIGITS_3 },
    { field: 'enerRegen', formatter: formatFlat2, width: DIGITS_3 },
    { field: 'anomProf', formatter: formatFloor, width: DIGITS_3 },
    { field: 'anomMas', formatter: formatFloor, width: DIGITS_3 },
    { field: 'dmgBonus', formatter: formatPctNoDec, width: DIGITS_4 },
    { field: 'defIgn', formatter: formatPct, width: DIGITS_4 },
  ]

  return statConfigs
    .filter((cfg) => isCombat || (!cfg.baseOnly && cfg.field !== 'dmgBonus' && cfg.field !== 'defIgn' && cfg.field !== 'pen'))
    .map(({ field, formatter, width }) => ({
      colId: field,
      headerName: STAT_LABELS[field] ?? field,
      valueGetter: (params) => {
        const data = params.data
        if (!data) return undefined
        return isCombat
          ? data.combatStats?.[field as keyof BuildCombatStats]
          : (data.baseStats as any)?.[field]
      },
      valueFormatter: formatter,
      cellStyle: (params: CellClassParams<EnrichedBuild, number>) =>
        gradientCellStyle(params, field, aggregations),
      minWidth: width,
      width,
      flex: 10,
    }))
}

// ── Memoized aggregations calculation ──
function useAggregations(rowData: EnrichedBuild[], statDisplay: StatDisplay) {
  return useMemo(() => buildAggregations(rowData, statDisplay), [rowData, statDisplay])
}

export function OptimizerGrid({
  builds,
  enrichedBuilds: extEnrichedBuilds,
  pinnedBuild,
  statDisplay,
  onBuildSelect,
}: {
  builds?: GeneratedBuild[]
  enrichedBuilds?: EnrichedBuild[]
  pinnedBuild?: GeneratedBuild
  statDisplay: StatDisplay
  onBuildSelect?: (build: GeneratedBuild) => void
}) {
  const { t } = useTranslation('page_optimize')
  const gridRef = useRef<AgGridReact>(null)
  const pinnedBuilds = useOptimizerDisplayStore((s) => s.pinnedBuilds)
  const addPinnedBuild = useOptimizerDisplayStore((s) => s.addPinnedBuild)
  const removePinnedBuild = useOptimizerDisplayStore((s) => s.removePinnedBuild)

  // Pinned top row for the currently equipped build
  // Finds the matching enriched build to display real stat values
  const pinnedTopRowData = useMemo((): EnrichedBuild[] | undefined => {
    if (!pinnedBuild) return undefined
    const pinnedId = buildRowId(pinnedBuild)
    const enriched = extEnrichedBuilds?.find((b) => b.id === pinnedId)
    return [
      {
        id: pinnedId,
        index: -1,
        value: enriched?.value ?? pinnedBuild.value,
        wengineKey: pinnedBuild.wengineKey,
        discIds: pinnedBuild.discIds,
        discSetIds: enriched?.discSetIds ?? [],
        combatStats: enriched?.combatStats ?? null,
        baseStats: enriched?.baseStats ?? null,
      },
    ]
  }, [pinnedBuild, extEnrichedBuilds])

  // Enriched build data is computed externally and stored on the row data
  // We use `useMemo` to keep reactivity - enriched builds come from parent
  // We need to merge enriched stats into the row data
  // Use externally-provided enriched data, falling back to basic row data

  const isPinned = useCallback(
    (id: string) => pinnedBuilds.some((b) => b.buildId === id),
    [pinnedBuilds]
  )

  // Create row data from enriched builds
  // Matches by buildRowId instead of array position because
  // enrichedBuilds includes the equipped build (at index 0) while
  // builds only contains generated builds.
  const rowData = useMemo(() => {
    if (!builds || builds.length === 0) return []
    return builds.map((build, index) => {
      const buildId = buildRowId(build)
      const enriched = extEnrichedBuilds?.find((e) => e.id === buildId)
      if (enriched) {
        return { ...enriched, index }
      }
      return {
        id: buildId,
        index,
        value: build.value,
        wengineKey: build.wengineKey,
        discIds: build.discIds,
        discSetIds: [],
        combatStats: null,
        baseStats: null,
      } as EnrichedBuild
    })
  }, [builds, extEnrichedBuilds])

  // Aggregations must include the pinned top row so the equipped build's
  // cells get gradient colors even when there are no generated builds yet.
  const allDataForAggregations = useMemo(() => {
    if (!pinnedTopRowData || pinnedTopRowData.length === 0) return rowData
    return [...rowData, ...pinnedTopRowData]
  }, [rowData, pinnedTopRowData])
  const aggregations = useAggregations(allDataForAggregations, statDisplay)

  const handleTogglePin = useCallback(
    (build: EnrichedBuild) => {
      if (isPinned(build.id)) {
        removePinnedBuild(build.id)
      } else {
        addPinnedBuild({
          buildId: build.id,
          index: build.index,
          value: build.value,
          wengineKey: build.wengineKey,
        })
      }
    },
    [isPinned, addPinnedBuild, removePinnedBuild]
  )

  // Custom cell renderer for pin button
  const PinCellRenderer = useCallback(
    (props: { data: EnrichedBuild }) => {
      if (!props.data) return null
      const pinned = isPinned(props.data.id)
      return (
        <Flex align="center" justify="center" style={{ height: '100%' }}>
          <ActionIcon
            size="xs"
            variant={pinned ? 'filled' : 'subtle'}
            color={pinned ? 'yellow' : 'gray'}
            onClick={(e) => {
              e.stopPropagation()
              handleTogglePin(props.data)
            }}
          >
            {pinned ? <IconPinned size={12} /> : <IconPin size={12} />}
          </ActionIcon>
        </Flex>
      )
    },
    [isPinned, handleTogglePin]
  )

  const columnDefs: ColDef<EnrichedBuild>[] = useMemo(
    () => [
      // Pin column
      {
        headerName: '',
        field: 'id',
        width: 36,
        sortable: false,
        cellRenderer: PinCellRenderer,
      },
      // Index
      {
        headerName: '#',
        field: 'index',
        width: 40,
        valueFormatter: (params) => (params.value != null ? String(params.value + 1) : ''),
      },
      // Value (score) - sortable with gradient
      {
        headerName: t('grid.value', 'Value'),
        field: 'value',
        valueFormatter: (params) => (params.value != null ? Math.floor(params.value).toLocaleString() : ''),
        cellStyle: (params) => gradientCellStyle(params, 'value', aggregations),
        minWidth: DIGITS_5,
        width: DIGITS_5,
        flex: 10,
      },
      // Disc Set icons - using custom cell renderer
      {
        headerName: t('grid.sets', 'Sets'),
        field: 'discSetIds',
        cellRenderer: DiscSetCellRenderer,
        width: 68,
        sortable: false,
      },
      // Stat columns with gradient
      ...buildStatColumnDefs(aggregations, statDisplay),
    ],
    [PinCellRenderer, t, aggregations, statDisplay]
  )

  const onCellClicked = (event: CellClickedEvent<EnrichedBuild>) => {
    if (event.data && onBuildSelect) {
      const { id: _id, index: _index, combatStats: _cs, baseStats: _bs, ...build } = event.data
      // Convert back to GeneratedBuild
      onBuildSelect({
        wengineKey: build.wengineKey,
        discIds: build.discIds,
        value: build.value,
      })
    }
  }

  return (
    <div
      id="optimizerGridContainer"
      className="ag-theme-balham ag-theme-balham-dark"
      style={GRID_CONTAINER_STYLE}
      role="region"
      aria-label={t('grid.title', 'Optimization results grid')}
    >
      <AgGridReact
        animateRows={false}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        gridOptions={{
          ...gridOptions,
          localeText: {
            page: t('grid.page', 'Page'),
            more: t('grid.more', 'More'),
            to: t('grid.to', 'to'),
            of: t('grid.of', 'of'),
            next: t('grid.next', 'Next'),
            previous: t('grid.previous', 'Previous'),
            loadingOoo: t('grid.loading', 'Loading...'),
            noRowsToShow: t('grid.noRows', 'No results — run the optimizer'),
          },
        }}
        headerHeight={36}
        onCellClicked={onCellClicked}
        pinnedTopRowData={pinnedTopRowData}
        ref={gridRef}
        rowSelection={rowSelection}
        rowData={rowData}
        getRowId={(params) => params.data.id}
      />
    </div>
  )
}
