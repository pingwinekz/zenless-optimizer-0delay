import {
  zodBoolean,
  zodEnumWithDefault,
  zodFilteredArray,
} from '@genshin-optimizer/common/database'
import {
  type CharacterKey,
  allAttributeKeys,
  allCharacterKeys,
  allCharacterRarityKeys,
  allSpecialityKeys,
} from '@genshin-optimizer/zzz/consts'
import { z } from 'zod'
import { DataEntry } from '../DataEntry'
import type { ZzzDatabase } from '../Database'

export const characterSortKeys = [
  'new',
  'level',
  'rarity',
  'name',
  'custom',
  'score',
] as const
export type CharacterSortKey = (typeof characterSortKeys)[number]

const persistedSortKeys = [
  'level',
  'rarity',
  'name',
  'custom',
  'score',
] as const
type PersistedSortKey = (typeof persistedSortKeys)[number]

const displayCharacterSchema = z.object({
  sortType: zodEnumWithDefault(
    persistedSortKeys,
    'level'
  ) as z.ZodType<PersistedSortKey>,
  ascending: zodBoolean(),
  specialtyType: zodFilteredArray(allSpecialityKeys, []),
  attribute: zodFilteredArray(allAttributeKeys, []),
  rarity: zodFilteredArray(allCharacterRarityKeys, []),
  customSortOrder: z
    .array(z.string())
    .refine((arr) =>
      arr.every((k) => allCharacterKeys.includes(k as CharacterKey))
    )
    .default([]),
})
export type IDisplayCharacterEntry = z.infer<typeof displayCharacterSchema>

export class DisplayCharacterEntry extends DataEntry<
  'display_character',
  'display_character',
  IDisplayCharacterEntry,
  IDisplayCharacterEntry
> {
  constructor(database: ZzzDatabase) {
    super(
      database,
      'display_character',
      () => displayCharacterSchema.parse({}),
      'display_character'
    )
  }
  override validate(obj: unknown): IDisplayCharacterEntry | undefined {
    const result = displayCharacterSchema.safeParse(obj)
    return result.success ? result.data : undefined
  }
}
