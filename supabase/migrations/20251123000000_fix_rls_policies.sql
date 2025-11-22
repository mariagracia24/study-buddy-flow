-- Ensure RLS is enabled on all tables
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

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

