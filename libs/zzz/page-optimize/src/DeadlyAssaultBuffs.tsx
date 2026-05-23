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
import {
  Box,
  CardActionArea,
  CardContent,
  Stack,
  Typography,
} from '@mui/material'
import seasons from './daSeasons_gen.json'

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
  'Scorching Frost': {
    bonusStats: [
      { tag: { q: 'anomProf', qt: 'base' }, value: 30 },
      { tag: { q: 'dmg_', qt: 'combat', damageType2: 'abloom' }, value: 10 },
      { tag: { q: 'dmg_', qt: 'combat', attribute: 'ice' }, value: 30 },
    ],
    enemyStats: [{ tag: { q: 'resRed_', attribute: 'ice' }, value: 25 }],
  },
  Decree: {
    bonusStats: [
      { tag: { q: 'sheer_dmg_', qt: 'combat' }, value: 20 },
      {
        tag: { q: 'crit_dmg_', qt: 'combat' },
        value: 50,
        specialty: 'rupture',
      },
      {
        tag: { q: 'resIgn_', qt: 'combat', damageType1: 'special' },
        value: 30,
        specialty: 'rupture',
      },
      {
        tag: { q: 'resIgn_', qt: 'combat', damageType1: 'chain' },
        value: 30,
        specialty: 'rupture',
      },
    ],
    enemyStats: [],
  },
  'Singular Blade': {
    bonusStats: [
      { tag: { q: 'anomProf', qt: 'base' }, value: 20 },
      { tag: { q: 'crit_dmg_', qt: 'combat' }, value: 60 },
    ],
    enemyStats: [{ tag: { q: 'defRed_' }, value: 10 }],
  },
}

function getActiveSeason() {
  const now = Date.now()
  for (const season of seasons) {
    const begin = new Date(season.beginTime).getTime()
    const end = new Date(season.endTime).getTime()
    if (begin <= now && now < end) return season
  }
  return null
}

type SeasonZone = (typeof seasons)[number]['zones'][number]

export function DeadlyAssaultBuffs() {
  const { database } = useDatabaseContext()
  const { key: characterKey } = useCharacterContext()!
  const team = useTeam(characterKey)!

  const activeSeason = getActiveSeason()
  const zones: SeasonZone[] = activeSeason?.zones ?? []
  const seen = new Set<string>()
  const buffs = activeSeason
    ? (zones[0]?.buffs.filter((b) => {
        if (seen.has(b.title)) return false
        seen.add(b.title)
        return true
      }) ?? [])
    : []

  const applyBuff = (title: string) => {
    const config = buffConfigs[title]
    if (!config) return
    const characterSpecialty = getCharStat(characterKey).specialty
    const newBonusStats: TeamBonusStat[] = config.bonusStats
      .filter(({ specialty }) => !specialty || specialty === characterSpecialty)
      .map(({ tag, value }) => ({
        tag,
        value,
        disabled: false,
      }))
    const newEnemyStats: TeamEnemyStat[] = config.enemyStats
      .filter(({ specialty }) => !specialty || specialty === characterSpecialty)
      .map(({ tag, value }) => ({
        tag,
        value,
      }))
    database.teams.setFrame0(characterKey, (frame) => {
      const bossResists = frame.enemyStats.filter((s) => s.tag.q === 'res_')
      return {
        bonusStats: newBonusStats,
        enemyStats: [...bossResists, ...newEnemyStats],
      }
    })
  }

  const selectBoss = (zone: SeasonZone) => {
    const bossStats: TeamEnemyStat[] = []
    if (zone.enemyResists)
      Object.entries(zone.enemyResists).forEach(([attr, val]) =>
        bossStats.push({
          tag: { q: 'res_', attribute: attr as AttributeKey },
          value: val,
        })
      )
    if (zone.enemyWeak)
      Object.entries(zone.enemyWeak).forEach(([attr, val]) =>
        bossStats.push({
          tag: { q: 'res_', attribute: attr as AttributeKey },
          value: -val,
        })
      )
    database.teams.setFrame0(characterKey, {
      description: `da_boss:${zone.name}`,
      enemyStats: bossStats,
    })
    database.teams.set(characterKey, {
      enemyLvl: zone.monsterLevel,
      enemyDef: zone.monsterDef,
    })
  }

  const selectedBossName = getTeamFrame0(team).description?.startsWith(
    'da_boss:'
  )
    ? getTeamFrame0(team).description!.slice(8)
    : null

  if (!activeSeason) return null

  return (
    <CardThemed bgt="light">
      <CardContent>
        <Stack spacing={1.5}>
          <Typography variant="subtitle2">Boss</Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {zones.map((zone) => (
              <CardThemed
                key={zone.name}
                bgt="dark"
                sx={{
                  flex: '1 1 160px',
                  outline: `2px solid ${
                    zone.name === selectedBossName
                      ? 'var(--mui-palette-secondary-main)'
                      : 'transparent'
                  }`,
                }}
              >
                <CardActionArea onClick={() => selectBoss(zone)}>
                  <Stack alignItems="center" sx={{ p: 1 }}>
                    <Box
                      component="img"
                      src={`${BOSS_CDN}/Monster_${zone.monsterImage}.webp`}
                      alt={zone.monsterName ?? zone.name}
                      sx={{ width: 96, height: 96, objectFit: 'contain' }}
                      onError={(e) => {
                        const el = e.target as HTMLImageElement
                        el.style.display = 'none'
                      }}
                    />
                    <Typography variant="caption" textAlign="center">
                      {zone.name}
                    </Typography>
                  </Stack>
                </CardActionArea>
              </CardThemed>
            ))}
          </Stack>
          <Typography variant="subtitle2">Buff</Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {buffs.map((buff) => {
              const hasConfig = !!buffConfigs[buff.title]
              return (
                <CardThemed
                  key={buff.id}
                  bgt="dark"
                  sx={{ flex: '1 1 200px', opacity: hasConfig ? 1 : 0.5 }}
                >
                  <CardActionArea
                    onClick={() => applyBuff(buff.title)}
                    disabled={!hasConfig}
                  >
                    <Stack sx={{ p: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {buff.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        dangerouslySetInnerHTML={{
                          __html: buff.desc
                            .replace(/\n/g, ' ')
                            .replace(
                              /<color=(#[A-Fa-f0-9]{6})>/g,
                              '<span style="color:$1">'
                            )
                            .replace(/<\/color>/g, '</span>')
                            .trim(),
                        }}
                      />
                      {!hasConfig && (
                        <Typography
                          variant="caption"
                          color="warning.main"
                          sx={{ mt: 0.5 }}
                        >
                          No stat mapping configured
                        </Typography>
                      )}
                    </Stack>
                  </CardActionArea>
                </CardThemed>
              )
            })}
          </Stack>
        </Stack>
      </CardContent>
    </CardThemed>
  )
}
