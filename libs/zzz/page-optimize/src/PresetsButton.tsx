import { DropdownButton } from '@genshin-optimizer/common/ui'
import { Menu } from '@mantine/core'

// TODO: Implement presets system
// Presets should save/load character + W-Engine + opt config combinations
export function PresetsButton() {
  return (
    <DropdownButton title="Presets" variant="light" size="sm">
      <Menu.Item disabled>
        <Menu.Label>No presets saved</Menu.Label>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item disabled>
        TODO: Save/Load presets for character, W-Engine, and optimizer config
      </Menu.Item>
    </DropdownButton>
  )
}
