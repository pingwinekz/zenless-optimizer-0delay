import { AdBlockContextWrapper } from '@genshin-optimizer/common/ad'
import { ScrollTop } from '@genshin-optimizer/common/ui'
import { isDev } from '@genshin-optimizer/common/util'
import { Box, Flex, MantineProvider, Skeleton } from '@mantine/core'
import { setDebugMode } from '@genshin-optimizer/pando/engine'
import { DatabaseProvider } from '@genshin-optimizer/zzz/db-ui'
import '@genshin-optimizer/zzz/i18n' // import to load translations
import PageHome from '@genshin-optimizer/zzz/page-home'
import {
  createMantineTheme,
  themeResolver,
  useThemeStore,
} from '@genshin-optimizer/zzz/theme'
import { Suspense, lazy, useMemo } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import '../styles.scss'
import Footer from './Footer'
import Header from './Header'
import { LayoutSider } from './LayoutSider'
const PageDiscs = lazy(() => import('@genshin-optimizer/zzz/page-discs'))
const PageOptimize = lazy(() => import('@genshin-optimizer/zzz/page-optimize'))
const PageCharacters = lazy(
  () => import('@genshin-optimizer/zzz/page-characters')
)
const PageWengines = lazy(() => import('@genshin-optimizer/zzz/page-wengines'))
const PageSettings = lazy(() => import('@genshin-optimizer/zzz/page-settings'))

// Enable debug mode for Pando calcs
setDebugMode(isDev)

export default function App() {
  const seedColor = useThemeStore((s) => s.seedColor)
  const mantineTheme = useMemo(() => createMantineTheme(seedColor), [seedColor])

  return (
    <MantineProvider
      theme={mantineTheme}
      cssVariablesResolver={themeResolver}
      defaultColorScheme="dark"
    >
      <DatabaseProvider>
        <HashRouter basename="/">
          <AdBlockContextWrapper>
            <Content />
          </AdBlockContextWrapper>
          <ScrollTop />
        </HashRouter>
      </DatabaseProvider>
    </MantineProvider>
  )
}

function Content() {
  return (
    <Flex direction="column" mih="100vh" pos="relative">
      <Header anchor="back-to-top-anchor" />
      <Flex style={{ flex: 1 }}>
        <LayoutSider />
        <Box
          style={{
            padding: '10px 10px 0 10px',
            margin: '0 auto',
            minHeight: 280,
            overflow: 'initial',
            display: 'flex',
            justifyContent: 'space-around',
            width: '100%',
          }}
        >
          <Suspense fallback={<Skeleton h="100%" />}>
            <Routes>
              <Route index element={<PageHome />} />
              <Route path="/discs" element={<PageDiscs />} />
              <Route path="/optimize" element={<PageOptimize />} />
              <Route path="/characters/*" element={<PageCharacters />} />
              <Route path="/wengines" element={<PageWengines />} />
              <Route path="/settings" element={<PageSettings />} />
            </Routes>
          </Suspense>
        </Box>
      </Flex>

      {/* make sure footer is always at bottom */}
      <div style={{ flexGrow: 1 }} />

      <Footer />
    </Flex>
  )
}
