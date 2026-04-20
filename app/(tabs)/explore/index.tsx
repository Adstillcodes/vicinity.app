import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { PlaceholderMap } from '@/components/PlaceholderMap';
import { useNearbyTravelers, sendMatchRequest } from '@/hooks/useNearbyTravelers';
import { useState } from 'react';
import { NearbyTraveler } from '@/types';

export default function ExploreScreen() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const { travelers, loading, refetch } = useNearbyTravelers(searchQuery || undefined);

  const travelerCount = travelers.length;

  const handleMatch = async (traveler: NearbyTraveler) => {
    const result = await sendMatchRequest(traveler.id);
    if (result.success) {
      Alert.alert('Match Sent!', `You liked ${traveler.full_name}. You'll be notified if they also like you!`);
      refetch();
    } else {
      Alert.alert('Error', result.error || 'Failed to send match request');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      {/* Header with search */}
      <View style={styles.header}>
        <View style={[styles.searchBar, { backgroundColor: theme.colors.bg3, borderColor: theme.colors.border }]}>
          <Text style={{ color: theme.colors.muted, marginRight: 8, fontSize: 16 }}>◎</Text>
          <TextInput 
            placeholder="Search destination city..." 
            placeholderTextColor={theme.colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1, color: theme.colors.ink, fontSize: 14 }}
          />
        </View>
        
        {/* Travelers pill */}
        <View style={[styles.pill, { backgroundColor: theme.colors.bg2, borderColor: theme.colors.border }]}>
          <Text style={[styles.pillText, { color: theme.colors.ink }]}>
            {loading ? 'Loading...' : `${travelerCount} travelers nearby`}
          </Text>
        </View>
      </View>
      
      {/* Map */}
      <PlaceholderMap 
        travelers={travelers}
        onMarkerPress={(traveler) => console.log('Pressed:', traveler.full_name)}
      />

      {/* Bottom tray with nearby travelers */}
      <View style={[styles.tray, { backgroundColor: theme.colors.bg2, borderTopColor: theme.colors.border }]}>
        <Text style={[styles.trayLabel, { color: theme.colors.muted }]}>Travelers in {searchQuery || 'this area'}</Text>
        {travelers.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.colors.muted }]}>
            No travelers found. Be the first!
          </Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trayContent}>
            {travelers.slice(0, 10).map((traveler) => (
              <TouchableOpacity 
                key={traveler.id}
                style={[styles.travelerCard, { backgroundColor: theme.colors.bg3, borderColor: theme.colors.border }]}
                onPress={() => handleMatch(traveler)}
              >
                <View style={[styles.travelerAvatar, { backgroundColor: theme.colors.muted }]}>
                  <Text style={{ color: theme.colors.bg, fontSize: 16 }}>{traveler.full_name?.charAt(0)}</Text>
                </View>
                <Text style={[styles.travelerName, { color: theme.colors.ink }]}>{traveler.full_name}</Text>
                <Text style={[styles.travelerDist, { color: theme.colors.muted }]}>Tap to match</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, paddingTop: 48, gap: 12 },
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 12, 
    borderRadius: 12, 
    borderWidth: 1 
  },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
  },
  pillText: { fontSize: 10, letterSpacing: 1 },
  tray: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 100,
    borderTopWidth: 1,
  },
  trayLabel: {
    fontSize: 9,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  trayContent: {
    gap: 10,
  },
  travelerCard: {
    width: 80,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  travelerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  travelerName: { fontSize: 11, fontWeight: '500' },
  travelerDist: { fontSize: 9, marginTop: 2 },
  emptyText: { fontSize: 14, textAlign: 'center', marginVertical: 20 },
});