import { IconCircleMinus } from '@tabler/icons-react'
import { useDataEntryBase } from '@genshin-optimizer/common/database-ui'
import {
  CardThemed,
  ImgIcon,
  ModalWrapper,
  usePrev,
} from '@genshin-optimizer/common/ui'
import {
  Box,
  CloseButton,
  Divider,
  SimpleGrid,
  Text,
  TextInput,
} from '@mantine/core'
import {
  rarityDefIcon,
  specialityDefIcon,
  wengineAsset,
} from '@genshin-optimizer/zzz/assets'
import type { SpecialityKey, WengineKey } from '@genshin-optimizer/zzz/consts'
import {
  allRaritykeys,
  allSpecialityKeys,
  allWengineKeys,
  allWengineRarityKeys,
} from '@genshin-optimizer/zzz/consts'
import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import { getWengineStat } from '@genshin-optimizer/zzz/stats'
import type { ChangeEvent } from 'react'
import { useDeferredValue, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SegmentedFilterRow } from '../toggles'
import { WengineName } from './WengineTrans'

type WengineSelectionModalProps = {
  show: boolean
  onHide: () => void
  onSelect: (wKey: WengineKey | '') => void
  wengineTypeFilter?: SpecialityKey | ''
  zIndex?: number
}

export function WengineSelectionModal({
  show,
  onHide,
  onSelect,
  wengineTypeFilter,
  zIndex,
}: WengineSelectionModalProps) {
  const { t } = useTranslation(['page_wengine'])
  const [wengineFilter, setWenginefilter] = useState<SpecialityKey[]>(
    wengineTypeFilter ? [wengineTypeFilter] : [...allSpecialityKeys]
  )
  if (usePrev(wengineTypeFilter) !== wengineTypeFilter && wengineTypeFilter)
    setWenginefilter([wengineTypeFilter])

  const { database } = useDatabaseContext()
  const displayWengine = useDataEntryBase(database.displayWengine)

  const [searchTerm, setSearchTerm] = useState('')
  const deferredSearchTerm = useDeferredValue(searchTerm)

  const { rarity } = displayWengine
  const wengineIdList = useMemo(
    () =>
      allWengineKeys
        .filter((wKey) => wengineFilter.includes(getWengineStat(wKey).type))
        .filter(
          (wKey) =>
            !deferredSearchTerm ||
            t(`${wKey}`)
              .toLowerCase()
              .includes(deferredSearchTerm.toLowerCase())
        )
        .filter((wKey) => rarity.includes(getWengineStat(wKey).rarity))
        .sort((a, b) => {
          const wengineSortRarityMap = allRaritykeys
          return (
            wengineSortRarityMap.indexOf(getWengineStat(a).rarity) -
            wengineSortRarityMap.indexOf(getWengineStat(b).rarity)
          )
        }),
    [deferredSearchTerm, rarity, t, wengineFilter]
  )

  return (
    <ModalWrapper
      opened={show}
      onClose={onHide}
      zIndex={zIndex}
      size="75%"
      containerProps={{ style: { height: '100vh' } }}
    >
      <CardThemed
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <Box
          style={{
            display: 'flex',
            gap: 8,
            padding: '16px',
            alignItems: 'center',
          }}
        >
          <TextInput
            styles={{
              input: {
                height: 40,
                lineHeight: '40px',
                fontSize: 14,
                borderRadius: 4,
              },
            }}
            w={200}
            placeholder={t('wengineName')}
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value.toLowerCase())
            }
            rightSection={
              searchTerm ? (
                <CloseButton size="sm" onClick={() => setSearchTerm('')} />
              ) : undefined
            }
            rightSectionPointerEvents="all"
          />
          <Box style={{ flex: 1 }}>
            <SegmentedFilterRow
              tags={allSpecialityKeys.map((sk) => ({
                key: sk,
                display: <ImgIcon src={specialityDefIcon(sk)} size={1.5} />,
              }))}
              currentFilter={wengineFilter}
              setCurrentFilters={setWenginefilter}
            />
          </Box>
          <Box style={{ minWidth: 180 }}>
            <SegmentedFilterRow
              tags={allWengineRarityKeys.map((rk) => ({
                key: rk,
                display: <ImgIcon src={rarityDefIcon(rk)} size={1.2} />,
              }))}
              currentFilter={rarity}
              setCurrentFilters={(rarity) =>
                database.displayWengine.set({ rarity })
              }
            />
          </Box>
        </Box>
        <Divider />
        <Box style={{ flex: 1, overflow: 'auto' }} p="sm">
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={8}>
            {/* Unequip / None option */}
            <CardThemed
              bgt="light"
              style={{ width: '100%', height: '100%', cursor: 'pointer' }}
            >
              <Box
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  minHeight: 100,
                  padding: 8,
                }}
                onClick={() => {
                  onHide()
                  onSelect('')
                }}
              >
                <IconCircleMinus size={48} />
                <Text size="sm" c="dimmed">
                  {t('wengine:button.unequipWengine')}
                </Text>
              </Box>
            </CardThemed>
            {wengineIdList.map((wengineKey) => {
              const wengineStat = getWengineStat(wengineKey)
              return (
                <CardThemed
                  key={wengineKey}
                  bgt="light"
                  style={{ height: '100%' }}
                >
                  <Box
                    style={{ display: 'flex', cursor: 'pointer' }}
                    onClick={() => {
                      onHide()
                      onSelect(wengineKey)
                    }}
                  >
                    <Box
                      component="img"
                      src={wengineAsset(wengineKey, 'icon')}
                      style={{ width: 100, height: 'auto' }}
                      className={` grad-${wengineStat.rarity}star`}
                    />
                    <Box style={{ flexGrow: 1, padding: '0 8px' }}>
                      <Text>
                        <WengineName wKey={wengineKey} />
                      </Text>
                      <Text style={{ display: 'flex', alignItems: 'baseline' }}>
                        <ImgIcon
                          size={1.5}
                          src={specialityDefIcon(wengineStat.type)}
                        />
                        <ImgIcon
                          size={1.5}
                          src={rarityDefIcon(wengineStat.rarity)}
                        />
                      </Text>
                    </Box>
                  </Box>
                </CardThemed>
              )
            })}
          </SimpleGrid>
        </Box>
      </CardThemed>
    </ModalWrapper>
  )
}
