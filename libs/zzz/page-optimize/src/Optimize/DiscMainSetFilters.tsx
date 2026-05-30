import { useBoolState } from '@genshin-optimizer/common/react-util'
import type {
  DiscMainStatKey,
  DiscSlotKey,
} from '@genshin-optimizer/zzz/consts'
import {
  discSlotToMainStatKeys,
  statKeyTextMap,
} from '@genshin-optimizer/zzz/consts'
import type { ICachedDisc } from '@genshin-optimizer/zzz/db'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import {
  OptConfigContext,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import { Button, Flex } from '@mantine/core'
import {
  IconAdjustments,
  IconCheckbox,
  IconSettings,
  IconSquare,
} from '@tabler/icons-react'
import { useContext } from 'react'
import { HeaderText, MultiSelectPills } from '../layout'
import { DiscSetFilterModal } from './DiscSetFilterModal'
import { FormSetConditionals } from './FormSetConditionals'
import { WEngineFilterModal } from './WEngineFilterModal'

const mainStatStyle = { width: '100%' } as const

function MainStatSlot({
  slotKey,
  disabled: _disabled,
}: {
  slotKey: '4' | '5' | '6'
  disabled?: boolean
}) {
  const { database } = useDatabaseContext()
  const { optConfigId, optConfig } = useContext(OptConfigContext)

  const value = (optConfig[`slot${slotKey}`] ?? []) as DiscMainStatKey[]
  const data = discSlotToMainStatKeys[slotKey].map((key) => ({
    value: key,
    label: `${statKeyTextMap[key] ?? key}`,
  }))

  return (
    <MultiSelectPills
      clearable
      size="xs"
      style={mainStatStyle}
      placeholder={`S${slotKey}`}
      value={value}
      onChange={(val) =>
        database.optConfigs.set(optConfigId, { [`slot${slotKey}`]: val })
      }
      data={data}
    />
  )
}

export function DiscMainSetFilters({
  discsBySlot,
  wengines,
  disabled,
}: {
  discsBySlot: Record<DiscSlotKey, ICachedDisc[]>
  wengines: WengineKey[]
  disabled?: boolean
}) {
  const { database } = useDatabaseContext()
  const { optConfigId, optConfig } = useContext(OptConfigContext)
  const [showSetFilter, onOpenSetFilter, onCloseSetFilter] = useBoolState()
  const [showWengineFilter, onOpenWengineFilter, onCloseWengineFilter] =
    useBoolState()
  const [showConditionals, onOpenConditionals, onCloseConditionals] =
    useBoolState()

  return (
    <Flex direction="column" gap={5}>
      <HeaderText>Main stats</HeaderText>
      <Flex direction="column" gap={7}>
        <MainStatSlot slotKey="4" disabled={disabled} />
        <MainStatSlot slotKey="5" disabled={disabled} />
        <MainStatSlot slotKey="6" disabled={disabled} />
      </Flex>

      <HeaderText>Sets</HeaderText>
      <Flex direction="column" gap={7}>
        <Button
          leftSection={
            optConfig.optWengine ? (
              <IconCheckbox size={16} />
            ) : (
              <IconSquare size={16} />
            )
          }
          variant="default"
          onClick={() =>
            database.optConfigs.set(optConfigId, {
              optWengine: !optConfig.optWengine,
            })
          }
          disabled={disabled}
        >
          Optimize W-Engine
        </Button>

        <Button
          leftSection={<IconAdjustments size={16} />}
          variant="default"
          onClick={onOpenSetFilter}
          disabled={disabled}
        >
          Disc Set Filter
        </Button>
        <Button
          leftSection={<IconSettings size={16} />}
          variant="default"
          onClick={onOpenWengineFilter}
          disabled={!optConfig.optWengine}
        >
          W-Engine Filter
        </Button>

        <Button
          leftSection={<IconAdjustments size={16} />}
          variant="default"
          onClick={onOpenConditionals}
          disabled={disabled}
        >
          Set Conditionals
        </Button>
      </Flex>

      <DiscSetFilterModal
        show={showSetFilter}
        onClose={onCloseSetFilter}
        discsBySlot={discsBySlot}
        disabled={disabled}
      />
      <WEngineFilterModal
        show={showWengineFilter}
        onClose={onCloseWengineFilter}
        wengines={wengines}
        disabled={disabled}
      />
      <FormSetConditionals
        show={showConditionals}
        onClose={onCloseConditionals}
      />
    </Flex>
  )
}
