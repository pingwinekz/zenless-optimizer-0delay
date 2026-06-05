import { CardThemed } from '@genshin-optimizer/common/ui'
import { ZCard } from '@genshin-optimizer/zzz/ui'
import { Box, CardSection, Group, SimpleGrid, Title } from '@mantine/core'
import { IconFileDescription } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { IntroCard } from './IntroCard'
import QuickLinksCard from './QuickLinksCard'
import { Roadmap } from './Roadmap'
import TeamCard from './TeamCard'

declare const __VERSION__: string
export default function PageHome() {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <SimpleGrid cols={{ base: 1, lg: 3 }} spacing={2}>
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            gridColumn: 'span 2',
          }}
        >
          <IntroCard />
          <Roadmap />
          <ZCard>
            <PatchNotesCard />
          </ZCard>
        </Box>
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <QuickLinksCard />
          <TeamCard />
        </Box>
      </SimpleGrid>
    </Box>
  )
}

function PatchNotesCard() {
  const { t } = useTranslation('page_home')
  const [{ isLoaded, text }, setState] = useState({ isLoaded: false, text: '' })
  useEffect(() => {
    const regex = /^(\d+)\.(\d+)\.(\d+)$/
    const minorVersion = __VERSION__.replace(regex, `$1.$2.${0}`)
    fetch(process.env['NX_URL_GITHUB_API_GO_RELEASES'] + minorVersion)
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        const decoder = new TextDecoder('utf-8')
        const data = decoder.decode(buffer)
        const release = JSON.parse(data)
        setState({ isLoaded: true, text: release.body })
      })
      .catch((err) => console.log('Error: ' + err.message))
  }, [])

  return (
    <CardThemed>
      <Group p="md" style={{ paddingBottom: 0 }}>
        <IconFileDescription />
        <Title order={5}>{t('quickLinksCard.buttons.patchNotes.title')}</Title>
      </Group>
      <CardSection>
        {isLoaded ? (
          <ReactMarkdown children={text} remarkPlugins={[remarkGfm]} />
        ) : (
          'Loading...'
        )}
      </CardSection>
    </CardThemed>
  )
}
