import { allDiscSetKeys, discSetNames } from '@genshin-optimizer/zzz/consts'
import { discDefIcon } from '@genshin-optimizer/zzz/assets'
import {
  useCharacterContext,
  useDatabaseContext,
  useTeam,
} from '@genshin-optimizer/zzz/db-ui'
import { conditionals } from '@genshin-optimizer/zzz/formula'
import type { IConditionalData } from '@genshin-optimizer/game-opt/engine'
import { Translate } from '@genshin-optimizer/zzz/i18n'
import { Drawer, Flex, HoverCard, Select, Switch, Text } from '@mantine/core'
import { useMemo, useState } from 'react'

const conditionalIconWidth = 32
const conditionalNameWidth = 200
const conditionalInputWidth = 100
const defaultGap = 5
const columnGap = 6

export function FormSetConditionals({
  show,
  onClose,
}: {
  show: boolean
  onClose: () => void
}) {
  const [hasOpened, setHasOpened] = useState(false)
  if (show && !hasOpened) setHasOpened(true)

  return (
    <Drawer
      opened={show}
      onClose={onClose}
      title="Conditional set effects"
      position="right"
      size={450}
      keepMounted
    >
      {hasOpened && <FormSetConditionalsContent />}
    </Drawer>
  )
}

function FormSetConditionalsContent() {
  const discOptions = useMemo(
    () =>
      allDiscSetKeys.map((key) => {
        const sheetConditionals = (conditionals as Record<string, unknown>)[
          key
        ] as Record<string, IConditionalData> | undefined
        if (!sheetConditionals) return null
        const entries = Object.entries(sheetConditionals)
        if (entries.length === 0) return null
        return (
          <DiscSetConditionalRow key={key} sheet={key} condEntries={entries} />
        )
      }),
    []
  )

  return (
    <Flex direction="column" gap={columnGap}>
      <Flex gap={defaultGap} align="center">
        <div style={{ width: conditionalIconWidth }} />
        <div style={{ width: conditionalNameWidth }} />
      </Flex>
      {discOptions}
    </Flex>
  )
}

function DiscSetConditionalRow({
  sheet,
  condEntries,
}: {
  sheet: string
  condEntries: [string, IConditionalData][]
}) {
  const genNs = `disc_${sheet}_gen`

  return (
    <HoverCard
      width={400}
      position="left"
      withArrow
      openDelay={300}
      closeDelay={200}
    >
      <HoverCard.Target>
        <Flex gap={defaultGap} align="center" style={{ cursor: 'default' }}>
          <div style={{ width: conditionalIconWidth, marginRight: 5 }}>
            <img
              src={discDefIcon(sheet as any)}
              style={{
                width: conditionalIconWidth,
                height: conditionalIconWidth,
                display: 'block',
              }}
              alt=""
            />
          </div>
          <div
            style={{
              width: conditionalNameWidth,
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            {discSetNames[sheet as keyof typeof discSetNames] ?? sheet}
          </div>
          <Flex style={{ flex: 1 }} gap={defaultGap} wrap="wrap">
            {condEntries.map(([condName, condData]) => (
              <ConditionalInput
                key={condName}
                sheet={sheet}
                condName={condName}
                condData={condData}
              />
            ))}
          </Flex>
        </Flex>
      </HoverCard.Target>
      <HoverCard.Dropdown style={{ fontSize: 13 }}>
        <Text fw={600} mb={4} size="sm">
          {discSetNames[sheet as keyof typeof discSetNames] ?? sheet}
        </Text>
        <Flex direction="column" gap={4}>
          <Text size="xs">
            <Translate ns={genNs} key18="desc2" />
          </Text>
          <Text size="xs">
            <Translate ns={genNs} key18="desc4" />
          </Text>
        </Flex>
      </HoverCard.Dropdown>
    </HoverCard>
  )
}

function ConditionalInput({
  sheet,
  condName,
  condData,
}: {
  sheet: string
  condName: string
  condData: IConditionalData
}) {
  const character = useCharacterContext()!
  const { database } = useDatabaseContext()
  const team = useTeam(character.key)
  const currentCond = team?.frames[0]?.conditionals?.find(
    (c) => c.sheet === sheet && c.condKey === condName
  )
  const currentValue = currentCond?.condValue ?? 0

  const setValue = (condValue: number) => {
    database.teams.setFrameConditional(
      character.key,
      0,
      sheet as any,
      condName,
      character.key as any,
      null,
      condValue
    )
  }

  if (condData.type === 'bool') {
    return (
      <Switch
        checked={currentValue > 0}
        onChange={(e) => setValue(e.currentTarget.checked ? 1 : 0)}
        size="xs"
        style={{ width: conditionalInputWidth }}
      />
    )
  }

  if (condData.type === 'num') {
    const min = condData.min ?? 0
    const max = condData.max ?? 10
    const options = Array.from({ length: max - min + 1 }, (_, i) => ({
      label: String(min + i),
      value: String(min + i),
    }))
    return (
      <Select
        data={options}
        value={String(currentValue)}
        onChange={(v) => setValue(v != null ? Number(v) : 0)}
        size="xs"
        style={{ width: conditionalInputWidth }}
        comboboxProps={{ keepMounted: false, width: 160 }}
      />
    )
  }

  return null
}
