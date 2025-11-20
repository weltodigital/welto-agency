import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ddtyovjdxdfpqjemmtyp.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkdHlvdmpkeGRmcHFqZW1tdHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODIzMjYsImV4cCI6MjA3OTE1ODMyNn0.uIGMXSqbUg-5HOVQUznYwBb1GAetPqpi0aJ5iVKj8Y0';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed'
        });
    }

    try {
        // Log for debugging
        console.log('Request method:', req.method);
        console.log('Request body:', req.body);
        console.log('Supabase URL:', supabaseUrl);
        console.log('Supabase Key exists:', !!supabaseKey);

        const data = req.body;

        // Validate we have data
        if (!data) {
            console.error('No data received');
            return res.status(400).json({
                success: false,
                message: 'No data received'
            });
        }

        // Validate required fields
        const requiredFields = ['first_name', 'last_name', 'email', 'phone', 'business_name', 'trade_type', 'location'];
        const missingFields = requiredFields.filter(field => !data[field] || data[field].trim() === '');

        if (missingFields.length > 0) {
            console.error('Missing fields:', missingFields);
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email address'
            });
        }

        // Prepare data for Supabase
        const leadData = {
            first_name: data.first_name.trim(),
            last_name: data.last_name.trim(),
            email: data.email.trim().toLowerCase(),
            phone: data.phone.trim(),
            business_name: data.business_name.trim(),
            trade_type: data.trade_type.trim(),
            location: data.location.trim(),
            current_marketing: data.current_marketing || 'Directory sites',
            message: (data.message || '').trim(),
            source: 'seo-leads-1',
            ip_address: req.headers['x-forwarded-for'] || req.connection.remoteAddress || '',
            user_agent: req.headers['user-agent'] || '',
            submitted_at: new Date().toISOString()
        };

        // Simplified approach - try to create table first if it doesn't exist
        const createTableIfNotExists = async () => {
            try {
                // Try to select from table to see if it exists
                const { error: selectError } = await supabase
                    .from('leads')
                    .select('id')
                    .limit(1);

                if (selectError && selectError.message.includes('relation "public.leads" does not exist')) {
                    console.log('Table does not exist, creating it...');
                    // Table doesn't exist, we need to create it manually via Supabase dashboard
                    return { needsTableCreation: true };
                }
                return { needsTableCreation: false };
            } catch (error) {
                console.error('Error checking table:', error);
                return { needsTableCreation: true };
            }
        };

        const tableCheck = await createTableIfNotExists();
        if (tableCheck.needsTableCreation) {
            return res.status(500).json({
                success: false,
                message: 'Database table "leads" does not exist. Please create the table in your Supabase dashboard first.',
                hint: 'Go to Supabase Dashboard > SQL Editor and run the SQL from setup-database.sql'
            });
        }

        // Insert data into Supabase
        console.log('Attempting to insert lead data:', leadData);
        const { data: result, error } = await supabase
            .from('leads')
            .insert([leadData])
            .select();

        if (error) {
            console.error('Supabase error details:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            return res.status(500).json({
                success: false,
                message: 'Failed to submit lead. Please try again later.',
                error: error.message,
                details: error.details
            });
        }

        console.log('Successfully inserted lead:', result);

        return res.status(200).json({
            success: true,
            message: 'Lead submitted successfully',
            lead_id: result[0]?.id
        });

    } catch (error) {
        console.error('Submit lead error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred. Please try again later.'
        });
    }
}