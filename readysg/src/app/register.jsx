import { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { Redirect } from 'expo-router';
import { HelperText } from 'react-native-paper';
import { useAuth, authErrorMessage } from '../context/AuthContext';
import { Screen, AppHeader, H, Field, Button } from '../components/ui';

export default function Register() {
  const { user, register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Redirect href="/" />;

  const submit = async () => {
    setError('');
    if (!name.trim()) return setError('Enter a display name. It shows on leaderboards.');
    if (password.length < 6) return setError('Use a password with at least 6 characters.');
    setBusy(true);
    try {
      await register(name, email, password);
    } catch (e) {
      setError(authErrorMessage(e));
    }
    setBusy(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen header={<AppHeader back="Sign in" guest />}>
        <H level={1}>Create your account</H>
        <Field
          label="Display name"
          hint="Shown on leaderboards. Avoid your full name."
          value={name}
          onChangeText={setName}
          maxLength={40}
          autoComplete="nickname"
        />
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <Field
          label="Password"
          hint="At least 6 characters."
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
        />
        {error ? (
          <HelperText type="error" visible accessibilityRole="alert" accessibilityLiveRegion="assertive" style={{ fontSize: 16 }}>
            {error}
          </HelperText>
        ) : null}
        <Button mode="contained" onPress={submit} loading={busy} disabled={busy}>
          Create account
        </Button>
      </Screen>
    </KeyboardAvoidingView>
  );
}
