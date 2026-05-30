import { CardThemed } from '@genshin-optimizer/common/ui'
import { Box, Group, Table, Text } from '@mantine/core'
import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'

/**
 * A single damage tag entry for the pie chart.
 */
export interface DamageTagEntry {
  name: string
  value: number
  color: string
  type: string // 'physical', 'fire', 'ice', 'electric', 'ether', 'wind'
}

const DEFAULT_COLORS = [
  '#4dabf7', // blue
  '#fcc419', // yellow
  '#ff6b6b', // red
  '#38d9a9', // teal
  '#da77f2', // purple
  '#ff922b', // orange
  '#d6336c', // pink
  '#20c997', // green
]

/**
 * DamageTagPieChart - Donut chart showing damage distribution by tag/type.
 * Includes a data table with percentages.
 *
 * TODO: Integrate with real calc data from the solver.
 * Currently renders with placeholder/mock data.
 */
export function DamageTagPieChart({
  data,
}: {
  data?: DamageTagEntry[]
}) {
  const colors = useMemo(
    () => DEFAULT_COLORS.slice(0, data?.length ?? 6),
    [data]
  )

  const chartData = useMemo(() => {
    const items = data ?? [
      { name: 'Physical', value: 42000, color: '#4dabf7', type: 'physical' },
      { name: 'Fire', value: 28000, color: '#ff6b6b', type: 'fire' },
      { name: 'Ice', value: 15000, color: '#38d9a9', type: 'ice' },
      { name: 'Electric', value: 32000, color: '#fcc419', type: 'electric' },
      { name: 'Ether', value: 18000, color: '#da77f2', type: 'ether' },
    ]

    const total = items.reduce((sum, i) => sum + i.value, 0)
    return items.map((i, index) => ({
      ...i,
      color: i.color || colors[index % colors.length],
      percentage: total > 0 ? ((i.value / total) * 100).toFixed(1) : '0',
    }))
  }, [data, colors])

  const totalDmg = chartData.reduce((sum, i) => sum + i.value, 0)

  return (
    <CardThemed>
      <Box p="md">
        <Text fw={700} size="sm" mb="xs">
          Damage Type Distribution
        </Text>
        <Text size="xs" c="dimmed" mb="md">
          Total: {totalDmg.toLocaleString()} &mdash; {chartData.length} types
        </Text>

        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [
                value.toLocaleString(),
                name,
              ]}
              contentStyle={{
                backgroundColor: 'var(--layer-2)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 4,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 10 }} />
          </PieChart>
        </ResponsiveContainer>

        {/* Data table */}
        <Table striped highlightOnHover mt="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Type</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Damage</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>%</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {chartData.map((entry) => (
              <Table.Tr key={entry.name}>
                <Table.Td>
                  <Group gap={4} wrap="nowrap">
                    <Box
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: entry.color,
                        flexShrink: 0,
                      }}
                    />
                    <Text size="xs">{entry.name}</Text>
                  </Group>
                </Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>
                  <Text size="xs">{entry.value.toLocaleString()}</Text>
                </Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>
                  <Text size="xs" c="dimmed">
                    {entry.percentage}%
                  </Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
          <Table.Tfoot>
            <Table.Tr>
              <Table.Th>
                <Text size="xs" fw={700}>
                  Total
                </Text>
              </Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>
                <Text size="xs" fw={700}>
                  {totalDmg.toLocaleString()}
                </Text>
              </Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>
                <Text size="xs" fw={700}>
                  100%
                </Text>
              </Table.Th>
            </Table.Tr>
          </Table.Tfoot>
        </Table>

        {/* TODO: Integrate with real calc data from solver */}
        {/* TODO: Add click interaction to filter by damage type */}
      </Box>
    </CardThemed>
  )
}
