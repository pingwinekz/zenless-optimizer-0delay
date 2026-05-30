import { discMaxLevel } from '@genshin-optimizer/zzz/consts'
import {
  OptConfigContext,
  useDatabaseContext,
} from '@genshin-optimizer/zzz/db-ui'
import { DiscLevelSlider } from '@genshin-optimizer/zzz/ui'
import { memo, useContext } from 'react'

export const DiscLevelFilter = memo(function DiscLevelFilter({
  disabled = false,
}: {
  disabled?: boolean
}) {
  const { database } = useDatabaseContext()
  const { optConfigId, optConfig } = useContext(OptConfigContext)
  return (
    <DiscLevelSlider
      levelLow={optConfig?.levelLow ?? discMaxLevel['S']}
      levelHigh={optConfig?.levelHigh ?? discMaxLevel['S']}
      setLow={(levelLow) => database.optConfigs.set(optConfigId, { levelLow })}
      setHigh={(levelHigh) =>
        database.optConfigs.set(optConfigId, { levelHigh })
      }
      setBoth={(levelLow, levelHigh) =>
        database.optConfigs.set(optConfigId, {
          levelLow,
          levelHigh,
        })
      }
      disabled={disabled}
    />
  )
})
