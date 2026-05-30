import { OptTargetTagRowSxProvider } from '@genshin-optimizer/zzz/formula-ui'
import { StatHighlightContext } from '@genshin-optimizer/zzz/ui'
import { useMemo, useState } from 'react'
import Optimize from './Optimize'

export function CharacterOptDisplay() {
  const [statHighlight, setStatHighlight] = useState('')
  const statHLContextObj = useMemo(
    () => ({ statHighlight, setStatHighlight }),
    [statHighlight, setStatHighlight]
  )

  return (
    <StatHighlightContext.Provider value={statHLContextObj}>
      <OptTargetTagRowSxProvider>
        <Optimize />
      </OptTargetTagRowSxProvider>
    </StatHighlightContext.Provider>
  )
}
