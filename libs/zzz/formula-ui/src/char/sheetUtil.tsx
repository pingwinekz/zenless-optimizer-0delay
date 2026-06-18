import { ColorText, ImgIcon } from '@genshin-optimizer/common/ui'
import { objKeyMap } from '@genshin-optimizer/common/util'
import type { IFormulaData } from '@genshin-optimizer/game-opt/engine'
import type {
  Document,
  UISheetElement,
} from '@genshin-optimizer/game-opt/sheet-ui'
import { commonDefIcon, mindscapeDefIcon } from '@genshin-optimizer/zzz/assets'
import type { CharacterKey, SkillKey } from '@genshin-optimizer/zzz/consts'
import { allSkillKeys } from '@genshin-optimizer/zzz/consts'
import { useCharacter } from '@genshin-optimizer/zzz/db-ui'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { formulas, own } from '@genshin-optimizer/zzz/formula'
import { GameDesc, i18n } from '@genshin-optimizer/zzz/i18n'
import { getCharStat, mappedStats } from '@genshin-optimizer/zzz/stats'
import { TagDisplay } from '../components'
import { st, trans } from '../util'
import type { CharUISheet } from './consts'
import { getVariant } from './util'

type AddlDocumentsPerSkillAbility = Partial<
  Record<SkillKey, Partial<Record<string, Document[]>>>
>
type AddlDocuments = {
  perSkillAbility?: AddlDocumentsPerSkillAbility
  core?: Document[]
  ability?: Document[]
  potential?: Document[]
  m1?: Document[]
  m2?: Document[]
  m3?: Document[]
  m4?: Document[]
  m5?: Document[]
  m6?: Document[]
}

// Creates the base sheet for a character, including all skill dmg, daze and anom values
export function createBaseSheet(
  key: CharacterKey,
  addlDocuments: AddlDocuments = {}
): CharUISheet {
  const hasPotential = getCharStat(key).potentialParams.length > 0

  return {
    ...createSkillsSheets(key, addlDocuments?.perSkillAbility),
    core: createCoreAndAbilitySheet(
      key,
      addlDocuments?.core,
      addlDocuments?.ability
    ),
    ...(hasPotential
      ? { potential: createPotentialSheet(key, addlDocuments?.potential) }
      : {}),
    m1: createMindscapeSheet(key, 1, addlDocuments?.m1),
    m2: createMindscapeSheet(key, 2, addlDocuments?.m2),
    m3: createMindscapeSheet(key, 3, addlDocuments?.m3),
    m4: createMindscapeSheet(key, 4, addlDocuments?.m4),
    m5: createMindscapeSheet(key, 5, addlDocuments?.m5),
    m6: createMindscapeSheet(key, 6, addlDocuments?.m6),
  }
}

// Creates proper field with automatic title for a given buff
export function fieldForBuff(buff: IFormulaData<Tag>) {
  return {
    title: <TagDisplay tag={buff.tag} preventRecursion />,
    fieldRef: buff.tag,
    ...(buff.team !== undefined ? { team: buff.team } : {}),
  }
}

function fieldForSkillFormula(
  charKey: CharacterKey,
  skill: SkillKey,
  formula: IFormulaData<Tag>
) {
  return {
    title: (
      <ColorText color={getVariant(formula.tag)}>
        {abilityFormulaNameToTranslated(charKey, skill, formula.name)}
      </ColorText>
    ),
    fieldRef: formula.tag,
  }
}

function createSkillsSheets(
  charKey: CharacterKey,
  addlDocumentsPerSkillAbility?: AddlDocumentsPerSkillAbility
) {
  const dm = mappedStats.char[charKey]
  if (!dm) {
    console.error('mappedStats.char[' + charKey + '] is undefined')
    return {} as any
  }
  const form = formulas[charKey]
  if (!form) {
    console.error('formulas[' + charKey + '] is undefined')
    return {} as any
  }
  const [chg, _ch] = trans('char', charKey)
  return objKeyMap(
    allSkillKeys,
    (skill): UISheetElement => ({
      title: skill, // TODO: Translate. Though this doesn't seem to be shown anywhere
      img: commonDefIcon(`${skill}Flat`),
      documents: Object.keys(dm[skill]).flatMap((ability): Document[] => [
        {
          type: 'text',
          header: {
            icon: <ImgIcon src={commonDefIcon(`${skill}Flat`)} size={1.5} />,
            text: chg(`${skill}.${ability}.name`),
          },
          text: chg(`${skill}.${ability}.desc`),
        },
        {
          type: 'fields',
          fields: Object.values(form)
            .filter((f: any) => f.name.split('_')[0] === ability)
            .map((f: any) => fieldForSkillFormula(charKey, skill, f)),
        },
        ...(addlDocumentsPerSkillAbility?.[skill]?.[ability] ?? []),
      ]),
    })
  )
}

function abilityFormulaNameToTranslated(
  charKey: CharacterKey,
  skill: SkillKey,
  abilityFormulaName: string
) {
  const [ability, hitNumber, type] = abilityFormulaName.split('_')
  const hitIdx = hitNumber.replace(/\D/g, '')
  return (
    <FormulaNameSpan
      charKey={charKey}
      skill={skill}
      ability={ability}
      hitIdx={hitIdx}
      type={type}
    />
  )
}

/**
 * Renders a formula name (e.g. "BasicAttackSweepingEdge_0_dmg") using the
 * ability's i18n name and a 1-indexed hit number.
 */
function FormulaNameSpan({
  charKey,
  skill,
  ability,
  hitIdx,
  type,
}: {
  charKey: CharacterKey
  skill: SkillKey
  ability: string
  hitIdx: string
  type: string
}) {
  const ns = `char_${charKey}_gen`
  const abilityNameKey = `${ns}:${skill}.${ability}.name`
  const abilityName = i18n.exists(abilityNameKey)
    ? i18n.t(abilityNameKey)
    : ability.replace(/([A-Z])/g, ' $1').trim()
  if (hitIdx) {
    const hitNum = Number(hitIdx) + 1 // 0-indexed → 1-indexed for user display
    return st(type, { val: `${abilityName} #${hitNum} ` })
  }
  return st(type, { val: `${abilityName} ` })
}

function createCoreAndAbilitySheet(
  charKey: CharacterKey,
  addlCoreDocuments: Document[] = [],
  addlAbilityDocuments: Document[] = []
): UISheetElement {
  const [chg, _ch] = trans('char', charKey)
  return {
    title: 'core',
    documents: [
      {
        type: 'text',
        header: {
          icon: <ImgIcon src={commonDefIcon('coreFlat')} size={1.5} />,
          text: chg('core.name'),
        },
        text: (calc) => chg(`core.desc.${calc.compute(own.char.core).val}`),
      },
      ...addlCoreDocuments,
      {
        type: 'text',
        header: {
          icon: <ImgIcon src={commonDefIcon('coreFlat')} size={1.5} />,
          text: chg('ability.name'),
        },
        text: chg('ability.desc'),
      },
      ...addlAbilityDocuments,
    ],
  }
}

function createMindscapeSheet(
  charKey: CharacterKey,
  mindscape: 1 | 2 | 3 | 4 | 5 | 6,
  addlDocuments: Document[] = []
): UISheetElement {
  const [chg, _ch] = trans('char', charKey)
  return {
    title: `mindscape${mindscape}`,
    documents: [
      {
        type: 'text',
        header: {
          icon: <ImgIcon src={mindscapeDefIcon(mindscape)} size={1.5} />,
          text: chg(`mindscapes.${mindscape}.name`),
        },
        text: (
          <>
            {chg(`mindscapes.${mindscape}.desc`)}
            <br />
            <br />
            <i>{chg(`mindscapes.${mindscape}.flavor`)}</i>
          </>
        ),
      },
      ...addlDocuments,
    ],
  }
}

function createPotentialSheet(
  charKey: CharacterKey,
  addlPotentialDocuments: Document[] = []
): UISheetElement {
  const [chg, _ch] = trans('char', charKey)
  return {
    title: 'potential',
    documents: [
      {
        type: 'text',
        header: {
          icon: <ImgIcon src={commonDefIcon('coreFlat')} size={1.5} />,
          text: chg(`potential.name`),
        },
        text: (calc) =>
          chg(`potential.desc.${calc.compute(own.char.potential).val}`),
      },
      ...addlPotentialDocuments,
    ],
  }
}

/**
 * Renders a core passive description using the character's actual core level,
 * so the displayed values match the level the character has unlocked rather
 * than always showing base level 0 values.
 *
 * Uses `useCharacter(characterKey)` to look up the specific character's data,
 * so it works correctly for both the main character and teammates (unlike
 * `useCharacterContext()` which always returns the main character).
 *
 * @param characterKey - The character's key (used to construct both the ns and the db lookup)
 * @param paragraph - Optional paragraph index within the core level's desc.
 *   Omit to render all paragraphs for the core level.
 */
export function CoreGameDesc({
  characterKey,
  paragraph,
}: {
  characterKey: CharacterKey
  paragraph?: number
}) {
  const char = useCharacter(characterKey)
  const coreLevel = char?.core ?? 0
  const suffix = paragraph !== undefined ? `.${paragraph}` : ''
  return (
    <GameDesc
      ns={`char_${characterKey}_gen`}
      key18={`core.desc.${coreLevel}${suffix}`}
    />
  )
}
