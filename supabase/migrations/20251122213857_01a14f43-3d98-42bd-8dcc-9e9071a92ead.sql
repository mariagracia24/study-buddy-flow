-- Add new columns to existing tables

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

-- Trigger for daily_calendar updated_at
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