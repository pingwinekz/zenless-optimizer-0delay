import {
  Flex,
  HoverCard,
  NumberInput,
  Select,
  Slider,
  Switch,
  Text,
} from '@mantine/core'
import { IconHelp } from '@tabler/icons-react'
import type { IConditionalData } from '@genshin-optimizer/game-opt/engine'
import type { CharacterKey, WengineKey } from '@genshin-optimizer/zzz/consts'
import {
  useCharacterContext,
  useDatabaseContext,
  useTeam,
} from '@genshin-optimizer/zzz/db-ui'
import { conditionals } from '@genshin-optimizer/zzz/formula'
import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HeaderText } from '../layout'

const inputWidth = 61
const numberWidth = 55
const sliderWidth = 155

const conditionalJustify = 'flex-start'
const conditionalAlign = 'center'

function ConditionalText({
  style,
  children,
}: {
  style?: React.CSSProperties
  children: React.ReactNode
}) {
  return <div style={{ whiteSpace: 'pre-line', ...style }}>{children}</div>
}

function condLabel(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function precisionRound(number: number): number {
  if (number < 1) return Math.round(number * 1000) / 1000
  return Math.round(number * 10) / 10
}

export function WEngineConditionalsDisplay({
  wengineKey,
}: {
  wengineKey: WengineKey
}) {
  const { t } = useTranslation('wengineNames_gen')
  const mainChar = useCharacterContext()!
  const { database } = useDatabaseContext()
  const team = useTeam(mainChar.key)
  const wengineConditionals = (conditionals as any)[wengineKey]
  if (!wengineConditionals) return null

  const condEntries = Object.entries(wengineConditionals) as [
    string,
    IConditionalData,
  ][]
  if (condEntries.length === 0) return null

  return (
    <Flex direction="column" gap={5}>
      <Flex justify="space-between" align="center">
        <HeaderText>{t(wengineKey)} Conditionals</HeaderText>
        <HoverCard
          width={400}
          position="left"
          withArrow
          openDelay={300}
          closeDelay={200}
        >
          <HoverCard.Target>
            <IconHelp size={16} style={{ cursor: 'pointer', opacity: 0.6 }} />
          </HoverCard.Target>
          <HoverCard.Dropdown>
            <Text size="sm">
              Configure conditional buffs for this W-Engine. These affect the
              optimizer's damage calculations when the conditions are met.
            </Text>
          </HoverCard.Dropdown>
        </HoverCard>
      </Flex>
      {condEntries.map(([condName, condData]) => (
        <WengineConditionalRow
          key={condName}
          wengineKey={wengineKey}
          condName={condName}
          condData={condData}
          team={team}
          database={database}
          mainCharKey={mainChar.key}
        />
      ))}
    </Flex>
  )
}

const WengineConditionalRow = memo(function WengineConditionalRow({
  wengineKey,
  condName,
  condData,
  team,
  database,
  mainCharKey,
}: {
  wengineKey: WengineKey
  condName: string
  condData: IConditionalData
  team: ReturnType<typeof useTeam>
  database: ReturnType<typeof useDatabaseContext>['database']
  mainCharKey: CharacterKey
}) {
  const currentCond = team?.frames[0]?.conditionals?.find(
    (c) => c.sheet === wengineKey && c.condKey === condName
  )
  const currentValue = currentCond?.condValue ?? 0

  const setValue = (condValue: number) => {
    database.teams.setFrameConditional(
      mainCharKey,
      0,
      wengineKey as any,
      condName,
      mainCharKey as any,
      null,
      condValue
    )
  }

  const label = condLabel(condName)

  if (condData.type === 'bool') {
    return (
      <Flex justify={conditionalJustify} align={conditionalAlign}>
        <Switch
          style={{ marginRight: 5 }}
          checked={currentValue > 0}
          onChange={(e) => setValue(e.currentTarget.checked ? 1 : 0)}
          size="xs"
        />
        <ConditionalText>{label}</ConditionalText>
      </Flex>
    )
  }

  if (condData.type === 'num') {
    const min = condData.min ?? 0
    const max = condData.max ?? 10
    const step = condData.int_only ? 1 : 0.1

    return (
      <NumConditionalRow
        label={label}
        value={currentValue}
        min={min}
        max={max}
        step={step}
        onChange={setValue}
      />
    )
  }

  if (condData.type === 'list') {
    return (
      <Flex justify={conditionalJustify} align={conditionalAlign}>
        <Select
          style={{ minWidth: 80, width: 80, marginRight: 5 }}
          maxDropdownHeight={500}
          comboboxProps={{ keepMounted: false }}
          data={condData.list.map((item, index) => ({
            label: item,
            value: String(index),
          }))}
          value={String(currentValue)}
          onChange={(v) => setValue(Number(v) || 0)}
          size="xs"
        />
        <ConditionalText>{label}</ConditionalText>
      </Flex>
    )
  }

  return (
    <Text size="xs" c="dimmed">
      {label}: unsupported type
    </Text>
  )
})

const NumConditionalRow = memo(function NumConditionalRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (val: number) => void
}) {
  const [dragState, setDragState] = useState<number | undefined>(undefined)
  const displayValue = dragState ?? value

  return (
    <Flex direction="column" style={{ marginBottom: 0 }}>
      <Flex justify={conditionalJustify} align={conditionalAlign}>
        <div style={{ minWidth: inputWidth, display: 'block' }}>
          <NumberInput
            min={min}
            max={max}
            hideControls
            style={{ width: numberWidth }}
            styles={{ input: { height: 24, minHeight: 24 } }}
            onChange={(newValue) => {
              if (newValue != null && typeof newValue === 'number') {
                onChange(newValue)
              }
            }}
            value={precisionRound(displayValue)}
          />
        </div>
        <ConditionalText style={{ lineHeight: '16px' }}>
          {label}
        </ConditionalText>
      </Flex>

      <Flex align="center" gap={5} h={14}>
        <Slider
          min={min}
          max={max}
          step={step}
          style={{
            minWidth: sliderWidth,
            marginTop: 0,
            marginBottom: 0,
            marginLeft: 1,
          }}
          label={(val) => `${precisionRound(val ?? 0)}`}
          onChange={(newValue) => {
            setDragState(newValue)
          }}
          onChangeEnd={(newValue) => {
            setDragState(undefined)
            onChange(newValue)
          }}
          value={(displayValue ?? min) as number}
        />
        <ConditionalText
          style={{
            minWidth: 20,
            marginBottom: 2,
            textAlign: 'center',
          }}
        >
          {`${precisionRound(max)}`}
        </ConditionalText>
      </Flex>
    </Flex>
  )
})
