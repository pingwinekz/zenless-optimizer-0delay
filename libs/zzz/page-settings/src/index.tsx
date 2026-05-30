import { CardThemed } from '@genshin-optimizer/common/ui'
import { DatabaseCard } from '@genshin-optimizer/zzz/ui'
import { CardSection } from '@mantine/core'

export default function PageSettings() {
  return (
    <CardThemed style={{ my: 1 }}>
      <CardSection style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <DatabaseCard />
      </CardSection>
    </CardThemed>
  )
}
