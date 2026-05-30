import { Flex, HoverCard, Text } from '@mantine/core'
import { IconHelp } from '@tabler/icons-react'
import { FilterRow, HeaderText } from '../layout'

export function MinMaxRatingFilters({
  disabled = false,
}: {
  disabled?: boolean
}) {
  return (
    <Flex direction="column" gap={5}>
      <Flex justify="space-between" align="center">
        <HeaderText>Rating min / max filters</HeaderText>
        <HoverCard width={300} openDelay={200} closeDelay={100}>
          <HoverCard.Target>
            <IconHelp size={16} style={{ cursor: 'pointer', opacity: 0.6 }} />
          </HoverCard.Target>
          <HoverCard.Dropdown>
            <Text fw={600} mb={4}>
              Rating Filters
            </Text>
            <Text size="sm">
              Set minimum or maximum values for build ratings. These filters
              apply to the final build scores.
            </Text>
          </HoverCard.Dropdown>
        </HoverCard>
      </Flex>

      <Flex direction="column" gap={7}>
        <FilterRow
          label="EHP"
          min={undefined}
          max={undefined}
          setMin={() => {}}
          setMax={() => {}}
          disabled={disabled}
        />
        <FilterRow
          label="DPS Score"
          min={undefined}
          max={undefined}
          setMin={() => {}}
          setMax={() => {}}
          disabled={disabled}
        />
        <FilterRow
          label="Anomaly Dmg"
          min={undefined}
          max={undefined}
          setMin={() => {}}
          setMax={() => {}}
          disabled={disabled}
        />
      </Flex>
    </Flex>
  )
}
