import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabase';

export default function VerifyScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { theme } = useTheme();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email || '',
        token: code,
        type: 'email',
      });

      if (verifyError) {
        setError(verifyError.message);
      } else {
        router.replace('/(auth)/onboarding');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setLoading(true);
    setError('');

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (resendError) {
        setError(resendError.message);
      } else {
        setResendTimer(60);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
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
          <Text style={[styles.title, { color: theme.colors.ink }]}>Check your email</Text>
          <Text style={[styles.subtitle, { color: theme.colors.muted }]}>
            We sent a verification code to{'\n'}{email}
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.inputLabel, { color: theme.colors.muted }]}>6-Digit Code</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.colors.bg3, borderColor: theme.colors.border }]}>
            <TextInput
              placeholder="000000"
              placeholderTextColor={theme.colors.muted}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
              style={[styles.input, { color: theme.colors.ink }]}
            />
          </View>

          {error ? (
            <Text style={[styles.error, { color: '#ff6b6b' }]}>{error}</Text>
          ) : null}

          <TouchableOpacity
            onPress={handleVerify}
            disabled={loading || code.length < 6}
            style={[
              styles.button, 
              { backgroundColor: theme.colors.ink },
              (loading || code.length < 6) && { opacity: 0.5 }
            ]}
          >
            <Text style={[styles.buttonText, { color: theme.colors.bg }]}>
              {loading ? 'Verifying...' : 'Verify'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleResend}
            disabled={loading || resendTimer > 0}
            style={styles.resendButton}
          >
            <Text style={[styles.resendText, { color: resendTimer > 0 ? theme.colors.muted : theme.colors.ink }]}>
              {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend code'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 32, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 48 },
  title: { fontSize: 28, fontWeight: '300', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  form: { marginBottom: 32 },
  inputLabel: { fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 },
  inputContainer: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14 },
  input: { fontSize: 24, fontWeight: '300', textAlign: 'center', letterSpacing: 8 },
  error: { fontSize: 12, marginTop: 12, textAlign: 'center' },
  button: { marginTop: 32, paddingVertical: 16, borderRadius: 100, alignItems: 'center' },
  buttonText: { fontSize: 12, fontWeight: '500', letterSpacing: 2, textTransform: 'uppercase' },
  resendButton: { marginTop: 16, alignItems: 'center' },
  resendText: { fontSize: 12 },
});