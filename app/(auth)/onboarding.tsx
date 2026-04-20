import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser, useAuth } from '@/hooks/useSupabaseAuth';
import * as ImagePicker from 'expo-image-picker';
import { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useCitySearch } from '@/hooks/useCitySearch';
import { uploadMultiplePhotos } from '@/lib/photoUpload';
import { saveQuizAnswers, saveDestination } from '@/lib/matching';
import { supabase } from '@/lib/supabase';
import { QUIZ_QUESTIONS, QUIZ_OPTIONS } from '@/types';


const PHOTO_SLOTS = 5;

export default function OnboardingScreen() {
  const router = useRouter();
const { user, isLoaded: userIsLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const { theme, toggleTheme, themeMode } = useTheme();
  const { query, setQuery, results, setSelectedCity, selectedCity } = useCitySearch();

  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState('');
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null, null, null]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [arrivalDate, setArrivalDate] = useState<Date>(new Date());
  const [departureDate, setDepartureDate] = useState<Date>(new Date());
  const [showArrivalPicker, setShowArrivalPicker] = useState(false);
  const [showDeparturePicker, setShowDeparturePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const generateDateOptions = (startDate?: Date): Date[] => {
    const dates: Date[] = [];
    const start = startDate || new Date();
    start.setHours(0, 0, 0, 0);
    for (let i = 0; i < 90; i++) {
      const nextDate = new Date(start);
      nextDate.setDate(start.getDate() + i);
      dates.push(nextDate);
    }
    return dates;
  };

  const progress = step === 0 ? '20%' : step === 1 ? '40%' : step === 2 ? '60%' : step === 3 ? '80%' : '100%';

  const pickImage = async (slotIndex: number) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newPhotos = [...photos];
      newPhotos[slotIndex] = result.assets[0].uri;
      setPhotos(newPhotos);
    }
  };

  const selectAnswer = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[quizIdx] = answer;
    setAnswers(newAnswers);
  };

  const nextQuiz = () => {
    if (quizIdx < QUIZ_OPTIONS.length - 1) {
      setQuizIdx(quizIdx + 1);
    } else {
      setStep(3);
    }
  };

  const selectCity = (city: any) => {
    setSelectedCity(city);
    setQuery(`${city.city}, ${city.country}`);
  };

  const finish = async () => {
    // Allow if selectedCity is set OR if user has typed a city name
    if (!selectedCity && !query) {
      Alert.alert('Error', 'Please select a city');
      return;
    }

    // If user typed a city but didn't select from dropdown, create a placeholder city
    const cityToSave = selectedCity || {
      id: 'manual',
      city: query.split(',')[0].trim(),
      country: query.split(',')[1]?.trim() || '',
      lat: 0,
      lng: 0,
    };

    const userId = user?.id || '';

    setLoading(true);
    
    // Always proceed to tabs - save what we can
    try {
      // Save full name to profile
      if (userId && fullName.trim()) {
        await supabase
          .from('profiles')
          .update({ full_name: fullName.trim() })
          .eq('id', userId);
      }

      // Upload photos only if we have a user
      if (userId) {
        const photoUris = photos.filter((p): p is string => p !== null);
        if (photoUris.length > 0) {
          await uploadMultiplePhotos(userId, photoUris.map((uri, i) => ({ uri })));
        }

        // Save quiz answers
        const quizResult = await saveQuizAnswers(userId, answers);
        if (!quizResult.success) {
          console.log('Quiz save skipped');
        }

        // Save destination
        const destResult = await saveDestination(userId, {
          city: cityToSave.city,
          country: cityToSave.country,
          lat: cityToSave.lat,
          lng: cityToSave.lng,
          arrival_date: arrivalDate.toISOString().split('T')[0],
          departure_date: departureDate.toISOString().split('T')[0],
        });
      }
    } catch (err) {
      console.log('Profile save skipped:', err);
    }

    router.replace('/(tabs)/profile');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => step > 0 ? (step === 2 && quizIdx > 0 ? setQuizIdx(quizIdx - 1) : setStep(step - 1)) : router.back()}
        >
          <Text style={[styles.backBtnText, { color: theme.colors.ink }]}>←</Text>
        </TouchableOpacity>
        <View style={[styles.progressBar, { backgroundColor: theme.colors.bg3 }]}>
          <View style={[styles.progressFill, { width: progress, backgroundColor: theme.colors.ink }]} />
        </View>
        <TouchableOpacity 
          style={[styles.themeToggleBtn, { backgroundColor: theme.colors.bg3 }]}
          onPress={toggleTheme}
        >
          <Text style={[styles.themeToggleIcon, { color: theme.colors.ink }]}>
            {themeMode === 'dark' ? '☾' : '◐'}
          </Text>
        </TouchableOpacity>
        <Text style={[styles.stepLabel, { color: theme.colors.muted }]}>
          {step === 0 ? '2 of 5' : step === 1 ? '3 of 5' : step === 2 ? '4 of 5' : '5 of 5'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Step 0: Full Name */}
        {step === 0 && (
          <>
            <Text style={[styles.title, { color: theme.colors.ink }]}>What's your{'\n'}name?</Text>
            <Text style={[styles.subtitle, { color: theme.colors.muted }]}>
              This is how other travelers will see you.
            </Text>

            <View style={[styles.inputContainer, { backgroundColor: theme.colors.bg3, borderColor: theme.colors.border }]}>
              <TextInput
                placeholder="Enter your full name"
                placeholderTextColor={theme.colors.muted}
                value={fullName}
                onChangeText={setFullName}
                style={[styles.input, { color: theme.colors.ink }]}
                autoCapitalize="words"
              />
            </View>

            <TouchableOpacity 
              style={[styles.btnPrimary, { backgroundColor: theme.colors.ink }]}
              onPress={() => setStep(1)}
              disabled={!fullName.trim()}
            >
              <Text style={[styles.btnPrimaryText, { color: theme.colors.bg }]}>Continue</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Step 1: Photos */}
        {step === 1 && (
          <>
            <Text style={[styles.title, { color: theme.colors.ink }]}>Add your{'\n'}photos.</Text>
            <Text style={[styles.subtitle, { color: theme.colors.muted }]}>
              Tap a slot to upload from your device.
            </Text>

            <View style={styles.photoGrid}>
              {[0, 1, 2, 3, 4].map((i) => (
                <TouchableOpacity 
                  key={i} 
                  style={[
                    styles.photoSlot,
                    { backgroundColor: theme.colors.bg3, borderColor: theme.colors.border },
                    i === 0 && styles.photoSlotLarge
                  ]}
                  onPress={() => pickImage(i)}
                >
                  {photos[i] ? (
                    <Image source={{ uri: photos[i] }} style={styles.photoPreview} />
                  ) : (
                    <Text style={[styles.photoPlus, { color: theme.colors.muted }]}>+</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.note, { color: theme.colors.muted }]}>
              First photo becomes your profile photo.
            </Text>

            <TouchableOpacity 
              style={[styles.btnPrimary, { backgroundColor: theme.colors.ink }]}
              onPress={() => setStep(2)}
            >
              <Text style={[styles.btnPrimaryText, { color: theme.colors.bg }]}>Continue</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Step 2: Quiz */}
        {step === 2 && (
          <>
            <View style={styles.quizProgress}>
              {QUIZ_OPTIONS.map((_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.quizDot,
                    { backgroundColor: i <= quizIdx ? theme.colors.ink : theme.colors.bg3 }
                  ]} 
                />
              ))}
            </View>

            <Text style={[styles.quizQuestion, { color: theme.colors.ink }]}>
              {QUIZ_QUESTIONS[quizIdx]}
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.muted }]}>
              Pick the one that feels most like you.
            </Text>

            <View style={styles.quizOptions}>
              {QUIZ_OPTIONS[quizIdx].map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.quizOption,
                    { backgroundColor: theme.colors.bg3, borderColor: theme.colors.border },
                    answers[quizIdx] === opt && { backgroundColor: theme.colors.ink }
                  ]}
                  onPress={() => selectAnswer(opt)}
                >
                  <Text style={[
                    styles.quizOptionText,
                    { color: answers[quizIdx] === opt ? theme.colors.bg : theme.colors.ink }
                  ]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[
                styles.btnPrimary, 
                { backgroundColor: theme.colors.ink },
                !answers[quizIdx] && { opacity: 0.5 }
              ]}
              onPress={nextQuiz}
              disabled={!answers[quizIdx]}
            >
              <Text style={[styles.btnPrimaryText, { color: theme.colors.bg }]}>
                {quizIdx === QUIZ_OPTIONS.length - 1 ? 'Build My Profile →' : 'Next'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Step 3: Destination */}
        {step === 3 && (
          <>
            <Text style={[styles.title, { color: theme.colors.ink }]}>Where are{'\n'}you headed?</Text>
            <Text style={[styles.subtitle, { color: theme.colors.muted }]}>
              Search from 120+ cities worldwide.
            </Text>

            <View style={[styles.searchBox, { backgroundColor: theme.colors.bg3, borderColor: theme.colors.border }]}>
              <Text style={[styles.searchIcon, { color: theme.colors.muted }]}>◎</Text>
              <TextInput
                style={[styles.searchInput, { color: theme.colors.ink }]}
                value={query}
                onChangeText={setQuery}
                placeholder="Search a city..."
                placeholderTextColor={theme.colors.muted}
                onFocus={() => selectedCity && setSelectedCity(null)}
              />
            </View>

            {results.length > 0 && !selectedCity && (
              <View style={[styles.resultsBox, { backgroundColor: theme.colors.bg3, borderColor: theme.colors.border }]}>
                {results.map((city) => (
                  <TouchableOpacity
                    key={city.id}
                    style={[styles.resultItem, { borderBottomColor: theme.colors.border }]}
                    onPress={() => selectCity(city)}
                  >
                    <Text style={[styles.resultCity, { color: theme.colors.ink }]}>{city.city}</Text>
                    <Text style={[styles.resultCountry, { color: theme.colors.muted }]}>{city.country}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {selectedCity && (
              <View style={[styles.cityPreview, { backgroundColor: theme.colors.bg3, borderColor: theme.colors.border }]}>
                <Text style={[styles.cityPreviewName, { color: theme.colors.ink }]}>{selectedCity.city}</Text>
                <Text style={[styles.cityPreviewCountry, { color: theme.colors.muted }]}>{selectedCity.country}</Text>
              </View>
            )}

            <View style={styles.datesRow}>
              <View style={styles.dateField}>
                <Text style={[styles.fieldLabel, { color: theme.colors.muted }]}>From</Text>
                <TouchableOpacity 
                  style={[styles.dateInput, { backgroundColor: theme.colors.bg3, borderColor: theme.colors.border }]}
                  onPress={() => setShowArrivalPicker(!showArrivalPicker)}
                >
                  <Text style={{ color: theme.colors.ink }}>{formatDate(arrivalDate)}</Text>
                  <Text style={{ color: theme.colors.muted, fontSize: 12 }}> ▼</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.dateField}>
                <Text style={[styles.fieldLabel, { color: theme.colors.muted }]}>To</Text>
                <TouchableOpacity 
                  style={[styles.dateInput, { backgroundColor: theme.colors.bg3, borderColor: theme.colors.border }]}
                  onPress={() => setShowDeparturePicker(!showDeparturePicker)}
                >
                  <Text style={{ color: theme.colors.ink }}>{formatDate(departureDate)}</Text>
                  <Text style={{ color: theme.colors.muted, fontSize: 12 }}> ▼</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Arrival Date Dropdown */}
            {showArrivalPicker && (
              <View style={[styles.dateDropdown, { backgroundColor: theme.colors.bg3, borderColor: theme.colors.border }]}>
                <ScrollView style={styles.dateDropdownList} nestedScrollEnabled>
                  {generateDateOptions().slice(0, 60).map((date) => (
                    <TouchableOpacity
                      key={date.toISOString()}
                      style={[
                        styles.dateOption,
                        { borderBottomColor: theme.colors.border },
                        formatDate(date) === formatDate(arrivalDate) && { backgroundColor: theme.colors.ink }
                      ]}
                      onPress={() => {
                        setArrivalDate(date);
                        if (date > departureDate) {
                          setDepartureDate(date);
                        }
                        setShowArrivalPicker(false);
                      }}
                    >
                      <Text style={[
                        styles.dateOptionText,
                        { color: formatDate(date) === formatDate(arrivalDate) ? theme.colors.bg : theme.colors.ink }
                      ]}>
                        {formatDate(date)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Departure Date Dropdown */}
            {showDeparturePicker && (
              <View style={[styles.dateDropdown, { backgroundColor: theme.colors.bg3, borderColor: theme.colors.border }]}>
                <ScrollView style={styles.dateDropdownList} nestedScrollEnabled>
                  {generateDateOptions(arrivalDate).map((date) => (
                    <TouchableOpacity
                      key={date.toISOString()}
                      style={[
                        styles.dateOption,
                        { borderBottomColor: theme.colors.border },
                        formatDate(date) === formatDate(departureDate) && { backgroundColor: theme.colors.ink }
                      ]}
                      onPress={() => {
                        setDepartureDate(date);
                        setShowDeparturePicker(false);
                      }}
                    >
                      <Text style={[
                        styles.dateOptionText,
                        { color: formatDate(date) === formatDate(departureDate) ? theme.colors.bg : theme.colors.ink }
                      ]}>
                        {formatDate(date)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <TouchableOpacity 
              style={[
                styles.btnPrimary, 
                { backgroundColor: theme.colors.ink },
                ((!selectedCity && !query) || !arrivalDate || !departureDate || loading) && { opacity: 0.5 }
              ]}
              onPress={finish}
              disabled={(!selectedCity && !query) || !arrivalDate || !departureDate || loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.bg} />
              ) : (
                <Text style={[styles.btnPrimaryText, { color: theme.colors.bg }]}>Enter Vicinity →</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 48, gap: 12 },
  backBtn: { padding: 8 },
  backBtnText: { fontSize: 24 },
  themeToggleBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  themeToggleIcon: { fontSize: 18 },
  progressBar: { flex: 1, height: 3, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  stepLabel: { fontSize: 10, letterSpacing: 1 },
  body: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 36, fontWeight: '300', lineHeight: 44, marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 24 },
  inputContainer: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 24 },
  input: { fontSize: 16 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  photoSlot: { width: '31%', aspectRatio: 1, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  photoSlotLarge: { width: '100%', height: 200, marginBottom: 10 },
  photoPreview: { width: '100%', height: '100%' },
  photoPlus: { fontSize: 32, fontWeight: '300' },
  note: { fontSize: 12, marginBottom: 24 },
  quizProgress: { flexDirection: 'row', gap: 6, marginBottom: 24 },
  quizDot: { width: 8, height: 8, borderRadius: 4 },
  quizQuestion: { fontSize: 22, fontWeight: '300', lineHeight: 28, marginBottom: 8 },
  quizOptions: { gap: 10, marginBottom: 24 },
  quizOption: { padding: 16, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  quizOptionText: { fontSize: 14 },
  btnPrimary: { paddingVertical: 16, borderRadius: 100, alignItems: 'center', marginTop: 'auto' },
  btnPrimaryText: { fontSize: 14, fontWeight: '500', letterSpacing: 2 },
  searchBox: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14 },
  resultsBox: { borderRadius: 12, borderWidth: 1, marginBottom: 16, overflow: 'hidden' },
  resultItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1 },
  resultCity: { fontSize: 14 },
  resultCountry: { fontSize: 12 },
  cityPreview: { padding: 16, borderRadius: 12, marginBottom: 16 },
  cityPreviewName: { fontSize: 18, fontWeight: '300' },
  cityPreviewCountry: { fontSize: 12, marginTop: 4 },
  datesRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  dateField: { flex: 1 },
  fieldLabel: { fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 },
  dateInput: { padding: 14, borderRadius: 12, borderWidth: 1, fontSize: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateDropdown: { borderRadius: 12, borderWidth: 1, maxHeight: 200, marginBottom: 24, overflow: 'hidden' },
  dateDropdownList: { maxHeight: 200 },
  dateOption: { padding: 14, borderBottomWidth: 1 },
  dateOptionText: { fontSize: 14 },
});