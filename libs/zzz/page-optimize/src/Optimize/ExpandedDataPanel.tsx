import { Accordion, Box, Text } from '@mantine/core'
import { useState } from 'react'
import { DamageSplitsChart } from '../Analysis/DamageSplitsChart'
import { DamageTagPieChart } from '../Analysis/DamageTagPieChart'
import { StatsDiffCard } from '../Analysis/StatsDiffCard'
import { SubstatUpgrades } from '../Analysis/SubstatUpgrades'
import { TeammateUpgrades } from '../Analysis/TeammateUpgrades'

const ACCORDION_IDS = [
  'statComparison',
  'damageSplits',
  'damageDistribution',
  'substatUpgrades',
  'teammateUpgrades',
] as const

export function ExpandedDataPanel() {
  const [expandedSections, setExpandedSections] =
    useState<string[]>(ACCORDION_IDS)

  return (
    <Box
      style={{
        padding: 'var(--mantine-spacing-md)',
        borderRadius: 6,
        backgroundColor: 'var(--layer-2)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <Text fw={700} size="sm" mb="xs">
        Analysis & Data Panel
      </Text>
      <Text size="xs" c="dimmed" mb="md">
        Detailed analysis for the selected build. Expand sections to view stat
        comparisons, damage splits, upgrade recommendations, and more.
      </Text>

      <Accordion
        multiple
        value={expandedSections}
        onChange={(values) => setExpandedSections(values as string[])}
        variant="contained"
        chevronPosition="right"
        styles={{ item: { border: 'none' } }}
      >
        <Accordion.Item value="statComparison">
          <Accordion.Control>
            <Text size="sm" fw={600}>
              Stat Comparison
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <StatsDiffCard />
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="damageSplits">
          <Accordion.Control>
            <Text size="sm" fw={600}>
              Damage Splits
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <DamageSplitsChart />
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="damageDistribution">
          <Accordion.Control>
            <Text size="sm" fw={600}>
              Damage Type Distribution
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <DamageTagPieChart />
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="substatUpgrades">
          <Accordion.Control>
            <Text size="sm" fw={600}>
              Substat Upgrade Recommendations
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <SubstatUpgrades />
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="teammateUpgrades">
          <Accordion.Control>
            <Text size="sm" fw={600}>
              Teammate Upgrade Recommendations
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <TeammateUpgrades />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      {/* TODO: Integrate with real data from solver */}
      {/*
       * Data flow:
       * - StatsDiffCard: needs current build stats + compared build stats
       * - DamageSplitsChart: needs damage breakdown by ability type from calc
       * - DamageTagPieChart: needs damage breakdown by elemental type from calc
       * - SubstatUpgrades: needs current build's substat distribution + calc
       * - TeammateUpgrades: needs team composition + calc
       */}
    </Box>
  )
}
