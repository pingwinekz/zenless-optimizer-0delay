import { DropdownButton } from '@genshin-optimizer/common/ui'
import type { TargetTag } from '@genshin-optimizer/zzz/db'
import {
  type ICachedCharacter,
  type Team,
  getTeamFrame0,
  targetTag,
} from '@genshin-optimizer/zzz/db'
import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import { own } from '@genshin-optimizer/zzz/formula'
import {
  FullTagDisplay,
  useZzzCalcContext,
} from '@genshin-optimizer/zzz/formula-ui'
import { Box, Divider, Menu } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useCallback, useMemo } from 'react'
import { RotationConfigDialog } from './RotationConfigDialog'

const statTargets = [
  own.final.atk,
  own.final.hp,
  own.final.def,
  own.final.enerRegen,
  own.final.anomProf,
  own.final.anomMas,
] as const

export function OptTargetSelector({
  character: { key: characterKey },
  team,
}: {
  team: Team
  character: ICachedCharacter
}) {
  const { tag: target } = getTeamFrame0(team)
  const calc = useZzzCalcContext()
  const { database } = useDatabaseContext()
  const tag = useMemo(() => {
    if (!target) return undefined
    return targetTag(target)
  }, [target])

  const isRotation = !!target?.rotation
  const rotationCount = target?.rotation?.length ?? 0

  const formulaOptions = useMemo(() => {
    if (!calc) return []
    return calc.listFormulas(own.listing.formulas)
  }, [calc])

  const [rotationOpened, { open: openRotation, close: closeRotation }] =
    useDisclosure(false)

  const handleRotationChange = useCallback(
    (rotation: Array<{ sheet: string; name: string }> | undefined) => {
      database.teams.setFrame0(characterKey, { tag: { rotation } })
    },
    [database, characterKey]
  )

  return (
    <>
      <DropdownButton
        color={tag ? 'green' : 'yellow'}
        title={
          tag ? (
            <Box style={{ display: 'flex', gap: 4 }}>
              <strong>Target: </strong>
              {isRotation ? (
                <span>
                  Rotation DMG ({rotationCount} attack
                  {rotationCount !== 1 ? 's' : ''})
                </span>
              ) : (
                <FullTagDisplay tag={tag} />
              )}
            </Box>
          ) : (
            'Select an Optimization Target'
          )
        }
        variant={tag ? 'outline' : undefined}
        style={{ height: '100%', flexGrow: 1 }}
      >
        <Menu.Label>DMG</Menu.Label>
        <Menu.Item
          onClick={openRotation}
          style={{ fontWeight: isRotation ? 'bold' : undefined }}
        >
          Rotation DMG
        </Menu.Item>
        <Divider />
        {formulaOptions.map(({ tag: formulaTag }, i) => {
          const { name, sheet } = formulaTag
          if (!name || !sheet) return null
          return (
            <Menu.Item
              key={`dmg_${i}_${sheet}_${name}`}
              onClick={() =>
                database.teams.setFrame0(characterKey, {
                  tag: {
                    sheet,
                    name,
                  },
                })
              }
            >
              <Box style={{ display: 'flex', gap: 4 }}>
                <FullTagDisplay tag={formulaTag} />
              </Box>
            </Menu.Item>
          )
        })}
        <Divider />
        <Menu.Label>Stats</Menu.Label>
        {statTargets.map(({ tag: statTag }, i) => {
          const { q, qt } = statTag
          if (!q || !qt) return null
          return (
            <Menu.Item
              key={`stat_${i}_${q}_${qt}`}
              onClick={() =>
                database.teams.setFrame0(characterKey, {
                  tag: {
                    q: q as TargetTag['q'],
                    qt: qt as 'final',
                  },
                })
              }
            >
              <Box style={{ display: 'flex', gap: 4 }}>
                <FullTagDisplay tag={statTag} />
              </Box>
            </Menu.Item>
          )
        })}
      </DropdownButton>
      <RotationConfigDialog
        opened={rotationOpened}
        close={closeRotation}
        rotation={target?.rotation}
        onRotationChange={handleRotationChange}
      />
    </>
  )
}
