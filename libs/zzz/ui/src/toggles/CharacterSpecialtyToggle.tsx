import type { SolidToggleButtonGroupProps } from '@genshin-optimizer/common/ui'
import { ImgIcon, SolidColoredToggleButton } from '@genshin-optimizer/common/ui'
import { handleMultiSelect } from '@genshin-optimizer/common/util'
import { specialityDefIcon } from '@genshin-optimizer/zzz/assets'
import type { SpecialityKey } from '@genshin-optimizer/zzz/consts'
import { allSpecialityKeys } from '@genshin-optimizer/zzz/consts'
import { Badge, Group } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import type { ReactNode } from 'react'

type CharSpecialtyToggleProps = Omit<
  SolidToggleButtonGroupProps,
  'onChange' | 'value'
> & {
  onChange: (value: SpecialityKey[]) => void
  value: SpecialityKey[]
  totals: Record<SpecialityKey, ReactNode>
}

const specaltyTypeHandler = handleMultiSelect([...allSpecialityKeys])
export function CharSpecialtyToggle({
  value,
  totals,
  onChange,
  ...props
}: CharSpecialtyToggleProps) {
  const xs = !useMediaQuery('(min-width: 600px)')
  return (
    <Group {...(props as any)} gap="xs">
      {allSpecialityKeys.map((sk) => (
        <SolidColoredToggleButton
          key={sk}
          value={sk}
          selected={value.includes(sk)}
          style={{
            padding: xs ? 4 : undefined,
            minWidth: xs ? 0 : '6em',
          }}
          onClick={() => onChange(specaltyTypeHandler(value, sk))}
        >
          <ImgIcon src={specialityDefIcon(sk)} size={2} sideMargin />
          <Badge size="sm">{totals[sk]}</Badge>
        </SolidColoredToggleButton>
      ))}
    </Group>
  )
}
