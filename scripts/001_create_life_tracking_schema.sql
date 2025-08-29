-- Create users profile table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily entries table for life tracking
CREATE TABLE IF NOT EXISTS public.daily_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  
  -- Quran and Islamic Studies (in minutes)
  quran_memorization INTEGER DEFAULT 0,
  quran_study INTEGER DEFAULT 0,
  hadith_study INTEGER DEFAULT 0,
  islamic_literature INTEGER DEFAULT 0,
  other_literature INTEGER DEFAULT 0,
  
  -- Work Hours (in minutes)
  online_work INTEGER DEFAULT 0,
  offline_work INTEGER DEFAULT 0,
  
  -- Skills Development (in minutes)
  skill_lessons INTEGER DEFAULT 0,
  skill_practice INTEGER DEFAULT 0,
  skill_projects INTEGER DEFAULT 0,
  
  -- Physical Exercise (count)
  pull_ups INTEGER DEFAULT 0,
  push_ups INTEGER DEFAULT 0,
  squats INTEGER DEFAULT 0,
  
  -- Religious Practice (count)
  prayers_in_congregation INTEGER DEFAULT 0,
  classes_attended INTEGER DEFAULT 0,
  
  -- Communication (count of interactions)
  communication_members INTEGER DEFAULT 0,
  communication_companions INTEGER DEFAULT 0,
  communication_workers INTEGER DEFAULT 0,
  communication_relations INTEGER DEFAULT 0,
  communication_friends INTEGER DEFAULT 0,
  communication_talented_students INTEGER DEFAULT 0,
  communication_well_wishers INTEGER DEFAULT 0,
  communication_mahram INTEGER DEFAULT 0,
  
  -- Distribution Activities (count)
  literature_distribution INTEGER DEFAULT 0,
  magazine_distribution INTEGER DEFAULT 0,
  sticker_card_distribution INTEGER DEFAULT 0,
  gift_distribution INTEGER DEFAULT 0,
  
  -- Responsibilities (in minutes)
  dawati_responsibilities INTEGER DEFAULT 0,
  other_responsibilities INTEGER DEFAULT 0,
  
  -- Personal Development (in minutes)
  newspaper_reading INTEGER DEFAULT 0,
  self_criticism INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one entry per user per date
  UNIQUE(user_id, entry_date)
);

-- Create goals table for monthly/yearly targets
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  target_period TEXT NOT NULL CHECK (target_period IN ('daily', 'weekly', 'monthly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- RLS Policies for daily_entries
CREATE POLICY "daily_entries_select_own" ON public.daily_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "daily_entries_insert_own" ON public.daily_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "daily_entries_update_own" ON public.daily_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "daily_entries_delete_own" ON public.daily_entries FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for goals
CREATE POLICY "goals_select_own" ON public.goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "goals_insert_own" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "goals_update_own" ON public.goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "goals_delete_own" ON public.goals FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_entries_user_date ON public.daily_entries(user_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_daily_entries_date ON public.daily_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_goals_user_active ON public.goals(user_id, is_active);
