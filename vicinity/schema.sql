-- =====================================================
-- VICINITY APP DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE (Complete Schema)
-- =====================================================

-- Create profiles table if not exists
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    current_lat FLOAT,        -- Current location latitude
    current_lng FLOAT,       -- Current location longitude
    interests TEXT[],           -- Array of interest tags
    quiz_answers JSONB,        -- Quiz responses for matching
    destination_city TEXT,      -- Current destination city
    destination_country TEXT,  -- Current destination country
    destination_lat FLOAT,     -- Destination latitude
    destination_lng FLOAT,     -- Destination longitude
    arrival_date DATE,          -- Trip start date
    departure_date DATE,        -- Trip end date
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PHOTOS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    slot_index INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, slot_index)
);

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CONNECTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
    compatibility_score INT,  -- Match percentage (0-100)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- MESSAGES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES connections(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CITIES TABLE (For Discover/Teleport feature)
-- =====================================================

CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    emoji TEXT,
    traveler_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES - PROFILES
-- =====================================================

-- Users can read all profiles (for matching)
CREATE POLICY "Anyone can view profiles" ON profiles
FOR SELECT USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);

-- =====================================================
-- RLS POLICIES - PHOTOS
-- =====================================================

-- Anyone can view photos
CREATE POLICY "Anyone can view photos" ON photos
FOR SELECT USING (true);

-- Users can insert their own photos
CREATE POLICY "Users can insert own photos" ON photos
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own photos
CREATE POLICY "Users can update own photos" ON photos
FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own photos
CREATE POLICY "Users can delete own photos" ON photos
FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES - CONNECTIONS
-- =====================================================

-- Users can view their own connections
CREATE POLICY "Users can view own connections" ON connections
FOR SELECT USING (
    requester_id = auth.uid() OR recipient_id = auth.uid()
);

-- Users can create connection requests
CREATE POLICY "Users can create connections" ON connections
FOR INSERT WITH CHECK (requester_id = auth.uid());

-- Users can update (accept/reject) connections they're part of
CREATE POLICY "Users can update own connections" ON connections
FOR UPDATE USING (
    requester_id = auth.uid() OR recipient_id = auth.uid()
);

-- =====================================================
-- RLS POLICIES - MESSAGES
-- =====================================================

-- Users can view messages in their conversations
CREATE POLICY "Users can view own messages" ON messages
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM connections c
        WHERE c.id = messages.conversation_id
        AND (c.requester_id = auth.uid() OR c.recipient_id = auth.uid())
    )
);

-- Users can send messages in their conversations
CREATE POLICY "Users can send messages" ON messages
FOR INSERT WITH CHECK (sender_id = auth.uid());

-- =====================================================
-- RLS POLICIES - CITIES
-- =====================================================

-- Anyone can view cities
CREATE POLICY "Anyone can view cities" ON cities
FOR SELECT USING (true);

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

-- Avatars bucket (existing)
INSERT INTO storage.buckets (id, name, public, created_at, updated_at)
VALUES ('avatars', 'avatars', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Photos bucket (new)
INSERT INTO storage.buckets (id, name, public, created_at, updated_at)
VALUES ('photos', 'photos', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE POLICIES
-- =====================================================

-- Avatars: Public read
CREATE POLICY "Public Access to avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Avatars: Authenticated upload
CREATE POLICY "Users can upload avatars" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Avatars: Authenticated update
CREATE POLICY "Users can update avatars" ON storage.objects
FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Photos: Public read
CREATE POLICY "Public Access to photos" ON storage.objects
FOR SELECT USING (bucket_id = 'photos');

-- Photos: Authenticated upload
CREATE POLICY "Users can upload photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'photos' AND auth.role() = 'authenticated');

-- Photos: Authenticated update
CREATE POLICY "Users can update photos" ON storage.objects
FOR UPDATE USING (bucket_id = 'photos' AND auth.role() = 'authenticated');

-- Photos: Authenticated delete
CREATE POLICY "Users can delete photos" ON storage.objects
FOR DELETE USING (bucket_id = 'photos' AND auth.role() = 'authenticated');

-- =====================================================
-- SEED DATA - CITIES (Optional)
-- =====================================================

INSERT INTO cities (name, country, emoji, traveler_count) VALUES
    ('Paris', 'France', '🗼', 41),
    ('Tokyo', 'Japan', '🌸', 47),
    ('Bali', 'Indonesia', '🎭', 25),
    ('New York', 'USA', '🗽', 52),
    ('London', 'UK', '🏰', 38),
    ('Miami', 'USA', '🌴', 18),
    ('Barcelona', 'Spain', '🎨', 32),
    ('Amsterdam', 'Netherlands', '🚲', 22),
    ('Sydney', 'Australia', '🏄', 28),
    ('Dubai', 'UAE', '🏜️', 35)
ON CONFLICT DO NOTHING;

-- =====================================================
-- INDEXES (For Performance)
-- =====================================================

-- Index on profiles for current location queries
CREATE INDEX IF NOT EXISTS profiles_location_idx ON profiles(current_lat, current_lng);

-- Index on profiles for destination queries
CREATE INDEX IF NOT EXISTS profiles_destination_idx ON profiles(destination_city);

-- Index on connections for user queries
CREATE INDEX IF NOT EXISTS connections_requester_idx ON connections(requester_id);
CREATE INDEX IF NOT EXISTS connections_recipient_idx ON connections(recipient_id);

-- Index on messages for conversation queries
CREATE INDEX IF NOT EXISTS messages_conversation_idx ON messages(conversation_id);

-- Index on photos for user queries
CREATE INDEX IF NOT EXISTS photos_user_idx ON photos(user_id);

-- =====================================================
-- FUNCTION - Auto-create profile on signup
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auto-profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- DONE!
-- =====================================================

SELECT 'Vicinity database schema created successfully!' as status;