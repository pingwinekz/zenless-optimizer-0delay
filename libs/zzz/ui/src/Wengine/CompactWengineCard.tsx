import { CardThemed, ConditionalWrapper } from '@genshin-optimizer/common/ui'
import {
  getUnitStr,
  range,
  statKeyToFixed,
  toPercent,
} from '@genshin-optimizer/common/util'
import { wengineAsset, wenginePhaseIcon } from '@genshin-optimizer/zzz/assets'
import { rarityColor } from '@genshin-optimizer/zzz/consts'
import { useWengine } from '@genshin-optimizer/zzz/db-ui'
import { getWengineStat, getWengineStats } from '@genshin-optimizer/zzz/stats'
import { StatIcon } from '@genshin-optimizer/zzz/svgicons'
import { Box, Skeleton, Text } from '@mantine/core'
import type { ReactNode } from 'react'
import { Suspense, useCallback, useContext } from 'react'
import { ZCard } from '../Components'
import { StatHighlightContext, getHighlightRGBA, isHighlight } from '../context'
import { COMPACT_CARD_HEIGHT_PX, EmptyCompactCard } from '../util'

export function CompactWengineCard({
  wengineId,
  onClick,
}: {
  wengineId: string | undefined
  onClick?: () => void
}) {
  const { statHighlight, setStatHighlight } = useContext(StatHighlightContext)
  const wrapperFunc = useCallback(
    (children: ReactNode) => (
      <Box
        onClick={() => onClick?.()}
        style={{ cursor: 'pointer', borderRadius: 0 }}
      >
        {children}
      </Box>
    ),
    [onClick]
  )
  const falseWrapperFunc = useCallback(
    (children: ReactNode) => <Box>{children}</Box>,
    []
  )
  const wengine = useWengine(wengineId)
  if (!wengine) {
    return (
      <EmptyCompactCard placeholder={'No Wengine Equipped'} onClick={onClick} />
    )
  }
  const wengineStat = getWengineStat(wengine.key)
  const wengineStats = getWengineStats(
    wengine.key,
    wengine.level,
    wengine.phase,
    wengine.modification
  )
  const substatKey = wengineStat['second_statkey']

  return (
    <ZCard bgt="dark">
      <Suspense
        fallback={
          <Skeleton width="100%" height={`${COMPACT_CARD_HEIGHT_PX}px`} />
        }
      >
        <ConditionalWrapper
          condition={!!onClick}
          wrapper={wrapperFunc}
          falseWrapper={falseWrapperFunc}
        >
          <Box
            style={{
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: `${COMPACT_CARD_HEIGHT_PX}px`,
              gap: 4,
            }}
          >
            <Box style={{ display: 'flex', flexGrow: 1 }}>
              <Box
                component="img"
                alt="Wengine Image"
                src={wengineAsset(wengine.key, 'icon')}
                style={{
                  border: `4px solid ${rarityColor[wengineStat.rarity]}`,
                  borderRadius: '12px',
                  background: 'var(--mantine-color-gray-1)',
                  width: `${COMPACT_CARD_HEIGHT_PX - 40}px`,
                  height: `${COMPACT_CARD_HEIGHT_PX - 40}px`,
                }}
              />

              <Box
                style={{
                  marginLeft: '10px',
                  paddingTop: 4,
                  paddingBottom: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                <Text
                  onMouseEnter={() => setStatHighlight('atk')}
                  onMouseLeave={() => setStatHighlight('')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: 'bold',
                    gap: 4,
                    position: 'relative',
                    overflow: 'visible',
                  }}
                >
                  <StatIcon statKey={'atk'} />
                  <Box
                    component="span"
                    style={{ position: 'relative', zIndex: 1 }}
                  >
                    {wengineStats['atk_base'].toFixed()}
                  </Box>
                  <Box
                    style={{
                      content: '""',
                      position: 'absolute',
                      left: '-5%',
                      width: '110%',
                      height: '150%',
                      borderRadius: 4,
                      backgroundColor: getHighlightRGBA(
                        isHighlight(statHighlight, 'atk')
                      ),
                      transition: 'background-color 0.3s ease-in-out',
                    }}
                  />
                </Text>
                <Text
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: 'bold',
                    gap: 4,
                    position: 'relative',
                  }}
                >
                  <StatIcon statKey={substatKey} />
                  <Box
                    component="span"
                    style={{ position: 'relative', zIndex: 1 }}
                  >
                    {toPercent(wengineStats[substatKey], substatKey).toFixed(
                      statKeyToFixed(substatKey)
                    )}
                    {getUnitStr(substatKey)}
                  </Box>
                  <Box
                    style={{
                      content: '""',
                      position: 'absolute',
                      left: '-5%',
                      width: '110%',
                      height: '150%',
                      borderRadius: 4,
                      backgroundColor: getHighlightRGBA(
                        isHighlight(statHighlight, substatKey)
                      ),
                      transition: 'background-color 0.3s ease-in-out',
                    }}
                  />
                </Text>
              </Box>
            </Box>
            <CardThemed
              bgt="light"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px',
              }}
            >
              <Text
                style={{
                  fontWeight: '900',
                }}
              >
                Lv.{wengine.level}
              </Text>
              <Box style={{ display: 'flex', alignItems: 'center' }}>
                {range(1, 5).map((index: number) => (
                  <Box
                    component={'img'}
                    key={`phase-active-${index}`}
                    src={wenginePhaseIcon(
                      index <= wengine.phase ? 'singlePhase' : 'singleNonPhase'
                    )}
                  />
                ))}
              </Box>
            </CardThemed>
          </Box>
        </ConditionalWrapper>
      </Suspense>
    </ZCard>
  )
}
