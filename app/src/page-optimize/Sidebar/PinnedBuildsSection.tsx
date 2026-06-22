import { ActionIcon, CloseButton, Flex, Stack, Text } from '@mantine/core'
import { IconPin, IconPinnedOff } from '@tabler/icons-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { useOptimizerDisplayStore } from '../stores/useOptimizerDisplayStore'

export const PinnedBuildsSection = memo(function PinnedBuildsSection() {
  const { t } = useTranslation('page_optimize')
  const pinnedBuilds = useOptimizerDisplayStore((s) => s.pinnedBuilds)
  const removePinnedBuild = useOptimizerDisplayStore((s) => s.removePinnedBuild)
  const clearPinnedBuilds = useOptimizerDisplayStore((s) => s.clearPinnedBuilds)

  return (
    <Stack gap={5}>
      <Flex justify="space-between" align="center">
        <Flex gap={4} align="center">
          <IconPin size={14} />
          <Text fw={700} size="sm">
            {t('pinnedBuilds.title', 'Pinned Builds')}
          </Text>
        </Flex>
        {pinnedBuilds.length > 0 && (
          <ActionIcon
            size="xs"
            variant="subtle"
            onClick={clearPinnedBuilds}
            aria-label={t('pinnedBuilds.clearAll', 'Clear all pins')}
          >
            <IconPinnedOff size={12} />
          </ActionIcon>
        )}
      </Flex>
      {pinnedBuilds.length === 0 ? (
        <Text size="xs" c="dimmed">
          {t(
            'pinnedBuilds.noPinnedBuilds',
            'Click the pin icon on a build row to save it here.'
          )}
        </Text>
      ) : (
        <Stack gap={2}>
          {pinnedBuilds.map((build) => (
            <Flex
              key={build.buildId}
              justify="space-between"
              align="center"
              style={{
                padding: '2px 4px',
                borderRadius: 4,
                backgroundColor: 'var(--mantine-color-dark-6)',
              }}
            >
              <Text size="xs">
                #{build.index + 1} — {build.value.toLocaleString()}
              </Text>
              <CloseButton
                size="xs"
                onClick={() => removePinnedBuild(build.buildId)}
                aria-label={t('pinnedBuilds.unpin', 'Unpin')}
              />
            </Flex>
          ))}
        </Stack>
      )}
    </Stack>
  )
})
