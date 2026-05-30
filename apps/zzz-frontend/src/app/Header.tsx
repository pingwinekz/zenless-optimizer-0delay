import { shouldShowDevComponents } from '@genshin-optimizer/common/util'
import { ActionIcon, Badge, Box, Flex, Skeleton, Text } from '@mantine/core'
import { IconMenu2, IconX } from '@tabler/icons-react'
import {
  OpenCloseIDs,
  useOpenClose,
} from '@genshin-optimizer/common/react-util'
import { Suspense } from 'react'
import { Link as RouterLink } from 'react-router-dom'

export const HEADER_HEIGHT = 48

export default function Header({ anchor }: { anchor: string }) {
  return (
    <Suspense fallback={<Skeleton h={HEADER_HEIGHT} />}>
      <HeaderContent anchor={anchor} />
    </Suspense>
  )
}

function HeaderContent({ anchor }: { anchor: string }) {
  const { isOpen: isSidebarOpen, toggle: toggleSidebar } = useOpenClose(
    OpenCloseIDs.MENU_SIDEBAR
  )

  return (
    <Box
      component="nav"
      id={anchor}
      bg="dark.9"
      style={{
        height: HEADER_HEIGHT,
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <Flex align="center" h="100%">
        <Flex
          align="center"
          justify="center"
          style={{ width: 56, minWidth: 56 }}
        >
          <ActionIcon variant="transparent" onClick={toggleSidebar}>
            {isSidebarOpen ? <IconX size={16} /> : <IconMenu2 size={16} />}
          </ActionIcon>
        </Flex>
        <Flex
          component={RouterLink as any}
          {...({ to: '/' } as any)}
          align="center"
          gap={8}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <Text
            fw={500}
            fz="md"
            style={{ letterSpacing: '-0.01em', color: 'rgba(255,255,255,0.9)' }}
          >
            Zenless Optimizer
          </Text>
          {shouldShowDevComponents && (
            <Badge size="xs" variant="filled">
              Dev
            </Badge>
          )}
        </Flex>
      </Flex>
    </Box>
  )
}
