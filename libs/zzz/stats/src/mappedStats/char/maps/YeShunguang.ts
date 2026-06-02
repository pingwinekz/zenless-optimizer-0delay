import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'YeShunguang'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackSwiftedge: data_gen.skillParams['basic']['BasicAttackSwiftedge'],
    BasicAttackCloudstreamSwordWill:
      data_gen.skillParams['basic']['BasicAttackCloudstreamSwordWill'],
    BasicAttackEnlightenedMindSplittingCurrents:
      data_gen.skillParams['basic'][
        'BasicAttackEnlightenedMindSplittingCurrents'
      ],
    BasicAttackEnlightenedMindSkywardAscent:
      data_gen.skillParams['basic']['BasicAttackEnlightenedMindSkywardAscent'],
    BasicAttackEnlightenedMindSunderlightMaximum:
      data_gen.skillParams['basic'][
        'BasicAttackEnlightenedMindSunderlightMaximum'
      ],
    BasicAttackEnlightenedMindSunderlight:
      data_gen.skillParams['basic']['BasicAttackEnlightenedMindSunderlight'],
    BasicAttackEnlightenedMindSunderlightAnnihilation:
      data_gen.skillParams['basic'][
        'BasicAttackEnlightenedMindSunderlightAnnihilation'
      ],
    Culmination: data_gen.skillParams['basic']['Culmination'],
  },
  dodge: {
    DodgeLeaveNoTrace: data_gen.skillParams['dodge']['DodgeLeaveNoTrace'],
    DodgeWanderingCloud: data_gen.skillParams['dodge']['DodgeWanderingCloud'],
    DashAttackPhantasmDash:
      data_gen.skillParams['dodge']['DashAttackPhantasmDash'],
    DodgeCounterSwallowStrike:
      data_gen.skillParams['dodge']['DodgeCounterSwallowStrike'],
  },
  special: {
    SpecialAttackGuidingTides:
      data_gen.skillParams['special']['SpecialAttackGuidingTides'],
    EXSpecialAttackGaleSuppression:
      data_gen.skillParams['special']['EXSpecialAttackGaleSuppression'],
    SpecialAttackEnlightenedMindCleanExit:
      data_gen.skillParams['special']['SpecialAttackEnlightenedMindCleanExit'],
    EXSpecialAttackEnlightenedMindSoaringLight:
      data_gen.skillParams['special'][
        'EXSpecialAttackEnlightenedMindSoaringLight'
      ],
    EXSpecialAttackEnlightenedMindReturnToDust:
      data_gen.skillParams['special'][
        'EXSpecialAttackEnlightenedMindReturnToDust'
      ],
  },
  chain: {
    ChainAttackSmiteTheWicked:
      data_gen.skillParams['chain']['ChainAttackSmiteTheWicked'],
    UltimateChasingStorms:
      data_gen.skillParams['chain']['UltimateChasingStorms'],
    ChainAttackEnlightenedMindLureThunder:
      data_gen.skillParams['chain']['ChainAttackEnlightenedMindLureThunder'],
    UltimateCleavingHeavens:
      data_gen.skillParams['chain']['UltimateCleavingHeavens'],
  },
  assist: {
    EntrySkillIlluminatingDarkness:
      data_gen.skillParams['assist']['EntrySkillIlluminatingDarkness'],
    QuickAssistSupportGuard:
      data_gen.skillParams['assist']['QuickAssistSupportGuard'],
    AssistFollowUpCeaseHostility:
      data_gen.skillParams['assist']['AssistFollowUpCeaseHostility'],
    DefensiveAssistWhenIReturn:
      data_gen.skillParams['assist']['DefensiveAssistWhenIReturn'],
    QuickAssistEnlightenedMindTacticalSupport:
      data_gen.skillParams['assist'][
        'QuickAssistEnlightenedMindTacticalSupport'
      ],
    AssistFollowUpEnlightenedMindUnification:
      data_gen.skillParams['assist'][
        'AssistFollowUpEnlightenedMindUnification'
      ],
  },
  core: {
    qingmingForce: data_gen.coreParams[0],
    bearerConversion: data_gen.coreParams[1],
    bearerStacks: data_gen.coreParams[3],
    crit_: data_gen.coreParams[4],
    dmg_: data_gen.coreParams[5],
    etherVeilDuration: data_gen.coreParams[6],
    veilVulnerabilityCap: data_gen.coreParams[7],
  },
  ability: {
    qingmingForceOnEtherVeil: data_gen.abilityParams[0],
    bearerIfEnlightened: data_gen.abilityParams[1],
  },
  m1: {
    qingmingForce: data_gen.mindscapeParams[0][0],
    cooldown: data_gen.mindscapeParams[0][1],
    dmg_: data_gen.mindscapeParams[0][2],
    defIgn_: data_gen.mindscapeParams[0][3],
  },
  m2: {
    bearerStacks: data_gen.mindscapeParams[1][0],
    culminationStacks: data_gen.mindscapeParams[1][1],
    qingmingToCulmination: data_gen.mindscapeParams[1][2],
    defIgn_: data_gen.mindscapeParams[1][3],
  },
  m4: {
    decibels: data_gen.mindscapeParams[3][0],
    cooldown: data_gen.mindscapeParams[3][1],
    veilVulnerabilityCap: data_gen.mindscapeParams[3][2],
  },
  m6: {
    initialLanternWish: data_gen.mindscapeParams[5][0],
    lanternWishOnEnlightened: data_gen.mindscapeParams[5][1],
    maxLanternWish: data_gen.mindscapeParams[5][2],
    lanternWishForUltimate: data_gen.mindscapeParams[5][3],
    lanternWishConsumed: data_gen.mindscapeParams[5][4],
    physicalDmg_: data_gen.mindscapeParams[5][5],
  },
} as const

export default dm
