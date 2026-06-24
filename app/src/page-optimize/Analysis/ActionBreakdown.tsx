import { Box, Group, Table, Text } from '@mantine/core'
import { CardThemed } from '@zenless-optimizer/common/ui'
import { useMemo } from 'react'
import { FullTagDisplay } from '../../formula-ui/components'
import type { AnalysisData } from './ExpandedDataPanelController'

const DAMAGE_COLORS = [
  '#4dabf7',
  '#fcc419',
  '#ff6b6b',
  '#38d9a9',
  '#da77f2',
  '#ff922b',
]

export function ActionBreakdown({
  analysisData,
}: {
  analysisData: AnalysisData
}) {
  const { targetInfo } = analysisData

  const displayActions = useMemo(() => {
    if (!targetInfo?.perActionDamage.length) return []
    return [...targetInfo.perActionDamage].sort((a, b) => b.value - a.value)
  }, [targetInfo])

  const actionStats =
    displayActions.length > 0
      ? (displayActions[0].buffedStats ?? analysisData.selectedStats)
      : analysisData.selectedStats

  if (!targetInfo || displayActions.length === 0) {
    return (
      <CardThemed>
        <Box p="md">
          <Text fw={700} size="sm" mb="xs">
            Optimization Target
          </Text>
          <Text size="xs" c="dimmed">
            Select an optimization target to see its breakdown.
          </Text>
        </Box>
      </CardThemed>
    )
  }

  const totalDmg = displayActions.reduce((s, a) => s + a.value, 0)
  const isRotation = displayActions.length > 1

  return (
    <CardThemed>
      <Box p="md">
        <Text fw={700} size="sm" mb="xs">
          Action Breakdown
        </Text>

        {displayActions.length > 0 && (
          <>
            <Box mb="sm">
              {displayActions.map((entry, i) => {
                const pct = totalDmg > 0 ? (entry.value / totalDmg) * 100 : 0
                return (
                  <Box key={entry.name} mb="xs">
                    <Group gap="xs" wrap="nowrap" mb={2}>
                      <Box
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 2,
                          backgroundColor:
                            DAMAGE_COLORS[i % DAMAGE_COLORS.length],
                          flexShrink: 0,
                        }}
                      />
                      <Box style={{ flex: 1 }}>
                        <FullTagDisplay tag={entry.tag} />
                      </Box>
                      <Text
                        size="xs"
                        fw={600}
                        style={{ textAlign: 'right', width: 100 }}
                      >
                        {Math.floor(entry.value).toLocaleString()}
                      </Text>
                      {isRotation && (
                        <Text
                          size="xs"
                          c="dimmed"
                          style={{ textAlign: 'right', width: 50 }}
                        >
                          {pct.toFixed(1)}%
                        </Text>
                      )}
                    </Group>
                  </Box>
                )
              })}
            </Box>

            {isRotation && (
              <Box
                style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: 6,
                  marginBottom: 10,
                }}
              >
                <Group gap="xs" wrap="nowrap">
                  <Text size="xs" fw={700} style={{ flex: 1 }}>
                    Total
                  </Text>
                  <Text
                    size="xs"
                    fw={700}
                    style={{ textAlign: 'right', width: 100 }}
                  >
                    {Math.floor(totalDmg).toLocaleString()}
                  </Text>
                  <Text
                    size="xs"
                    c="dimmed"
                    style={{ textAlign: 'right', width: 50 }}
                  >
                    100%
                  </Text>
                </Group>
              </Box>
            )}

            {actionStats && (
              <Table striped highlightOnHover mt="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Stat</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>Value</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  <Table.Tr>
                    <Table.Td>
                      <Text size="xs">ATK</Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'right' }}>
                      <Text size="xs">
                        {Math.round(actionStats.atk).toLocaleString()}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td>
                      <Text size="xs">DMG Bonus</Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'right' }}>
                      <Text size="xs">
                        {(actionStats.dmgBonus * 100).toFixed(1)}%
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td>
                      <Text size="xs">CRIT Rate</Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'right' }}>
                      <Text size="xs">
                        {(actionStats.critRate * 100).toFixed(1)}%
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td>
                      <Text size="xs">CRIT DMG</Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'right' }}>
                      <Text size="xs">
                        {(actionStats.critDmg * 100).toFixed(1)}%
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td>
                      <Text size="xs">PEN Ratio</Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'right' }}>
                      <Text size="xs">
                        {(actionStats.penRatio * 100).toFixed(1)}%
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td>
                      <Text size="xs">Impact</Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'right' }}>
                      <Text size="xs">
                        {Math.round(actionStats.impact).toLocaleString()}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
            )}
          </>
        )}
      </Box>
    </CardThemed>
  )
}
