import { CardThemed } from '@genshin-optimizer/common/ui'
import type {
  CharacterKey,
  DiscSetKey,
  WengineKey,
} from '@genshin-optimizer/zzz/consts'
import { Box, Table, Text } from '@mantine/core'
import { useMemo } from 'react'

/**
 * A single teammate upgrade recommendation entry.
 */
export interface TeammateUpgradeEntry {
  /** Description of the change (e.g., "Swap set to Freedom Blues", "Add Nicole") */
  description: string
  /** Estimated DPS improvement (0-1 scale) */
  dpsImprovement?: number
  /** Estimated EHP improvement (0-1 scale) */
  ehpImprovement?: number
  /** Category: 'set', 'swap', 'wengine' */
  category: 'set' | 'swap' | 'wengine'
  /** Optional character key for swap recommendations */
  characterKey?: CharacterKey
  /** Optional disc set key for set recommendations */
  discSetKey?: DiscSetKey
  /** Optional wengine key for wengine recommendations */
  wengineKey?: WengineKey
}

/**
 * TeammateUpgrades - Table showing the effect of changing teammate
 * disc sets, W-Engines, or swapping teammates entirely.
 *
 * TODO: Integrate with real solver calc data for computed improvements.
 * Currently renders with placeholder/mock values.
 */
export function TeammateUpgrades({
  upgrades,
}: {
  upgrades?: TeammateUpgradeEntry[]
}) {
  const displayData = useMemo(() => {
    const items = upgrades ?? [
      {
        description: 'Add Nicole (Support)',
        dpsImprovement: 0.085,
        ehpImprovement: 0,
        category: 'swap' as const,
      },
      {
        description: 'Add Lucy (Support)',
        dpsImprovement: 0.062,
        ehpImprovement: 0.01,
        category: 'swap' as const,
      },
      {
        description: 'Teammate 4-pc: Freedom Blues',
        dpsImprovement: 0.045,
        ehpImprovement: 0,
        category: 'set' as const,
      },
      {
        description: 'Teammate W-Engine: Slice of Time',
        dpsImprovement: 0.038,
        ehpImprovement: 0,
        category: 'wengine' as const,
      },
      {
        description: 'Teammate 4-pc: Swing Jazz',
        dpsImprovement: 0.022,
        ehpImprovement: 0,
        category: 'set' as const,
      },
      {
        description: 'Teammate W-Engine: Bashful Demon',
        dpsImprovement: 0.015,
        ehpImprovement: 0.025,
        category: 'wengine' as const,
      },
      {
        description: 'Teammate 2-pc: Proto Punk',
        dpsImprovement: 0.008,
        ehpImprovement: 0.05,
        category: 'set' as const,
      },
    ]

    return [...items].sort(
      (a, b) => (b.dpsImprovement ?? 0) - (a.dpsImprovement ?? 0)
    )
  }, [upgrades])

  const categoryLabel = (cat: 'set' | 'swap' | 'wengine') => {
    switch (cat) {
      case 'swap':
        return 'Swap'
      case 'set':
        return 'Set'
      case 'wengine':
        return 'W-Engine'
    }
  }

  const categoryColor = (cat: 'set' | 'swap' | 'wengine') => {
    switch (cat) {
      case 'swap':
        return 'blue'
      case 'set':
        return 'teal'
      case 'wengine':
        return 'violet'
    }
  }

  return (
    <CardThemed>
      <Box p="md">
        <Text fw={700} size="sm" mb="xs">
          Teammate Upgrade Recommendations
        </Text>
        <Text size="xs" c="dimmed" mb="sm">
          Estimated improvements from changing teammate configurations. Sorted
          by DPS impact (highest first).
        </Text>

        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Change</Table.Th>
              <Table.Th>Category</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>DPS Impact</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>EHP Impact</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {displayData.map((entry, index) => {
              const dpsPct = (entry.dpsImprovement ?? 0) * 100
              const ehpPct = (entry.ehpImprovement ?? 0) * 100

              return (
                <Table.Tr key={index}>
                  <Table.Td>
                    <Text size="xs" fw={500}>
                      {entry.description}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" c={categoryColor(entry.category)} fw={500}>
                      {categoryLabel(entry.category)}
                    </Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>
                    <Text
                      size="xs"
                      c={
                        dpsPct > 5 ? 'green' : dpsPct > 2 ? 'yellow' : 'dimmed'
                      }
                    >
                      {dpsPct > 0 ? `+${dpsPct.toFixed(1)}%` : '—'}
                    </Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>
                    <Text
                      size="xs"
                      c={
                        ehpPct > 3 ? 'green' : ehpPct > 1 ? 'yellow' : 'dimmed'
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
        {/* TODO: Show actual teammate names from roster instead of descriptions */}
        {/* TODO: Add "Apply" button to equip recommended configuration */}
      </Box>
    </CardThemed>
  )
}
