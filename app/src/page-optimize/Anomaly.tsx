import { Box } from '@mantine/core'
import {
  type Document,
  DocumentDisplay,
} from '@zenless-optimizer/game-opt/sheet-ui'
import { anomalyMeta } from '../formula'
import { TagDisplay } from '../formula-ui'

export function AnomalySection() {
  return (
    <Box>
      {anomalyDocs.map((doc, index) => (
        <DocumentDisplay key={index} document={doc} />
      ))}
    </Box>
  )
}

const anomalyDocs: Document[] = [
  {
    type: 'conditional',
    conditional: {
      label: 'Frostbite',
      metadata: anomalyMeta.conditionals.frostbite,
      fields: [
        {
          title: <TagDisplay tag={anomalyMeta.buffs.frostbite_crit_dmg_.tag} />,
          fieldRef: anomalyMeta.buffs.frostbite_crit_dmg_.tag,
        },
      ],
    },
  },
  {
    type: 'conditional',
    conditional: {
      label: 'Anomaly Time Passed',
      metadata: anomalyMeta.conditionals.anomTimePassed,
    },
  },
]
