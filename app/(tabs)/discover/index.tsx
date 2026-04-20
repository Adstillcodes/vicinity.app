import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

const CITIES = [
  { id: '1', emoji: '🗼', name: 'Paris', country: 'France', travelers: 41, price: 2.99 },
  { id: '2', emoji: '🌸', name: 'Tokyo', country: 'Japan', travelers: 47, price: 4.99 },
  { id: '3', emoji: '🎭', name: 'Bali', country: 'Indonesia', travelers: 25, price: 1.99 },
  { id: '4', emoji: '🗽', name: 'New York', country: 'USA', travelers: 52, price: 3.99 },
  { id: '5', emoji: '🌴', name: 'Miami', country: 'USA', travelers: 18, price: 2.49 },
  { id: '6', emoji: '🏰', name: 'London', country: 'UK', travelers: 38, price: 3.49 },
];

export default function DiscoverScreen() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.ink }]}>Discover</Text>
        <Text style={[styles.subtitle, { color: theme.colors.muted }]}>Teleport · AI Itineraries</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionLabel, { color: theme.colors.muted }]}>✦ Teleport to a city</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.border, marginLeft: 12 }} />
        </View>

        <View style={styles.citiesGrid}>
          {CITIES.map(city => (
            <TouchableOpacity 
              key={city.id} 
              style={[styles.cityCard, { backgroundColor: theme.colors.bg3, borderColor: theme.colors.border }]}
            >
              <Text style={styles.cityEmoji}>{city.emoji}</Text>
              <View style={styles.cityInfo}>
                <Text style={[styles.cityName, { color: theme.colors.ink }]}>{city.name}</Text>
                <Text style={[styles.cityMeta, { color: theme.colors.muted }]}>
                  {city.country} · {city.travelers} travelers
                </Text>
              </View>
              <Text style={[styles.cityPrice, { color: theme.colors.muted }]}>${city.price}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.planCard, { backgroundColor: theme.colors.bg3, borderColor: theme.colors.border }]}>
          <Text style={[styles.planLabel, { color: theme.colors.muted }]}>Plan a trip</Text>
          <View style={[styles.planInput, { borderBottomColor: theme.colors.border }]}>
            <Text style={{ color: theme.colors.muted, fontFamily: 'System', fontSize: 16 }}>e.g. Kyoto, Cape Town...</Text>
          </View>
          <TouchableOpacity style={[styles.planButton, { backgroundColor: theme.colors.ink }]}>
            <Text style={[styles.planButtonText, { color: theme.colors.bg }]}>Generate Itinerary ✦</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, paddingTop: 48, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '300' },
  subtitle: { fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 },
  content: { padding: 16, paddingTop: 0 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionLabel: { fontSize: 9, letterSpacing: 2, textTransform: 'uppercase' },
  citiesGrid: { gap: 10, marginBottom: 24 },
  cityCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1 },
  cityEmoji: { fontSize: 24, marginRight: 12 },
  cityInfo: { flex: 1 },
  cityName: { fontSize: 16, fontWeight: '300' },
  cityMeta: { fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 },
  cityPrice: { fontSize: 14 },
  planCard: { borderRadius: 16, borderWidth: 1, padding: 16 },
  planLabel: { fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 },
  planInput: { paddingBottom: 12, marginBottom: 12, borderBottomWidth: 1 },
  planButton: { paddingVertical: 14, borderRadius: 100, alignItems: 'center' },
  planButtonText: { fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' },
});