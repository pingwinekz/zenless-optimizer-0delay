import { CardSection } from '@mantine/core'
import { CardThemed } from '@zenless-optimizer/common/ui'
import { DatabaseCard } from '../ui'

export default function PageSettings() {
  return (
    <CardThemed style={{ my: 1 }}>
      <CardSection style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <DatabaseCard />
      </CardSection>
    </CardThemed>
  )
}
