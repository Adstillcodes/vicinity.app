import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeProvider } from '@/hooks/useTheme';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/hooks/useSupabaseAuth';

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <View style={styles.pinIcon}>
        <View style={styles.pinShape}>
          <View style={styles.pinDot} />
        </View>
      </View>
      <Text style={styles.wordmark}>Vicinity</Text>
    </View>
  );
}

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0A0A0A' },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <ThemeProvider>
          <StatusBar style="auto" />
          <RootLayoutNav />
        </ThemeProvider>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
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
    borderColor: '#7A736C',
  },
  pinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    transform: [{ rotate: '45deg' }],
    backgroundColor: '#7A736C',
  },
  wordmark: {
    fontSize: 48,
    fontWeight: '300',
    letterSpacing: 14,
    textTransform: 'uppercase',
    color: '#F7F3EE',
  },
});