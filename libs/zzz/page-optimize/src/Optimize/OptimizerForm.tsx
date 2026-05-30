import { FilterContainer, FormCard, FormRow, HeaderText } from '../layout'
import { OptimizerMenuIds } from '../layout/optimizerMenuIds'
import { CharacterSelectorDisplay } from '../CharacterSelectorDisplay'
import { CharacterPreviewPanel } from '../CharacterPreviewPanel'
import { OptTargetSelector } from '../OptTargetSelector'
import { CritModeSelector } from '../OptTargetRow/CritModeSelector'
import { SpecificDmgTypeSelector } from '../OptTargetRow/SpecificDmgTypeSelector'
import { AfterShockToggleButton } from '../AfterShockToggleButton'
import { CharacterConditionalsDisplay } from './CharacterConditionalsDisplay'
import { WEngineConditionalsDisplay } from './WEngineConditionalsDisplay'
import { MinMaxStatFilters } from './MinMaxStatFilters'
import { DiscMainSetFilters } from './DiscMainSetFilters'
import {
  StatSimulationDisplay,
  SimulationInputs,
  SimulationManager,
} from '../Simulation'
import { EnemyStatsSection } from '../EnemyStats'
import { AnomalySection } from '../Anomaly'
import { DeadlyAssaultBuffs } from '../DeadlyAssaultBuffs'
import { ShiyuDefenseBuffs } from '../ShiyuDefenseBuffs'
import type {
  ICachedCharacter,
  Team,
  ICachedDisc,
} from '@genshin-optimizer/zzz/db'
import { getTeamFrame0 } from '@genshin-optimizer/zzz/db'
import {
  OptConfigContext,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import type {
  DiscSlotKey,
  CharacterKey,
  WengineKey,
} from '@genshin-optimizer/zzz/consts'
import { TeammatesSection } from './TeammatesSection'
import {
  Button,
  Divider,
  Drawer,
  Flex,
  HoverCard,
  Select,
  Switch,
  Text,
} from '@mantine/core'
import { IconHelp, IconSettings } from '@tabler/icons-react'
import { useCallback, useContext, useState } from 'react'

export function OptimizerForm({
  characterKey,
  character,
  team,
  discsBySlot,
  wengines,
  disabled,
  sortByKey,
  resultLimit,
  onCharacterChange,
  onWengineChange,
  onSortByChange,
  onResultLimitChange,
}: {
  characterKey: CharacterKey
  character: ICachedCharacter
  team: Team
  discsBySlot: Record<DiscSlotKey, ICachedDisc[]>
  wengines: WengineKey[]
  disabled?: boolean
  sortByKey?: string
  resultLimit?: number
  onCharacterChange: (ck: CharacterKey) => void
  onWengineChange: (wengineKey: WengineKey | '') => void
  onSortByChange: (key: string) => void
  onResultLimitChange: (limit: number) => void
}) {
  const { database } = useDatabaseContext()
  const { tag: target } = getTeamFrame0(team)
  const isRotation = !!target?.rotation
  const isAftershock = target?.damageType2 === 'aftershock'
  const setAftershock = useCallback(
    (aftershock: boolean) =>
      database.teams.setFrame0(characterKey, (frame) => {
        const { tag: oldTarget = {} } = frame
        const { damageType2, ...oTarget } = oldTarget
        if (!aftershock) return { tag: oTarget }
        return {
          tag: {
            ...oTarget,
            damageType2: 'aftershock',
          },
        }
      }),
    [database, characterKey]
  )

  const [activeDrawer, setActiveDrawer] = useState<string | null>(null)

  const wengineKey: WengineKey | '' = character.wengineKey || ''

  return (
    <FilterContainer>
      {/* ── Character options (5-card layout matching fribbels) ── */}
      <FormRow id={OptimizerMenuIds.characterOptions}>
        {/* Card 1: Character art + W-Engine preview — 248px wide, self-styled */}
        <CharacterPreviewPanel
          characterKey={characterKey}
          onCharacterChange={onCharacterChange}
          onWengineChange={onWengineChange}
        />

        {/* Card 2: Character + W-Engine selectors, Presets, Optimization Target */}
        <FormCard>
          <CharacterSelectorDisplay
            characterKey={characterKey}
            onCharacterChange={onCharacterChange}
            wengineKey={character.wengineKey || ''}
            onWengineChange={onWengineChange}
            sortByKey={sortByKey}
            resultLimit={resultLimit}
            onSortByChange={onSortByChange}
            onResultLimitChange={onResultLimitChange}
          />
        </FormCard>

        {/* Card 3: Character conditionals */}
        <FormCard>
          <CharacterConditionalsDisplay characterKey={characterKey} />
        </FormCard>

        {/* Card 4: W-Engine conditionals + Advanced Options */}
        <FormCard justify="space-between">
          {wengineKey && (
            <>
              <WEngineConditionalsDisplay wengineKey={wengineKey} />
              <Divider my="xs" />
            </>
          )}
          <Flex direction="column" gap={5}>
            <HeaderText style={{ marginTop: 25 }}>Advanced options</HeaderText>
            <Button
              variant="default"
              leftSection={<IconSettings size={16} />}
              onClick={() => setActiveDrawer('damage')}
            >
              Damage Configuration
            </Button>
            <Button
              variant="default"
              leftSection={<IconSettings size={16} />}
              onClick={() => setActiveDrawer('enemy')}
            >
              Enemy Configurations
            </Button>
            <Button
              variant="default"
              leftSection={<IconSettings size={16} />}
              onClick={() => setActiveDrawer('buffs')}
            >
              Extra Combat Buffs
            </Button>
          </Flex>
        </FormCard>

        {/* Card 5: Optimizer Options (switches matching fribbels' OptimizerOptionsDisplay) */}
        <FormCard>
          <OptimizerOptionsSection disabled={disabled} />
        </FormCard>
      </FormRow>

      {/* ── Relic & stat filters (consolidated) ── */}
      <FormRow id={OptimizerMenuIds.relicAndStatFilters}>
        {/* Optimization Target */}
        <FormCard size="small">
          <OptTargetSelector character={character} team={team} />
        </FormCard>

        {/* Disc main set filters + set conditionals */}
        <FormCard size="small">
          <DiscMainSetFilters
            discsBySlot={discsBySlot}
            wengines={wengines}
            disabled={disabled}
          />
        </FormCard>

        {/* Stat min/max filters */}
        <FormCard size="small">
          <MinMaxStatFilters disabled={disabled} />
        </FormCard>
      </FormRow>

      {/* ── Teammates ── */}
      <FormRow id={OptimizerMenuIds.teammates}>
        <FormCard size="large" style={{ padding: 16 }}>
          <TeammatesSection />
        </FormCard>
      </FormRow>

      {/* ── Advanced Options Drawers ── */}
      <Drawer
        opened={activeDrawer === 'damage'}
        onClose={() => setActiveDrawer(null)}
        title="Damage Configuration"
        position="right"
        size={400}
      >
        <Flex direction="column" gap="xs">
          {isRotation ? (
            <Text size="sm" c="dimmed">
              Rotation DMG targets do not use individual damage configuration
              options.
            </Text>
          ) : (
            <>
              <CritModeSelector />
              <SpecificDmgTypeSelector />
              {target?.name === 'standardDmgInst' ||
              target?.name === 'sheerDmgInst' ? (
                <AfterShockToggleButton
                  isAftershock={isAftershock}
                  setAftershock={setAftershock}
                />
              ) : null}
            </>
          )}
        </Flex>
      </Drawer>

      <Drawer
        opened={activeDrawer === 'enemy'}
        onClose={() => setActiveDrawer(null)}
        title="Enemy Configurations"
        position="right"
        size={900}
      >
        <EnemyStatsSection />
      </Drawer>

      <Drawer
        opened={activeDrawer === 'buffs'}
        onClose={() => setActiveDrawer(null)}
        title="Extra Combat Buffs"
        position="right"
        size={900}
      >
        <Flex direction="column" gap="xs">
          <AnomalySection />
          <Divider />
          <DeadlyAssaultBuffs />
          <Divider />
          <ShiyuDefenseBuffs />
        </Flex>
      </Drawer>

      {/* ── Character custom stats simulation ── */}
      <FormRow id={OptimizerMenuIds.characterStatsSimulation}>
        <FormCard size="medium">
          <StatSimulationDisplay />
        </FormCard>
        <FormCard size="medium">
          <SimulationInputs />
        </FormCard>
        <FormCard size="small">
          <SimulationManager />
        </FormCard>
      </FormRow>
    </FilterContainer>
  )
}

/** Fribbels-style Optimizer Options section */
function OptimizerOptionsSection({ disabled }: { disabled?: boolean }) {
  const { optConfigId, optConfig } = useContext(OptConfigContext)
  const { database } = useDatabaseContext()

  const setOption = useCallback(
    <K extends keyof typeof optConfig>(
      field: K,
      value: (typeof optConfig)[K]
    ) => {
      database.optConfigs.set(optConfigId, { [field]: value })
    },
    [database, optConfigId]
  )

  const minEnhanceOptions = [
    { value: '0', label: '+0' },
    { value: '3', label: '+3' },
    { value: '6', label: '+6' },
    { value: '9', label: '+9' },
    { value: '12', label: '+12' },
    { value: '15', label: '+15' },
  ]

  return (
    <Flex direction="column" gap={5}>
      <Flex justify="space-between" align="center">
        <HeaderText>Optimizer options</HeaderText>
        <HoverCard
          width={400}
          position="left"
          withArrow
          openDelay={300}
          closeDelay={200}
        >
          <HoverCard.Target>
            <IconHelp size={16} style={{ cursor: 'pointer', opacity: 0.6 }} />
          </HoverCard.Target>
          <HoverCard.Dropdown>
            <Text size="sm">
              Configure which discs and W-Engines the optimizer considers.
            </Text>
          </HoverCard.Dropdown>
        </HoverCard>
      </Flex>

      <Flex align="center">
        <Switch
          checked={!!optConfig.useEquipped}
          onChange={(e) => setOption('useEquipped', e.currentTarget.checked)}
          disabled={disabled}
          size="xs"
        />
        <Text size="xs">Use Equipped Discs</Text>
      </Flex>

      {optConfig.useEquipped && (
        <Flex align="center">
          <Switch
            checked={!!optConfig.useCharacterPriority}
            onChange={(e) =>
              setOption('useCharacterPriority', e.currentTarget.checked)
            }
            disabled={disabled}
            size="xs"
          />
          <Text size="xs">Use Character Priority</Text>
        </Flex>
      )}

      <Flex align="center">
        <Switch
          checked={!!optConfig.includeOffsets}
          onChange={(e) => setOption('includeOffsets', e.currentTarget.checked)}
          disabled={disabled}
          size="xs"
        />
        <Text size="xs">Include Offsets</Text>
      </Flex>

      <Flex align="center">
        <Switch
          checked={!!optConfig.optWengine}
          onChange={(e) => setOption('optWengine', e.currentTarget.checked)}
          disabled={disabled}
          size="xs"
        />
        <Text size="xs">Optimize W-Engine</Text>
      </Flex>

      {optConfig.optWengine && (
        <Flex align="center">
          <Switch
            checked={!!optConfig.useEquippedWengine}
            onChange={(e) =>
              setOption('useEquippedWengine', e.currentTarget.checked)
            }
            disabled={disabled}
            size="xs"
          />
          <Text size="xs">Use Equipped W-Engine</Text>
        </Flex>
      )}

      <Flex justify="space-between">
        <Flex direction="column" gap={2}>
          <HeaderText>Min enhance</HeaderText>
          <Select
            data={minEnhanceOptions}
            value={String(optConfig.levelLow)}
            onChange={(val) => {
              if (val == null) return
              const v = Number(val)
              setOption('levelLow', v)
              if (optConfig.levelHigh < v) setOption('levelHigh', v)
            }}
            size="xs"
            disabled={disabled}
            style={{ width: 90 }}
          />
        </Flex>
      </Flex>
    </Flex>
  )
}
