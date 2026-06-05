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
import { TagContext } from '@genshin-optimizer/game-opt/formula-ui'
import { TagFieldDisplay } from '@genshin-optimizer/game-opt/sheet-ui'
import type { Field } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey, WengineKey } from '@genshin-optimizer/zzz/consts'
import {
  useCharacterContext,
  useDatabaseContext,
  useTeam,
} from '@genshin-optimizer/zzz/db-ui'
import { buffs as allBuffs, conditionals } from '@genshin-optimizer/zzz/formula'
import { wengineUiSheets } from '@genshin-optimizer/zzz/formula-ui'
import { i18n } from '@genshin-optimizer/zzz/i18n'
import { memo, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
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

function condLabel(key: string, ns: string): string {
  const translated = i18n.t(key, { ns })
  if (typeof translated === 'string' && translated !== key) return translated
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function precisionRound(number: number): number {
  if (number < 1) return Math.round(number * 1000) / 1000
  return Math.round(number * 10) / 10
}

export function WEngineConditionalsDisplay({
  wengineKey,
  teammateKey,
}: {
  wengineKey: WengineKey | ''
  teammateKey?: CharacterKey
}) {
  const { t } = useTranslation('wengineNames_gen')
  const mainChar = useCharacterContext()!
  const { database } = useDatabaseContext()
  const team = useTeam(mainChar.key)
  const src = teammateKey ?? mainChar.key

  // Extract conditional fields from wengine UI sheet
  const weConditionalFields = useMemo(() => {
    if (!wengineKey) return undefined
    const sheet = wengineUiSheets[wengineKey]
    if (!sheet) return undefined
    // Look up buff metadata to determine if each field is team-wide.
    // Many wengine UI sheets use tagToTagField which doesn't include the
    // team flag, so we need to match by fieldRef.name against the buffs lookup.
    const wengineBuffs = (allBuffs as any)[wengineKey] as
      | Record<string, { team?: boolean }>
      | undefined
    // Helper to check if a field references a buff entry (has fieldRef.name)
    // and returns whether that buff is team-wide.
    function isBuffFieldTeamWide(f: Field): boolean {
      // If the field has an explicit team flag, use it
      if ('team' in f) return f.team !== false
      // Look up by fieldRef.name against buff metadata
      if (wengineBuffs && 'fieldRef' in f && f.fieldRef?.name) {
        const buff = wengineBuffs[f.fieldRef.name]
        // If the field matches a buff entry, check its team flag
        if (buff) return buff.team !== false
      }
      // If we can't determine (no buff metadata or no matching buff entry),
      // this is not a known buff field — treat as not team-wide
      return false
    }
    // Pre-check: does this wengine have ANY team-wide buffs?
    // If so, conditionals should always be shown in teammate view even if
    // their direct fields are self-only (e.g. Neon Fantasies: stacks
    // conditional's own fields are self-only, but squadDmg_ team buff
    // depends on the stacks value).
    const wengineHasTeamBuffs =
      teammateKey &&
      wengineBuffs &&
      Object.values(wengineBuffs).some((b) => b.team === true)

    const result: Record<string, Field[]> = {}
    // Also collect team-wide passive buffs from 'fields'-type documents
    // (e.g. Neon Fantasies' squadDmg_, HalfSugarBunny's passive_atk_)
    const passiveTeamFields: Field[] = []
    sheet.documents.forEach((doc) => {
      // Process 'conditional' documents (interactive conditionals)
      if (doc.type === 'conditional' && doc.conditional) {
        const condName = doc.conditional.metadata.name
        const fields = doc.conditional.fields
        const fieldsArr = fields ?? []
        if (teammateKey) {
          // Collect only fields that match entries in the buff metadata
          // (or have an explicit team flag). Fields that don't match any
          // buff entry (e.g., Duration formulas) can't be used to determine
          // team status.
          const matchingBuffFields = fieldsArr.filter((f: Field) => {
            if ('team' in f) return true
            if (wengineBuffs && 'fieldRef' in f && f.fieldRef?.name)
              return !!wengineBuffs[f.fieldRef.name]
            return false
          })
          // Show conditional if:
          // 1) It has team-wide fields directly, OR
          // 2) The wengine has ANY team-wide buffs (the conditional's control
          //    state may affect team-wide buffs defined in other documents)
          const hasTeamBuff =
            matchingBuffFields.length === 0
              ? !!wengineHasTeamBuffs
              : matchingBuffFields.some((f: Field) => isBuffFieldTeamWide(f)) ||
                !!wengineHasTeamBuffs
          if (!hasTeamBuff) return
          // Include team-wide buff fields and informational fields
          // (fields that don't match any entry in the buff metadata).
          const teamFields = fieldsArr.filter(
            (f: Field) =>
              // If no buff metadata, include everything
              !wengineBuffs ||
              // Include informational fields not found in buff metadata
              !(
                'fieldRef' in f &&
                f.fieldRef?.name &&
                wengineBuffs[f.fieldRef.name]
              ) ||
              // Or include team-wide buff fields
              isBuffFieldTeamWide(f)
          )
          // In teammate view, always include the conditional (even with 0 fields)
          // so the interactive control (toggle/slider) is visible. The control
          // state affects team-wide buffs even if this conditional's own fields
          // are self-only.
          if (!result[condName]) result[condName] = []
          result[condName].push(...teamFields)
        } else {
          // Main character view: include all fields
          if (!result[condName]) result[condName] = []
          result[condName].push(...fieldsArr)
        }
      }
      // Process 'fields' documents (passive buffs like squadDmg_)
      if (doc.type === 'fields' && doc.fields?.length) {
        if (teammateKey) {
          const matchingBuffFields = doc.fields.filter((f: Field) => {
            if ('team' in f) return true
            if (wengineBuffs && 'fieldRef' in f && f.fieldRef?.name)
              return !!wengineBuffs[f.fieldRef.name]
            return false
          })
          const hasTeamBuff =
            matchingBuffFields.length === 0
              ? false
              : matchingBuffFields.some((f: Field) => isBuffFieldTeamWide(f))
          if (hasTeamBuff) {
            // Include only the team-wide fields from this doc
            const teamFields = doc.fields.filter(
              (f: Field) =>
                // If no buff metadata, include everything
                !wengineBuffs ||
                // Include informational fields not found in buff metadata
                !(
                  'fieldRef' in f &&
                  f.fieldRef?.name &&
                  wengineBuffs[f.fieldRef.name]
                ) ||
                // Or include team-wide buff fields
                isBuffFieldTeamWide(f)
            )
            passiveTeamFields.push(...teamFields)
          }
        } else {
          // Main character view: include all fields (they're already visible elsewhere)
        }
      }
    })
    // Store passive team fields under a synthetic key so they can be rendered
    if (passiveTeamFields.length > 0) {
      result['__passive_team_buffs__'] = passiveTeamFields
    }
    // When in teammate view, return result even if empty so the caller
    // can distinguish "no UI sheet" (undefined) from "all fields filtered" ({}).
    if (teammateKey) return result
    return Object.keys(result).length > 0 ? result : undefined
  }, [wengineKey, teammateKey])

  // Extract localized labels from wengine UI sheet
  const weCondLabels = useMemo(() => {
    if (!wengineKey) return undefined
    const sheet = wengineUiSheets[wengineKey]
    if (!sheet) return undefined
    const result: Record<string, ReactNode> = {}
    sheet.documents.forEach((doc) => {
      if (doc.type === 'conditional' && doc.conditional?.label) {
        const condName = doc.conditional.metadata.name
        const label = doc.conditional.label
        if (typeof label === 'function') return
        result[condName] = label
      }
    })
    return Object.keys(result).length > 0 ? result : undefined
  }, [wengineKey])

  // Tag context for rendering passive team-wide buff fields
  const outerTag = useContext(TagContext)
  const tagForPassiveFields = useMemo(
    () => ({ ...outerTag, src }),
    [outerTag, src]
  )

  // Early return (no hooks after this point)
  if (!wengineKey) {
    return (
      <Flex direction="column" gap={5}>
        <HeaderText>W-Engine Conditionals</HeaderText>
        <Text size="sm" c="dimmed">
          No W-Engine equipped.
        </Text>
      </Flex>
    )
  }

  const passiveTeamFields = weConditionalFields?.['__passive_team_buffs__']

  const wengineConditionals = (conditionals as any)[wengineKey]
  const condEntries = wengineConditionals
    ? (Object.entries(wengineConditionals) as [string, IConditionalData][])
    : []

  // If there are no conditionals AND no passive team fields, show placeholder
  if (
    condEntries.length === 0 &&
    (!passiveTeamFields || passiveTeamFields.length === 0)
  )
    return (
      <Flex direction="column" gap={5}>
        <HeaderText>{t(wengineKey)} Conditionals</HeaderText>
        <Text size="sm" c="dimmed">
          No conditionals for this W-Engine.
        </Text>
      </Flex>
    )

  return (
    <Flex direction="column" gap={5}>
      <HeaderText>{t(wengineKey)} Conditionals</HeaderText>
      {/* Render passive (always-active) team-wide buffs */}
      {passiveTeamFields && passiveTeamFields.length > 0 && (
        <Box
          style={{
            borderRadius: 'var(--mantine-radius-sm)',
            border: '1px solid var(--mantine-color-default-border)',
            padding: '6px 8px',
            fontSize: 11,
            lineHeight: '16px',
          }}
        >
          <TagContext.Provider value={tagForPassiveFields as any}>
            {passiveTeamFields.map(
              (field, i) =>
                'fieldRef' in field && (
                  <TagFieldDisplay
                    key={i}
                    field={field}
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
      {condEntries
        .filter(([condName]) => {
          if (condName === '__passive_team_buffs__') return false
          // If weConditionalFields is provided and condName is missing,
          // all its fields were self-buffs — skip the entire conditional toggle
          if (weConditionalFields && !weConditionalFields[condName])
            return false
          return true
        })
        .map(([condName, condData]) => (
          <WengineConditionalRow
            key={condName}
            wengineKey={wengineKey}
            condName={condName}
            condData={condData}
            team={team}
            database={database}
            mainCharKey={mainChar.key}
            src={src}
            fields={weConditionalFields?.[condName]}
            label={weCondLabels?.[condName]}
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
  src,
  fields,
  label: labelProp,
}: {
  wengineKey: WengineKey
  condName: string
  condData: IConditionalData
  team: ReturnType<typeof useTeam>
  database: ReturnType<typeof useDatabaseContext>['database']
  mainCharKey: CharacterKey
  src: CharacterKey
  fields?: Field[]
  label?: ReactNode
}) {
  const outerTag = useContext(TagContext)
  const tagForFields = useMemo(() => ({ ...outerTag, src }), [outerTag, src])
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
      src as any,
      null,
      condValue
    )
  }

  const label = labelProp ?? condLabel(condName, `wengine_${wengineKey}`)

  const rowContent = (
    <>
      {condData.type === 'bool' && (
        <Flex justify={conditionalJustify} align={conditionalAlign}>
          <Switch
            style={{ marginRight: 5 }}
            checked={currentValue > 0}
            onChange={(e) => setValue(e.currentTarget.checked ? 1 : 0)}
            size="xs"
          />
          <ConditionalText>{label}</ConditionalText>
        </Flex>
      )}
      {condData.type === 'num' && (
        <NumConditionalRow
          label={label}
          value={currentValue}
          min={condData.min ?? 0}
          max={condData.max ?? 10}
          step={condData.int_only ? 1 : 0.1}
          onChange={setValue}
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
            value={String(currentValue)}
            onChange={(v) => setValue(Number(v) || 0)}
            size="xs"
          />
          <ConditionalText>{label}</ConditionalText>
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
}: {
  label: ReactNode
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
