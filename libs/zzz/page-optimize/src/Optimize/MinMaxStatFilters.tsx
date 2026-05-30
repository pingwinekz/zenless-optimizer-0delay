import type { StatFilterStatKey, StatFilters } from '@genshin-optimizer/zzz/db'
import {
  OptConfigContext,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import { Flex, HoverCard, Text } from '@mantine/core'
import { IconHelp } from '@tabler/icons-react'
import { useCallback, useContext } from 'react'
import { FilterRow, FormStatTextStyled, HeaderText } from '../layout'

const statFilterStatKeys: StatFilterStatKey[] = [
  'hp',
  'def',
  'atk',
  'crit_',
  'crit_dmg_',
  'pen',
  'pen_',
  'enerRegen_',
  'enerRegen',
  'anomProf',
  'anomMas',
  'impact',
  'dazeInc_',
  'sheerForce',
  'dmg_',
]

const statLabels: Record<StatFilterStatKey, string> = {
  hp: 'HP',
  def: 'DEF',
  atk: 'ATK',
  crit_: 'CR',
  crit_dmg_: 'CD',
  pen: 'PEN',
  pen_: 'PEN%',
  enerRegen_: 'ERR%',
  enerRegen: 'ERR',
  anomProf: 'AP',
  anomMas: 'AM',
  impact: 'Impact',
  dazeInc_: 'Daze%',
  sheerForce: 'SF',
  dmg_: 'DMG%',
}

export function MinMaxStatFilters({
  disabled = false,
}: {
  disabled?: boolean
}) {
  const {
    optConfigId,
    optConfig: { statFilters },
  } = useContext(OptConfigContext)

  const { database } = useDatabaseContext()

  const setStatFilters = useCallback(
    (statFilters: StatFilters) =>
      database.optConfigs.set(optConfigId, { statFilters }),
    [database, optConfigId]
  )

  const updateFilter = useCallback(
    (index: number, field: 'value' | 'isMax', value: number | boolean) => {
      const updated = structuredClone(statFilters)
      if (index >= 0 && index < updated.length) {
        if (field === 'value') {
          updated[index].value = value as number
        } else {
          updated[index].isMax = value as boolean
        }
        setStatFilters(updated)
      }
    },
    [statFilters, setStatFilters]
  )

  const addFilter = useCallback(
    (q: StatFilterStatKey) => {
      const updated = structuredClone(statFilters)
      const existing = updated.findIndex((f) => f.tag.q === q && !f.isMax)
      if (existing === -1) {
        updated.push({
          tag: { q, qt: 'final' },
          value: 0,
          isMax: false,
          disabled: false,
        })
      }
      setStatFilters(updated)
    },
    [statFilters, setStatFilters]
  )

  const addMaxFilter = useCallback(
    (q: StatFilterStatKey) => {
      const updated = structuredClone(statFilters)
      const existing = updated.findIndex((f) => f.tag.q === q && f.isMax)
      if (existing === -1) {
        updated.push({
          tag: { q, qt: 'final' },
          value: 0,
          isMax: true,
          disabled: false,
        })
      }
      setStatFilters(updated)
    },
    [statFilters, setStatFilters]
  )

  const clearFilter = useCallback(
    (q: StatFilterStatKey) => {
      const updated = structuredClone(statFilters)
      const filtered = updated.filter((f) => !(f.tag.q === q))
      setStatFilters(filtered)
    },
    [statFilters, setStatFilters]
  )

  return (
    <Flex direction="column" gap={5}>
      <Flex justify="space-between" align="center">
        <HeaderText>Stat min / max filters</HeaderText>
        <HoverCard width={300} openDelay={200} closeDelay={100}>
          <HoverCard.Target>
            <IconHelp size={16} style={{ cursor: 'pointer', opacity: 0.6 }} />
          </HoverCard.Target>
          <HoverCard.Dropdown>
            <Text fw={600} mb={4}>
              Stat Filters
            </Text>
            <Text size="sm">
              Set minimum or maximum values for each stat. The optimizer will
              only return builds that meet these thresholds.
            </Text>
          </HoverCard.Dropdown>
        </HoverCard>
      </Flex>

      <Flex direction="column" gap={7}>
        {statFilterStatKeys.map((statKey) => {
          const minFilter = statFilters.find(
            (f) => f.tag.q === statKey && !f.isMax
          )
          const maxFilter = statFilters.find(
            (f) => f.tag.q === statKey && f.isMax
          )
          return (
            <FilterRow
              key={statKey}
              label={
                <FormStatTextStyled>{statLabels[statKey]}</FormStatTextStyled>
              }
              min={minFilter?.value}
              max={maxFilter?.value}
              setMin={(val) => {
                if (val === undefined) {
                  clearFilter(statKey)
                } else {
                  if (!minFilter) addFilter(statKey)
                  const idx = statFilters.findIndex(
                    (f) => f.tag.q === statKey && !f.isMax
                  )
                  if (idx >= 0) updateFilter(idx, 'value', val)
                }
              }}
              setMax={(val) => {
                if (val === undefined) {
                  clearFilter(statKey)
                } else {
                  if (!maxFilter) addMaxFilter(statKey)
                  const idx = statFilters.findIndex(
                    (f) => f.tag.q === statKey && f.isMax
                  )
                  if (idx >= 0) updateFilter(idx, 'value', val)
                }
              }}
              disabled={disabled}
            />
          )
        })}
      </Flex>
    </Flex>
  )
}
