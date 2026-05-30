import { damageTypeKeysMap } from '@genshin-optimizer/zzz/formula-ui'
import { Button } from '@mantine/core'

export function AfterShockToggleButton({
  isAftershock,
  setAftershock,
}: {
  isAftershock: boolean
  setAftershock: (aftershock: boolean) => void
}) {
  return (
    <Button
      onClick={() => setAftershock(!isAftershock)}
      color={isAftershock ? 'green' : 'gray'}
    >
      {damageTypeKeysMap.aftershock}
    </Button>
  )
}
