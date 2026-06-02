import { wengineAsset } from '@genshin-optimizer/zzz/assets'
import {
  type CharacterKey,
  type PhaseKey,
  type WengineKey,
  allPhaseKeys,
} from '@genshin-optimizer/zzz/consts'

import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import { getCharStat } from '@genshin-optimizer/zzz/stats'
import {
  CharacterName,
  WengineName,
  WengineSelectionModal,
  useCharacterTabStore,
} from '@genshin-optimizer/zzz/ui'
import { IconX } from '@tabler/icons-react'
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Image,
  Modal,
  SegmentedControl,
  Text,
} from '@mantine/core'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

type CharacterEditForm = {
  mindscape: number
  wengineKey: WengineKey | null
  wenginePhase: PhaseKey
}

export function CharacterEditModal({
  characterKey,
  onClose,
}: {
  characterKey: CharacterKey | null
  onClose: () => void
}) {
  const { t } = useTranslation('page_characters')
  const { database } = useDatabaseContext()
  const [wengineSelectOpen, setWengineSelectOpen] = useState(false)

  const [form, setForm] = useState<CharacterEditForm>({
    mindscape: 0,
    wengineKey: null,
    wenginePhase: 1,
  })
  const [initialForm, setInitialForm] = useState<CharacterEditForm | null>(null)

  useEffect(() => {
    if (!characterKey) {
      setInitialForm(null)
      return
    }
    const char = database.chars.get(characterKey)
    if (!char) return
    const f: CharacterEditForm = {
      mindscape: char.mindscape,
      wengineKey: char.wengineKey || null,
      wenginePhase: char.wenginePhase as PhaseKey,
    }
    setForm(f)
    setInitialForm(f)
  }, [characterKey, database])

  const hasChanges = useMemo(() => {
    if (!initialForm) return false
    return (
      initialForm.mindscape !== form.mindscape ||
      initialForm.wengineKey !== form.wengineKey ||
      initialForm.wenginePhase !== form.wenginePhase
    )
  }, [initialForm, form])

  const charStat = characterKey ? getCharStat(characterKey) : null

  const onSave = () => {
    if (!characterKey) return

    database.chars.set(characterKey, {
      mindscape: form.mindscape,
      wengineKey: form.wengineKey ?? '',
      wenginePhase: form.wenginePhase,
    })

    useCharacterTabStore.getState().setFocusCharacter(characterKey)
    onClose()
  }

  return (
    <>
      <WengineSelectionModal
        show={wengineSelectOpen}
        onHide={() => setWengineSelectOpen(false)}
        onSelect={(wKey) => {
          setForm((f) => ({ ...f, wengineKey: wKey || null }))
          setWengineSelectOpen(false)
        }}
        wengineTypeFilter={charStat?.specialty ?? ''}
        zIndex={210}
      />
      <Modal
        opened={!!characterKey}
        onClose={onClose}
        size={400}
        centered
        withCloseButton={false}
        padding="md"
      >
        <Group mb="md">
          <Text fw={700} size="lg">
            {characterKey && <CharacterName characterKey={characterKey} />}
          </Text>
          <ActionIcon onClick={onClose} style={{ marginLeft: 'auto' }}>
            <IconX />
          </ActionIcon>
        </Group>

        <Text fw={600} mb="xs">
          {t('mindscapeTitle')}
        </Text>
        <Box mb="md">
          <SegmentedControl
            data={[0, 1, 2, 3, 4, 5, 6].map((m) => ({
              value: String(m),
              label: `M${m}`,
            }))}
            value={String(form.mindscape)}
            onChange={(v) => setForm((f) => ({ ...f, mindscape: Number(v) }))}
            fullWidth
            size="xs"
          />
        </Box>

        <Text fw={600} mb="xs">
          {t('editCharacter.wengine')}
        </Text>
        <Box mb="md">
          {form.wengineKey ? (
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 8,
              }}
            >
              <Image
                src={wengineAsset(form.wengineKey, 'icon')}
                w={48}
                h={48}
                fit="contain"
              />
              <Box>
                <Text fw={500}>
                  <WengineName wKey={form.wengineKey} />
                </Text>
                <Button
                  variant="subtle"
                  size="xs"
                  onClick={() => setWengineSelectOpen(true)}
                >
                  {t('editCharacter.change')}
                </Button>
              </Box>
              <ActionIcon
                style={{ marginLeft: 'auto' }}
                onClick={() => setForm((f) => ({ ...f, wengineKey: null }))}
              >
                <IconX />
              </ActionIcon>
            </Box>
          ) : (
            <Button
              variant="default"
              fullWidth
              onClick={() => setWengineSelectOpen(true)}
            >
              {t('editCharacter.selectWengine')}
            </Button>
          )}
          {form.wengineKey && (
            <>
              <Text size="sm" fw={500} mb={4}>
                {t('editCharacter.phase')}
              </Text>
              <SegmentedControl
                data={allPhaseKeys.map((p) => ({
                  value: String(p),
                  label: `P${p}`,
                }))}
                value={String(form.wenginePhase)}
                onChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    wenginePhase: Number(v) as PhaseKey,
                  }))
                }
                fullWidth
                size="xs"
              />
            </>
          )}
        </Box>

        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={onClose}>
            {t('editCharacter.cancel')}
          </Button>
          <Button onClick={onSave} disabled={!hasChanges}>
            {t('editCharacter.save')}
          </Button>
        </Group>
      </Modal>
    </>
  )
}
