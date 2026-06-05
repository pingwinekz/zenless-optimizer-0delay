import {
  Box,
  Flex,
  HoverCard,
  NumberInput,
  Select,
  Slider,
  Switch,
  Text,
} from '@mantine/core'
import type { IConditionalData } from '@genshin-optimizer/game-opt/engine'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import {
  useCharacterContext,
  useDatabaseContext,
  useTeam,
} from '@genshin-optimizer/zzz/db-ui'
import { conditionals } from '@genshin-optimizer/zzz/formula'
import { i18n } from '@genshin-optimizer/zzz/i18n'
import { TagContext } from '@genshin-optimizer/game-opt/formula-ui'
import { TagFieldDisplay } from '@genshin-optimizer/game-opt/sheet-ui'
import type { Field } from '@genshin-optimizer/game-opt/sheet-ui'
import { memo, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { HeaderText } from '../layout'

// ColorizeNumbers - wraps numbers and Mindscape labels in gold spans
// matching the fribbels ColorizeNumbers pattern (#ebb434 gold)
const COND_GOLD = '#ebb434'

function colorizeNumbers(text: string): ReactNode {
  // Match M1-M6, numbers (int/dec with optional %)
  const parts = text.split(/(M[1-6]|\d+(?:\.\d+)?(?:%)?)/g)
  return parts.map((part, i) => {
    if (/^(M[1-6]|\d+(?:\.\d+)?(?:%)?)$/.test(part)) {
      return (
        <span key={i} style={{ color: COND_GOLD }}>
          {part}
        </span>
      )
    }
    return part
  })
}

function renderDescription(desc: ReactNode): ReactNode {
  if (typeof desc === 'string') return colorizeNumbers(desc)
  return desc
}

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

function condLabel(key: string, ns: string): string {
  const translated = i18n.t(key, { ns })
  if (typeof translated === 'string' && translated !== key) return translated
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function getMindscapeRequirement(condName: string): number | null {
  const match = condName.match(/^m([1-6])/i)
  if (match) {
    return parseInt(match[1], 10)
  }
  return null
}

function precisionRound(number: number): number {
  if (number < 1) return Math.round(number * 1000) / 1000
  return Math.round(number * 10) / 10
}

export function CharacterConditionalsDisplay({
  characterKey,
  mindscapeOverride,
  conditionalFields,
  conditionalDescriptions,
  conditionalLabels,
  showZeroFields = false,
  passiveFields,
}: {
  characterKey: CharacterKey
  mindscapeOverride?: number
  conditionalFields?: Record<string, Field[]>
  conditionalDescriptions?: Record<string, ReactNode>
  conditionalLabels?: Record<string, ReactNode>
  showZeroFields?: boolean
  passiveFields?: {
    field: Field
    /** 0 = always available, 1-6 = requires that mindscape level */
    mindscape: number
  }[]
}) {
  const { t } = useTranslation('charNames_gen')
  const mainChar = useCharacterContext()!
  const { database } = useDatabaseContext()
  const team = useTeam(mainChar.key)
  const effectiveMindscape = mindscapeOverride ?? mainChar.mindscape

  const allConditionals = conditionals as Record<string, unknown>
  const charConditionals = allConditionals[characterKey] as
    | Record<string, IConditionalData>
    | undefined

  if (!charConditionals) {
    console.log(
      '[CharacterConditionalsDisplay] No conditionals for',
      characterKey,
      'Available keys:',
      Object.keys(allConditionals).slice(0, 10)
    )
    return (
      <Text size="xs" c="dimmed">
        No conditionals
      </Text>
    )
  }

  const condEntries = Object.entries(charConditionals).sort(([, a], [, b]) => {
    const aReq = (a as IConditionalData).mindscapeRequirement ?? 0
    const bReq = (b as IConditionalData).mindscapeRequirement ?? 0
    return aReq - bReq
  })
  const visiblePassives =
    passiveFields?.filter((entry) => effectiveMindscape >= entry.mindscape) ??
    []
  const hasPassives = visiblePassives.length > 0
  if (condEntries.length === 0 && !hasPassives) {
    return (
      <Text size="xs" c="dimmed">
        No conditionals
      </Text>
    )
  }

  return (
    <Flex direction="column" gap={5}>
      <HeaderText>{t(characterKey)} Conditionals</HeaderText>
      {hasPassives && (
        <Box
          style={{
            borderRadius: 'var(--mantine-radius-sm)',
            border: '1px solid var(--mantine-color-default-border)',
            padding: '6px 8px',
            fontSize: 11,
            lineHeight: '16px',
          }}
        >
          {visiblePassives.map(
            (entry, i) =>
              'fieldRef' in entry.field && (
                <TagFieldDisplay
                  key={i}
                  field={entry.field}
                  showZero={true}
                  rowSx={{
                    paddingTop: 1,
                    paddingBottom: 1,
                    gap: 6,
                  }}
                />
              )
          )}
        </Box>
      )}
      {condEntries
        .filter(([condName]) => {
          // If conditionalFields is provided and this condName has no entry,
          // all its fields were self-buffs — skip the entire conditional
          if (conditionalFields && !conditionalFields[condName]) return false
          return true
        })
        .map(([condName, condData]) => (
          <CharacterConditionalRow
            key={condName}
            characterKey={characterKey}
            condName={condName}
            condData={condData}
            team={team}
            database={database}
            mainCharKey={mainChar.key}
            mindscape={effectiveMindscape}
            fields={conditionalFields?.[condName]}
            description={conditionalDescriptions?.[condName]}
            label={conditionalLabels?.[condName]}
            showZeroFields={showZeroFields}
          />
        ))}
    </Flex>
  )
}

const CharacterConditionalRow = memo(function CharacterConditionalRow({
  characterKey,
  condName,
  condData,
  team,
  database,
  mainCharKey,
  mindscape,
  fields,
  description,
  label: labelProp,
  showZeroFields = false,
}: {
  characterKey: CharacterKey
  condName: string
  condData: IConditionalData
  team: ReturnType<typeof useTeam>
  database: ReturnType<typeof useDatabaseContext>['database']
  mainCharKey: CharacterKey
  mindscape: number
  fields?: Field[]
  description?: ReactNode
  label?: ReactNode
  showZeroFields?: boolean
}) {
  const outerTag = useContext(TagContext)
  const tagForFields = useMemo(
    () => ({ ...outerTag, src: characterKey }),
    [outerTag, characterKey]
  )
  const currentCond = team?.frames[0]?.conditionals?.find(
    (c) => c.sheet === characterKey && c.condKey === condName
  )
  const currentValue = currentCond?.condValue ?? 0

  const mindscapeRequirement =
    condData.mindscapeRequirement ?? getMindscapeRequirement(condName)
  const isMindscapeDisabled =
    mindscapeRequirement !== null && mindscape < mindscapeRequirement

  // When mindscape drops below the requirement, auto-reset the conditional
  useEffect(() => {
    if (isMindscapeDisabled && currentValue > 0) {
      database.teams.setFrameConditional(
        mainCharKey,
        0,
        characterKey as any,
        condName,
        characterKey as any,
        null,
        0
      )
    }
  }, [
    isMindscapeDisabled,
    currentValue,
    database.teams,
    mainCharKey,
    characterKey,
    condName,
  ])

  const setValue = (condValue: number) => {
    if (isMindscapeDisabled) return
    database.teams.setFrameConditional(
      mainCharKey,
      0,
      characterKey as any,
      condName,
      characterKey as any,
      null,
      condValue
    )
  }

  const label = labelProp ?? condLabel(condName, `char_${characterKey}`)

  const rowContent = (
    <>
      {condData.type === 'bool' && (
        <Flex justify={conditionalJustify} align={conditionalAlign}>
          <Switch
            style={{ marginRight: 5 }}
            checked={currentValue > 0}
            onChange={(e) => setValue(e.currentTarget.checked ? 1 : 0)}
            size="xs"
            disabled={isMindscapeDisabled}
          />
          <ConditionalText
            style={isMindscapeDisabled ? { opacity: 0.5 } : undefined}
          >
            {label}
            {isMindscapeDisabled && ` (Requires M${mindscapeRequirement})`}
          </ConditionalText>
        </Flex>
      )}
      {condData.type === 'num' && (
        <NumConditionalRow
          label={label}
          value={isMindscapeDisabled ? 0 : currentValue}
          min={condData.min ?? 0}
          max={condData.max ?? 10}
          step={condData.int_only ? 1 : 0.1}
          onChange={setValue}
          disabled={isMindscapeDisabled}
          mindscapeRequirement={mindscapeRequirement}
        />
      )}
      {condData.type === 'list' && (
        <Flex justify={conditionalJustify} align={conditionalAlign}>
          <Select
            style={{ minWidth: 80, width: 80, marginRight: 5 }}
            maxDropdownHeight={500}
            comboboxProps={{ keepMounted: false }}
            data={condData.list.map((item, index) => ({
              label: item,
              value: String(index),
            }))}
            value={String(isMindscapeDisabled ? 0 : currentValue)}
            onChange={(v) => setValue(Number(v) || 0)}
            size="xs"
            disabled={isMindscapeDisabled}
          />
          <ConditionalText
            style={isMindscapeDisabled ? { opacity: 0.5 } : undefined}
          >
            {label}
            {isMindscapeDisabled && ` (Requires M${mindscapeRequirement})`}
          </ConditionalText>
        </Flex>
      )}
      {condData.type !== 'bool' &&
        condData.type !== 'num' &&
        condData.type !== 'list' && (
          <Text size="xs" c="dimmed">
            {label}: unsupported type
          </Text>
        )}
    </>
  )

  return (
    <HoverCard
      width={400}
      position="left"
      withArrow
      openDelay={300}
      closeDelay={200}
    >
      <HoverCard.Target>
        <Box
          style={{
            cursor: 'default',
            borderRadius: 'var(--mantine-radius-sm)',
            border: '1px solid var(--mantine-color-default-border)',
            padding: '4px 6px',
            transition: 'border-color 0.15s',
          }}
        >
          {rowContent}
          {currentValue > 0 && fields && fields.length > 0 && (
            <Box
              style={{
                marginTop: 4,
                borderTop: '1px solid var(--mantine-color-default-border)',
                paddingTop: 4,
                paddingLeft: 4,
                fontSize: 11,
                lineHeight: '16px',
              }}
            >
              <TagContext.Provider value={tagForFields as any}>
                {fields.map(
                  (field, i) =>
                    'fieldRef' in field && (
                      <TagFieldDisplay
                        key={i}
                        field={field}
                        showZero={showZeroFields}
                        rowSx={{
                          paddingTop: 1,
                          paddingBottom: 1,
                          gap: 6,
                        }}
                      />
                    )
                )}
              </TagContext.Provider>
            </Box>
          )}
        </Box>
      </HoverCard.Target>
      <HoverCard.Dropdown style={{ fontSize: 13 }}>
        <Text fw={600} mb={4} size="sm">
          {label}
        </Text>
        {description && (
          <Text size="sm" mb={8} style={{ whiteSpace: 'pre-wrap' }}>
            {renderDescription(description)}
          </Text>
        )}
        {currentValue > 0 && fields && fields.length > 0 && (
          <>
            <hr />
            <Box mt={4}>
              <TagContext.Provider value={tagForFields as any}>
                {fields.map(
                  (field, i) =>
                    'fieldRef' in field && (
                      <TagFieldDisplay
                        key={i}
                        field={field}
                        showZero={showZeroFields}
                        rowSx={{
                          paddingTop: 1,
                          paddingBottom: 1,
                          gap: 6,
                        }}
                      />
                    )
                )}
              </TagContext.Provider>
            </Box>
          </>
        )}
      </HoverCard.Dropdown>
    </HoverCard>
  )
})

const NumConditionalRow = memo(function NumConditionalRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
  disabled,
  mindscapeRequirement,
}: {
  label: ReactNode
  value: number
  min: number
  max: number
  step: number
  onChange: (val: number) => void
  disabled?: boolean
  mindscapeRequirement?: number | null
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
            disabled={disabled}
          />
        </div>
        <ConditionalText
          style={{
            lineHeight: '16px',
            opacity: disabled ? 0.5 : undefined,
          }}
        >
          {label}
          {disabled &&
            mindscapeRequirement &&
            ` (Requires M${mindscapeRequirement})`}
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
          disabled={disabled}
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
