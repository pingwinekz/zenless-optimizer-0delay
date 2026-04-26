import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import { register, registerBuff, teamBuff } from '../../util'
import { entriesForChar, getBaseTag, registerAllDmgDazeAndAnom } from '../util'

const key: CharacterKey = 'Cissia'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const sheet = register(
  key,
  entriesForChar(data_gen),

  ...registerAllDmgDazeAndAnom(key, dm),

  registerBuff('team_crit_dmg_', teamBuff.combat.crit_dmg_.add(dm.ability.squadCritDmg_)),
  registerBuff('self_crit_dmg_', teamBuff.combat.crit_dmg_.add(dm.ability.selfCritDmg_))
)
export default sheet