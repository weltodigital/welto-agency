import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ddtyovjdxdfpqjemmtyp.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkdHlvdmpkeGRmcHFqZW1tdHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODIzMjYsImV4cCI6MjA3OTE1ODMyNn0.uIGMXSqbUg-5HOVQUznYwBb1GAetPqpi0aJ5iVKj8Y0';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    try {
        console.log('Testing Supabase connection...');
        console.log('URL:', supabaseUrl);
        console.log('Key exists:', !!supabaseKey);

        // Test basic connection
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .limit(1);

        if (error) {
            console.error('Connection error:', error);
            return res.status(500).json({
                success: false,
                error: error.message,
                details: error.details,
                hint: error.hint
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Connection successful',
            recordCount: data ? data.length : 0,
            supabaseUrl: supabaseUrl
        });

    } catch (error) {
        console.error('Test error:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}