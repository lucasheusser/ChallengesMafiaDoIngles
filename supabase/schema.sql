-- ========================================
-- ENGLISH DAILY CHALLENGES - SUPABASE SQL
-- ========================================
-- This file contains all SQL needed to set up the database
-- Run this in your Supabase SQL Editor

-- ========================================
-- 1. CREATE TABLES
-- ========================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  full_name TEXT,
  coins_total INTEGER NOT NULL DEFAULT 0,
  points_total INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Challenges table
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  content_json JSONB NOT NULL,
  points_reward INTEGER NOT NULL DEFAULT 0,
  coin_reward INTEGER NOT NULL DEFAULT 0,
  publish_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  answers_json JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  feedback_text TEXT,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(challenge_id, user_id)
);

-- Transactions table (for gamification tracking)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  amount_coins INTEGER NOT NULL DEFAULT 0,
  amount_points INTEGER NOT NULL DEFAULT 0,
  ref_submission_id UUID REFERENCES public.submissions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ========================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_coins ON public.profiles(coins_total DESC);

CREATE INDEX IF NOT EXISTS idx_challenges_status ON public.challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_publish_date ON public.challenges(publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_challenges_created_by ON public.challenges(created_by);

CREATE INDEX IF NOT EXISTS idx_submissions_challenge_id ON public.submissions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON public.submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

-- ========================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- ========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 4. CREATE RLS POLICIES
-- ========================================

-- PROFILES POLICIES
-- Anyone authenticated can read all profiles (for leaderboard)
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Teachers/admins can update profiles (for rewards)
CREATE POLICY "Teachers can update profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
      AND role IN ('teacher', 'admin')
    )
  )
  WITH CHECK (true);

-- Profiles are created via trigger on signup
CREATE POLICY "Profiles can be inserted via trigger"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- CHALLENGES POLICIES
-- Published challenges can be read by all authenticated users
CREATE POLICY "Published challenges are viewable by authenticated users"
  ON public.challenges FOR SELECT
  TO authenticated
  USING (
    status = 'published' 
    OR 
    created_by IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('teacher', 'admin')
    )
  );

-- Teachers and admins can insert challenges
CREATE POLICY "Teachers can create challenges"
  ON public.challenges FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('teacher', 'admin')
    )
  );

-- Teachers can update their own challenges, admins can update any
CREATE POLICY "Teachers can update own challenges"
  ON public.challenges FOR UPDATE
  TO authenticated
  USING (
    created_by IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    created_by IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- SUBMISSIONS POLICIES
-- Students can read their own submissions
-- Teachers can read submissions for challenges they created
-- Admins can read all submissions
CREATE POLICY "Users can view relevant submissions"
  ON public.submissions FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
    OR
    challenge_id IN (
      SELECT id FROM public.challenges 
      WHERE created_by IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Students can insert their own submissions
CREATE POLICY "Students can submit challenges"
  ON public.submissions FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Teachers can update submissions (for review) on their challenges
-- Admins can update any submission
CREATE POLICY "Teachers can review submissions"
  ON public.submissions FOR UPDATE
  TO authenticated
  USING (
    challenge_id IN (
      SELECT id FROM public.challenges 
      WHERE created_by IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    challenge_id IN (
      SELECT id FROM public.challenges 
      WHERE created_by IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- TRANSACTIONS POLICIES
-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Only service role can insert transactions (via server actions)
CREATE POLICY "Transactions inserted by service"
  ON public.transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ========================================
-- 5. CREATE TRIGGERS
-- ========================================

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'student'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_challenges ON public.challenges;
CREATE TRIGGER set_updated_at_challenges
  BEFORE UPDATE ON public.challenges
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ========================================
-- 6. SEED DATA (OPTIONAL)
-- ========================================

-- Create a sample teacher user (you'll need to create this user via Supabase Auth first)
-- Then update their role to 'teacher' with:
-- UPDATE public.profiles SET role = 'teacher' WHERE user_id = 'YOUR_USER_UUID';

-- Sample challenge (uncomment after creating a teacher user and updating the created_by UUID)
/*
INSERT INTO public.challenges (
  title,
  description,
  type,
  content_json,
  points_reward,
  coin_reward,
  publish_date,
  status,
  created_by
) VALUES (
  'Prepositions Challenge #2',
  '## Welcome to Prepositions Challenge!

Practice using **at**, **on**, and **in** correctly.

### Instructions:
Complete each sentence with the correct preposition.',
  'fill_blanks_prepositions',
  '{
    "instructions": "Complete with at/on/in",
    "items": [
      {
        "id": "1",
        "text": "We usually travel (  ) the summer.",
        "options": ["at", "on", "in"]
      },
      {
        "id": "2",
        "text": "The meeting is (  ) 3 PM.",
        "options": ["at", "on", "in"]
      },
      {
        "id": "3",
        "text": "She was born (  ) Monday.",
        "options": ["at", "on", "in"]
      },
      {
        "id": "4",
        "text": "I live (  ) London.",
        "options": ["at", "on", "in"]
      },
      {
        "id": "5",
        "text": "The book is (  ) the table.",
        "options": ["at", "on", "in"]
      }
    ]
  }'::jsonb,
  50,
  50,
  CURRENT_DATE,
  'published',
  'YOUR_TEACHER_PROFILE_UUID'
);
*/

-- ========================================
-- 7. GRANT PERMISSIONS
-- ========================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant table permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.challenges TO authenticated;
GRANT ALL ON public.submissions TO authenticated;
GRANT ALL ON public.transactions TO authenticated;

-- ========================================
-- SETUP COMPLETE!
-- ========================================
-- Next steps:
-- 1. Create a user via Supabase Auth
-- 2. Update their role to 'teacher': UPDATE profiles SET role = 'teacher' WHERE user_id = 'uuid';
-- 3. Use the app to create challenges
-- 4. Students can register and complete challenges
