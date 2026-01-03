-- WELTO Dashboard Database Migration for Supabase
-- Run this script in your Supabase Dashboard SQL Editor

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'client',
  client_id TEXT,
  notes TEXT DEFAULT '',
  map_image TEXT DEFAULT '',
  lead_value REAL DEFAULT 500.0,
  reviews_start_count INTEGER DEFAULT 0,
  conversion_rate REAL DEFAULT 0.5,
  start_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  client_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  file_path TEXT,
  report_type TEXT DEFAULT 'monthly',
  period TEXT,
  uploaded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Metrics table for manual data entry
CREATE TABLE IF NOT EXISTS metrics (
  id SERIAL PRIMARY KEY,
  client_id TEXT NOT NULL,
  metric_type TEXT NOT NULL,
  metric_name TEXT,
  value REAL NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Search queries table for GSC data
CREATE TABLE IF NOT EXISTS search_queries (
  id SERIAL PRIMARY KEY,
  client_id TEXT NOT NULL,
  query TEXT NOT NULL,
  clicks INTEGER NOT NULL,
  impressions INTEGER NOT NULL,
  position REAL NOT NULL,
  period TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(client_id, query, period)
);

-- Top pages table for GSC data
CREATE TABLE IF NOT EXISTS top_pages (
  id SERIAL PRIMARY KEY,
  client_id TEXT NOT NULL,
  page_url TEXT NOT NULL,
  clicks INTEGER NOT NULL,
  impressions INTEGER NOT NULL,
  ctr REAL NOT NULL DEFAULT 0,
  position REAL NOT NULL,
  period TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(client_id, page_url, period)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_client_id ON users(client_id);
CREATE INDEX IF NOT EXISTS idx_reports_client_id ON reports(client_id);
CREATE INDEX IF NOT EXISTS idx_metrics_client_id ON metrics(client_id);
CREATE INDEX IF NOT EXISTS idx_metrics_date ON metrics(date);
CREATE INDEX IF NOT EXISTS idx_search_queries_client_id ON search_queries(client_id);
CREATE INDEX IF NOT EXISTS idx_search_queries_period ON search_queries(period);
CREATE INDEX IF NOT EXISTS idx_top_pages_client_id ON top_pages(client_id);
CREATE INDEX IF NOT EXISTS idx_top_pages_period ON top_pages(period);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE top_pages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own data unless they are admin
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text OR role = 'admin');

CREATE POLICY "Admin can manage all users" ON users
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::int AND role = 'admin'));

-- Reports, metrics, search queries, and top pages policies
CREATE POLICY "Users can view own client data" ON reports
  FOR SELECT USING (client_id IN (SELECT client_id FROM users WHERE id = auth.uid()::int));

CREATE POLICY "Admin can manage all reports" ON reports
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::int AND role = 'admin'));

CREATE POLICY "Users can view own metrics" ON metrics
  FOR SELECT USING (client_id IN (SELECT client_id FROM users WHERE id = auth.uid()::int));

CREATE POLICY "Admin can manage all metrics" ON metrics
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::int AND role = 'admin'));

CREATE POLICY "Users can view own search queries" ON search_queries
  FOR SELECT USING (client_id IN (SELECT client_id FROM users WHERE id = auth.uid()::int));

CREATE POLICY "Admin can manage all search queries" ON search_queries
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::int AND role = 'admin'));

CREATE POLICY "Users can view own top pages" ON top_pages
  FOR SELECT USING (client_id IN (SELECT client_id FROM users WHERE id = auth.uid()::int));

CREATE POLICY "Admin can manage all top pages" ON top_pages
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::int AND role = 'admin'));