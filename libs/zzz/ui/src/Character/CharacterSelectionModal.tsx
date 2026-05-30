import { useDataEntryBase } from '@genshin-optimizer/common/database-ui'
import {
  CardThemed,
  ImgIcon,
  ModalWrapper,
  SortByButton,
  SqBadge,
} from '@genshin-optimizer/common/ui'
import { filterFunction, sortFunction } from '@genshin-optimizer/common/util'
import {
  characterAsset,
  factionDefIcon,
  rarityDefIcon,
  specialityDefIcon,
} from '@genshin-optimizer/zzz/assets'
import type {
  AttributeKey,
  CharacterKey,
  CharacterRarityKey,
  SpecialityKey,
} from '@genshin-optimizer/zzz/consts'
import {
  allAttributeKeys,
  allCharacterKeys,
  allCharacterRarityKeys,
  allSpecialityKeys,
  milestoneMaxLevel,
} from '@genshin-optimizer/zzz/consts'
import { useCharacter, useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import { getCharStat } from '@genshin-optimizer/zzz/stats'
import { ElementIcon } from '@genshin-optimizer/zzz/svgicons'
import {
  Box,
  CloseButton,
  Divider,
  Skeleton,
  Text,
  TextInput,
} from '@mantine/core'
import type { ChangeEvent } from 'react'
import React, { Suspense, useDeferredValue, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SegmentedFilterRow } from '../toggles'
import {
  type CharacterSortKey,
  characterFilterConfigs,
  characterSortConfigs,
  characterSortMap,
} from './CharacterSort'

export function CharacterSingleSelectionModal({
  show,
  onHide,
  onSelect,
  newFirst = false,
  showNone = false,
}: {
  show: boolean
  onHide: () => void
  onSelect: (cKey: CharacterKey | null) => void
  newFirst?: boolean
  showNone?: boolean
}) {
  const { database } = useDatabaseContext()
  const displayCharacter = useDataEntryBase(database.displayCharacter)
  const [searchTerm, setSearchTerm] = useState('')
  const deferredSearchTerm = useDeferredValue(searchTerm)
  const deferredState = useDeferredValue(displayCharacter)
  const characterKeyList = useMemo(() => {
    const { attribute, specialtyType, rarity, sortType, ascending } =
      deferredState
    const sortByKeys = [
      ...(newFirst ? ['new'] : []),
      ...(characterSortMap[sortType] ?? []),
    ] as CharacterSortKey[]
    const filteredKeys = allCharacterKeys
      .filter(
        filterFunction(
          { attribute, specialtyType, rarity, name: deferredSearchTerm },
          characterFilterConfigs(database)
        )
      )
      .sort(
        sortFunction(sortByKeys, ascending, characterSortConfigs(database), [
          'new',
        ])
      )
    return filteredKeys
  }, [deferredState, newFirst, deferredSearchTerm, database])

  const onClose = () => {
    setSearchTerm('')
    onHide()
  }

  const filterSearchSortProps = {
    searchTerm: searchTerm,
    onChangeSpecialtyFilter: (specialtyType: SpecialityKey[]) => {
      database.displayCharacter.set({ specialtyType })
    },
    onChangeAttributeFilter: (attribute: AttributeKey[]) => {
      database.displayCharacter.set({ attribute })
    },
    onChangeRarityFilter: (rarity: CharacterRarityKey[]) => {
      database.displayCharacter.set({ rarity })
    },
    onChangeSearch: (e: ChangeEvent<HTMLTextAreaElement>) => {
      setSearchTerm(e.target.value)
    },
    onChangeSort: (sortType: CharacterSortKey) => {
      if (sortType !== 'new') database.displayCharacter.set({ sortType })
    },
    onChangeAsc: (ascending: boolean) => {
      database.displayCharacter.set({ ascending })
    },
  }

  return (
    <CharacterSelectionModalBase
      show={show}
      charactersToShow={characterKeyList}
      filterSearchSortProps={filterSearchSortProps}
      onClose={onClose}
    >
      <Box style={{ flex: 1, overflow: 'auto' }}>
        <Suspense fallback={<Skeleton width="100%" height={1000} />}>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '4px',
            }}
          >
            {showNone && (
              <Box>
                <CharacterCard
                  characterKey={undefined}
                  onClick={() => {
                    onHide()
                    onSelect(null)
                  }}
                />
              </Box>
            )}
            {characterKeyList.map((characterKey) => (
              <Box key={characterKey}>
                <CharacterCard
                  characterKey={characterKey}
                  onClick={() => {
                    onHide()
                    onSelect(characterKey)
                  }}
                />
              </Box>
            ))}
          </Box>
        </Suspense>
      </Box>
    </CharacterSelectionModalBase>
  )
}

function CharacterCard({
  characterKey,
  onClick,
}: { characterKey: CharacterKey | undefined; onClick: () => void }) {
  return (
    <CardThemed
      bgt="light"
      style={{
        position: 'relative',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px 16px 16px 16px',
        border: '3px solid var(--layer-2)',
      }}
    >
      <SelectionCard characterKey={characterKey} onClick={onClick} />
    </CardThemed>
  )
}

type FilterSearchSortProps = {
  searchTerm: string
  onChangeSpecialtyFilter: (weaps: SpecialityKey[]) => void
  onChangeAttributeFilter: (elements: AttributeKey[]) => void
  onChangeRarityFilter: (rarity: CharacterRarityKey[]) => void
  onChangeSearch: (e: ChangeEvent<HTMLTextAreaElement>) => void
  onChangeSort: (sortType: CharacterSortKey) => void
  onChangeAsc: (asc: boolean) => void
}

type CharacterSelectionModalBaseProps = {
  show: boolean
  charactersToShow: CharacterKey[]
  filterSearchSortProps: FilterSearchSortProps
  onClose: () => void
  children: React.ReactNode
}
const sortKeys = Object.keys(characterSortMap)

function CharacterSelectionModalBase({
  show,
  charactersToShow: _charactersToShow,
  filterSearchSortProps,
  onClose,
  children,
}: CharacterSelectionModalBaseProps) {
  const { t } = useTranslation('page_characters')
  const { database } = useDatabaseContext()
  const displayCharacter = useDataEntryBase(database.displayCharacter)

  const { specialtyType, attribute, rarity, sortType, ascending } =
    displayCharacter

  return (
    <ModalWrapper
      opened={show}
      onClose={onClose}
      size="75%"
      containerProps={{
        style: {
          height: '100vh',
        },
      }}
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
            placeholder={t('searchPlaceholder')}
            value={filterSearchSortProps.searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              filterSearchSortProps.onChangeSearch(e as any)
            }
            rightSection={
              filterSearchSortProps.searchTerm ? (
                <CloseButton
                  size="sm"
                  onClick={() =>
                    filterSearchSortProps.onChangeSearch({
                      target: { value: '' },
                    } as any)
                  }
                />
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
              currentFilter={specialtyType}
              setCurrentFilters={(specialtyType) =>
                database.displayCharacter.set({ specialtyType })
              }
            />
          </Box>
          <Box style={{ width: 421 }}>
            <SegmentedFilterRow
              tags={allAttributeKeys.map((atr) => ({
                key: atr,
                display: (
                  <ElementIcon
                    ele={atr}
                    iconProps={{ style: { fontSize: '1.3rem' } }}
                  />
                ),
              }))}
              currentFilter={attribute}
              setCurrentFilters={(attribute) =>
                database.displayCharacter.set({ attribute })
              }
            />
          </Box>
          <Box style={{ minWidth: 120 }}>
            <SegmentedFilterRow
              tags={allCharacterRarityKeys.map((rk) => ({
                key: rk,
                display: <ImgIcon src={rarityDefIcon(rk)} size={1.2} />,
              }))}
              currentFilter={rarity}
              setCurrentFilters={(rarity) =>
                database.displayCharacter.set({ rarity })
              }
            />
          </Box>
          <SortByButton
            sortKeys={sortKeys}
            value={sortType}
            onChange={(sortType) =>
              filterSearchSortProps.onChangeSort(sortType)
            }
            ascending={ascending}
            onChangeAsc={(ascending) =>
              filterSearchSortProps.onChangeAsc(ascending)
            }
          />
        </Box>
        <Divider />
        {children}
      </CardThemed>
    </ModalWrapper>
  )
}

function SelectionCard({
  characterKey,
  onClick,
}: {
  characterKey: CharacterKey | undefined
  onClick: () => void
}) {
  const { t } = useTranslation(['page_characters', 'charNames_gen'])
  const character = useCharacter(characterKey)
  const { rarity, attribute, faction, specialty } = characterKey
    ? getCharStat(characterKey)
    : {}
  const { level = 1, promotion = 0, mindscape = 0 } = character ?? {}

  return (
    <Box onClick={onClick} style={{ cursor: 'pointer' }}>
      <Box
        style={{
          position: 'relative',
          width: '100%',
          height: '120px',
          display: 'flex',
          paddingLeft: '3px',
          gap: '0.125rem',
          alignItems: 'center',
        }}
      >
        <Box
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            opacity: 0.7,
            background: attribute
              ? `var(--mantine-color-${attribute}-filled)`
              : 'var(--layer-2)',
          }}
        />
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1,
            flexShrink: 1,
          }}
        >
          {characterKey ? (
            <Box
              component="img"
              style={{ height: '120px', display: 'block' }}
              src={characterAsset(characterKey, 'select')}
            />
          ) : (
            <Box
              style={{
                fontSize: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100px',
                height: '120px',
              }}
            >
              <Text style={{ fontSize: '100px', lineHeight: 1 }}>—</Text>
            </Box>
          )}
        </Box>
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1,
            justifyContent: 'space-evenly',
            background: 'var(--layer-2)',
            padding: '4px 12px',
            width: '100%',
            height: '100%',
          }}
        >
          {characterKey ? (
            <>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.125rem',
                }}
              >
                <Text
                  style={{
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    fontStyle: 'italic',
                  }}
                >
                  {t(`charNames_gen:${characterKey}`)}
                </Text>
              </Box>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.125rem',
                }}
              >
                <ImgIcon
                  size={2}
                  src={factionDefIcon(faction ?? 'BelebogHeavyIndustries')}
                />
                <ElementIcon
                  ele={attribute ?? 'physical'}
                  iconProps={{ style: { fontSize: '1.5em' } }}
                />
                <ImgIcon
                  size={1.5}
                  src={specialityDefIcon(specialty ?? 'anomaly')}
                />
              </Box>

              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <ImgIcon size={1.5} src={rarityDefIcon(rarity ?? 'A')} />
                {!!character && (
                  <Box
                    style={{
                      textShadow: '0 0 5px gray',
                      display: 'flex',
                      gap: '0.25rem',
                    }}
                  >
                    <Box>
                      <Text component="span" style={{ whiteSpace: 'nowrap' }}>
                        {t('charLevel', { level: level })}
                      </Text>
                      <Text component="span" c="dimmed">
                        /{milestoneMaxLevel[promotion]}
                      </Text>
                    </Box>
                    <Text component="span">M{mindscape}</Text>
                  </Box>
                )}

                {!character && (
                  <Text component="span">
                    <SqBadge color={'electric'}>
                      {t('characterEditor.new')}
                    </SqBadge>
                  </Text>
                )}
              </Box>
            </>
          ) : (
            <Text>{t('characterEditor.none')}</Text>
          )}
        </Box>
      </Box>
    </Box>
  )
}
