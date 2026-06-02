import {
  useDataManagerValues,
  useDataManagerBase,
} from '@genshin-optimizer/common/database-ui'
import { DeferCreateProvider, DeferCreate } from '@genshin-optimizer/common/ui'
import { objKeyMap } from '@genshin-optimizer/common/util'
import type {
  BuildResult,
  Progress as SolverProgress,
} from '@genshin-optimizer/game-opt/solver'
import { Solver, buildCount } from '@genshin-optimizer/game-opt/solver'
import {
  type DiscSlotKey,
  type CharacterKey,
  type PhaseKey,
  allDiscSlotKeys,
} from '@genshin-optimizer/zzz/consts'
import {
  type DiscIds,
  type ICachedDisc,
  type GeneratedBuild,
  getTeamFrame0,
  targetTag,
} from '@genshin-optimizer/zzz/db'
import {
  hasHigherPriority,
  getCharacterEffectiveStats,
} from '@genshin-optimizer/zzz/util'
import {
  OptConfigContext,
  OptConfigProvider,
  useCharacterContext,
  useDatabaseContext,
  useDiscs,
  useTeam,
} from '@genshin-optimizer/zzz/db-ui'
import { useZzzCalcContext } from '@genshin-optimizer/zzz/formula-ui'
import { createSolverConfig } from '@genshin-optimizer/zzz/solver'
import { getCharStat, getWengineStat } from '@genshin-optimizer/zzz/stats'
import {
  DiscEditorModal,
  useDiscEditorModalStore,
} from '@genshin-optimizer/zzz/ui'
import { ShowcaseDiscCard } from '@genshin-optimizer/zzz/page-characters'
import { BuildsSelector, WorkerSelector } from '@genshin-optimizer/zzz/ui'
import { Box, Flex, Stack, Text, Loader } from '@mantine/core'
import type { MouseEvent } from 'react'
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
  PermutationsSection,
  OptimizerControlsSection,
  ResultsSection,
  PinnedBuildsSection,
} from '../Sidebar'
import type { StatDisplay } from '../Sidebar'
import { BuildsSection } from '../BuildManagement'
import { useOptimizerDisplayStore } from '../stores/useOptimizerDisplayStore'
import { useResponsive } from '../hooks'
import { ResponsiveBottomBar } from '../layout'
import { OptimizerForm } from './OptimizerForm'
import { OptimizerGrid } from './OptimizerGrid'
import { batchComputeBuildStats } from '../Util/buildStatsUtils'
import type { EnrichedBuild } from '../Util/buildStatsUtils'

/**
 * Renders the 6 showcase-style disc cards in a single horizontal row
 * for a selected build's discIds.
 * Clicking a disc opens the disc editor modal.
 * Extracted as a separate component so the `useDiscs` hook is always
 * called unconditionally (Rules of Hooks).
 */
function SelectedBuildDiscs({
  discIds,
  characterKey,
}: {
  discIds: DiscIds
  characterKey: CharacterKey
}) {
  const discs = useDiscs(discIds)
  const effectiveStats = useMemo(
    () => getCharacterEffectiveStats(characterKey),
    [characterKey]
  )
  const openEditorModal = useDiscEditorModalStore((s) => s.openOverlay)

  const handleDiscClick = useCallback(
    (slot: DiscSlotKey) => {
      const disc = discs[slot]
      openEditorModal({
        selectedDisc: disc ?? null,
        slotKey: slot,
        characterKey,
        onOk: () => {},
      })
    },
    [discs, openEditorModal, characterKey]
  )

  return (
    <Flex
      gap={6}
      wrap="nowrap"
      style={
        {
          '--showcase-card-bg': 'var(--mantine-color-dark-6)',
          '--showcase-card-border': 'rgba(255, 255, 255, 0.1)',
          '--showcase-shadow': 'rgba(0, 0, 0, 0.25) 0px 2px 16px',
          '--showcase-shadow-inset':
            ', inset rgba(255, 255, 255, 0.1) 0px 0px 2px',
        } as any
      }
    >
      {allDiscSlotKeys.map((slotKey) => (
        <ShowcaseDiscCard
          key={slotKey}
          slot={slotKey}
          disc={discs[slotKey]}
          onClick={() => handleDiscClick(slotKey)}
          effectiveStats={effectiveStats}
        />
      ))}
    </Flex>
  )
}

export default function Optimize() {
  const { key: characterKey } = useCharacterContext()!
  const team = useTeam(characterKey)!
  const { database } = useDatabaseContext()
  const mate = team.teammates.find((t) => t.characterKey === characterKey)
  const optConfigId = mate?.optConfigId

  if (!optConfigId) {
    const newOptConfigId = database.optConfigs.new({
      wEngineTypes: [getCharStat(characterKey).specialty],
    })
    database.teams.setTeammateOptConfigId(
      characterKey,
      characterKey,
      newOptConfigId
    )
    return null
  }
  return (
    <OptConfigProvider optConfigId={optConfigId}>
      <OptimizeWrapper />
    </OptConfigProvider>
  )
}

function OptimizeWrapper() {
  const { database } = useDatabaseContext()
  const calc = useZzzCalcContext()
  const character = useCharacterContext()!
  const { key: characterKey } = character
  const team = useTeam(characterKey)!
  const { tag: target } = getTeamFrame0(team)
  const [numWorkers, setNumWorkers] = useState(8)
  const [progress, setProgress] = useState<SolverProgress | undefined>(
    undefined
  )
  const { optConfig, optConfigId } = useContext(OptConfigContext)
  const discs = useDataManagerValues(database.discs)

  // Sidebar display state
  const {
    setPermutationDetails,
    setPermutations,
    setPermutationsSearched,
    setPermutationsResults,
    setOptimizationInProgress,
    setOptimizerStartTime,
    setOptimizerEndTime,
    setOptimizerProgress,
    clearPinnedBuilds,
  } = useOptimizerDisplayStore()

  // Stat display toggle (combat vs basic stats in grid)
  const [statDisplay, setStatDisplay] = useState<StatDisplay>('combat')

  const discsBySlot = useMemo(() => {
    const slotKeyMap = {
      4: optConfig.slot4,
      5: optConfig.slot5,
      6: optConfig.slot6,
    } as const
    const isFilteredSlot = (slotKey: DiscSlotKey): slotKey is '4' | '5' | '6' =>
      ['4', '5', '6'].includes(slotKey)

    // Get custom sort order for priority checking
    // When empty, all characters have equal priority (no filtering)
    const displayCharacter = database.displayCharacter.get()
    const customSortOrder = displayCharacter?.customSortOrder ?? []

    return discs.reduce(
      (discsBySlot, disc) => {
        const { slotKey, mainStatKey, level, location } = disc
        if (level < optConfig.levelLow || level > optConfig.levelHigh)
          return discsBySlot

        // Existing logic: exclude if useEquipped is false
        if (location && !optConfig.useEquipped && location !== characterKey)
          return discsBySlot

        // Priority-based filtering: exclude discs from higher-priority characters
        if (
          location &&
          optConfig.useEquipped &&
          optConfig.useCharacterPriority &&
          location !== characterKey
        ) {
          // Check if disc owner has higher priority
          if (hasHigherPriority(location, characterKey, customSortOrder)) {
            return discsBySlot
          }
        }

        if (
          isFilteredSlot(slotKey) &&
          !slotKeyMap[slotKey].includes(mainStatKey)
        )
          return discsBySlot
        discsBySlot[disc.slotKey].push(disc)
        return discsBySlot
      },
      {
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        6: [],
      } as Record<DiscSlotKey, ICachedDisc[]>
    )
  }, [
    optConfig.slot4,
    optConfig.slot5,
    optConfig.slot6,
    optConfig.levelLow,
    optConfig.levelHigh,
    optConfig.useEquipped,
    optConfig.useCharacterPriority,
    discs,
    characterKey,
    database.displayCharacter,
  ])
  const allWengineData = useDataManagerValues(database.wengines)
  const filteredWengineKeys = useMemo(() => {
    if (!optConfig.optWengine) {
      return character.wengineKey ? [character.wengineKey] : []
    }
    return allWengineData
      .filter(({ key }) => {
        const { type } = getWengineStat(key)
        return optConfig.wEngineTypes.includes(type)
      })
      .map(({ key }) => key)
  }, [
    characterKey,
    character.wengineKey,
    allWengineData,
    optConfig.optWengine,
    optConfig.wEngineTypes,
  ])

  const totalPermutations = useMemo(
    () => buildCount(Object.values(discsBySlot)) * filteredWengineKeys.length,
    [filteredWengineKeys.length, discsBySlot]
  )

  // Update sidebar permutation details
  useEffect(() => {
    const details: Record<string, { count: number; total: number }> = {}
    for (const [slot, slotDiscs] of Object.entries(discsBySlot)) {
      details[slot] = {
        count: slotDiscs.length,
        total: slotDiscs.length,
      }
    }
    setPermutationDetails(details)
    setPermutations(totalPermutations)
  }, [discsBySlot, totalPermutations, setPermutationDetails, setPermutations])

  const [optimizing, setOptimizing] = useState(false)
  const [sortByKey, setSortByKey] = useState<string | undefined>(undefined)
  const [resultLimit, setResultLimit] = useState(5)

  const cancelToken = useRef(() => {})
  useEffect(() => () => cancelToken.current(), [])

  const onCharacterChange = useCallback(
    (ck: CharacterKey) => {
      database.dbMeta.set({ optCharKey: ck })
    },
    [database.dbMeta]
  )

  const onWengineChange = useCallback(
    (wengineKey: string | undefined) => {
      database.chars.set(characterKey, {
        wengineKey: (wengineKey ?? '') as any,
        wenginePhase: 1,
      })
    },
    [database.chars, characterKey]
  )

  const onOptimize = useCallback(
    async (event: MouseEvent) => {
      if (!calc || !target) return
      const cancelled = new Promise<void>((r) => (cancelToken.current = r))
      setProgress(undefined)
      setOptimizing(true)
      setOptimizationInProgress(true)
      setOptimizerStartTime(Date.now())
      setOptimizerEndTime(null)
      setOptimizerProgress(0)
      setPermutationsSearched(0)
      setPermutationsResults(0)

      const statFilters = (optConfig.statFilters ?? []).filter(
        (s) => !s.disabled
      )
      const frames = target.rotation
        ? target.rotation.map(({ sheet, name }) => ({
            tag: targetTag({ sheet, name }),
            multiplier: 1,
          }))
        : [{ tag: targetTag(target), multiplier: 1 }]
      const config = createSolverConfig(
        characterKey,
        calc,
        frames,
        statFilters,
        optConfig.setFilter2,
        optConfig.setFilter4,
        filteredWengineKeys,
        character.wenginePhase as PhaseKey,
        discsBySlot,
        numWorkers,
        optConfig.maxBuildsToShow,
        setProgress
      )

      if (event.altKey) {
        console.log(config)
        setOptimizing(false)
        setOptimizationInProgress(false)
        return
      }

      const optimizer = new Solver(config)

      cancelled.then(() => optimizer.terminate('user cancelled'))
      let results: BuildResult<string>[]
      try {
        results = await optimizer.results
      } catch (e) {
        console.error('Optimizer failed:', e)
        return
      } finally {
        cancelToken.current = () => {}
        setOptimizing(false)
        setOptimizationInProgress(false)
        setOptimizerEndTime(Date.now())
        if (progress) {
          setOptimizerProgress(1)
          setPermutationsSearched(progress.computed + progress.remaining)
          setPermutationsResults(progress.computed + progress.remaining)
        }
      }
      database.optConfigs.newOrSetGeneratedBuildList(optConfigId, {
        builds: results.map(({ ids, value }) => ({
          wengineKey: ids[0],
          discIds: objKeyMap(allDiscSlotKeys, (_slot, index) => ids[index + 1]),
          value,
        })),
        buildDate: Date.now(),
      })
      setPermutationsResults(results.length)
    },
    [
      calc,
      target,
      optConfig.statFilters,
      optConfig.setFilter2,
      optConfig.setFilter4,
      optConfig.maxBuildsToShow,
      characterKey,
      filteredWengineKeys,
      discsBySlot,
      numWorkers,
      database.optConfigs,
      optConfigId,
      setOptimizationInProgress,
      setOptimizerStartTime,
      setOptimizerEndTime,
      setOptimizerProgress,
      setPermutationsSearched,
      setPermutationsResults,
      progress,
    ]
  )

  const onCancel = useCallback(() => {
    cancelToken.current()
    setOptimizing(false)
    setOptimizationInProgress(false)
  }, [cancelToken, setOptimizationInProgress])

  // Equipped build: the character's currently equipped discs + wengine (always first row)
  const equippedBuild = useMemo(
    (): GeneratedBuild => ({
      wengineKey: character.wengineKey || undefined,
      discIds: character.equippedDiscs,
      value: 0,
    }),
    [character.wengineKey, character.equippedDiscs]
  )

  // Selected build for disc preview below grid — start with equipped build by default
  const [selectedBuild, setSelectedBuild] =
    useState<GeneratedBuild>(equippedBuild)

  const onReset = useCallback(() => {
    // TODO: Implement filter reset logic
    // This should reset all form fields to defaults
  }, [])

  const onEquip = useCallback(() => {
    if (!selectedBuild) return
    for (const discId of Object.values(selectedBuild.discIds)) {
      if (discId) {
        database.discs.set(discId, { location: characterKey })
      }
    }
  }, [selectedBuild, database.discs, characterKey])

  const onFilter = useCallback(() => {
    // TODO: Implement filter results logic
  }, [])

  const onPin = useCallback(() => {
    // Pin the currently selected grid row
    // This function reads from gridRef via the gridStore pattern
    // TODO: implement pin selected row logic
  }, [])

  const onClearPins = useCallback(() => {
    clearPinnedBuilds()
  }, [clearPinnedBuilds])

  // Update progress in sidebar
  useEffect(() => {
    if (progress) {
      setPermutationsSearched(progress.computed + progress.remaining)
      setPermutationsResults(progress.computed + progress.remaining)
      if (totalPermutations > 0) {
        setOptimizerProgress(
          (progress.computed + progress.remaining) / totalPermutations
        )
      }
    }
  }, [
    progress,
    totalPermutations,
    setPermutationsSearched,
    setPermutationsResults,
    setOptimizerProgress,
  ])

  // Get generated builds for the grid (reactive — updates when list changes)
  const generatedBuildList =
    useDataManagerBase(
      database.generatedBuildList,
      optConfig.generatedBuildListId ?? ''
    ) || undefined

  // Clear selected build when builds change (new optimization run) — reset to equipped
  useEffect(() => {
    setSelectedBuild(equippedBuild)
  }, [
    optConfig.generatedBuildListId,
    generatedBuildList?.buildDate,
    equippedBuild,
  ])

  // Generated builds only (used as main grid rows)
  const allBuilds = useMemo(
    () => generatedBuildList?.builds ?? [],
    [generatedBuildList?.builds]
  )

  // Includes equipped build + generated builds for stats computation
  // (stats are needed for both the pinned equipped build and regular rows)
  const buildsForStats = useMemo(() => {
    return [equippedBuild, ...allBuilds]
  }, [equippedBuild, allBuilds])

  // Enriched builds state (stats computed for each build)
  const [enrichedBuilds, setEnrichedBuilds] = useState<EnrichedBuild[]>([])
  const [isComputingStats, setIsComputingStats] = useState(false)

  // Compute enriched stats when builds change (equipped or generated)
  useEffect(() => {
    const builds = buildsForStats
    if (builds.length === 0) {
      setEnrichedBuilds([])
      setIsComputingStats(false)
      return
    }

    // Get the optimization target formula tag from the team's first frame
    const { tag: target } = getTeamFrame0(team)
    const formulaTag = target?.rotation
      ? target.rotation.map(({ sheet, name }) => targetTag({ sheet, name }))
        : target
        ? targetTag(target)
        : undefined

    let cancelled = false
    setIsComputingStats(true)

    batchComputeBuildStats(
      builds,
      (id) => database.discs.get(id) ?? undefined,
      character,
      team,
      // Optional progress tracking
      undefined,
      formulaTag
    ).then((enriched) => {
      if (!cancelled) {
        setEnrichedBuilds(enriched)
        setIsComputingStats(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [buildsForStats, character, team, database])

  const { t } = useTranslation('page_optimize')
  const { isMobileLayout } = useResponsive()

  return (
    <DeferCreateProvider enabled={true} resetKey={characterKey}>
      <Flex
        gap="md"
        align="flex-start"
        style={{
          width: '100%',
          paddingBottom: isMobileLayout ? 80 : 0,
        }}
      >
        {/* ─── Left Column: Form + Grid (1302px) ─── */}
        <Stack gap="md" w={1302}>
          {/* Form Area */}
          <OptimizerForm
            characterKey={characterKey}
            character={character}
            team={team}
            discsBySlot={discsBySlot}
            wengines={filteredWengineKeys}
            sortByKey={sortByKey}
            resultLimit={resultLimit}
            onCharacterChange={onCharacterChange}
            onWengineChange={onWengineChange}
            onSortByChange={setSortByKey}
            onResultLimitChange={setResultLimit}
          />

          {/* Worker/Builds selectors below form */}
          <Flex gap="sm" wrap="wrap">
            <BuildsSelector
              maxBuildsToShow={optConfig.maxBuildsToShow}
              optConfigId={optConfigId}
            />
            <WorkerSelector
              numWorkers={numWorkers}
              setNumWorkers={setNumWorkers}
            />
          </Flex>

          {/* Results Grid */}
          <DeferCreate>
            {isComputingStats ? (
              <Flex
                align="center"
                justify="center"
                style={{
                  width: 1302,
                  height: 300,
                  backgroundColor: 'var(--layer-2)',
                  borderRadius: 6,
                  gap: 8,
                }}
              >
                <Loader size="sm" />
                <Text size="sm" c="dimmed">
                  {t('grid.computingStats', 'Computing build stats...')}
                </Text>
              </Flex>
            ) : (
              <OptimizerGrid
                builds={allBuilds}
                enrichedBuilds={enrichedBuilds}
                pinnedBuild={equippedBuild}
                statDisplay={statDisplay}
                onBuildSelect={(build) => {
                  setSelectedBuild(build)
                }}
              />
            )}
          </DeferCreate>

          {/* Selected build disc preview — always shown, defaults to equipped build */}
          {selectedBuild && (
            <Box
              style={{
                borderRadius: 6,
                padding: 8,
                backgroundColor: 'var(--mantine-color-dark-7)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }}
            >
              <Text size="sm" fw={500} mb="xs">
                {t('grid.selectedBuild', 'Selected Build')} —{' '}
                {Math.floor(selectedBuild.value).toLocaleString()}
              </Text>
              <SelectedBuildDiscs
                discIds={selectedBuild.discIds}
                characterKey={characterKey}
              />
            </Box>
          )}
        </Stack>

        {/* ─── Right Column: Sticky Sidebar (233px) ─── */}
        {!isMobileLayout && (
          <DeferCreate>
            <Box
              style={{
                position: 'sticky',
                top: 253,
                width: 233,
                alignSelf: 'flex-start',
                flexShrink: 0,
              }}
            >
              <Box
                style={{
                  borderRadius: 6,
                  backgroundColor: 'var(--layer-2)',
                  padding: 16,
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <Stack gap={5}>
                  <PermutationsSection isFullSize={true} />
                  <OptimizerControlsSection
                    isFullSize={true}
                    optimizing={optimizing}
                    total={totalPermutations}
                    hasTarget={!!target}
                    statDisplay={statDisplay}
                    onOptimize={onOptimize}
                    onCancel={onCancel}
                    onReset={onReset}
                    onStatDisplayChange={setStatDisplay}
                  />
                  <ResultsSection
                    isFullSize={true}
                    onEquip={onEquip}
                    onFilter={onFilter}
                    onPin={onPin}
                    onClearPins={onClearPins}
                  />
                  <PinnedBuildsSection />
                  <BuildsSection />
                </Stack>
              </Box>
            </Box>
          </DeferCreate>
        )}
      </Flex>

      {/* Mobile bottom bar */}
      {isMobileLayout && (
        <ResponsiveBottomBar
          optimizing={optimizing}
          total={totalPermutations}
          onOptimize={onOptimize}
          onCancel={onCancel}
          onReset={onReset}
        />
      )}

      {/* Disc editor modal (global, opened by clicking disc cards) */}
      <DiscEditorModal />
    </DeferCreateProvider>
  )
}
