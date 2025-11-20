# WELTO Contact Form Setup Instructions

This guide will help you set up the contact form and database for the seo-leads-1 page.

## Prerequisites

- Web server with PHP 7.4+ support
- MySQL database server
- Basic knowledge of database management

## Step 1: Database Setup

1. **Create the database and table:**
   - Access your MySQL database (via phpMyAdmin, command line, or hosting control panel)
   - Import or run the SQL commands from `setup-database.sql`
   - This will create the `welto_leads` database and `leads` table

2. **Update database credentials:**
   - Edit `submit-lead.php` (line 7-12)
   - Edit `admin/leads.php` (line 5-10)
   - Edit `admin/export-leads.php` (line 4-9)
   - Update the database connection details:
     ```php
     $db_config = [
         'host' => 'your_database_host',      // Usually 'localhost'
         'dbname' => 'welto_leads',           // Database name
         'username' => 'your_db_username',    // Database username
         'password' => 'your_db_password'     // Database password
     ];
     ```

## Step 2: File Permissions

Ensure your web server can read the PHP files:
- `submit-lead.php` - Handles form submissions
- `admin/leads.php` - Admin panel to view leads
- `admin/export-leads.php` - CSV export functionality

## Step 3: Testing the Setup

1. **Test the contact form:**
   - Visit your seo-leads-1.html page
   - Fill out and submit the contact form
   - Check for success/error messages

2. **Test the admin panel:**
   - Visit `/admin/leads.php` to view submitted leads
   - Test the filters and pagination
   - Try exporting leads as CSV

3. **Check database:**
   - Verify data is being stored in the `leads` table
   - Check that all fields are populated correctly

## Step 4: Security Considerations

### For Production Use:

1. **Protect the admin directory:**
   - Add HTTP authentication
   - Create a `.htaccess` file in `/admin/`:
     ```apache
     AuthType Basic
     AuthName "Admin Area"
     AuthUserFile /path/to/.htpasswd
     Require valid-user
     ```

2. **Create a dedicated database user:**
   - Don't use the root MySQL user
   - Create a user with limited permissions:
     ```sql
     CREATE USER 'welto_app'@'localhost' IDENTIFIED BY 'strong_password';
     GRANT SELECT, INSERT, UPDATE ON welto_leads.* TO 'welto_app'@'localhost';
     FLUSH PRIVILEGES;
     ```

3. **Enable email notifications:**
   - Uncomment line 120 in `submit-lead.php`
   - Configure your server's mail settings
   - Consider using SMTP for better deliverability

## File Structure

```
/welto-agency/
├── seo-leads-1.html          # Landing page with contact form
├── submit-lead.php           # Form processing script
├── setup-database.sql        # Database setup SQL
├── admin/
│   ├── leads.php            # Admin panel for viewing leads
│   └── export-leads.php     # CSV export script
└── SETUP_INSTRUCTIONS.md    # This file
```

## Features Included

### Contact Form Features:
- ✅ Responsive design matching your site style
- ✅ Client-side validation
- ✅ AJAX form submission
- ✅ Success/error feedback
- ✅ Google Analytics conversion tracking
- ✅ Fallback to Calendly for direct booking

### Database Features:
- ✅ Secure data storage with input sanitization
- ✅ Duplicate email handling (updates existing records)
- ✅ IP address and user agent tracking
- ✅ Timestamped submissions
- ✅ Indexed fields for performance

### Admin Panel Features:
- ✅ View all leads with pagination
- ✅ Filter by trade type and date range
- ✅ Export leads to CSV
- ✅ Responsive design
- ✅ Real-time statistics

## Form Fields Captured

- **Required Fields:**
  - First Name
  - Last Name
  - Email Address
  - Phone Number
  - Business Name
  - Trade Type (dropdown)
  - Service Area
  - Current Marketing Spend (ranges)

- **Optional Fields:**
  - Message/Challenge description

- **Automatic Fields:**
  - Submission timestamp
  - IP address
  - User agent
  - Source page (seo-leads-1)

## Troubleshooting

### Common Issues:

1. **Form submission fails:**
   - Check database credentials
   - Verify PHP error logs
   - Ensure database table exists

2. **Admin panel shows empty:**
   - Confirm database connection
   - Check if any leads have been submitted
   - Verify table permissions

3. **Email notifications not working:**
   - Check server mail configuration
   - Consider using PHPMailer for SMTP
   - Verify email addresses in code

### Database Connection Errors:
- Verify host, username, password, and database name
- Check if MySQL service is running
- Ensure user has proper permissions

## Support

For additional support with setup, contact the development team or refer to the documentation for your hosting provider's database management tools.