import { Box, CloseButton, Flex, Text, TextInput } from '@mantine/core'
import { IconCircleMinus, IconStar } from '@tabler/icons-react'
import { useDataEntryBase } from '@zenless-optimizer/common/database-ui'
import { ImgIcon, ModalWrapper } from '@zenless-optimizer/common/ui'
import type { ChangeEvent } from 'react'
import {
  Suspense,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { rarityDefIcon, specialityDefIcon, wengineAsset } from '../../assets'
import type { CharacterKey, SpecialityKey, WengineKey } from '../../consts'
import {
  allSpecialityKeys,
  allWengineKeys,
  allWengineRarityKeys,
} from '../../consts'
import { useDatabaseContext } from '../../db-ui'
import { characterKeyToWengineKey, getWengineStat } from '../../stats'
import { SegmentedFilterRow } from '../toggles'
import { WengineName } from './WengineTrans'
type WengineSelectionModalProps = {
  show: boolean
  onHide: () => void
  onSelect: (wKey: WengineKey | '') => void
  wengineTypeFilter?: SpecialityKey | ''
  characterKey?: CharacterKey
  zIndex?: number
}

export function WengineSelectionModal({
  show,
  onHide,
  onSelect,
  wengineTypeFilter,
  characterKey,
  zIndex,
}: WengineSelectionModalProps) {
  const { t: tWengine } = useTranslation('wengineNames_gen')
  const { database } = useDatabaseContext()
  const displayWengine = useDataEntryBase(database.displayWengine)

  const [wengineFilter, setWenginefilter] = useState<SpecialityKey[]>(
    wengineTypeFilter ? [wengineTypeFilter] : [...allSpecialityKeys]
  )

  const handleSetWengineFilter = useCallback((keys: SpecialityKey[]) => {
    // Single-select: only the last selected key
    setWenginefilter(keys.length > 1 ? [keys[keys.length - 1]] : keys)
  }, [])

  // Sync external wengineTypeFilter changes
  useEffect(() => {
    if (wengineTypeFilter) {
      setWenginefilter([wengineTypeFilter])
    }
  }, [wengineTypeFilter])

  const [searchTerm, setSearchTerm] = useState('')
  const deferredSearchTerm = useDeferredValue(searchTerm)

  const { rarity } = displayWengine

  const sigWengineKey = useMemo(
    () => (characterKey ? characterKeyToWengineKey[characterKey] : undefined),
    [characterKey]
  )

  const wengineIdList = useMemo(
    () =>
      allWengineKeys
        .filter(
          (wKey) =>
            !wengineFilter.length ||
            wengineFilter.includes(getWengineStat(wKey).type)
        )
        .filter(
          (wKey) =>
            !deferredSearchTerm ||
            tWengine(`${wKey}`)
              .toLowerCase()
              .includes(deferredSearchTerm.toLowerCase())
        )
        .filter(
          (wKey) =>
            !rarity.length || rarity.includes(getWengineStat(wKey).rarity)
        )
        .sort((a, b) => {
          const wengineSortRarityMap = allWengineRarityKeys
          return (
            wengineSortRarityMap.indexOf(getWengineStat(a).rarity) -
            wengineSortRarityMap.indexOf(getWengineStat(b).rarity)
          )
        }),
    [deferredSearchTerm, rarity, tWengine, wengineFilter]
  )

  return (
    <ModalWrapper
      opened={show}
      onClose={onHide}
      zIndex={zIndex}
      size="75%"
      containerProps={{
        style: {
          height: '70%',
          maxWidth: 1200,
          minHeight: 'min(910px, 90dvh)',
        },
      }}
    >
      <Flex direction="column" style={{ height: '100%', overflow: 'hidden' }}>
        {/* ─── Filter bar ─── */}
        <Box p="md" pb={0}>
          <Flex gap="sm" wrap="wrap" align="center">
            {/* Search */}
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
              placeholder="W-Engine"
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              rightSection={
                searchTerm ? (
                  <CloseButton size="sm" onClick={() => setSearchTerm('')} />
                ) : undefined
              }
              rightSectionPointerEvents="all"
            />

            {/* Specialty/Class filters */}
            <Box style={{ flex: '1 1 0', minWidth: 240 }}>
              <SegmentedFilterRow
                tags={allSpecialityKeys.map((sk) => ({
                  key: sk,
                  display: <ImgIcon src={specialityDefIcon(sk)} size={1.5} />,
                  flexBasis: `${100 / allSpecialityKeys.length}%`,
                }))}
                currentFilter={wengineFilter}
                setCurrentFilters={handleSetWengineFilter}
              />
            </Box>

            {/* Rarity filters */}
            <Box style={{ flex: '0 0 200px' }}>
              <SegmentedFilterRow
                tags={allWengineRarityKeys.map((rk) => ({
                  key: rk,
                  display: <ImgIcon src={rarityDefIcon(rk)} size={1.2} />,
                  flexBasis: `${100 / allWengineRarityKeys.length}%`,
                }))}
                currentFilter={rarity}
                setCurrentFilters={(keys) =>
                  database.displayWengine.set({
                    rarity: keys.length > 1 ? [keys[keys.length - 1]] : keys,
                  })
                }
              />
            </Box>
          </Flex>
        </Box>

        {/* ─── W-Engine card grid ─── */}
        <Box style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          <Suspense fallback={null}>
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(115px, 1fr))',
                gap: 6,
              }}
            >
              {/* Unequip / None option */}
              <SelectionCard
                wengineKey={undefined}
                onClick={() => {
                  onHide()
                  onSelect('')
                }}
              />
              {wengineIdList.map((wengineKey) => (
                <SelectionCard
                  key={wengineKey}
                  wengineKey={wengineKey}
                  isSignature={wengineKey === sigWengineKey}
                  onClick={() => {
                    onHide()
                    onSelect(wengineKey)
                  }}
                />
              ))}
            </Box>
          </Suspense>
        </Box>
      </Flex>
    </ModalWrapper>
  )
}

/**
 * Fribbels-style wengine selection card:
 * - Icon image with object-position offset
 * - Rarity-based accent border (gold for S, purple for A, blue/grey for B)
 * - Name overlay at bottom (2-line clamp)
 * - Hover lift effect
 */
function SelectionCard({
  wengineKey,
  isSignature,
  onClick,
}: {
  wengineKey: WengineKey | undefined
  isSignature?: boolean
  onClick: () => void
}) {
  const stat = wengineKey ? getWengineStat(wengineKey) : undefined
  const rarity = stat?.rarity ?? 'A'

  const rarityAccent =
    rarity === 'S'
      ? 'var(--mantine-color-yellow-7)'
      : rarity === 'A'
        ? 'var(--mantine-color-grape-7)'
        : 'var(--mantine-color-blue-7)'

  const rarityStripe =
    rarity === 'S'
      ? 'linear-gradient(90deg, var(--mantine-color-yellow-6), var(--mantine-color-yellow-4))'
      : rarity === 'A'
        ? 'linear-gradient(90deg, var(--mantine-color-grape-6), var(--mantine-color-grape-4))'
        : 'linear-gradient(90deg, var(--mantine-color-blue-6), var(--mantine-color-blue-4))'

  return (
    <Box
      onClick={onClick}
      style={{
        cursor: 'pointer',
        position: 'relative',
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: 'var(--mantine-color-dark-7)',
        border: `2px solid ${rarityAccent}`,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      {wengineKey && stat ? (
        <>
          {/* W-Engine icon */}
          <Box
            component="img"
            src={wengineAsset(wengineKey)}
            alt=""
            style={{
              display: 'block',
              width: '100%',
              aspectRatio: '115 / 112',
              objectFit: 'cover',
              objectPosition: '50% 0%',
            }}
          />

          {/* Rarity indicator stripe at top */}
          <Box
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: rarityStripe,
            }}
          />

          {/* Signature weapon badge */}
          {isSignature && (
            <Box
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: 'var(--mantine-color-yellow-6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
              }}
            >
              <IconStar size={14} fill="white" color="white" />
            </Box>
          )}

          {/* Name overlay at bottom (2-line clamp) */}
          <Box
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
              padding: '24px 6px 5px',
            }}
          >
            <Text
              size="xs"
              style={{
                color: '#fff',
                fontWeight: 600,
                textAlign: 'center',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.3,
                wordBreak: 'break-word',
              }}
            >
              <WengineName wKey={wengineKey} />
            </Text>
          </Box>
        </>
      ) : (
        /* Empty slot for "Unequip" option */
        <Flex
          direction="column"
          align="center"
          justify="center"
          gap={4}
          style={{ width: '100%', aspectRatio: '115 / 112', padding: 8 }}
        >
          <IconCircleMinus size={32} />
          <Text size="xs" c="dimmed" style={{ textAlign: 'center' }}>
            Unequip
          </Text>
        </Flex>
      )}
    </Box>
  )
}
