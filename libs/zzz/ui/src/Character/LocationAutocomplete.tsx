import type { GeneralAutocompleteOption } from '@genshin-optimizer/common/ui'
import { GeneralAutocomplete } from '@genshin-optimizer/common/ui'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allCharacterKeys } from '@genshin-optimizer/zzz/consts'
import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import { Skeleton } from '@mantine/core'
import { Suspense, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CharIconCircle } from './CharIconCircleElement'

export function LocationAutocomplete({
  locKey,
  setLocKey,
  ...props
}: {
  locKey: CharacterKey | ''
  setLocKey: (v: CharacterKey | '') => void
}) {
  const { t } = useTranslation(['common', 'charNames_gen'])
  const { database } = useDatabaseContext()

  const options: GeneralAutocompleteOption<CharacterKey | ''>[] = useMemo(
    () => [
      {
        key: '',
        label: t('inventory'),
      },
      ...allCharacterKeys
        .filter((key) => database.chars.get(key))
        .map(
          (key): GeneralAutocompleteOption<CharacterKey | ''> => ({
            key,
            label: t(`charNames_gen:${key}`),
            favorite: false,
          })
        ),
    ],
    [database.chars, t]
  )

  const toImg = useCallback(
    (key: typeof locKey) =>
      key === '' ? undefined : <CharIconCircle characterKey={key} />,
    []
  )

  return (
    <Suspense fallback={<Skeleton width={100} height={20} />}>
      <GeneralAutocomplete
        size="sm"
        options={options}
        toImg={toImg}
        valueKey={locKey}
        onChange={(k) => setLocKey((k ?? '') as CharacterKey | '')}
        {...(props as any)}
      />
    </Suspense>
  )
}
