import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { useUser, useAuth } from '@/hooks/useSupabaseAuth';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const { theme, toggleTheme, themeMode } = useTheme();
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState<string>('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      
      // Fetch full name from profiles
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      if (profileData?.full_name) {
        setFullName(profileData.full_name);
      }
      
      // Fetch first uploaded photo from photos table
      const { data: photoData } = await supabase
        .from('photos')
        .select('photo_url')
        .eq('user_id', user.id)
        .eq('slot_index', 0)
        .single();
      if (photoData?.photo_url) {
        setProfilePhoto(photoData.photo_url);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/sign-in');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.ink }]}>Profile</Text>
        <TouchableOpacity onPress={toggleTheme} style={[styles.themeToggle, { backgroundColor: theme.colors.bg3 }]}>
          <Text style={{ color: theme.colors.ink }}>{themeMode === 'dark' ? '☾' : '◐'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        {profilePhoto ? (
          <TouchableOpacity onPress={() => {}} style={styles.avatarContainer}>
            <Image source={{ uri: profilePhoto }} style={[styles.avatarImage, { borderColor: theme.colors.border }]} />
          </TouchableOpacity>
        ) : user?.email ? (
          <TouchableOpacity onPress={() => {}} style={styles.avatarContainer}>
            <View style={[styles.avatar, { borderColor: theme.colors.border }]}>
              <Text style={[styles.avatarInitial, { color: theme.colors.ink }]}>
                {(fullName || user?.email)?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.bg3, borderColor: theme.colors.border }]}>
            <Text style={[styles.avatarInitial, { color: theme.colors.muted }]}>
              {(fullName || user?.email)?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
        )}
        <Text style={[styles.name, { color: theme.colors.ink }]}>
          {fullName || user?.email?.split('@')[0] || 'Traveler'}
        </Text>
        <Text style={[styles.email, { color: theme.colors.muted }]}>
          {user?.email}
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.bg2, borderColor: theme.colors.border }]}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={[styles.menuText, { color: theme.colors.ink }]}>Edit Profile</Text>
          <Text style={{ color: theme.colors.muted }}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={[styles.menuText, { color: theme.colors.ink }]}>Travel Dates</Text>
          <Text style={{ color: theme.colors.muted }}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={[styles.menuText, { color: theme.colors.ink }]}>Interests</Text>
          <Text style={{ color: theme.colors.muted }}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.bg2, borderColor: theme.colors.border }]}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={[styles.menuText, { color: theme.colors.ink }]}>Notifications</Text>
          <Text style={{ color: theme.colors.muted }}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={[styles.menuText, { color: theme.colors.ink }]}>Privacy</Text>
          <Text style={{ color: theme.colors.muted }}>→</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.signOut, { backgroundColor: theme.colors.bg2, borderColor: theme.colors.border }]}
        onPress={handleSignOut}
      >
        <Text style={{ color: theme.colors.muted, fontSize: 12 }}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, paddingTop: 40 },
  title: { fontSize: 28, fontWeight: '300' },
  themeToggle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  profileSection: { alignItems: 'center', marginBottom: 32 },
  avatarContainer: {},
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  avatarImage: { width: 80, height: 80, borderRadius: 40, borderWidth: 1 },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 28 },
  name: { fontSize: 24, fontWeight: '300', marginTop: 16 },
  email: { fontSize: 12, marginTop: 4 },
  section: { borderRadius: 16, borderWidth: 1, marginBottom: 16, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  menuText: { fontSize: 14 },
  signOut: { padding: 16, borderRadius: 16, borderWidth: 1, alignItems: 'center', marginTop: 8 },
});