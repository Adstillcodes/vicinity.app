export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  arrival_date: string | null;
  departure_date: string | null;
  interests: string[] | null;
  created_at: string;
}

export interface Connection {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  compatibility_score: number | null;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface City {
  id: string;
  name: string;
  country: string;
  emoji: string;
  traveler_count: number;
}

export interface NearbyTraveler {
  id: string;
  full_name: string;
  avatar_url: string | null;
  distance: number;
  destination_city?: string;
  destination_country?: string;
  arrival_date?: string;
  departure_date?: string;
}

export interface Photo {
  id: string;
  user_id: string;
  photo_url: string;
  slot_index: number;
  created_at: string;
}

export interface Destination {
  city: string;
  country: string;
  lat: number;
  lng: number;
  arrival_date: string;
  departure_date: string;
}

export interface CitySearchResult {
  id: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
}

export const QUIZ_QUESTIONS = [
  'You land in a new city. First move?',
  'Your ideal travel day looks like…',
  'How do you prefer to travel?',
  'Your travel budget feels like…',
] as const;

export const QUIZ_OPTIONS = [
  ['Find the best local café', 'Book a last-minute tour', 'Wander with no plan', 'See who\'s nearby'],
  ['Museums & galleries', 'Markets & street food', 'Hiking or nature', 'Rooftop bars & nightlife'],
  ['Always solo', 'Solo but open to others', 'Small group', 'Whoever joins'],
  ['Stretch every dollar', 'Comfort matters', 'No compromises', 'Depends on the trip'],
] as const;