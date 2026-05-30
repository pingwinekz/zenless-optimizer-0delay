import { Flex } from '@mantine/core'
import type { ReactNode } from 'react'
import { InputNumberStyled } from './InputNumberStyled'
import { FormStatTextStyled } from './FormStatTextStyled'

export function FilterRow({
  label,
  min,
  max,
  setMin,
  setMax,
  disabled,
}: {
  label: string | ReactNode
  min: number | undefined
  max: number | undefined
  setMin: (val: number | undefined) => void
  setMax: (val: number | undefined) => void
  disabled?: boolean
}) {
  return (
    <Flex justify="space-between" style={{ margin: 0 }}>
      <InputNumberStyled
        hideControls
        style={{ margin: 0, width: 63 }}
        value={min}
        onChange={(val) => setMin(val === '' ? undefined : Number(val))}
        disabled={disabled}
      />
      <FormStatTextStyled>{label}</FormStatTextStyled>
      <InputNumberStyled
        hideControls
        style={{ margin: 0, width: 63 }}
        value={max}
        onChange={(val) => setMax(val === '' ? undefined : Number(val))}
        disabled={disabled}
      />
    </Flex>
  )
}
