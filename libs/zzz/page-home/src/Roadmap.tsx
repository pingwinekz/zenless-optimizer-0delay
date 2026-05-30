/* eslint-disable jsx-a11y/accessible-emoji */
import { SqBadge } from '@genshin-optimizer/common/ui'
import { ZCard } from '@genshin-optimizer/zzz/ui'
import { CardSection, List, Stack, Text, Title } from '@mantine/core'

export function Roadmap() {
  return (
    <ZCard>
      <CardSection>
        <Title order={5}>
          <span role="img" aria-label="rocket">
            🚀
          </span>{' '}
          Roadmap to ZZZero-maxxing
        </Title>

        <Stack gap={2}>
          <ZCard bgt="dark">
            <CardSection>
              {/* Milestone 1 */}
              <Title order={6}>
                <span role="img" aria-label="target">
                  🎯
                </span>{' '}
                Milestone 1: MVPish <SqBadge color="green">COMPLETED</SqBadge>
              </Title>
              <Text>
                A real test of "What's the absolute <strong>least</strong> I can
                do and still call it an optimizer?" 🤡
              </Text>
              <List>
                <List.Item>❌ No datamine (we rawdoggin' the stats)</List.Item>
                <List.Item>🦴 Bare bones Disc inventory</List.Item>
                <List.Item>
                  📸 Scan discs using screenshot tech (caveman mode engaged)
                </List.Item>
                <List.Item>
                  ✏️ Stats editor for solver inputs (DIY optimizer experience)
                </List.Item>
                <List.Item>
                  🏗️ Minimal disc filter/force sets for solver
                </List.Item>
                <List.Item>
                  📜 Napkin sketch calculations (trust me bro numbers)
                </List.Item>
                <List.Item>
                  🎯 General damage targets (aka 'hit big numbers around this
                  area')
                </List.Item>
                <List.Item>🔄 2p Disc effects (the bare minimum™)</List.Item>
                <List.Item>💪 Brute force solver</List.Item>
              </List>
            </CardSection>
          </ZCard>

          <ZCard bgt="dark">
            <CardSection>
              {/* Milestone 2 */}
              <Title order={6}>
                <span role="img" aria-label="lightbulb">
                  💡
                </span>{' '}
                Milestone 2: I NEED THIS{' '}
                <SqBadge color="green">COMPLETED</SqBadge>
              </Title>
              <List>
                <List.Item>🧙‍♂️ Scuffed datamine via Hakushin API</List.Item>
                <List.Item>
                  📥 Import character & Wengine stats (No more manual typing,
                  rejoice!)
                </List.Item>
                <List.Item>
                  🎭 4p Disc conditionals (because 2p ain't enough)
                </List.Item>
                <List.Item>
                  📂 Disc inventory with filters (finally some organization)
                </List.Item>
              </List>
            </CardSection>
          </ZCard>

          <ZCard bgt="dark">
            <CardSection>
              {/* Milestone 3 */}
              <Title order={6}>
                <span role="img" aria-label="gem">
                  💎
                </span>{' '}
                Milestone 3: I WANT THIS.{' '}
                <SqBadge color="green">COMPLETED</SqBadge>
              </Title>
              <Text>
                We're entering <strong>premium optimizer experience</strong>{' '}
                territory. 🛠️✨
              </Text>
              <List>
                <List.Item>
                  🔧 Wengine conditionals (min-maxers be eatin' GOOD 🧠💪)
                </List.Item>
                <List.Item>
                  🕵️‍♂️ Advanced 2p/4p set filters (no more 💩 builds—only PEAK
                  performance)
                </List.Item>
                <List.Item>
                  ❌ Auto-yeet trash builds (bad builds? Deleted. Skill issue.)
                </List.Item>
                <List.Item>
                  🎨 UI glow-up (no more 'made by a programmer' vibes, we fancy
                  now 😎)
                </List.Item>
              </List>
            </CardSection>
          </ZCard>

          <ZCard bgt="dark">
            <CardSection>
              {/* Milestone 4: Engine Swap */}
              <Title order={6}>
                <span role="img" aria-label="gear">
                  ⚙️
                </span>{' '}
                Milestone 4: ENGINE SWAP BABY 🚗💨{' '}
                <SqBadge color="yellow">IN-PROGRESS</SqBadge>
              </Title>
              <List>
                <List.Item>
                  🔥 Pando calculation engine replaces scuffed math
                </List.Item>
                <List.Item>🔍 Compare different builds</List.Item>
                <List.Item>
                  📝 Print out math formulas (show your work, nerd)
                </List.Item>
                <List.Item>
                  🧠 Advanced solver optimization (Pando makes the best and
                  fastest builds, no 🧢)
                </List.Item>
              </List>
            </CardSection>
          </ZCard>

          <ZCard bgt="dark">
            <CardSection>
              {/* Milestone 5 */}
              <Title order={6}>
                <span role="img" aria-label="performing arts">
                  🎭
                </span>{' '}
                Milestone 5: Characters ARE Built Different
              </Title>
              <List>
                <List.Item>🏆 Adding in each character and targets</List.Item>
                <List.Item>
                  🎯 Add multi-target optimization (characters can't just
                  one-shot)
                </List.Item>
                <List.Item>
                  👥 Add team/builds (there is no 'i' in team)
                </List.Item>
              </List>
            </CardSection>
          </ZCard>
        </Stack>
      </CardSection>
    </ZCard>
  )
}
