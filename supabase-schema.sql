-- Create leads table in Supabase
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    trade_type VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    current_marketing VARCHAR(255) NOT NULL,
    message TEXT,
    source VARCHAR(50) DEFAULT 'website',
    ip_address VARCHAR(45),
    user_agent TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for email for faster lookups
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

-- Create index for submitted_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_leads_submitted_at ON leads(submitted_at DESC);

-- Create index for trade_type for filtering
CREATE INDEX IF NOT EXISTS idx_leads_trade_type ON leads(trade_type);

-- Create index for source for analytics
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);

-- Enable Row Level Security (RLS)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts from anyone (for lead submission)
CREATE POLICY "Allow public inserts" ON leads
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Create policy to allow authenticated users to view leads
CREATE POLICY "Allow authenticated read" ON leads
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy to allow authenticated users to update leads
CREATE POLICY "Allow authenticated update" ON leads
    FOR UPDATE
    TO authenticated
    USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Optional: Create a view for lead analytics
CREATE OR REPLACE VIEW leads_summary AS
SELECT
    trade_type,
    location,
    COUNT(*) as total_leads,
    COUNT(*) FILTER (WHERE submitted_at >= NOW() - INTERVAL '30 days') as leads_last_30_days,
    COUNT(*) FILTER (WHERE submitted_at >= NOW() - INTERVAL '7 days') as leads_last_7_days,
    MAX(submitted_at) as latest_submission
FROM leads
GROUP BY trade_type, location
ORDER BY total_leads DESC;