import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { NearbyTraveler } from '@/types';

interface PlaceholderMapProps {
  travelers?: NearbyTraveler[];
  onMarkerPress?: (traveler: NearbyTraveler) => void;
  message?: string;
}

export function PlaceholderMap({ travelers = [], onMarkerPress, message }: PlaceholderMapProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg3 }]}>
      <Text style={[styles.icon, { color: theme.colors.muted }]}>◎</Text>
      {message && (
        <Text style={[styles.text, { color: theme.colors.muted }]}>{message}</Text>
      )}
      <Text style={[styles.hint, { color: theme.colors.muted }]}>
        {travelers.length} travelers on map
      </Text>
      {travelers.slice(0, 6).map((traveler) => (
        <TouchableOpacity
          key={traveler.id}
          style={[styles.marker, { backgroundColor: theme.colors.ink }]}
          onPress={() => onMarkerPress?.(traveler)}
        >
          <Text style={[styles.markerText, { color: theme.colors.bg }]}>
            {traveler.full_name?.charAt(0)}
          </Text>
        </TouchableOpacity>
      ))}
      <Text style={[styles.hint, { color: theme.colors.muted, marginTop: 16 }]}>
        Tap markers to match • Run npx expo prebuild for full map
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
  },
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  markerText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default PlaceholderMap;