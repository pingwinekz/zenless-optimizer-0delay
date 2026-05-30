export const OptimizerMenuIds = {
  characterOptions: 'Character options',
  relicAndStatFilters: 'Relic & stat filters',
  teammates: 'Teammates',
  characterStatsSimulation: 'Character custom stats simulation',
}

export const initialMenuState: Record<string, boolean> = {
  [OptimizerMenuIds.characterOptions]: true,
  [OptimizerMenuIds.relicAndStatFilters]: true,
  [OptimizerMenuIds.teammates]: true,
  [OptimizerMenuIds.characterStatsSimulation]: false,
}
