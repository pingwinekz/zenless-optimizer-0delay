import { CardThemed } from '@genshin-optimizer/common/ui'
import {
  useDatabaseContext,
  useDisplayDisc,
} from '@genshin-optimizer/zzz/db-ui'
import type { DiscFilterOption } from '@genshin-optimizer/zzz/util'
import { IconRefresh } from '@tabler/icons-react'
import { Box, Button, Group, Skeleton, Text } from '@mantine/core'
import { t } from 'i18next'
import { Suspense, useCallback } from 'react'
import { Trans } from 'react-i18next'
import { DiscFilterDisplay } from './DiscFilterDisplay'

export default function DiscFilter({
  numShowing,
  total,
  discIds,
}: {
  numShowing: number
  total: number
  discIds: string[]
}) {
  const database = useDatabaseContext().database
  const { filterOption } = useDisplayDisc()
  const filterOptionDispatch = useCallback(
    (option: Partial<DiscFilterOption>) =>
      database.displayDisc.set({
        filterOption: {
          ...filterOption,
          ...option,
        },
      }),
    [database, filterOption]
  )
  return (
    <Suspense fallback={<Skeleton width="100%" height={300} />}>
      <CardThemed>
        <Box p="sm">
          <Group justify="space-between" mb="sm">
            <Text fw={700}>{t('discFilter')}</Text>
            <Text>
              <strong>{numShowing}</strong> / {total}
            </Text>
            <Button
              size="sm"
              color="red"
              onClick={() => database.displayDisc.set({ action: 'reset' })}
              leftSection={<IconRefresh size={16} />}
              variant="default"
            >
              <Trans t={t} i18nKey="ui:reset" />
            </Button>
          </Group>
          <Suspense fallback={<Skeleton width="100%" height={400} />}>
            <DiscFilterDisplay
              filterOption={filterOption}
              filterOptionDispatch={filterOptionDispatch}
              filteredIds={discIds}
            />
          </Suspense>
        </Box>
      </CardThemed>
    </Suspense>
  )
}
