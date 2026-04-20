import { supabase } from './supabase';

export async function calculateMatchPercentage(
  user1Answers: string[],
  user2Answers: string[]
): Promise<number> {
  if (!user1Answers || !user2Answers || user1Answers.length !== user2Answers.length) {
    return 0;
  }

  const matches = user1Answers.filter((answer, index) => answer === user2Answers[index]).length;
  return Math.round((matches / user1Answers.length) * 100);
}

export async function getMatchingUsers(
  userId: string,
  currentUserAnswers: string[],
  minMatchPercentage: number = 50
): Promise<any[]> {
  // Get all profiles with quiz_answers except current user
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .neq('id', userId)
    .not('quiz_answers', 'is', null);

  if (error || !profiles) {
    console.error('Error fetching profiles:', error);
    return [];
  }

  // Calculate match percentage for each profile
  const matchingProfiles = await Promise.all(
    profiles.map(async (profile) => {
      const otherAnswers = profile.quiz_answers || [];
      const matchPercentage = await calculateMatchPercentage(currentUserAnswers, otherAnswers);
      return { ...profile, match_percentage: matchPercentage };
    })
  );

  // Filter by minimum match percentage and sort by match
  return matchingProfiles
    .filter(p => p.match_percentage >= minMatchPercentage)
    .sort((a, b) => b.match_percentage - a.match_percentage);
}

export async function saveQuizAnswers(
  userId: string,
  answers: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ quiz_answers: answers })
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function saveDestination(
  userId: string,
  destination: {
    city: string;
    country: string;
    lat: number;
    lng: number;
    arrival_date: string;
    departure_date: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        destination_city: destination.city,
        destination_lat: destination.lat,
        destination_lng: destination.lng,
        destination_country: destination.country,
        arrival_date: destination.arrival_date,
        departure_date: destination.departure_date,
      })
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function completeOnboarding(
  userId: string,
  answers: string[],
  destination: {
    city: string;
    country: string;
    lat: number;
    lng: number;
    arrival_date: string;
    departure_date: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    // Save quiz answers
    const quizResult = await saveQuizAnswers(userId, answers);
    if (!quizResult.success) {
      return { success: false, error: quizResult.error };
    }

    // Save destination
    const destResult = await saveDestination(userId, destination);
    if (!destResult.success) {
      return { success: false, error: destResult.error };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}