import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export default function ChatsScreen() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.ink }]}>Chats</Text>
      </View>
      <View style={styles.empty}>
        <Text style={{ color: theme.colors.muted, fontSize: 48, marginBottom: 16 }}>✉</Text>
        <Text style={{ color: theme.colors.muted, textAlign: 'center' }}>
          No conversations yet.{'\n'}
          Connect with travelers to start chatting!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, paddingTop: 48, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '300' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
});
