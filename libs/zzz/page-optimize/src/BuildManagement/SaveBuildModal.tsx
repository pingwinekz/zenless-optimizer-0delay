import {
  OptConfigContext,
  useCharacterContext,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import {
  Button,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { memo, useCallback, useContext } from 'react'
import { useTranslation } from 'react-i18next'

export const SaveBuildModal = memo(function SaveBuildModal({
  opened,
  onClose,
}: {
  opened: boolean
  onClose: () => void
}) {
  const { t } = useTranslation('page_optimize')
  const { database } = useDatabaseContext()
  const { optConfig } = useContext(OptConfigContext)
  const character = useCharacterContext()

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
    },
    validate: {
      name: (value) =>
        value.trim().length < 1
          ? t('buildsSection.nameRequired', 'Name is required')
          : null,
    },
  })

  const handleSave = useCallback(
    (values: { name: string; description: string }) => {
      const listId = optConfig.generatedBuildListId
      if (!listId) return

      const generatedBuildList = database.generatedBuildList.get(listId)
      if (!generatedBuildList || !generatedBuildList.builds.length) return

      // Save each build as a separate saved build entry
      const now = Date.now()
      const characterKey = character?.key ?? ''
      for (const build of generatedBuildList.builds) {
        database.savedBuilds.new({
          name: values.name,
          description: values.description,
          value: build.value,
          wengineKey: build.wengineKey,
          discIds: build.discIds,
          characterKey,
          createdAt: now,
          updatedAt: now,
        })
      }

      form.reset()
      onClose()
    },
    [optConfig.generatedBuildListId, database, form, onClose, character?.key]
  )

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('buildsSection.saveBuild', 'Save Build')}
      size="sm"
    >
      <form onSubmit={form.onSubmit(handleSave)}>
        <Stack gap="sm">
          <Text size="xs" c="dimmed">
            {t(
              'buildsSection.saveDescription',
              'Save the current generated build list with a name so you can load it later.'
            )}
          </Text>
          <TextInput
            label={t('buildsSection.buildName', 'Build Name')}
            placeholder={t('buildsSection.namePlaceholder', 'My Build')}
            required
            {...form.getInputProps('name')}
          />
          <Textarea
            label={t('buildsSection.description', 'Description (optional)')}
            placeholder={t(
              'buildsSection.descPlaceholder',
              'Some notes about this build...'
            )}
            autosize
            minRows={2}
            maxRows={4}
            {...form.getInputProps('description')}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              {t('buildsSection.cancel', 'Cancel')}
            </Button>
            <Button type="submit">{t('buildsSection.save', 'Save')}</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
})
