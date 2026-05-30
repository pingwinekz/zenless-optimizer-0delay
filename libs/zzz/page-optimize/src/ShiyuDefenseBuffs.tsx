import { CardThemed } from '@genshin-optimizer/common/ui'
import type { AttributeKey, SpecialityKey } from '@genshin-optimizer/zzz/consts'
import type {
  BonusStatTag,
  EnemyStatsTag,
  TeamBonusStat,
  TeamEnemyStat,
} from '@genshin-optimizer/zzz/db'
import { getTeamFrame0 } from '@genshin-optimizer/zzz/db'
import {
  useCharacterContext,
  useDatabaseContext,
  useTeam,
} from '@genshin-optimizer/zzz/db-ui'
import { getCharStat } from '@genshin-optimizer/zzz/stats'
import { Box, CardSection, Group, Stack, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import seasons from './shiyuSeasons_gen.json'

const BOSS_CDN = 'https://static.nanoka.cc/assets/zzz'

type BuffBonusStat = {
  tag: BonusStatTag
  value: number
  specialty?: SpecialityKey
}
type BuffEnemyStat = {
  tag: EnemyStatsTag
  value: number
  specialty?: SpecialityKey
}
type BuffConfig = {
  bonusStats: BuffBonusStat[]
  enemyStats: BuffEnemyStat[]
}

const buffConfigs: Record<string, BuffConfig> = {
  'Flowing Frost': {
    bonusStats: [
      { tag: { q: 'anomProf', qt: 'base' }, value: 30 },
      { tag: { q: 'dmg_', qt: 'combat', damageType2: 'abloom' }, value: 20 },
      { tag: { q: 'dmg_', qt: 'combat', attribute: 'ice' }, value: 20 },
    ],
    enemyStats: [],
  },
  'Overwhelming Force': {
    bonusStats: [
      { tag: { q: 'sheer_dmg_', qt: 'combat' }, value: 35 },
      { tag: { q: 'dmg_', qt: 'combat', attribute: 'physical' }, value: 10 },
    ],
    enemyStats: [{ tag: { q: 'resRed_', attribute: 'physical' }, value: 10 }],
  },
  Unstoppable: {
    bonusStats: [
      { tag: { q: 'atk_', qt: 'combat' }, value: 10 },
      { tag: { q: 'dmg_', qt: 'combat', damageType1: 'basic' }, value: 20 },
      {
        tag: { q: 'dmg_', qt: 'combat', damageType1: 'exSpecial' },
        value: 20,
      },
      { tag: { q: 'dmg_', qt: 'combat', damageType1: 'chain' }, value: 20 },
      { tag: { q: 'crit_dmg_', qt: 'combat' }, value: 30 },
    ],
    enemyStats: [],
  },
  'Perpetual Frigidity': {
    bonusStats: [
      { tag: { q: 'dmg_', qt: 'combat', attribute: 'ice' }, value: 10 },
      { tag: { q: 'anomProf', qt: 'base' }, value: 40 },
      { tag: { q: 'dmg_', qt: 'combat', damageType2: 'abloom' }, value: 30 },
    ],
    enemyStats: [],
  },
  'Thundering Strike': {
    bonusStats: [
      { tag: { q: 'dmg_', qt: 'combat', attribute: 'physical' }, value: 20 },
      { tag: { q: 'dmg_', qt: 'combat', attribute: 'electric' }, value: 20 },
      { tag: { q: 'crit_dmg_', qt: 'combat' }, value: 30 },
    ],
    enemyStats: [{ tag: { q: 'defRed_' }, value: 10 }],
  },
  'Enigmatic Spectrum': {
    bonusStats: [
      { tag: { q: 'dmg_', qt: 'combat', attribute: 'ether' }, value: 20 },
      { tag: { q: 'dmg_', qt: 'combat', damageType1: 'anomaly' }, value: 20 },
    ],
    enemyStats: [{ tag: { q: 'unstun_' }, value: 20 }],
  },
  'Piercing Thunder Strike': {
    bonusStats: [
      { tag: { q: 'dmg_', qt: 'combat', attribute: 'electric' }, value: 20 },
      { tag: { q: 'dmg_', qt: 'combat', damageType1: 'basic' }, value: 40 },
      { tag: { q: 'dmg_', qt: 'combat', damageType1: 'special' }, value: 40 },
      {
        tag: { q: 'dmg_', qt: 'combat', damageType1: 'exSpecial' },
        value: 40,
      },
    ],
    enemyStats: [{ tag: { q: 'defRed_' }, value: 15 }],
  },
  'Bullying Tactics': {
    bonusStats: [
      { tag: { q: 'dmg_', qt: 'combat', attribute: 'ice' }, value: 20 },
      { tag: { q: 'dmg_', qt: 'combat', attribute: 'ether' }, value: 20 },
      { tag: { q: 'dmg_', qt: 'combat', damageType1: 'basic' }, value: 50 },
      { tag: { q: 'dmg_', qt: 'combat', damageType1: 'dash' }, value: 50 },
    ],
    enemyStats: [],
  },
}

function getActiveSeason() {
  const now = Date.now()
  for (const season of seasons) {
    const begin = new Date(season.beginTime!).getTime()
    const end = new Date(season.endTime!).getTime()
    if (begin <= now && now < end) return season
  }
  return null
}

type SeasonRoom = (typeof seasons)[number]['rooms'][number]

export function ShiyuDefenseBuffs() {
  const { t } = useTranslation('page_optimize')
  const { database } = useDatabaseContext()
  const { key: characterKey } = useCharacterContext()!
  const team = useTeam(characterKey)!

  const activeSeason = getActiveSeason()
  const rooms = activeSeason?.rooms ?? []

  const applyRoom = (room: SeasonRoom) => {
    const bossStats: TeamEnemyStat[] = []
    if (room.enemyResists)
      Object.entries(room.enemyResists).forEach(([attr, val]) =>
        bossStats.push({
          tag: { q: 'res_', attribute: attr as AttributeKey },
          value: val,
        })
      )
    if (room.enemyWeak)
      Object.entries(room.enemyWeak).forEach(([attr, val]) =>
        bossStats.push({
          tag: { q: 'res_', attribute: attr as AttributeKey },
          value: -val,
        })
      )

    database.teams.set(characterKey, {
      enemyLvl: room.monsterLevel,
      enemyDef: room.bigMonster.stats.Defence,
    })

    const config = room.buff ? buffConfigs[room.buff.title] : null
    if (config) {
      const characterSpecialty = getCharStat(characterKey).specialty
      const newBonusStats: TeamBonusStat[] = config.bonusStats
        .filter(
          ({ specialty }) => !specialty || specialty === characterSpecialty
        )
        .map(({ tag, value }) => ({
          tag,
          value,
          disabled: false,
        }))
      const newEnemyStats: TeamEnemyStat[] = config.enemyStats
        .filter(
          ({ specialty }) => !specialty || specialty === characterSpecialty
        )
        .map(({ tag, value }) => ({
          tag,
          value,
        }))
      database.teams.setFrame0(characterKey, (frame) => {
        const nonResists = frame.enemyStats.filter((s) => s.tag.q !== 'res_')
        return {
          bonusStats: newBonusStats,
          enemyStats: [...bossStats, ...nonResists, ...newEnemyStats],
          description: `sd_room:${room.id}`,
        }
      })
    } else {
      database.teams.setFrame0(characterKey, {
        enemyStats: bossStats,
        description: `sd_room:${room.id}`,
      })
    }
  }

  const selectedRoomId = getTeamFrame0(team).description?.startsWith('sd_room:')
    ? getTeamFrame0(team).description!.slice(8)
    : null

  if (!activeSeason) return null

  return (
    <CardThemed bgt="light">
      <CardSection>
        <Stack gap={1.5}>
          <Text size="sm" fw={700}>
            {`${t('sdBuffs')} - ${activeSeason.name}`}
          </Text>
          <Group gap={1}>
            {rooms.map((room) => {
              const hasConfig = room.buff && !!buffConfigs[room.buff.title]
              return (
                <CardThemed
                  key={room.id}
                  bgt="dark"
                  style={{
                    flex: '1 1 200px',
                    outline: `2px solid ${
                      room.id === selectedRoomId
                        ? 'var(--mantine-color-yellow-6)'
                        : 'transparent'
                    }`,
                    opacity: hasConfig ? 1 : 0.5,
                  }}
                >
                  <CardSection
                    onClick={() => hasConfig && applyRoom(room)}
                    style={{ cursor: hasConfig ? 'pointer' : 'default' }}
                  >
                    <Stack p={4}>
                      <Box
                        component="img"
                        src={`${BOSS_CDN}/Monster_${room.bigMonster.image}.webp`}
                        alt={room.bigMonster.name}
                        style={{
                          width: 96,
                          height: 96,
                          objectFit: 'contain',
                          margin: '0 auto',
                        }}
                        onError={(e) => {
                          const el = e.target as HTMLImageElement
                          el.style.display = 'none'
                        }}
                      />
                      <Text size="xs" fw={700} style={{ textAlign: 'center' }}>
                        {room.bigMonster.name}
                      </Text>
                      <Text size="xs" style={{ textAlign: 'center' }}>
                        {room.name}
                      </Text>
                      {room.buff && (
                        <Text size="xs" style={{ textAlign: 'center' }}>
                          {room.buff.title}
                        </Text>
                      )}
                      {room.buff && (
                        <Text
                          size="xs"
                          style={{ textAlign: 'center' }}
                          dangerouslySetInnerHTML={{
                            __html: room.buff.desc
                              .replace(/\n/g, ' ')
                              .replace(
                                /<color=(#[A-Fa-f0-9]{6})>/g,
                                '<span style="color:$1">'
                              )
                              .replace(/<\/color>/g, '</span>')
                              .trim(),
                          }}
                        />
                      )}
                      {!hasConfig && room.buff && (
                        <Text size="xs" style={{ textAlign: 'center' }}>
                          No stat mapping
                        </Text>
                      )}
                    </Stack>
                  </CardSection>
                </CardThemed>
              )
            })}
          </Group>
        </Stack>
      </CardSection>
    </CardThemed>
  )
}
