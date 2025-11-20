-- Supabase setup for WELTO lead capture system
-- Run this SQL in Supabase Dashboard > SQL Editor

-- Don't drop existing table, just ensure it has the right structure
-- Add missing columns if they don't exist

-- Add current_marketing column if it doesn't exist
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS current_marketing VARCHAR(50) DEFAULT 'Directory sites';

-- Add missing columns if they don't exist
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS message TEXT,
ADD COLUMN IF NOT EXISTS source VARCHAR(100) DEFAULT 'seo-leads-1',
ADD COLUMN IF NOT EXISTS ip_address INET,
ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Ensure timestamps exist
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create indexes for performance (skip if they exist)
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_submitted_at ON public.leads(submitted_at);
CREATE INDEX IF NOT EXISTS idx_leads_trade_type ON public.leads(trade_type);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);

-- Enable Row Level Security (RLS) - this is safe to run multiple times
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.leads;
DROP POLICY IF EXISTS "Allow authenticated selects" ON public.leads;

-- Create policy to allow inserts (for the anon key)
CREATE POLICY "Allow anonymous inserts" ON public.leads
    FOR INSERT TO anon
    WITH CHECK (true);

-- Create policy to allow selects for authenticated users only
CREATE POLICY "Allow authenticated selects" ON public.leads
    FOR SELECT TO authenticated
    USING (true);

-- Grant necessary permissions (these are safe to run multiple times)
GRANT INSERT ON public.leads TO anon;
GRANT ALL ON public.leads TO authenticated;

-- Grant sequence permissions (try both possible sequence names)
DO $$
BEGIN
    -- Try the standard sequence name first
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'leads_id_seq') THEN
        GRANT USAGE, SELECT ON public.leads_id_seq TO anon;
        GRANT USAGE, SELECT ON public.leads_id_seq TO authenticated;
    END IF;

    -- Try alternative sequence name
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name LIKE '%leads%id%seq%') THEN
        EXECUTE 'GRANT USAGE, SELECT ON ' || (SELECT sequence_schema||'.'||sequence_name FROM information_schema.sequences WHERE sequence_name LIKE '%leads%id%seq%' LIMIT 1) || ' TO anon';
        EXECUTE 'GRANT USAGE, SELECT ON ' || (SELECT sequence_schema||'.'||sequence_name FROM information_schema.sequences WHERE sequence_name LIKE '%leads%id%seq%' LIMIT 1) || ' TO authenticated';
    END IF;
END
$$;