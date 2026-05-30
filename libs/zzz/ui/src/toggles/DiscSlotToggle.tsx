import type { SolidToggleButtonGroupProps } from '@genshin-optimizer/common/ui'
import { handleMultiSelect } from '@genshin-optimizer/common/util'
import type { DiscSlotKey } from '@genshin-optimizer/zzz/consts'
import { allDiscSlotKeys } from '@genshin-optimizer/zzz/consts'
import { Badge, Button, Group } from '@mantine/core'
import type { ReactNode } from 'react'

type DiscSlotToggleProps = Omit<
  SolidToggleButtonGroupProps,
  'onChange' | 'value'
> & {
  onChange: (value: DiscSlotKey[]) => void
  value: DiscSlotKey[]
  totals: Record<DiscSlotKey, ReactNode>
}

const slotHandler = handleMultiSelect([...allDiscSlotKeys])

export function DiscSlotToggle({
  value,
  totals,
  onChange,
  ...props
}: DiscSlotToggleProps) {
  return (
    <Group {...(props as any)} gap="xs">
      {allDiscSlotKeys.map((slotKey) => (
        <Button
          key={slotKey}
          variant={value.includes(slotKey) ? 'filled' : 'outline'}
          size="compact-sm"
          onClick={() => onChange(slotHandler(value, slotKey))}
        >
          {slotKey}
          <Badge size="sm" ml={4}>
            {totals[slotKey]}
          </Badge>
        </Button>
      ))}
    </Group>
  )
}
