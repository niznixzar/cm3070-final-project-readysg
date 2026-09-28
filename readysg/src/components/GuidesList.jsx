// Guide list, shared by the Guides tab and the guest screen.
import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon, Searchbar, useTheme } from 'react-native-paper';
import { T, CallButton, PressableCard } from './ui';
import { GUIDES, EMERGENCY_NUMBERS } from '../content/guides';
import { space } from '../theme';

// A guide's words, lower-cased, for search.
function searchText(guide) {
  const blockText = guide.blocks.map((b) => b.text ?? (b.items ?? []).join(' '));
  return [guide.title, guide.subtitle, ...blockText].join(' ').toLowerCase();
}

export default function GuidesList() {
  const router = useRouter();
  const { colors } = useTheme();
  const [query, setQuery] = useState('');

  const search = query.trim().toLowerCase();
  const results = search ? GUIDES.filter((g) => searchText(g).includes(search)) : GUIDES;

  return (
    <View style={{ gap: space.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Icon source="check-circle" size={18} color={colors.success} />
        <T variant="smallBold" style={{ color: colors.success }}>All guides work offline</T>
      </View>

      <Searchbar
        placeholder="Search guides, e.g. burns, gas leak, haze"
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
        accessibilityLabel="Search guides"
      />

      <View style={{ flexDirection: 'row', gap: space.sm }}>
        {EMERGENCY_NUMBERS.map((n, i) => (
          <CallButton key={n.number} number={n.number} label={n.label} primary={i === 0} />
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
        {results.map((guide) => (
          <PressableCard
            key={guide.id}
            onPress={() => router.push(`/guide/${guide.id}`)}
            accessibilityLabel={`${guide.title}. ${guide.subtitle}`}
            style={{ width: '47%', flexGrow: 1 }}
          >
            <T variant="bodyBold">{guide.title}</T>
            <T variant="small" style={{ color: colors.onSurfaceVariant }}>{guide.subtitle}</T>
          </PressableCard>
        ))}
        {!results.length ? (
          <T style={{ color: colors.onSurfaceVariant }}>No guides match "{query}". Try a shorter word, like "fire".</T>
        ) : null}
      </View>

      <T variant="caption" style={{ color: colors.onSurfaceVariant }}>
        Content from the SCDF Civil Defence Emergency Handbook (10th ed.) and NEA.
      </T>
    </View>
  );
}
