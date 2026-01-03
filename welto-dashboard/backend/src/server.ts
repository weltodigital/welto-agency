import app from './app';
import { initSupabaseDatabase } from './database/supabase';

const startServer = async () => {
  try {
    // Initialize database
    await initSupabaseDatabase();
    console.log('Supabase database initialized successfully');

    // Start server
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Dashboard API ready for app.weltodigital.com`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();