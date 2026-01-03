import sqlite3 from 'sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.join(__dirname, '../../database.db');
const db = new sqlite3.Database(dbPath);

export const initDatabase = () => {
  return new Promise<void>((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'client',
          client_id TEXT,
          notes TEXT DEFAULT '',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Reports table
      db.run(`
        CREATE TABLE IF NOT EXISTS reports (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          client_id TEXT NOT NULL,
          title TEXT NOT NULL,
          content TEXT,
          file_path TEXT,
          report_type TEXT DEFAULT 'monthly',
          period TEXT,
          uploaded_by INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (uploaded_by) REFERENCES users (id)
        )
      `);

      // Metrics table for manual data entry
      db.run(`
        CREATE TABLE IF NOT EXISTS metrics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          client_id TEXT NOT NULL,
          metric_type TEXT NOT NULL,
          metric_name TEXT,
          value REAL NOT NULL,
          date DATE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Search queries table for GSC data
      db.run(`
        CREATE TABLE IF NOT EXISTS search_queries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          client_id TEXT NOT NULL,
          query TEXT NOT NULL,
          clicks INTEGER NOT NULL,
          impressions INTEGER NOT NULL,
          position REAL NOT NULL,
          period TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(client_id, query, period)
        )
      `);

      // Top pages table for GSC data
      db.run(`
        CREATE TABLE IF NOT EXISTS top_pages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          client_id TEXT NOT NULL,
          page_url TEXT NOT NULL,
          clicks INTEGER NOT NULL,
          impressions INTEGER NOT NULL,
          ctr REAL NOT NULL,
          position REAL NOT NULL,
          period TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(client_id, page_url, period)
        )
      `);

      // Migration: Add notes column to existing users table
      db.run(`
        ALTER TABLE users ADD COLUMN notes TEXT DEFAULT ''
      `, (err) => {
        // Ignore error if column already exists
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Migration error:', err);
        }
      });

      // Migration: Add metric_name column to existing metrics table
      db.run(`
        ALTER TABLE metrics ADD COLUMN metric_name TEXT
      `, (err) => {
        // Ignore error if column already exists
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Migration error:', err);
        }
      });

      // Migration: Add map_image column to existing users table
      db.run(`
        ALTER TABLE users ADD COLUMN map_image TEXT DEFAULT ''
      `, (err) => {
        // Ignore error if column already exists
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Migration error:', err);
        }
      });

      // Migration: Add lead_value column to existing users table
      db.run(`
        ALTER TABLE users ADD COLUMN lead_value REAL DEFAULT 500.0
      `, (err) => {
        // Ignore error if column already exists
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Migration error:', err);
        }
      });

      // Migration: Add reviews_start_count column to existing users table
      db.run(`
        ALTER TABLE users ADD COLUMN reviews_start_count INTEGER DEFAULT 0
      `, (err) => {
        // Ignore error if column already exists
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Migration error:', err);
        }
      });

      // Migration: Add conversion_rate column to existing users table
      db.run(`
        ALTER TABLE users ADD COLUMN conversion_rate REAL DEFAULT 0.5
      `, (err) => {
        // Ignore error if column already exists
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Migration error:', err);
        }
      });

      // Create default admin user
      const adminPassword = bcrypt.hashSync('admin123', 10);
      db.run(`
        INSERT OR IGNORE INTO users (username, password, role)
        VALUES ('admin', ?, 'admin')
      `, [adminPassword]);

      // Create sample client user
      const clientPassword = bcrypt.hashSync('client123', 10);
      db.run(`
        INSERT OR IGNORE INTO users (username, password, role, client_id)
        VALUES ('client1', ?, 'client', 'CLIENT001')
      `, [clientPassword], (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database initialized successfully');
          resolve();
        }
      });
    });
  });
};

export { db };
export default db;