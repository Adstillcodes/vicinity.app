import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useSupabaseAuth';

export default function Index() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Redirect href="/(tabs)/explore" />;
  }

  return <Redirect href="/(auth)/sign-in" />;
}