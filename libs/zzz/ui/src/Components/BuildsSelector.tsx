import { DropdownButton } from '@genshin-optimizer/common/ui'
import { maxBuildsToShowList } from '@genshin-optimizer/zzz/db'
import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import { Menu, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'

export function BuildsSelector({
  maxBuildsToShow,
  optConfigId,
}: {
  maxBuildsToShow: number
  optConfigId: string
}) {
  const { database } = useDatabaseContext()
  const { t } = useTranslation('page_optimize')
  return (
    <DropdownButton title={t('build', { count: maxBuildsToShow })}>
      <Menu.Item>
        <Text size="xs" c="blue">
          {t('buildDropdownDesc')}
        </Text>
      </Menu.Item>
      {maxBuildsToShowList.map((n) => (
        <Menu.Item
          key={n}
          onClick={() =>
            database.optConfigs.set(optConfigId, { maxBuildsToShow: n })
          }
        >
          {t('build', { count: n })}
        </Menu.Item>
      ))}
    </DropdownButton>
  )
}
