import { useBoolState } from '@genshin-optimizer/common/react-util'
import { useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import {
  DiscEditorModal,
  DiscInventory,
  useDiscEditorModalStore,
} from '@genshin-optimizer/zzz/ui'

import { Suspense, useCallback } from 'react'
import DupModal from './DupModal'
import classes from './pageDiscs.module.css'

export default function PageDiscs() {
  const [showDup, onShowDup, onHideDup] = useBoolState(false)
  const { database } = useDatabaseContext()
  const openEditorModal = useDiscEditorModalStore((s) => s.openOverlay)

  const onAddNew = useCallback(() => {
    openEditorModal({
      selectedDisc: null,
      onOk: () => {},
    })
  }, [openEditorModal])

  const onEdit = useCallback(
    (id: string) => {
      const disc = database.discs.get(id)
      if (disc) {
        openEditorModal({
          selectedDisc: disc,
          onOk: () => {},
        })
      }
    },
    [database.discs, openEditorModal]
  )

  return (
    <div className={classes.container}>
      <DiscEditorModal />

      <Suspense fallback={false}>
        <DupModal show={showDup} onHide={onHideDup} setDiscToEdit={onEdit} />
      </Suspense>
      <DiscInventory onAdd={onAddNew} onEdit={onEdit} onShowDup={onShowDup} />
    </div>
  )
}
