import { useState, useEffect, useCallback } from 'react';
import { CitySearchResult } from '../types';

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
const SEARCH_DEBOUNCE_MS = 300;

const FALLBACK_CITIES: CitySearchResult[] = [
  { id: '1', city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
  { id: '2', city: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503 },
  { id: '3', city: 'New York', country: 'USA', lat: 40.7128, lng: -74.006 },
  { id: '4', city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278 },
  { id: '5', city: 'Barcelona', country: 'Spain', lat: 41.3851, lng: 2.1734 },
  { id: '6', city: 'Bali', country: 'Indonesia', lat: -8.3405, lng: 115.092 },
  { id: '7', city: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lng: 4.9041 },
  { id: '8', city: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093 },
  { id: '9', city: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708 },
  { id: '10', city: 'Miami', country: 'USA', lat: 25.7617, lng: -80.1918 },
  { id: '11', city: 'Berlin', country: 'Germany', lat: 52.52, lng: 13.405 },
  { id: '12', city: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964 },
  { id: '13', city: 'Lisbon', country: 'Portugal', lat: 38.7223, lng: -9.1393 },
  { id: '14', city: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018 },
  { id: '15', city: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198 },
];

export function useCitySearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CitySearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState<CitySearchResult | null>(null);

  const search = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 1) {
      setResults([]);
      return;
    }

    // Use fallback cities if no Mapbox token
    if (!MAPBOX_TOKEN || MAPBOX_TOKEN === '' || MAPBOX_TOKEN === 'pk.your_mapbox_token_here') {
      const filtered = FALLBACK_CITIES.filter(city => 
        city.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.country.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filtered.slice(0, 5));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${MAPBOX_TOKEN}&types=place&limit=5`
      );
      const data = await response.json();
      
      if (!data.features || !Array.isArray(data.features)) {
        setResults([]);
        return;
      }
      
      const cities: CitySearchResult[] = data.features.map((f: any) => ({
        id: f.id,
        city: f.text,
        country: f.properties?.country || f.context?.[0]?.text || '',
        lat: f.center?.[1] || 0,
        lng: f.center?.[0] || 0,
      }));
      
      setResults(cities);
    } catch (error) {
      console.error('City search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      search(query);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [query, search]);

  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
    setSelectedCity(null);
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    selectedCity,
    setSelectedCity,
    clear,
  };
}