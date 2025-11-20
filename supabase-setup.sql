-- Supabase setup for WELTO lead capture system
-- Run this SQL in Supabase Dashboard > SQL Editor

-- Create leads table with PostgreSQL syntax
CREATE TABLE IF NOT EXISTS public.leads (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    business_name VARCHAR(200) NOT NULL,
    trade_type VARCHAR(100) NOT NULL,
    location VARCHAR(200) NOT NULL,
    current_marketing VARCHAR(50) DEFAULT 'Directory sites',
    message TEXT,
    source VARCHAR(100) DEFAULT 'seo-leads-1',
    ip_address INET,
    user_agent TEXT,
    submitted_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_submitted_at ON public.leads(submitted_at);
CREATE INDEX IF NOT EXISTS idx_leads_trade_type ON public.leads(trade_type);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);

-- Enable Row Level Security (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts (for the anon key)
CREATE POLICY "Allow anonymous inserts" ON public.leads
    FOR INSERT TO anon
    WITH CHECK (true);

-- Create policy to allow selects for authenticated users only
CREATE POLICY "Allow authenticated selects" ON public.leads
    FOR SELECT TO authenticated
    USING (true);

-- Grant necessary permissions
GRANT INSERT ON public.leads TO anon;
GRANT ALL ON public.leads TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE leads_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE leads_id_seq TO authenticated;