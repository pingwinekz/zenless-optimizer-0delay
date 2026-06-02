import { ModalWrapper } from '@genshin-optimizer/common/ui'
import { toggleInArr } from '@genshin-optimizer/common/util'
import { allDiscSetKeys } from '@genshin-optimizer/zzz/consts'
import type { DiscSetKey, DiscSlotKey } from '@genshin-optimizer/zzz/consts'
import { discSetNames } from '@genshin-optimizer/zzz/consts'
import type { ICachedDisc } from '@genshin-optimizer/zzz/db'
import {
  OptConfigContext,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import { discDefIcon } from '@genshin-optimizer/zzz/assets'
import {
  Badge,
  Box,
  Button,
  CloseButton,
  Divider,
  Group,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core'
import { memo, useCallback, useContext, useMemo, useState } from 'react'
import classes from './DiscSetFilterModal.module.css'

export function DiscSetFilterModal({
  show,
  onClose,
  discsBySlot: _discsBySlot,
  disabled,
}: {
  show: boolean
  onClose: () => void
  discsBySlot: Record<DiscSlotKey, ICachedDisc[]>
  disabled?: boolean
}) {
  return (
    <ModalWrapper
      opened={show}
      onClose={onClose}
      size={1200}
      centered
      containerProps={{ style: { minHeight: undefined } }}
    >
      <DiscSetFilterModalContent close={onClose} disabled={disabled} />
    </ModalWrapper>
  )
}

function DiscSetFilterModalContent({
  close,
  disabled,
}: {
  close: () => void
  disabled?: boolean
}) {
  const { database } = useDatabaseContext()
  const { optConfigId, optConfig } = useContext(OptConfigContext)
  const { setFilter2 = [], setFilter4 = [] } = optConfig

  const [mode, setMode] = useState<'4p' | '2p'>('4p')
  const [search, setSearch] = useState('')

  const currentFilter = mode === '4p' ? setFilter4 : setFilter2

  const setCurrentFilter = useCallback(
    (keys: DiscSetKey[]) => {
      if (mode === '4p') {
        database.optConfigs.set(optConfigId, { setFilter4: keys })
      } else {
        database.optConfigs.set(optConfigId, { setFilter2: keys })
      }
    },
    [database, optConfigId, mode]
  )

  const initialFilters = useMemo(
    () => ({ setFilter2, setFilter4 }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const handleToggle = useCallback(
    (setKey: DiscSetKey) => {
      setCurrentFilter(
        currentFilter.length
          ? toggleInArr([...currentFilter], setKey)
          : [setKey]
      )
    },
    [currentFilter, setCurrentFilter]
  )

  const handleRevert = useCallback(() => {
    database.optConfigs.set(optConfigId, initialFilters)
  }, [database, optConfigId, initialFilters])

  const clearAll = useCallback(() => {
    if (mode === '4p') {
      database.optConfigs.set(optConfigId, { setFilter4: [] })
    } else {
      database.optConfigs.set(optConfigId, { setFilter2: [] })
    }
  }, [database, optConfigId, mode])

  const handleModeSwitch = useCallback((val: string) => {
    setMode(val as '4p' | '2p')
    setSearch('')
  }, [])

  const hasSelection = currentFilter.length > 0

  return (
    <Stack gap={0}>
      <Divider label="Selected Sets" labelPosition="center" mx="sm" mt="xs" />

      <Group gap="xs" p="sm" wrap="nowrap" align="center">
        <Stack gap={4} style={{ flex: 1 }}>
          <Group
            gap={5}
            wrap="wrap"
            align="center"
            className={classes.collectorRow}
          >
            {currentFilter.length === 0 && (
              <Text size="xs" c="dimmed">
                Sets
              </Text>
            )}
            {currentFilter.map((key) => (
              <Badge
                key={key}
                variant="default"
                radius="sm"
                size="lg"
                h={28}
                pl={6}
                pr={3}
                rightSection={
                  <CloseButton
                    size="xs"
                    variant="transparent"
                    onClick={() =>
                      setCurrentFilter(currentFilter.filter((k) => k !== key))
                    }
                  />
                }
              >
                <img
                  className={classes.collectorImg}
                  src={discDefIcon(key)}
                  alt=""
                />
              </Badge>
            ))}
          </Group>
        </Stack>

        {hasSelection && (
          <Button variant="subtle" size="compact-xs" onClick={clearAll}>
            Clear all
          </Button>
        )}
      </Group>

      <Box p="sm">
        <Stack gap={10}>
          <TextInput
            data-autofocus
            placeholder="Search disc sets..."
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            size="xs"
            rightSection={
              search ? (
                <CloseButton size="xs" onClick={() => setSearch('')} />
              ) : undefined
            }
          />

          <Divider label="Disc Sets" labelPosition="center" />

          <SegmentedControl
            value={mode}
            onChange={handleModeSwitch}
            size="xs"
            data={[
              { label: '4-Piece', value: '4p' },
              { label: '2-Piece', value: '2p' },
            ]}
            disabled={disabled}
          />

          <Box style={{ maxHeight: 400, overflowY: 'auto' }}>
            <DiscSetGrid
              setKeys={allDiscSetKeys}
              checkedNames={new Set(currentFilter)}
              onToggle={handleToggle}
              search={search}
            />
          </Box>
        </Stack>
      </Box>

      <Group className={classes.footer} p="sm" justify="flex-end" gap={6}>
        <Button variant="default" size="xs" onClick={handleRevert}>
          Revert
        </Button>
        <Button variant="filled" size="xs" onClick={close}>
          Done
        </Button>
      </Group>
    </Stack>
  )
}

function DiscSetGrid({
  setKeys,
  checkedNames,
  onToggle,
  search,
}: {
  setKeys: readonly DiscSetKey[]
  checkedNames: Set<string>
  onToggle: (setKey: DiscSetKey) => void
  search: string
}) {
  const columns = useMemo(() => {
    const cols: DiscSetKey[][] = [[], [], [], [], [], []]
    setKeys.forEach((k, i) => cols[i % 6].push(k))
    return cols
  }, [setKeys])

  const q = search.toLowerCase()

  return (
    <div className={classes.setGrid}>
      {columns.map((col, ci) => (
        <div key={ci} className={classes.gridColumn}>
          {col.map((key) => (
            <DiscSetRow
              key={key}
              setKey={key}
              checked={checkedNames.has(key)}
              dimmed={
                !!search &&
                !discSetNames[key]?.toLowerCase().includes(q) &&
                !key.toLowerCase().includes(q)
              }
              onToggle={onToggle}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

const DiscSetRow = memo(function DiscSetRow({
  setKey,
  checked,
  dimmed,
  onToggle,
}: {
  setKey: DiscSetKey
  checked: boolean
  dimmed: boolean
  onToggle: (setKey: DiscSetKey) => void
}) {
  const handleClick = useCallback(() => onToggle(setKey), [onToggle, setKey])

  return (
    <UnstyledButton
      className={`${classes.setRow} ${checked ? classes.setRowChecked : ''} ${dimmed ? classes.setRowDimmed : ''}`}
      onClick={handleClick}
    >
      <img className={classes.setImg} src={discDefIcon(setKey)} alt="" />
      <Text
        size="xs"
        truncate
        fw={checked ? 600 : undefined}
        c={checked ? undefined : 'dimmed'}
        style={{ flex: 1, minWidth: 0 }}
      >
        {discSetNames[setKey] ?? setKey}
      </Text>
    </UnstyledButton>
  )
})
