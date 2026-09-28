// Draws guide content blocks from content/guides.js.
import { Linking, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { T, H, Card, Button, CallButton } from './ui';
import { space } from '../theme';

// Rows are stacked cards so they fit at large text sizes, and each is read aloud as one sentence.
function Table({ caption, headers, rows }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: space.sm }}>
      <H level={3}>{caption}</H>
      {rows.map((row, i) => (
        <Card key={i} contentStyle={{ gap: 2, paddingVertical: space.md }}>
          <View accessible accessibilityLabel={row.map((cell, j) => `${headers[j]}: ${cell}`).join('. ')}>
            {row.map((cell, j) => (
              <View key={j} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                <T variant="small" style={{ color: colors.onSurfaceVariant, minWidth: 64 }}>{headers[j]}</T>
                <T variant={j === 0 ? 'bodyBold' : 'body'} style={{ flexShrink: 1 }}>{cell}</T>
              </View>
            ))}
          </View>
        </Card>
      ))}
    </View>
  );
}

function Bullet({ marker, children }) {
  return (
    <View style={{ flexDirection: 'row', gap: space.sm }}>
      <T variant="bodyBold" style={{ minWidth: 22 }} accessibilityElementsHidden importantForAccessibility="no">
        {marker}
      </T>
      <T style={{ flex: 1 }}>{children}</T>
    </View>
  );
}

export default function GuideBlocks({ blocks }) {
  const { colors } = useTheme();

  return (
    <View style={{ gap: space.md }}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'h':
            return <H key={i} style={{ marginTop: space.sm }}>{block.text}</H>;
          case 'p':
            return <T key={i}>{block.text}</T>;
          case 'list':
            return (
              <View key={i} style={{ gap: space.sm }}>
                {block.items.map((item, j) => <Bullet key={j} marker={'•'}>{item}</Bullet>)}
              </View>
            );
          case 'steps':
            return (
              <View key={i} style={{ gap: space.sm }}>
                {block.items.map((item, j) => (
                  <View key={j} accessible accessibilityLabel={`Step ${j + 1}. ${item}`}>
                    <Bullet marker={`${j + 1}.`}>{item}</Bullet>
                  </View>
                ))}
              </View>
            );
          case 'callout':
            return (
              <View key={i} style={{ backgroundColor: colors.errorContainer, borderRadius: 12, padding: space.md }}>
                <T variant="bodyBold" style={{ color: colors.onErrorContainer }}>{block.text}</T>
              </View>
            );
          case 'table':
            return <Table key={i} {...block} />;
          case 'link':
            return (
              <Button key={i} mode="text" icon="open-in-new" onPress={() => Linking.openURL(block.url)} style={{ alignSelf: 'flex-start' }}>
                {block.text}
              </Button>
            );
          case 'call':
            return (
              <View key={i} style={{ flexDirection: 'row' }}>
                <CallButton number={block.number} label={block.label} primary />
              </View>
            );
          default:
            return null; // skip block types we don't know
        }
      })}
    </View>
  );
}
