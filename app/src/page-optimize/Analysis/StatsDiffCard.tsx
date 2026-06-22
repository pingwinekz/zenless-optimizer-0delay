import { Box, Group, Table, Text } from '@mantine/core'
import { CardThemed } from '@zenless-optimizer/common/ui'
import { getUnitStr, valueString } from '@zenless-optimizer/common/util'
import type { StatKey } from '../../consts'
import { statKeyTextMap } from '../../consts'

/**
 * A stat entry representing a single stat value for comparison.
 */
export interface StatEntry {
  key: StatKey
  label?: string
  current: number
  improved?: number
}

/**
 * StatsDiffCard - Side-by-side stat comparison table.
 * Displays current vs improved stat values, highlighting improvements/degradations.
 *
 * TODO: Integrate with real calc data from the solver.
 * Currently renders with placeholder/mock data structure.
 */
export function StatsDiffCard({
  stats,
  title = 'Stat Comparison',
}: {
  stats?: StatEntry[]
  title?: string
}) {
  // Placeholder mock data if none provided
  const displayStats = stats ?? [
    { key: 'atk' as StatKey, current: 1850, improved: 2100 },
    { key: 'hp' as StatKey, current: 12500, improved: 13200 },
    { key: 'def' as StatKey, current: 680, improved: 720 },
    { key: 'crit_' as StatKey, current: 0.52, improved: 0.58 },
    { key: 'crit_dmg_' as StatKey, current: 1.05, improved: 1.2 },
    { key: 'pen_' as StatKey, current: 0.24, improved: 0.28 },
    { key: 'anomProf' as StatKey, current: 120, improved: 140 },
  ]

  // TODO: When integrating real data, compute improved value from solver
  // and highlight differences with color coding

  return (
    <CardThemed>
      <Box p="md">
        <Text fw={700} size="sm" mb="sm">
          {title}
        </Text>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Stat</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Current</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Improved</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Change</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {displayStats.map((stat) => {
              const label = stat.label ?? statKeyTextMap[stat.key] ?? stat.key
              const improved = stat.improved ?? stat.current
              const diff = improved - stat.current
              const unit = getUnitStr(stat.key)
              const isImprovement = diff > 0
              const isDegradation = diff < 0

              return (
                <Table.Tr key={stat.key}>
                  <Table.Td>
                    <Text size="xs" fw={500}>
                      {label}
                    </Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>
                    <Text size="xs" c="dimmed">
                      {valueString(stat.current, unit)}
                    </Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>
                    <Text
                      size="xs"
                      fw={600}
                      c={
                        isImprovement
                          ? 'green'
                          : isDegradation
                            ? 'red'
                            : undefined
                      }
                    >
                      {valueString(improved, unit)}
                    </Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>
                    <Text
                      size="xs"
                      c={
                        isImprovement
                          ? 'green'
                          : isDegradation
                            ? 'red'
                            : 'dimmed'
                      }
                    >
                      {isImprovement && '+'}
                      {valueString(diff, unit)}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )
            })}
          </Table.Tbody>
        </Table>
      </Box>
    </CardThemed>
  )
}

export function StatsDiffRow({
  label,
  current,
  improved,
}: {
  label: string
  current: string
  improved: string
}) {
  const currentNum = parseFloat(current)
  const improvedNum = parseFloat(improved)
  const diff = improvedNum - currentNum
  const isImprovement = diff > 0
  const isDegradation = diff < 0

  return (
    <Group gap="xs" justify="apart" wrap="nowrap">
      <Text size="xs" style={{ flex: 1, minWidth: 80 }}>
        {label}
      </Text>
      <Text size="xs" c="dimmed" style={{ textAlign: 'right', width: 80 }}>
        {current}
      </Text>
      <Text
        size="xs"
        fw={600}
        c={isImprovement ? 'green' : isDegradation ? 'red' : undefined}
        style={{ textAlign: 'right', width: 80 }}
      >
        {improved}
      </Text>
      <Text
        size="xs"
        c={isImprovement ? 'green' : isDegradation ? 'red' : 'dimmed'}
        style={{ textAlign: 'right', width: 80 }}
      >
        {isImprovement && '+'}
        {diff.toFixed(2)}
      </Text>
    </Group>
  )
}
