import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { NearbyTraveler } from '@/types';

function checkDateOverlap(
  arrivalA: string | null | undefined,
  departureA: string | null | undefined,
  arrivalB: string | null | undefined,
  departureB: string | null | undefined
): boolean {
  if (!arrivalA || !departureA || !arrivalB || !departureB) {
    return false;
  }
  const aStart = new Date(arrivalA);
  const aEnd = new Date(departureA);
  const bStart = new Date(arrivalB);
  const bEnd = new Date(departureB);
  return aStart <= bEnd && aEnd >= bStart;
}

export function useNearbyTravelers(destinationCity?: string) {
  const [travelers, setTravelers] = useState<NearbyTraveler[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNearbyTravelers();
  }, [destinationCity]);

  const fetchNearbyTravelers = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('profiles')
        .select('id, full_name, avatar_url, destination_city, destination_country, arrival_date, departure_date')
        .not('destination_city', 'is', null);

      if (destinationCity) {
        query = query.ilike('destination_city', `%${destinationCity}%`);
      }

      const { data: currentUser } = await supabase.auth.getUser();
      if (currentUser?.user) {
        query = query.neq('id', currentUser.user.id);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      const today = new Date().toISOString().split('T')[0];
      const travelersWithDistance: NearbyTraveler[] = (data || [])
        .filter((profile) => {
          return checkDateOverlap(
            profile.arrival_date,
            profile.departure_date,
            today,
            today
          );
        })
        .map((profile) => ({
          id: profile.id,
          full_name: profile.full_name || 'Traveler',
          avatar_url: profile.avatar_url,
          distance: Math.random() * 5,
          destination_city: profile.destination_city,
          destination_country: profile.destination_country,
          arrival_date: profile.arrival_date,
          departure_date: profile.departure_date,
        }));

      setTravelers(travelersWithDistance);
    } catch (err: any) {
      console.error('Error fetching travelers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { travelers, loading, error, refetch: fetchNearbyTravelers };
}

export async function sendMatchRequest(recipientId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const existingConnection = await supabase
      .from('connections')
      .select('*')
      .eq('requester_id', recipientId)
      .eq('recipient_id', user.id)
      .single();

    if (existingConnection.data) {
      const { error: updateError } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', existingConnection.data.id);

      if (updateError) {
        return { success: false, error: updateError.message };
      }
      return { success: true };
    }

    const { error: insertError } = await supabase
      .from('connections')
      .insert({
        requester_id: user.id,
        recipient_id: recipientId,
        status: 'pending',
      });

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export function useMatchedTravelers() {
  const [matches, setMatches] = useState<NearbyTraveler[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMatchedTravelers();
  }, []);

  const fetchMatchedTravelers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMatches([]);
        return;
      }

      const { data: connections, error: connError } = await supabase
        .from('connections')
        .select('*')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (connError) {
        throw connError;
      }

      const matchedUserIds = (connections || []).map((conn) =>
        conn.requester_id === user.id ? conn.recipient_id : conn.requester_id
      );

      if (matchedUserIds.length === 0) {
        setMatches([]);
        return;
      }

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, destination_city, destination_country, arrival_date, departure_date')
        .in('id', matchedUserIds);

      if (profileError) {
        throw profileError;
      }

      const matchedTravelers: NearbyTraveler[] = (profiles || []).map((profile) => ({
        id: profile.id,
        full_name: profile.full_name || 'Traveler',
        avatar_url: profile.avatar_url,
        distance: Math.random() * 5,
        destination_city: profile.destination_city,
        destination_country: profile.destination_country,
        arrival_date: profile.arrival_date,
        departure_date: profile.departure_date,
      }));

      setMatches(matchedTravelers);
    } catch (err: any) {
      console.error('Error fetching matches:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { matches, loading, error, refetch: fetchMatchedTravelers };
}