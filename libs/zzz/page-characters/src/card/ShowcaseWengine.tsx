import { ImgIcon } from '@genshin-optimizer/common/ui'
import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import type { PhaseKey, WengineKey } from '@genshin-optimizer/zzz/consts'
import { Box, Text } from '@mantine/core'
import { OuterShadowRingWrapper } from '../CharacterPreviewComponents'
import styles from './ShowcaseWengine.module.css'

export function ShowcaseWengine({
  wengineKey,
  phase,
  onClick,
}: {
  wengineKey: WengineKey | ''
  phase: PhaseKey
  onClick?: () => void
}) {
  return (
    <OuterShadowRingWrapper>
      <Box className={styles.wengineCard} onClick={onClick}>
        {wengineKey ? (
          <>
            <Box
              component="img"
              src={wengineAsset(wengineKey, 'big')}
              alt=""
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            <Box className={styles.wengineOverlay}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ImgIcon src={wengineAsset(wengineKey, 'icon')} size={1.4} />
                <Text className={styles.wengineName}>{wengineKey}</Text>
              </Box>
              <Text className={styles.wenginePhase}>P{phase}</Text>
            </Box>
          </>
        ) : (
          <Box
            className={styles.wengineOverlay}
            style={{
              justifyContent: 'center',
              minHeight: 44,
            }}
          >
            <Text size="sm" c="dimmed">
              No W-Engine
            </Text>
          </Box>
        )}
      </Box>
    </OuterShadowRingWrapper>
  )
}
