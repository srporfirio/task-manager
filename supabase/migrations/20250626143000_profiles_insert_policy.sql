-- Allow authenticated users to create their own profile row when the signup trigger
-- did not run (e.g. user created before migration or trigger failure).

CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);
