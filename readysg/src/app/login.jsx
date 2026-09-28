import { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { Avatar, HelperText, TextInput, useTheme } from 'react-native-paper';
import { useAuth, authErrorMessage } from '../context/AuthContext';
import { Screen, T, H, Field, Button, Card } from '../components/ui';
import { space } from '../theme';

export default function Login() {
  const { user, signIn, resetPassword } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const passwordRef = useRef(null);

  if (user) return <Redirect href="/" />;

  const submit = async () => {
    setError('');
    if (!email || !password) return setError('Enter your email and password.');
    setBusy(true);
    try {
      await signIn(email, password);
    } catch (e) {
      setError(authErrorMessage(e));
    }
    setBusy(false);
  };

  const forgotPassword = async () => {
    if (!email) return setError('Enter your email first, then tap Forgot password.');
    try {
      await resetPassword(email);
      Alert.alert('Check your email', `We sent a password reset link to ${email}.`);
    } catch (e) {
      setError(authErrorMessage(e));
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen contentStyle={{ paddingTop: 40, gap: space.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <Avatar.Icon size={52} icon="medical-bag" color="#ffffff" style={{ backgroundColor: colors.emergency }} />
          <T variant="title">ReadySG</T>
        </View>
        <H level={1}>Get prepared, one mission at a time</H>
        <T style={{ color: colors.onSurfaceVariant }}>
          Sign in to keep your progress, streaks and badges across devices.
        </T>

        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <View>
          <Field
            inputRef={passwordRef}
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={submit}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              />
            }
          />
          <Button mode="text" onPress={forgotPassword} style={{ alignSelf: 'flex-start' }}>
            Forgot password?
          </Button>
        </View>

        {error ? (
          <HelperText type="error" visible accessibilityRole="alert" accessibilityLiveRegion="assertive" style={{ fontSize: 16 }}>
            {error}
          </HelperText>
        ) : null}

        <Button mode="contained" onPress={submit} loading={busy} disabled={busy}>
          Sign in
        </Button>
        <Button mode="outlined" onPress={() => router.push('/register')}>
          Create an account
        </Button>

        <Card style={{ marginTop: space.md }}>
          <T variant="bodyBold">In an emergency right now?</T>
          <Button mode="text" onPress={() => router.push('/guides-guest')} style={{ alignSelf: 'flex-start' }}>
            Open emergency guides without signing in
          </Button>
        </Card>
      </Screen>
    </KeyboardAvoidingView>
  );
}
