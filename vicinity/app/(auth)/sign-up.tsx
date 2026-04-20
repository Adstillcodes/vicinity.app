import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useSupabaseAuth';
import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const result = await signUp(email, password);
      if (result.success) {
        router.replace({ pathname: '/(auth)/verify', params: { email } });
      } else {
        setError(result.error || 'Failed to sign up');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.bg }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.pinIcon}>
            <View style={[styles.pinShape, { borderColor: theme.colors.muted }]}>
              <View style={[styles.pinDot, { backgroundColor: theme.colors.muted }]} />
            </View>
          </View>
          <Text style={[styles.wordmark, { color: theme.colors.ink }]}>Vicinity</Text>
          <Text style={[styles.tagline, { color: theme.colors.muted }]}>
            Find your people, wherever you are.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.inputLabel, { color: theme.colors.muted }]}>Email</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.colors.bg3, borderColor: theme.colors.border }]}>
            <TextInput
              placeholder="you@example.com"
              placeholderTextColor={theme.colors.muted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={[styles.input, { color: theme.colors.ink }]}
            />
          </View>

          <Text style={[styles.inputLabel, { color: theme.colors.muted, marginTop: 20 }]}>Password</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.colors.bg3, borderColor: theme.colors.border }]}>
            <TextInput
              placeholder="Create a password"
              placeholderTextColor={theme.colors.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={[styles.input, { color: theme.colors.ink }]}
            />
          </View>

          {error ? (
            <Text style={[styles.error, { color: '#ff6b6b' }]}>{error}</Text>
          ) : null}

          <TouchableOpacity
            onPress={handleSignUp}
            disabled={loading}
            style={[styles.button, { backgroundColor: theme.colors.ink }]}
          >
            <Text style={[styles.buttonText, { color: theme.colors.bg }]}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.muted }]}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.link, { color: theme.colors.ink }]}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 32,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  pinIcon: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  pinShape: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    transform: [{ rotate: '-45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    transform: [{ rotate: '45deg' }],
  },
  wordmark: {
    fontSize: 48,
    fontWeight: '300',
    letterSpacing: 14,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 10,
    letterSpacing: 3.5,
    textTransform: 'uppercase',
  },
  form: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 9,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  inputContainer: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  input: {
    fontSize: 14,
    fontWeight: '300',
  },
  error: {
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
  },
  button: {
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
  link: {
    fontSize: 12,
    fontWeight: '500',
  },
});