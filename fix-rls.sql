-- Simple fix for RLS policy issue
-- Run this SQL in Supabase Dashboard > SQL Editor

-- Option 1: Temporarily disable RLS to test
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;

-- Option 2: If you want to keep RLS enabled, run these commands instead:
-- (Comment out the line above and uncomment the lines below)

/*
-- Drop all existing policies
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.leads;
DROP POLICY IF EXISTS "Allow authenticated selects" ON public.leads;
DROP POLICY IF EXISTS "Enable insert for anon users" ON public.leads;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.leads;

-- Create a very permissive insert policy
CREATE POLICY "allow_all_inserts" ON public.leads
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Create read policy for authenticated users
CREATE POLICY "allow_authenticated_reads" ON public.leads
    FOR SELECT
    TO authenticated
    USING (true);

-- Make sure permissions are granted
GRANT INSERT ON public.leads TO anon;
GRANT INSERT ON public.leads TO public;
GRANT ALL ON public.leads TO authenticated;
*/