import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import * as ExpoLocation from 'expo-location';
import { useTheme } from '@/hooks/useTheme';
import { NearbyTraveler } from '@/types';

interface MapViewComponentProps {
  travelers?: NearbyTraveler[];
  onMarkerPress?: (traveler: NearbyTraveler) => void;
  initialRegion?: Region;
}

export function VicinityMapView({ 
  travelers = [], 
  onMarkerPress,
  initialRegion 
}: MapViewComponentProps) {
  const { theme } = useTheme();
  const mapRef = useRef<MapView>(null);
  const [userLocation, setUserLocation] = useState<ExpoLocation.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Location permission denied');
        return;
      }

      const location = await ExpoLocation.getCurrentPositionAsync({});
      setUserLocation(location);
    } catch (error) {
      console.error('Error getting location:', error);
      setErrorMsg('Unable to get location');
    }
  };

  const defaultRegion: Region = userLocation ? {
    latitude: userLocation.coords.latitude,
    longitude: userLocation.coords.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  } : {
    latitude: 40.7128,
    longitude: -74.0060,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const region = initialRegion || defaultRegion;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={false}
        mapType={Platform.OS === 'ios' ? 'standard' : 'standard'}
        customMapStyle={theme.mode === 'dark' ? darkMapStyle : []}
      >
        {travelers.map((traveler) => (
          <Marker
            key={traveler.id}
            coordinate={{
              latitude: 40.7128 + (Math.random() - 0.5) * 0.02,
              longitude: -74.0060 + (Math.random() - 0.5) * 0.02,
            }}
            onPress={() => onMarkerPress?.(traveler)}
          >
            <View style={[styles.markerContainer, { backgroundColor: theme.colors.ink }]}>
              <Text style={[styles.markerInitial, { color: theme.colors.bg }]}>
                {traveler.full_name?.charAt(0) || '?'}
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {errorMsg && (
        <View style={[styles.errorContainer, { backgroundColor: theme.colors.bg2 }]}>
          <Text style={[styles.errorText, { color: theme.colors.muted }]}>{errorMsg}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F7F3EE',
  },
  markerInitial: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 12,
    textAlign: 'center',
  },
});

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1E1E1E' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#7A736C' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1E1E1E' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#3A3530' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0A0A0A' }] },
];