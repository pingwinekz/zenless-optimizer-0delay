import {
  readFileSync,
  readdirSync,
  writeFileSync,
  existsSync,
  mkdirSync,
} from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..', '..', '..', '..')
const bossDir = join(root, 'libs/zzz/dm/HakushinData/boss')
const outDir = join(root, 'libs/zzz/page-optimize/src')
const outFile = join(outDir, 'daSeasons_gen.json')

if (!existsSync(bossDir)) {
  console.error(`Boss data directory not found: ${bossDir}`)
  process.exit(1)
}

const files = readdirSync(bossDir)
  .filter((f) => f.endsWith('.json'))
  .sort()
const seasons = files.map((f) => {
  const raw = JSON.parse(readFileSync(join(bossDir, f), 'utf-8'))

  const zones = Object.entries(raw.Zone).map(([zoneId, zone]) => {
    const room = Object.values(zone.LayerRoom)[0]
    const monsterList = room ? Object.values(room.MonsterList) : []
    const monster = monsterList[0] ?? {}

    const iconPath = room?.MonsterIcon ?? ''
    const iconFile = iconPath.split('/').pop() ?? ''
    const monsterImage = iconFile
      .replace(/^IconMonster_/, '')
      .replace(/\.png$/, '')

    return {
      name: zone.Name,
      monsterLevel: zone.MonsterLevel,
      monsterName: monster.Name,
      monsterDef: monster.Stats?.Defence,
      monsterImage,
      buffs: Object.entries(zone.SelectableBuff ?? {}).map(([id, b]) => ({
        id,
        title: b.Title,
        desc: b.Desc,
      })),
    }
  })

  return {
    id: raw.Id,
    beginTime: raw.BeginTime,
    endTime: raw.EndTime,
    zones,
  }
})

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
writeFileSync(outFile, JSON.stringify(seasons, null, 2))
console.log(`Generated ${outFile} with ${seasons.length} seasons`)
