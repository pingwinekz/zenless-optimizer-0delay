import { useDataManagerValues } from '@genshin-optimizer/common/database-ui'
import { CardThemed, ModalWrapper } from '@genshin-optimizer/common/ui'
import type { ICachedDisc } from '@genshin-optimizer/zzz/db'
import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import { DiscCardObj } from '@genshin-optimizer/zzz/ui'
import { IconX, IconCopy } from '@tabler/icons-react'
import {
  ActionIcon,
  Alert,
  Box,
  Card,
  Divider,
  Group,
  Stack,
  Text,
} from '@mantine/core'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
export default function DupModal({
  setDiscToEdit,
  show,
  onHide,
}: {
  setDiscToEdit: (id: string) => void
  show: boolean
  onHide: () => void
}) {
  const { t } = useTranslation('disc')
  return (
    <ModalWrapper opened={show} onClose={onHide}>
      <CardThemed>
        <Group p="sm" style={{ position: 'relative' }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconCopy />
            <Text fw={700}>{t('showDupes')}</Text>
          </Box>
          <ActionIcon onClick={onHide} style={{ marginLeft: 'auto' }}>
            <IconX />
          </ActionIcon>
        </Group>
        <Divider />
        <Card.Section p="sm">
          <DupContent setDiscToEdit={setDiscToEdit} />
        </Card.Section>
      </CardThemed>
    </ModalWrapper>
  )
}
function DupContent({
  setDiscToEdit,
}: {
  setDiscToEdit: (id: string) => void
}) {
  const { t } = useTranslation('disc')
  const { database } = useDatabaseContext()
  const discValuesDirty = useDataManagerValues(database.discs)
  const dupList = useMemo(() => {
    const dups = [] as ICachedDisc[][]
    const discKeys = discValuesDirty && [...database.discs.keys]

    while (discKeys.length !== 0) {
      const discKey = discKeys.shift()
      if (!discKey) continue
      const disc = database.discs.get(discKey)
      if (!disc) continue
      const { duplicated } = database.discs.findDups(disc, discKeys)
      if (!duplicated.length) continue
      const dupKeys = duplicated

      dups.push(
        [disc, ...dupKeys].sort((a) =>
          (database.discs.get(a.location)?.location ?? '') ? -1 : 1
        )
      )
    }
    return dups
  }, [database.discs, discValuesDirty])
  return (
    <Stack gap={2}>
      {dupList.map((dups) => (
        <CardThemed key={dups.join()} style={{ overflowX: 'scroll' }}>
          <Card.Section style={{ display: 'flex', gap: 1 }}>
            {dups.map((dupDisc) => (
              <Box key={dupDisc.id} style={{ minWidth: 300 }}>
                <DiscCardObj
                  disc={dupDisc}
                  setLocation={(location) =>
                    database.discs.set(dupDisc.id, { location })
                  }
                  onLockToggle={() =>
                    database.discs.set(dupDisc.id, ({ lock }) => ({
                      lock: !lock,
                    }))
                  }
                  onDelete={() => database.discs.remove(dupDisc.id)}
                  onEdit={() => setDiscToEdit(dupDisc.id)}
                />
              </Box>
            ))}
          </Card.Section>
        </CardThemed>
      ))}
      {!dupList.length && (
        <Alert variant="light" color="green">
          {t('noDupAlert')}
        </Alert>
      )}
    </Stack>
  )
}
