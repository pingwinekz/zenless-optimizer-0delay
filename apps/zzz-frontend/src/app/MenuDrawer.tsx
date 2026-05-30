import { Tooltip } from '@mantine/core'
import {
  IconCalculator,
  IconDisc,
  IconHome,
  IconSettings,
  IconUser,
} from '@tabler/icons-react'
import { AnvilIcon } from '@genshin-optimizer/common/svgicons'
import { useMatch, Link as RouterLink } from 'react-router-dom'
import type { ReactNode } from 'react'
import classes from './Sidebar.module.css'

type NavItem = {
  label: string
  icon: ReactNode
  to: string
  value: string
}

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Navigation',
    items: [
      { label: 'Home', icon: <IconHome size={18} />, to: '/', value: '__home' },
      {
        label: 'Discs',
        icon: <IconDisc size={18} />,
        to: '/discs',
        value: 'discs',
      },
      {
        label: 'W-Engines',
        icon: <AnvilIcon />,
        to: '/wengines',
        value: 'wengines',
      },
    ],
  },
  {
    label: 'Optimization',
    items: [
      {
        label: 'Characters',
        icon: <IconUser size={18} />,
        to: '/characters',
        value: 'characters',
      },
      {
        label: 'Optimize',
        icon: <IconCalculator size={18} />,
        to: '/optimize',
        value: 'optimize',
      },
      {
        label: 'Settings',
        icon: <IconSettings size={18} />,
        to: '/settings',
        value: 'settings',
      },
    ],
  },
]

export function ExpandedNav() {
  const match = useMatch({ path: '/:currentTab', end: false })
  const currentTab = match?.params?.currentTab ?? '__home'

  return (
    <div className={classes.root}>
      {navGroups.map((group) => (
        <div key={group.label} className={classes.group}>
          <div className={classes.groupLabel}>{group.label}</div>
          {group.items.map((item) => {
            const isActive = item.value === currentTab
            return (
              <RouterLink
                key={item.value}
                to={item.to}
                className={classes.item}
                data-active={isActive}
              >
                <div className={classes.itemIcon}>{item.icon}</div>
                <span>{item.label}</span>
              </RouterLink>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export function CollapsedNav() {
  const match = useMatch({ path: '/:currentTab', end: false })
  const currentTab = match?.params?.currentTab ?? '__home'

  return (
    <div className={classes.root} style={{ alignItems: 'center' }}>
      {navGroups.map((group) => (
        <div
          key={group.label}
          className={classes.group}
          style={{ alignItems: 'center' }}
        >
          {group.items.map((item) => {
            const isActive = item.value === currentTab
            return (
              <Tooltip
                key={item.value}
                label={item.label}
                position="right"
                withArrow
                openDelay={300}
              >
                <RouterLink
                  to={item.to}
                  className={classes.itemCollapsed}
                  data-active={isActive}
                >
                  {item.icon}
                </RouterLink>
              </Tooltip>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export function MenuDrawer({ collapsed }: { collapsed: boolean }) {
  return collapsed ? <CollapsedNav /> : <ExpandedNav />
}
