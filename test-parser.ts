import { parseBuffDescription } from './libs/zzz/page-optimize/src/parseBuffDescription'

const testBuffs = [
  {
    name: 'Overwhelming Force',
    desc: '· Agent Sheer DMG increases by 35%, and their <color=#F0D12B>Physical DMG</color> increases by 10%.\n· Agent <color=#FFFFFF>Basic Attack</color>, <color=#FFFFFF>EX Special Attack</color>, and <color=#FFFFFF>Ultimate</color> ignore 10% of enemy <color=#F0D12B>Physical RES</color> on hit.',
  },
  {
    name: 'Sudden Nightfall',
    desc: "· Agent <color=#FFFFFF>Basic Attack</color>, <color=#FFFFFF>Dodge Counter</color>, and <color=#FFFFFF>Ultimate</color> DMG is increased by 20%, and ignores 30% of the enemy's <color=#98EFF0>Ice RES</color>.\n· When inflicting Disorder on an enemy, Agent CRIT DMG is increased by 50%, the enemy's Stun recovery speed is decreased by 15%, and the Stun DMG Multiplier is increased by 30% for 20s. Repeated triggers reset the duration.",
  },
  {
    name: 'Piercing Thunder Strike',
    desc: '· Agent Electric DMG increases by 20%.\n· Agent <color=#FFFFFF>Basic Attack</color>, <color=#FFFFFF>Special Attack</color>, and <color=#FFFFFF>EX Special Attack</color> deal 40% increased DMG and ignore 15% of enemy DEF.',
  },
  {
    name: 'Chaotic Blitz',
    desc: '· Agent Electric DMG increases by 15%.\n· Agent <color=#FFFFFF>Basic Attack</color>, <color=#FFFFFF>EX Special Attack</color>, and <color=#FFFFFF>Ultimate</color> deal 20% increased DMG and ignore 10% of enemy All-DMG RES on hit.',
  },
  {
    name: 'Swift Strike',
    desc: "· When there are 1/2 Agents with the Attack specialty in the squad, the whole squad's ATK increases by 10%/25%.\n· Agents' <color=#FFFFFF>Basic Attack</color> DMG increases by 40% and ignores 20% of the enemy's <color=#2EB6FF>Electric RES</color>.",
  },
  {
    name: 'Shatterboon',
    desc: '· Agent <color=#2EB6FF>Electric DMG</color> and <color=#F0D12B>Physical DMG</color> increase by 20%. When <color=#FFFFFF>Basic Attack</color>, <color=#FFFFFF>Chain Attack</color>, or <color=#FFFFFF>Ultimate</color> hits an enemy, CRIT DMG increases by 30%.\n· While within Ether Veil, Agent ATK increases by 10%, and attacks ignore 15% of enemy DEF.',
  },
  {
    name: 'Decree',
    desc: '· Agent Sheer DMG increases by 20%.\n· After launching EX Special Attack, Agents with Rupture specialty deal 50% bonus CRIT DMG, and their <color=#FFFFFF>EX Special Attack</color> as well as <color=#FFFFFF>Ultimate</color> ignore 30% of enemy <color=#F0D12B>Physical RES</color> on hit for 15s. Repeated triggers reset the duration.',
  },
  {
    name: 'Tempering Body',
    desc: "· Agents deal 20% more DMG and attacks ignore 10% of enemy All-DMG RES.\n· Attack specialty Agents' ATK increases by 20%, <color=#FFFFFF>Basic Attack</color> DMG increases by 40%, and ignore 20% of enemy DEF.",
  },
]

for (const buff of testBuffs) {
  console.log('===', buff.name, '===')
  const result = parseBuffDescription(buff.desc)
  for (const s of result.bonusStats) {
    const parts: string[] = []
    parts.push(s.tag.q)
    if (s.tag.attribute) parts.push(s.tag.attribute)
    if (s.tag.damageType1) parts.push(s.tag.damageType1)
    if (s.tag.damageType2) parts.push(s.tag.damageType2)
    console.log(
      `  ${parts.join('/')}: +${s.value}${s.tag.qt === 'combat' && ['atk_', 'crit_', 'crit_dmg_', 'hp_', 'dmg_', 'sheer_dmg_', 'impact_', 'dazeInc_', 'anomMas_', 'stun_', 'defIgn_', 'resIgn_'].includes(s.tag.q) ? '%' : ''}${s.specialty ? ` [${s.specialty}]` : ''}${s.conditional ? ' (conditional)' : ''}`
    )
  }
  if (result.enemyStats.length > 0) {
    for (const s of result.enemyStats) {
      const parts: string[] = []
      parts.push(s.tag.q)
      if (s.tag.attribute) parts.push(s.tag.attribute)
      console.log(
        `  enemy: ${parts.join('/')}: +${s.value}%${s.specialty ? ` [${s.specialty}]` : ''}${s.conditional ? ' (conditional)' : ''}`
      )
    }
  }
  console.log()
}
