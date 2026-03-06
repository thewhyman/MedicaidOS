-- Fix infinite recursion in profiles policy.
-- The original policy queried the profiles table from within itself.
-- Replace with a simple non-recursive policy: users can read their own profile.
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON profiles;

CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (id = auth.uid());
