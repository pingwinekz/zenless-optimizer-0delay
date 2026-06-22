import { Box, Table, Text } from '@mantine/core'
import { CardThemed } from '@zenless-optimizer/common/ui'
import { getUnitStr, valueString } from '@zenless-optimizer/common/util'
import { useMemo } from 'react'
import type { DiscRarityKey, DiscSubStatKey } from '../../consts'
import { getDiscSubStatBaseVal, statKeyTextMap } from '../../consts'

/**
 * A single substat upgrade entry.
 */
export interface SubstatUpgradeEntry {
  key: DiscSubStatKey
  currentRolls: number
  rarity: DiscRarityKey
  /** Approximate DPS improvement from +1 roll (0-1 scale) */
  dpsImprovement?: number
  /** Approximate EHP improvement from +1 roll (0-1 scale) */
  ehpImprovement?: number
}

const SUBSTAT_LABELS: Partial<Record<DiscSubStatKey, string>> = {
  hp: 'HP',
  atk: 'ATK',
  def: 'DEF',
  hp_: 'HP%',
  atk_: 'ATK%',
  def_: 'DEF%',
  pen: 'PEN',
  crit_: 'CRIT Rate',
  crit_dmg_: 'CRIT DMG',
  anomProf: 'Anomaly Prof.',
}

/**
 * SubstatUpgrades - Table showing the impact of +1 substat roll for each substat.
 * Ranks by DPS and EHP improvement.
 *
 * TODO: Integrate with real solver calc data for computed improvements.
 * Currently renders with placeholder/mock values.
 */
export function SubstatUpgrades({
  upgrades,
}: {
  upgrades?: SubstatUpgradeEntry[]
}) {
  const displayData = useMemo(() => {
    const items = upgrades ?? [
      {
        key: 'crit_' as DiscSubStatKey,
        currentRolls: 8,
        rarity: 'S' as DiscRarityKey,
        dpsImprovement: 0.048,
        ehpImprovement: 0,
      },
      {
        key: 'crit_dmg_' as DiscSubStatKey,
        currentRolls: 6,
        rarity: 'S' as DiscRarityKey,
        dpsImprovement: 0.042,
        ehpImprovement: 0,
      },
      {
        key: 'atk_' as DiscSubStatKey,
        currentRolls: 10,
        rarity: 'S' as DiscRarityKey,
        dpsImprovement: 0.031,
        ehpImprovement: 0,
      },
      {
        key: 'pen' as DiscSubStatKey,
        currentRolls: 3,
        rarity: 'S' as DiscRarityKey,
        dpsImprovement: 0.025,
        ehpImprovement: 0,
      },
      {
        key: 'atk' as DiscSubStatKey,
        currentRolls: 4,
        rarity: 'S' as DiscRarityKey,
        dpsImprovement: 0.018,
        ehpImprovement: 0,
      },
      {
        key: 'hp_' as DiscSubStatKey,
        currentRolls: 2,
        rarity: 'S' as DiscRarityKey,
        dpsImprovement: 0.005,
        ehpImprovement: 0.035,
      },
      {
        key: 'def_' as DiscSubStatKey,
        currentRolls: 1,
        rarity: 'S' as DiscRarityKey,
        dpsImprovement: 0,
        ehpImprovement: 0.028,
      },
      {
        key: 'hp' as DiscSubStatKey,
        currentRolls: 3,
        rarity: 'S' as DiscRarityKey,
        dpsImprovement: 0.002,
        ehpImprovement: 0.022,
      },
      {
        key: 'def' as DiscSubStatKey,
        currentRolls: 2,
        rarity: 'S' as DiscRarityKey,
        dpsImprovement: 0,
        ehpImprovement: 0.015,
      },
      {
        key: 'anomProf' as DiscSubStatKey,
        currentRolls: 0,
        rarity: 'S' as DiscRarityKey,
        dpsImprovement: 0.01,
        ehpImprovement: 0,
      },
    ]

    // Sort by DPS improvement descending
    return [...items].sort(
      (a, b) => (b.dpsImprovement ?? 0) - (a.dpsImprovement ?? 0)
    )
  }, [upgrades])

  return (
    <CardThemed>
      <Box p="md">
        <Text fw={700} size="sm" mb="xs">
          Substat Upgrade Impact
        </Text>
        <Text size="xs" c="dimmed" mb="sm">
          Showing the estimated impact of adding one additional substat roll.
          Rankings help prioritize which substats to improve.
        </Text>

        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Substat</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Current Rolls</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>+1 Roll Value</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>DPS Impact</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>EHP Impact</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {displayData.map((entry) => {
              const label =
                SUBSTAT_LABELS[entry.key] ??
                statKeyTextMap[entry.key] ??
                entry.key
              const rollValue = getDiscSubStatBaseVal(entry.key, entry.rarity)
              const unit = getUnitStr(entry.key)
              const dpsPct = (entry.dpsImprovement ?? 0) * 100
              const ehpPct = (entry.ehpImprovement ?? 0) * 100

              return (
                <Table.Tr key={entry.key}>
                  <Table.Td>
                    <Text size="xs" fw={500}>
                      {label}
                    </Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>
                    <Text size="xs">{entry.currentRolls}</Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>
                    <Text size="xs" c="green">
                      +{valueString(rollValue, unit)}
                    </Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>
                    <Text
                      size="xs"
                      c={
                        dpsPct > 1
                          ? 'green'
                          : dpsPct > 0.5
                            ? 'yellow'
                            : 'dimmed'
                      }
                    >
                      {dpsPct > 0 ? `+${dpsPct.toFixed(1)}%` : '—'}
                    </Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>
                    <Text
                      size="xs"
                      c={
                        ehpPct > 1
                          ? 'green'
                          : ehpPct > 0.5
                            ? 'yellow'
                            : 'dimmed'
                      }
                    >
                      {ehpPct > 0 ? `+${ehpPct.toFixed(1)}%` : '—'}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )
            })}
          </Table.Tbody>
        </Table>

        {/* TODO: Compute real values from solver calc */}
        {/* TODO: Add tooltip explaining how improvements are calculated */}
        {/* TODO: Allow switching between DPS and EHP ranking */}
      </Box>
    </CardThemed>
  )
}
