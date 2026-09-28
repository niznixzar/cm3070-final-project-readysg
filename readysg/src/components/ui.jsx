// Helpers for the few things React Native Paper doesn't provide.
import { Linking, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Appbar,
  Button as PaperButton,
  Card as PaperCard,
  HelperText,
  Text,
  TextInput,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';
import { space, TOUCH } from '../theme';

// Our text variants mapped to Paper's: [Paper variant, bold]
const VARIANTS = {
  display: ['headlineMedium', true],
  title: ['titleLarge', true],
  heading: ['titleMedium', true],
  body: ['bodyLarge', false],
  bodyBold: ['bodyLarge', true],
  small: ['bodyMedium', false],
  smallBold: ['bodyMedium', true],
  caption: ['bodySmall', false],
  captionBold: ['bodySmall', true],
};

export function T({ variant = 'body', style, ...rest }) {
  const [paperVariant, bold] = VARIANTS[variant];
  return <Text variant={paperVariant} style={[bold && { fontWeight: '700' }, style]} {...rest} />;
}

// Screen readers can jump between headings.
export function H({ level = 2, style, children }) {
  const variant = level === 1 ? 'display' : level === 2 ? 'heading' : 'bodyBold';
  return (
    <T variant={variant} accessibilityRole="header" style={style}>
      {children}
    </T>
  );
}

// Paper's Button, at least 48pt tall.
export function Button({ contentStyle, ...props }) {
  return <PaperButton contentStyle={[{ minHeight: TOUCH }, contentStyle]} {...props} />;
}

// Outlined Card with padding and spacing set.
export function Card({ children, style, contentStyle }) {
  return (
    <PaperCard mode="outlined" style={style}>
      <PaperCard.Content style={[{ gap: space.sm, paddingVertical: space.lg }, contentStyle]}>{children}</PaperCard.Content>
    </PaperCard>
  );
}

// Tappable Card. The label sits on the pressable part so screen readers read it.
export function PressableCard({ onPress, accessibilityLabel, style, children }) {
  return (
    <PaperCard mode="outlined" style={style}>
      <TouchableRipple
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        borderless
        style={{ borderRadius: 12 }}
      >
        <PaperCard.Content style={{ gap: space.sm, paddingVertical: space.lg }}>{children}</PaperCard.Content>
      </TouchableRipple>
    </PaperCard>
  );
}

export function Screen({ children, header, scroll = true, edges = ['top'], contentStyle }) {
  const { colors } = useTheme();
  const content = [{ padding: space.xl, paddingTop: space.xs, gap: space.md, paddingBottom: 32 }, contentStyle];
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: colors.background }}>
      {header}
      {scroll ? (
        <ScrollView contentContainerStyle={content} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, content]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

// Title or back button, plus an emergency button. Signed-out users get "Call 995".
export function AppHeader({ title, back, guest = false }) {
  const router = useRouter();
  const { colors } = useTheme();
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <Appbar style={{ backgroundColor: colors.background }}>
      {back ? <Appbar.BackAction onPress={goBack} accessibilityLabel={`Back to ${back}`} /> : null}
      <Appbar.Content title={back ? '' : title} titleStyle={{ fontWeight: '700' }} />
      <Button
        mode="contained"
        buttonColor={colors.emergency}
        textColor="#ffffff"
        icon={guest ? 'phone' : 'medical-bag'}
        onPress={guest ? () => Linking.openURL('tel:995') : () => router.push('/emergency-info')}
        accessibilityLabel={guest ? 'Call 995 for fire or ambulance' : 'Emergency info and emergency numbers'}
        style={{ marginRight: space.md }}
      >
        {guest ? 'Call 995' : 'Emergency'}
      </Button>
    </Appbar>
  );
}

// Outlined TextInput with an optional hint or error below.
export function Field({ label, hint, error, inputRef, style, ...inputProps }) {
  return (
    <View style={style}>
      <TextInput ref={inputRef} mode="outlined" label={label} error={!!error} {...inputProps} />
      {hint || error ? (
        <HelperText type={error ? 'error' : 'info'} visible>
          {error || hint}
        </HelperText>
      ) : null}
    </View>
  );
}

export function ChipRow({ label, children }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityLabel={label}
      contentContainerStyle={{ gap: space.sm }}
    >
      {children}
    </ScrollView>
  );
}

// Opens the phone dialler with the number filled in.
export function CallButton({ number, label, primary }) {
  const { colors } = useTheme();
  const bg = primary ? colors.emergency : colors.surface;
  const fg = primary ? '#ffffff' : colors.onSurface;
  return (
    <TouchableRipple
      onPress={() => Linking.openURL(`tel:${number}`)}
      accessibilityRole="button"
      accessibilityLabel={`Call ${number}, ${label}`}
      borderless
      style={{
        flex: 1,
        minHeight: 64,
        padding: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: primary ? bg : colors.outline,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View style={{ alignItems: 'center' }}>
        <T variant="heading" style={{ color: fg }}>{number}</T>
        <T variant="caption" style={{ color: fg, textAlign: 'center' }}>{label}</T>
      </View>
    </TouchableRipple>
  );
}
