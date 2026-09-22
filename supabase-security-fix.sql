-- WELTO — Supabase security remediation
-- Fixes every ERROR reported by the Supabase database linter on 2026-09-22.
-- Run once in Supabase Dashboard > SQL Editor. Safe to re-run.
--
-- Model: the browser/anon key may ONLY insert leads. Everything else is read
-- and written server-side with the service_role key, which bypasses RLS, so
-- these tables need no policies at all — RLS on with zero policies denies
-- anon and authenticated outright.
--
-- Supersedes fix-rls.sql, which disabled RLS on public.leads.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. public.leads  (policy_exists_rls_disabled, rls_disabled_in_public)
-- ---------------------------------------------------------------------------

-- Drop the accumulated policies. The "authenticated" read/update policies were
-- dead weight: the dashboard uses its own JWT auth, not Supabase Auth, so no
-- one is ever the `authenticated` role — but if Supabase Auth signup is ever
-- enabled, any signup would inherit read access to every lead.
DROP POLICY IF EXISTS "Allow public inserts"                        ON public.leads;
DROP POLICY IF EXISTS "Allow authenticated read"                    ON public.leads;
DROP POLICY IF EXISTS "Allow authenticated update"                  ON public.leads;
DROP POLICY IF EXISTS "Enable insert for anon users"                ON public.leads;
DROP POLICY IF EXISTS "Enable read access for authenticated users"  ON public.leads;
DROP POLICY IF EXISTS "Allow anonymous inserts"                     ON public.leads;
DROP POLICY IF EXISTS "Allow authenticated selects"                 ON public.leads;
DROP POLICY IF EXISTS "allow_all_inserts"                           ON public.leads;
DROP POLICY IF EXISTS "allow_authenticated_reads"                   ON public.leads;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- The only thing the public site needs: write-only lead capture.
CREATE POLICY "anon can submit leads" ON public.leads
  FOR INSERT TO anon
  WITH CHECK (true);

-- Table privileges are the second lock: even a future policy mistake cannot
-- hand out reads if the grant is not there.
REVOKE ALL ON public.leads FROM anon, authenticated;
GRANT INSERT ON public.leads TO anon;

-- If leads.id is a serial/identity column, anon needs its sequence to insert.
DO $$
DECLARE seq text;
BEGIN
  SELECT pg_get_serial_sequence('public.leads', 'id') INTO seq;
  IF seq IS NOT NULL THEN
    EXECUTE format('GRANT USAGE, SELECT ON SEQUENCE %s TO anon', seq);
  END IF;
END
$$;

-- ---------------------------------------------------------------------------
-- 2. public.leads_summary  (security_definer_view)
-- ---------------------------------------------------------------------------
-- As SECURITY DEFINER the view ran with the owner's rights, so it read leads
-- straight through RLS for whoever queried it. security_invoker makes it obey
-- the caller's policies; the revoke keeps it off the public API entirely.

ALTER VIEW public.leads_summary SET (security_invoker = true);
REVOKE ALL ON public.leads_summary FROM anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. Dashboard tables  (rls_disabled_in_public, sensitive_columns_exposed)
-- ---------------------------------------------------------------------------
-- public.users holds bcrypt password hashes and was readable by anyone holding
-- the anon key — which is published in this repo and in client-side JS.
--
-- The policies in backend/src/database/supabase-migration.sql are NOT recreated
-- here: they key off auth.uid(), which is always NULL under the dashboard's
-- custom JWT auth, and the users policy referenced users from within its own
-- policy, which raises infinite recursion (42P17) as soon as RLS is on.

DROP POLICY IF EXISTS "Users can view own data"            ON public.users;
DROP POLICY IF EXISTS "Admin can manage all users"         ON public.users;
DROP POLICY IF EXISTS "Users can view own client data"     ON public.reports;
DROP POLICY IF EXISTS "Admin can manage all reports"       ON public.reports;
DROP POLICY IF EXISTS "Users can view own metrics"         ON public.metrics;
DROP POLICY IF EXISTS "Admin can manage all metrics"       ON public.metrics;
DROP POLICY IF EXISTS "Users can view own search queries"  ON public.search_queries;
DROP POLICY IF EXISTS "Admin can manage all search queries" ON public.search_queries;
DROP POLICY IF EXISTS "Users can view own top pages"       ON public.top_pages;
DROP POLICY IF EXISTS "Admin can manage all top pages"     ON public.top_pages;

ALTER TABLE public.users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.top_pages      ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.users          FROM anon, authenticated;
REVOKE ALL ON public.reports        FROM anon, authenticated;
REVOKE ALL ON public.metrics        FROM anon, authenticated;
REVOKE ALL ON public.search_queries FROM anon, authenticated;
REVOKE ALL ON public.top_pages      FROM anon, authenticated;

COMMIT;

-- ---------------------------------------------------------------------------
-- Verify: expect rowsecurity = true for all six tables, and one policy on
-- leads ("anon can submit leads").
-- ---------------------------------------------------------------------------
-- SELECT tablename, rowsecurity FROM pg_tables
--  WHERE schemaname = 'public'
--    AND tablename IN ('leads','users','reports','metrics','search_queries','top_pages');
-- SELECT tablename, policyname, roles, cmd FROM pg_policies WHERE schemaname = 'public';
