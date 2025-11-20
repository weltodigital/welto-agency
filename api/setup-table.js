import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ddtyovjdxdfpqjemmtyp.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkdHlvdmpkeGRmcHFqZW1tdHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODIzMjYsImV4cCI6MjA3OTE1ODMyNn0.uIGMXSqbUg-5HOVQUznYwBb1GAetPqpi0aJ5iVKj8Y0';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    try {
        console.log('Setting up leads table...');

        // Create the table with proper PostgreSQL syntax
        const { data, error } = await supabase.rpc('create_leads_table');

        if (error && !error.message.includes('already exists')) {
            // If RPC doesn't work, try direct SQL execution
            const createTableSQL = `
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

                CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
                CREATE INDEX IF NOT EXISTS idx_leads_submitted_at ON public.leads(submitted_at);
                CREATE INDEX IF NOT EXISTS idx_leads_trade_type ON public.leads(trade_type);
            `;

            const { error: sqlError } = await supabase.rpc('exec_sql', { sql: createTableSQL });

            if (sqlError) {
                console.error('SQL execution error:', sqlError);
                return res.status(500).json({
                    success: false,
                    message: 'Could not create table',
                    error: sqlError.message
                });
            }
        }

        // Test that we can insert a record
        const testRecord = {
            first_name: 'Test',
            last_name: 'User',
            email: 'test@example.com',
            phone: '01234567890',
            business_name: 'Test Business',
            trade_type: 'electrician',
            location: 'London',
            current_marketing: 'Directory sites',
            message: 'Test message',
            source: 'test',
            ip_address: '127.0.0.1',
            user_agent: 'test',
            submitted_at: new Date().toISOString()
        };

        const { data: insertData, error: insertError } = await supabase
            .from('leads')
            .insert([testRecord])
            .select();

        if (insertError) {
            console.error('Insert test failed:', insertError);
            return res.status(500).json({
                success: false,
                message: 'Table exists but insert failed',
                error: insertError.message,
                details: insertError.details,
                hint: insertError.hint
            });
        }

        // Clean up test record
        if (insertData && insertData[0]) {
            await supabase
                .from('leads')
                .delete()
                .eq('id', insertData[0].id);
        }

        return res.status(200).json({
            success: true,
            message: 'Table setup complete and tested successfully'
        });

    } catch (error) {
        console.error('Setup error:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}