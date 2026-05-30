import type { GeneralAutocompleteOption } from '@genshin-optimizer/common/ui'
import { GeneralAutocomplete, ImgIcon } from '@genshin-optimizer/common/ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { allWengineKeys } from '@genshin-optimizer/zzz/consts'
import { Skeleton } from '@mantine/core'
import { Suspense, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export function WengineAutocomplete({
  wkey,
  setWKey,
  ...props
}: {
  wkey: WengineKey | ''
  setWKey: (v: WengineKey | '') => void
} & Omit<
  React.ComponentProps<typeof GeneralAutocomplete>,
  'options' | 'valueKey' | 'onChange' | 'toImg' | 'renderInput'
>) {
  const { t } = useTranslation('wengineNames_gen')

  const options: GeneralAutocompleteOption<WengineKey | ''>[] = useMemo(
    () => [
      {
        key: '',
        label: 'Select a Wengine',
      },
      ...allWengineKeys.map(
        (key): GeneralAutocompleteOption<WengineKey | ''> => ({
          key,
          label: t(key),
        })
      ),
    ],
    [t]
  )
  const toImg = useCallback(
    (key: WengineKey | '') =>
      !key ? undefined : (
        <ImgIcon
          size={2}
          style={{ width: 'auto' }}
          src={wengineAsset(key, 'icon')}
        />
      ),
    []
  )
  return (
    <Suspense fallback={<Skeleton width={100} />}>
      <GeneralAutocomplete
        size="sm"
        options={options}
        toImg={toImg}
        valueKey={wkey}
        onChange={(k) => setWKey(k ?? '')}
        {...props}
      />
    </Suspense>
  )
}
