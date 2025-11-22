-- ============================================
-- COMPLETE DATABASE SETUP
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- ============================================
-- Migration 1: Create storage bucket and base tables
-- ============================================

-- Create storage bucket for syllabus files (ignore if exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('syllabi', 'syllabi', false)
ON CONFLICT (id) DO NOTHING;

-- Create classes table
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  syllabus_url TEXT,
  ai_parsed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on classes
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Create assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  type TEXT,
  due_date DATE,
  estimated_minutes INTEGER,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on assignments
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Create study_blocks table
CREATE TABLE IF NOT EXISTS public.study_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE SET NULL,
  block_date DATE NOT NULL,
  start_time TIME,
  duration_minutes INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on study_blocks
ALTER TABLE public.study_blocks ENABLE ROW LEVEL SECURITY;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for classes table
DROP TRIGGER IF EXISTS update_classes_updated_at ON public.classes;
CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Migration 2: Create profiles, sessions, feed tables
-- ============================================

-- Create profiles table for user info
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  photo_url TEXT,
  streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_minutes INTEGER DEFAULT 0,
  last_study_date DATE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create study_sessions table
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE SET NULL,
  minutes_studied INTEGER NOT NULL,
  photo_url TEXT,
  timelapse_url TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on study_sessions
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- Create feed_posts table
CREATE TABLE IF NOT EXISTS public.feed_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.study_sessions(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  timelapse_url TEXT,
  minutes_studied INTEGER NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on feed_posts
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;

-- Create reactions table
CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(post_id, user_id, emoji)
);

-- Enable RLS on reactions
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create friendships table
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Enable RLS on friendships
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substring(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Nudge User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update streak
CREATE OR REPLACE FUNCTION public.update_user_streak(p_user_id UUID, p_minutes INTEGER)
RETURNS VOID AS $$
DECLARE
  v_last_date DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
BEGIN
  SELECT last_study_date, streak, longest_streak
  INTO v_last_date, v_current_streak, v_longest_streak
  FROM public.profiles
  WHERE user_id = p_user_id;

  -- Check if studied today already
  IF v_last_date = CURRENT_DATE THEN
    -- Just add minutes
    UPDATE public.profiles
    SET total_minutes = total_minutes + p_minutes
    WHERE user_id = p_user_id;
  ELSIF v_last_date = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Continuation of streak
    UPDATE public.profiles
    SET 
      streak = v_current_streak + 1,
      longest_streak = GREATEST(v_longest_streak, v_current_streak + 1),
      last_study_date = CURRENT_DATE,
      total_minutes = total_minutes + p_minutes
    WHERE user_id = p_user_id;
  ELSE
    -- Streak broken, restart
    UPDATE public.profiles
    SET 
      streak = 1,
      last_study_date = CURRENT_DATE,
      total_minutes = total_minutes + p_minutes
    WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Migration 3: Add class progress tracking
-- ============================================

-- Add class-specific progress tracking columns to classes table
ALTER TABLE public.classes
ADD COLUMN IF NOT EXISTS progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
ADD COLUMN IF NOT EXISTS streak integer DEFAULT 0 CHECK (streak >= 0),
ADD COLUMN IF NOT EXISTS last_studied_date date DEFAULT NULL;

-- Create function to update class streak
CREATE OR REPLACE FUNCTION public.update_class_streak(p_class_id uuid, p_user_id uuid, p_minutes integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_last_date DATE;
  v_current_streak INTEGER;
BEGIN
  SELECT last_studied_date, streak
  INTO v_last_date, v_current_streak
  FROM public.classes
  WHERE id = p_class_id AND user_id = p_user_id;

  -- Check if studied today already
  IF v_last_date = CURRENT_DATE THEN
    -- Already studied today, no streak change
    RETURN;
  ELSIF v_last_date = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Continuation of streak
    UPDATE public.classes
    SET 
      streak = v_current_streak + 1,
      last_studied_date = CURRENT_DATE
    WHERE id = p_class_id AND user_id = p_user_id;
  ELSE
    -- Streak broken, restart
    UPDATE public.classes
    SET 
      streak = 1,
      last_studied_date = CURRENT_DATE
    WHERE id = p_class_id AND user_id = p_user_id;
  END IF;
  
  -- Also update user's total minutes (keep global stats)
  UPDATE public.profiles
  SET total_minutes = total_minutes + p_minutes
  WHERE user_id = p_user_id;
END;
$$;

-- ============================================
-- Migration 4: Add additional columns and tables
-- ============================================

-- Update classes table with difficulty and time estimates
ALTER TABLE public.classes
ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'normal' CHECK (difficulty IN ('chill', 'normal', 'heavy')),
ADD COLUMN IF NOT EXISTS estimated_total_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS estimated_remaining_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS title TEXT;

-- Update study_sessions table for dual photos and lock mode
ALTER TABLE public.study_sessions
ADD COLUMN IF NOT EXISTS block_id TEXT,
ADD COLUMN IF NOT EXISTS target_minutes INTEGER,
ADD COLUMN IF NOT EXISTS front_photo_url TEXT,
ADD COLUMN IF NOT EXISTS back_photo_url TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'ended_early'));

-- Update feed_posts table for dual photos and visibility
ALTER TABLE public.feed_posts
ADD COLUMN IF NOT EXISTS front_photo_url TEXT,
ADD COLUMN IF NOT EXISTS back_photo_url TEXT,
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'everyone' CHECK (visibility IN ('buddies', 'everyone', 'me'));

-- Update profiles table with study preferences
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS weekday_study_range TEXT DEFAULT '2-3',
ADD COLUMN IF NOT EXISTS weekend_study_range TEXT DEFAULT '2-3',
ADD COLUMN IF NOT EXISTS earliest_study_time TEXT DEFAULT '07:00',
ADD COLUMN IF NOT EXISTS latest_study_time TEXT DEFAULT '23:00',
ADD COLUMN IF NOT EXISTS calendar_connected BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS google_calendar_id TEXT;

-- Create syllabus_topics table
CREATE TABLE IF NOT EXISTS public.syllabus_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  estimated_minutes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.syllabus_topics ENABLE ROW LEVEL SECURITY;

-- Create syllabus_assignments table
CREATE TABLE IF NOT EXISTS public.syllabus_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date DATE,
  type TEXT DEFAULT 'reading' CHECK (type IN ('reading', 'hw', 'project', 'exam')),
  estimated_minutes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.syllabus_assignments ENABLE ROW LEVEL SECURITY;

-- Create daily_calendar table with JSONB blocks array
CREATE TABLE IF NOT EXISTS public.daily_calendar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  blocks JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.daily_calendar ENABLE ROW LEVEL SECURITY;

-- Create pinky_promises table
CREATE TABLE IF NOT EXISTS public.pinky_promises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  block_id TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'kept', 'broken')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.pinky_promises ENABLE ROW LEVEL SECURITY;

-- Trigger for daily_calendar updated_at
DROP TRIGGER IF EXISTS update_daily_calendar_updated_at ON public.daily_calendar;
CREATE TRIGGER update_daily_calendar_updated_at
BEFORE UPDATE ON public.daily_calendar
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_syllabus_topics_class_id ON public.syllabus_topics(class_id);
CREATE INDEX IF NOT EXISTS idx_syllabus_assignments_class_id ON public.syllabus_assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_syllabus_assignments_due_date ON public.syllabus_assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_daily_calendar_user_date ON public.daily_calendar(user_id, date);
CREATE INDEX IF NOT EXISTS idx_pinky_promises_user_id ON public.pinky_promises(user_id);
CREATE INDEX IF NOT EXISTS idx_pinky_promises_block_id ON public.pinky_promises(block_id);

-- ============================================
-- Migration 5: Fix and ensure RLS policies are correct
-- ============================================

-- Ensure RLS is enabled on all tables
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syllabus_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syllabus_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pinky_promises ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them to ensure they're correct
DROP POLICY IF EXISTS "Users can view their own classes" ON public.classes;
DROP POLICY IF EXISTS "Users can insert their own classes" ON public.classes;
DROP POLICY IF EXISTS "Users can update their own classes" ON public.classes;
DROP POLICY IF EXISTS "Users can delete their own classes" ON public.classes;

DROP POLICY IF EXISTS "Users can view their own assignments" ON public.assignments;
DROP POLICY IF EXISTS "Users can insert their own assignments" ON public.assignments;
DROP POLICY IF EXISTS "Users can update their own assignments" ON public.assignments;
DROP POLICY IF EXISTS "Users can delete their own assignments" ON public.assignments;

DROP POLICY IF EXISTS "Users can view their own study blocks" ON public.study_blocks;
DROP POLICY IF EXISTS "Users can insert their own study blocks" ON public.study_blocks;
DROP POLICY IF EXISTS "Users can update their own study blocks" ON public.study_blocks;
DROP POLICY IF EXISTS "Users can delete their own study blocks" ON public.study_blocks;

DROP POLICY IF EXISTS "Users can view their own sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON public.study_sessions;

-- Recreate classes policies
CREATE POLICY "Users can view their own classes"
  ON public.classes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own classes"
  ON public.classes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own classes"
  ON public.classes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own classes"
  ON public.classes FOR DELETE
  USING (auth.uid() = user_id);

-- Recreate assignments policies
CREATE POLICY "Users can view their own assignments"
  ON public.assignments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assignments"
  ON public.assignments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assignments"
  ON public.assignments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assignments"
  ON public.assignments FOR DELETE
  USING (auth.uid() = user_id);

-- Recreate study_blocks policies
CREATE POLICY "Users can view their own study blocks"
  ON public.study_blocks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study blocks"
  ON public.study_blocks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study blocks"
  ON public.study_blocks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study blocks"
  ON public.study_blocks FOR DELETE
  USING (auth.uid() = user_id);

-- Recreate study_sessions policies
CREATE POLICY "Users can view their own sessions"
  ON public.study_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON public.study_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.study_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON public.study_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Profiles policies (public read, own write)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Feed posts policies (public read, own write)
DROP POLICY IF EXISTS "Everyone can view feed posts" ON public.feed_posts;
DROP POLICY IF EXISTS "Users can create their own posts" ON public.feed_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.feed_posts;

CREATE POLICY "Everyone can view feed posts"
  ON public.feed_posts FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own posts"
  ON public.feed_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON public.feed_posts FOR DELETE
  USING (auth.uid() = user_id);

-- Reactions policies (public read, own write)
DROP POLICY IF EXISTS "Everyone can view reactions" ON public.reactions;
DROP POLICY IF EXISTS "Users can add reactions" ON public.reactions;
DROP POLICY IF EXISTS "Users can remove their reactions" ON public.reactions;

CREATE POLICY "Everyone can view reactions"
  ON public.reactions FOR SELECT
  USING (true);

CREATE POLICY "Users can add reactions"
  ON public.reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their reactions"
  ON public.reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Comments policies (public read, own write)
DROP POLICY IF EXISTS "Everyone can view comments" ON public.comments;
DROP POLICY IF EXISTS "Users can add comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their comments" ON public.comments;

CREATE POLICY "Everyone can view comments"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Users can add comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- Friendships policies
DROP POLICY IF EXISTS "Users can view their friendships" ON public.friendships;
DROP POLICY IF EXISTS "Users can create friendships" ON public.friendships;
DROP POLICY IF EXISTS "Users can delete their friendships" ON public.friendships;

CREATE POLICY "Users can view their friendships"
  ON public.friendships FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendships"
  ON public.friendships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their friendships"
  ON public.friendships FOR DELETE
  USING (auth.uid() = user_id);

-- Syllabus topics policies
DROP POLICY IF EXISTS "Users can view their own syllabus topics" ON public.syllabus_topics;
DROP POLICY IF EXISTS "Users can insert their own syllabus topics" ON public.syllabus_topics;
DROP POLICY IF EXISTS "Users can update their own syllabus topics" ON public.syllabus_topics;
DROP POLICY IF EXISTS "Users can delete their own syllabus topics" ON public.syllabus_topics;

CREATE POLICY "Users can view their own syllabus topics"
ON public.syllabus_topics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.classes
    WHERE classes.id = syllabus_topics.class_id
    AND classes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own syllabus topics"
ON public.syllabus_topics FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.classes
    WHERE classes.id = syllabus_topics.class_id
    AND classes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own syllabus topics"
ON public.syllabus_topics FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.classes
    WHERE classes.id = syllabus_topics.class_id
    AND classes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own syllabus topics"
ON public.syllabus_topics FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.classes
    WHERE classes.id = syllabus_topics.class_id
    AND classes.user_id = auth.uid()
  )
);

-- Syllabus assignments policies
DROP POLICY IF EXISTS "Users can view their own syllabus assignments" ON public.syllabus_assignments;
DROP POLICY IF EXISTS "Users can insert their own syllabus assignments" ON public.syllabus_assignments;
DROP POLICY IF EXISTS "Users can update their own syllabus assignments" ON public.syllabus_assignments;
DROP POLICY IF EXISTS "Users can delete their own syllabus assignments" ON public.syllabus_assignments;

CREATE POLICY "Users can view their own syllabus assignments"
ON public.syllabus_assignments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.classes
    WHERE classes.id = syllabus_assignments.class_id
    AND classes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own syllabus assignments"
ON public.syllabus_assignments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.classes
    WHERE classes.id = syllabus_assignments.class_id
    AND classes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own syllabus assignments"
ON public.syllabus_assignments FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.classes
    WHERE classes.id = syllabus_assignments.class_id
    AND classes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own syllabus assignments"
ON public.syllabus_assignments FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.classes
    WHERE classes.id = syllabus_assignments.class_id
    AND classes.user_id = auth.uid()
  )
);

-- Daily calendar policies
DROP POLICY IF EXISTS "Users can view their own calendar" ON public.daily_calendar;
DROP POLICY IF EXISTS "Users can insert their own calendar" ON public.daily_calendar;
DROP POLICY IF EXISTS "Users can update their own calendar" ON public.daily_calendar;
DROP POLICY IF EXISTS "Users can delete their own calendar" ON public.daily_calendar;

CREATE POLICY "Users can view their own calendar"
ON public.daily_calendar FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendar"
ON public.daily_calendar FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar"
ON public.daily_calendar FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar"
ON public.daily_calendar FOR DELETE
USING (auth.uid() = user_id);

-- Pinky promises policies
DROP POLICY IF EXISTS "Users can view their own pinky promises" ON public.pinky_promises;
DROP POLICY IF EXISTS "Users can insert their own pinky promises" ON public.pinky_promises;
DROP POLICY IF EXISTS "Users can update their own pinky promises" ON public.pinky_promises;
DROP POLICY IF EXISTS "Users can delete their own pinky promises" ON public.pinky_promises;

CREATE POLICY "Users can view their own pinky promises"
ON public.pinky_promises FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pinky promises"
ON public.pinky_promises FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pinky promises"
ON public.pinky_promises FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pinky promises"
ON public.pinky_promises FOR DELETE
USING (auth.uid() = user_id);

-- Storage policies for syllabi bucket
DROP POLICY IF EXISTS "Users can upload their own syllabi" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own syllabi" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own syllabi" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own syllabi" ON storage.objects;

CREATE POLICY "Users can upload their own syllabi"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'syllabi' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own syllabi"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'syllabi' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own syllabi"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'syllabi' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own syllabi"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'syllabi' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Enable realtime for feed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'feed_posts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.feed_posts;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'reactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reactions;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'comments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
  END IF;
END $$;

-- ============================================
-- Setup Complete!
-- ============================================

