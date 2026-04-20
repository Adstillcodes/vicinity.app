import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useMatchedTravelers } from '@/hooks/useNearbyTravelers';

export default function MatchesScreen() {
  const { theme } = useTheme();
  const { matches, loading } = useMatchedTravelers();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.ink }]}>Matches</Text>
      </View>
      
      {loading ? (
        <View style={styles.empty}>
          <Text style={{ color: theme.colors.muted }}>Loading...</Text>
        </View>
      ) : matches.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ color: theme.colors.muted, fontSize: 48, marginBottom: 16 }}>♡</Text>
          <Text style={{ color: theme.colors.muted, textAlign: 'center' }}>
            No matches yet.{'\n'}
            Explore the map to find travelers nearby!
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.matchesList}>
          {matches.map((traveler) => (
            <TouchableOpacity 
              key={traveler.id}
              style={[styles.matchCard, { backgroundColor: theme.colors.bg2, borderColor: theme.colors.border }]}
            >
              <View style={[styles.matchAvatar, { backgroundColor: theme.colors.muted }]}>
                <Text style={{ color: theme.colors.bg, fontSize: 24 }}>{traveler.full_name?.charAt(0)}</Text>
              </View>
              <View style={styles.matchInfo}>
                <Text style={[styles.matchName, { color: theme.colors.ink }]}>{traveler.full_name}</Text>
                <Text style={[styles.matchDest, { color: theme.colors.muted }]}>
                  {traveler.destination_city}, {traveler.destination_country}
                </Text>
                <Text style={[styles.matchDates, { color: theme.colors.muted }]}>
                  {traveler.arrival_date} - {traveler.departure_date}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, paddingTop: 48, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '300' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  matchesList: { padding: 16, gap: 12 },
  matchCard: { flexDirection: 'row', padding: 16, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  matchAvatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  matchInfo: { flex: 1, marginLeft: 16 },
  matchName: { fontSize: 16, fontWeight: '500' },
  matchDest: { fontSize: 12, marginTop: 4 },
  matchDates: { fontSize: 10, marginTop: 2 },
});