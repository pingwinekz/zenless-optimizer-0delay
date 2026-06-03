import { allDiscSetKeys, discSetNames } from '@genshin-optimizer/zzz/consts'
import { discDefIcon } from '@genshin-optimizer/zzz/assets'
import { DocumentDisplay } from '@genshin-optimizer/game-opt/sheet-ui'
import { discUiSheets } from '@genshin-optimizer/zzz/formula-ui'
import {
  useCharacterContext,
  useDatabaseContext,
  useTeam,
} from '@genshin-optimizer/zzz/db-ui'
import { conditionals } from '@genshin-optimizer/zzz/formula'
import type { IConditionalData } from '@genshin-optimizer/game-opt/engine'
import {
  Box,
  Divider,
  Drawer,
  Flex,
  HoverCard,
  Select,
  Skeleton,
  Switch,
  Text,
} from '@mantine/core'
import { Suspense, useMemo, useState } from 'react'

const conditionalIconWidth = 32
const conditionalNameWidth = 255
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
      size={550}
      keepMounted
    >
      {hasOpened && (
        <Suspense fallback={<Skeleton height={300} />}>
          <FormSetConditionalsContent />
        </Suspense>
      )}
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
        <Flex style={{ flex: 1 }} justify="flex-end">
          <Text size="xs" c="dimmed">
            Effect
          </Text>
        </Flex>
      </Flex>
      <Divider />
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
  const character = useCharacterContext()!
  const { database } = useDatabaseContext()
  const team = useTeam(character.key)
  const uiSheet = discUiSheets[sheet as keyof typeof discUiSheets]

  const currentValues = useMemo(() => {
    const vals: Record<string, number> = {}
    for (const [condName, condData] of condEntries) {
      const currentCond = team?.frames[0]?.conditionals?.find(
        (c) => c.sheet === sheet && c.condKey === condName
      )
      const defaultVal =
        condData.type === 'bool'
          ? 1
          : condData.type === 'num'
            ? (condData.max ?? 10)
            : 0
      vals[condName] = currentCond?.condValue ?? defaultVal
    }
    return vals
  }, [team, sheet, condEntries])

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
          <Flex
            style={{ flex: 1 }}
            gap={defaultGap}
            justify="flex-end"
            wrap="wrap"
          >
            {condEntries.map(([condName, condData]) => (
              <ConditionalInput
                key={condName}
                sheet={sheet}
                condName={condName}
                condData={condData}
                currentValue={currentValues[condName]}
              />
            ))}
          </Flex>
        </Flex>
      </HoverCard.Target>
      <HoverCard.Dropdown style={{ fontSize: 13 }}>
        <Text fw={600} mb={4} size="sm">
          {discSetNames[sheet as keyof typeof discSetNames] ?? sheet}
        </Text>
        <Flex direction="column" gap={12}>
          <Flex direction="column" gap={4}>
            <Text size="xs" fw={600} tt="uppercase" c="dimmed">
              Set description
            </Text>
            {uiSheet &&
              Object.entries(uiSheet).map(([blockKey, block]) => (
                <Box key={blockKey}>
                  <Text size="xs" fw={500} mb={2}>
                    {blockKey === '2' ? '2-Piece' : '4-Piece'}
                  </Text>
                  {block.documents.map((doc, i) => (
                    <DocumentDisplay
                      key={i}
                      document={doc}
                      typoVariant="body2"
                    />
                  ))}
                </Box>
              ))}
          </Flex>
          <Flex direction="column" gap={4}>
            <Text size="xs" fw={600} tt="uppercase" c="dimmed">
              Enabled effect
            </Text>
            {condEntries.map(([condName, condData]) => {
              const label = condData.name
              const val = currentValues[condName]
              return (
                <Flex key={condName} align="center" gap={4}>
                  {condData.type === 'bool' && (
                    <Text
                      size="xs"
                      c={val > 0 ? 'green' : 'dimmed'}
                      fw={500}
                    >
                      {val > 0 ? 'ON' : 'OFF'}
                    </Text>
                  )}
                  {condData.type === 'num' && (
                    <Text size="xs" c="blue" fw={500}>
                      {val}
                      {condData.max != null && `/${condData.max}`}
                    </Text>
                  )}
                  <Text size="xs">{label}</Text>
                </Flex>
              )
            })}
          </Flex>
        </Flex>
      </HoverCard.Dropdown>
    </HoverCard>
  )
}

function ConditionalInput({
  sheet,
  condName,
  condData,
  currentValue: propCurrentValue,
}: {
  sheet: string
  condName: string
  condData: IConditionalData
  currentValue: number
}) {
  const character = useCharacterContext()!
  const { database } = useDatabaseContext()
  const currentValue = propCurrentValue

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
