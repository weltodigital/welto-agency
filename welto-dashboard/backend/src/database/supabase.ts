import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.SUPABASE_URL || 'https://ddtyovjdxdfpqjemmtyp.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkdHlvdmpkeGRmcHFqZW1tdHlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU4MjMyNiwiZXhwIjoyMDc5MTU4MzI2fQ.rPOrzq7fHFqIHY4PIGcEQ3GKt1SKlzHRUrP21G5aSbw';

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const initSupabaseDatabase = async () => {
  try {
    // Note: Tables should be created via Supabase Dashboard SQL Editor
    // This function will just create initial users if they don't exist

    console.log('Checking and creating initial users...');

    // Create default admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const { error: adminError } = await supabase
      .from('users')
      .upsert([
        {
          username: 'admin',
          password: adminPassword,
          role: 'admin'
        }
      ], { onConflict: 'username' });

    if (adminError) {
      console.error('Error creating admin user:', adminError);
    }

    // Create sample client user
    const clientPassword = await bcrypt.hash('client123', 10);
    const { error: clientError } = await supabase
      .from('users')
      .upsert([
        {
          username: 'client1',
          password: clientPassword,
          role: 'client',
          client_id: 'CLIENT001'
        }
      ], { onConflict: 'username' });

    if (clientError) {
      console.error('Error creating client user:', clientError);
    }

    console.log('Supabase database initialized successfully');

  } catch (error) {
    console.error('Error initializing Supabase database:', error);
    throw error;
  }
};

export default supabase;