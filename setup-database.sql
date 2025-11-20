-- Database setup for WELTO lead capture system
-- Run this SQL to create the database and table structure

-- Create database
CREATE DATABASE IF NOT EXISTS welto_leads CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE welto_leads;

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    business_name VARCHAR(200) NOT NULL,
    trade_type VARCHAR(100) NOT NULL,
    location VARCHAR(200) NOT NULL,
    current_marketing VARCHAR(50) NOT NULL,
    message TEXT,
    source VARCHAR(100) DEFAULT 'seo-leads-1',
    ip_address VARCHAR(45),
    user_agent TEXT,
    submitted_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_submitted_at (submitted_at),
    INDEX idx_trade_type (trade_type),
    INDEX idx_source (source)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create a user for the application (optional, for better security)
-- Replace 'your_password' with a strong password
-- CREATE USER IF NOT EXISTS 'welto_app'@'localhost' IDENTIFIED BY 'your_password';
-- GRANT SELECT, INSERT, UPDATE ON welto_leads.* TO 'welto_app'@'localhost';
-- FLUSH PRIVILEGES;

-- Sample queries for managing leads
-- View all leads:
-- SELECT * FROM leads ORDER BY submitted_at DESC;

-- View leads by trade type:
-- SELECT * FROM leads WHERE trade_type = 'electrician' ORDER BY submitted_at DESC;

-- View leads from last 30 days:
-- SELECT * FROM leads WHERE submitted_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) ORDER BY submitted_at DESC;

-- Count leads by trade type:
-- SELECT trade_type, COUNT(*) as lead_count FROM leads GROUP BY trade_type ORDER BY lead_count DESC;