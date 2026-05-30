import type { CardBackgroundColor } from '@genshin-optimizer/common/ui'
import type { CSSProperties, FunctionComponent, ReactNode } from 'react'

export type AdDims = { width?: number; height?: number }
export type AdComponent = FunctionComponent<{ children: ReactNode }>

export type AdProps = {
  style?: CSSProperties
  bgt?: CardBackgroundColor
  children: ReactNode
}
