import express from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import Papa from 'papaparse';
import { db } from '../database/db';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Configure multer for CSV file uploads
const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

// Configure multer for image uploads
const imageUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'map-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

router.get('/clients', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const clients = await db.getAllUsers({ role: 'client' });
    res.json(clients);
  } catch (err) {
    console.error('Error fetching clients:', err);
    return res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

router.post('/clients', authenticateToken, requireAdmin, async (req, res) => {
  const { username, password, client_id, start_date } = req.body;

  if (!username || !password || !client_id) {
    return res.status(400).json({ error: 'Username, password, and client_id are required' });
  }

  try {
    // Check if username already exists
    const existingUser = await db.getUser({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Check if client_id already exists
    const existingClient = await db.getUser({ client_id });
    if (existingClient) {
      return res.status(400).json({ error: 'Client ID already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newClient = await db.createUser({
      username,
      password: hashedPassword,
      role: 'client',
      client_id,
      start_date
    });

    res.status(201).json({
      message: 'Client created successfully',
      client: {
        id: newClient.id,
        username: newClient.username,
        client_id: newClient.client_id,
        start_date: newClient.start_date
      }
    });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// Add endpoint to update client start date
router.put('/clients/:id/start-date', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { start_date } = req.body;

  if (!start_date) {
    return res.status(400).json({ error: 'Start date is required' });
  }

  db.run('UPDATE users SET start_date = ? WHERE id = ? AND role = "client"', [start_date, id], function (err: any) {
    if (err) {
      console.error('Error updating start date:', err);
      return res.status(500).json({ error: 'Failed to update start date' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ message: 'Start date updated successfully' });
  });
});

router.delete('/clients/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;

  // Get client info first
  db.get('SELECT * FROM users WHERE id = ? AND role = "client"', [id], (err: any, client: any) => {
    if (err) {
      console.error('Error finding client:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Delete client and their data
    db.serialize(() => {
      db.run('DELETE FROM metrics WHERE client_id = ?', [client.client_id]);
      db.run('DELETE FROM reports WHERE client_id = ?', [client.client_id]);
      db.run('DELETE FROM users WHERE id = ?', [id], function (err: any) {
        if (err) {
          console.error('Error deleting client:', err);
          return res.status(500).json({ error: 'Failed to delete client' });
        }
        res.json({ message: 'Client deleted successfully' });
      });
    });
  });
});

router.get('/clients/:clientId/data', authenticateToken, requireAdmin, (req, res) => {
  const { clientId } = req.params;

  db.all(`
    SELECT * FROM reports WHERE client_id = ? ORDER BY created_at DESC
  `, [clientId], (err: any, reports: any[]) => {
    if (err) {
      console.error('Error fetching reports:', err);
      return res.status(500).json({ error: 'Failed to fetch reports' });
    }

    db.all(`
      SELECT * FROM metrics WHERE client_id = ? ORDER BY created_at DESC
    `, [clientId], (err: any, metrics: any[]) => {
      if (err) {
        console.error('Error fetching metrics:', err);
        return res.status(500).json({ error: 'Failed to fetch metrics' });
      }

      res.json({ reports, metrics });
    });
  });
});

router.post('/clients/:clientId/metrics', authenticateToken, requireAdmin, (req, res) => {
  const { clientId } = req.params;
  const { metric_type, value, month } = req.body;

  if (!metric_type || value === undefined) {
    return res.status(400).json({ error: 'Metric type and value are required' });
  }

  const metricMonth = month || new Date().toISOString().slice(0, 7);

  // Convert metric_type to readable name
  const metricName = metric_type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());

  db.run(`
    INSERT INTO metrics (client_id, metric_type, metric_name, value, date)
    VALUES (?, ?, ?, ?, ?)
  `, [clientId, metric_type, metricName, parseFloat(value), metricMonth], function (err: any) {
    if (err) {
      console.error('Error adding metric:', err);
      return res.status(500).json({ error: 'Failed to add metric' });
    }

    res.status(201).json({
      message: 'Metric added successfully',
      metric: { id: this.lastID, client_id: clientId, metric_type, value, date: metricMonth }
    });
  });
});

router.post('/clients/:clientId/reports', authenticateToken, requireAdmin, (req, res) => {
  const { clientId } = req.params;
  const { title, content, report_type, period } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const reportPeriod = period || new Date().toISOString().slice(0, 7);

  db.run(`
    INSERT INTO reports (client_id, title, content, report_type, period)
    VALUES (?, ?, ?, ?, ?)
  `, [clientId, title, content, report_type || 'monthly', reportPeriod], function (err: any) {
    if (err) {
      console.error('Error adding report:', err);
      return res.status(500).json({ error: 'Failed to add report' });
    }

    res.status(201).json({
      message: 'Report added successfully',
      report: { id: this.lastID, client_id: clientId, title, content, report_type, period: reportPeriod }
    });
  });
});

router.delete('/metrics/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM metrics WHERE id = ?', [id], function (err: any) {
    if (err) {
      console.error('Error deleting metric:', err);
      return res.status(500).json({ error: 'Failed to delete metric' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Metric not found' });
    }

    res.json({ message: 'Metric deleted successfully' });
  });
});

router.delete('/reports/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM reports WHERE id = ?', [id], function (err: any) {
    if (err) {
      console.error('Error deleting report:', err);
      return res.status(500).json({ error: 'Failed to delete report' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ message: 'Report deleted successfully' });
  });
});

// Update client notes
router.put('/clients/:id/notes', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;

  if (typeof notes !== 'string') {
    return res.status(400).json({ error: 'Notes must be a string' });
  }

  db.run('UPDATE users SET notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND role = "client"', [notes, id], function (err: any) {
    if (err) {
      console.error('Error updating client notes:', err);
      return res.status(500).json({ error: 'Failed to update client notes' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ message: 'Client notes updated successfully', notes });
  });
});

// Update client lead value
router.put('/clients/:id/lead-value', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { lead_value } = req.body;

  if (typeof lead_value !== 'number' || lead_value <= 0) {
    return res.status(400).json({ error: 'Lead value must be a positive number' });
  }

  db.run('UPDATE users SET lead_value = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND role = "client"', [lead_value, id], function (err: any) {
    if (err) {
      console.error('Error updating client lead value:', err);
      return res.status(500).json({ error: 'Failed to update client lead value' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ message: 'Client lead value updated successfully', lead_value });
  });
});

// Update client reviews start count
router.put('/clients/:id/reviews-start-count', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { reviews_start_count } = req.body;

  if (typeof reviews_start_count !== 'number' || reviews_start_count < 0) {
    return res.status(400).json({ error: 'Reviews start count must be a non-negative number' });
  }

  db.run('UPDATE users SET reviews_start_count = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND role = "client"', [reviews_start_count, id], function (err: any) {
    if (err) {
      console.error('Error updating client reviews start count:', err);
      return res.status(500).json({ error: 'Failed to update client reviews start count' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ message: 'Client reviews start count updated successfully', reviews_start_count });
  });
});

// Update client conversion rate
router.put('/clients/:id/conversion-rate', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { conversion_rate } = req.body;

  if (typeof conversion_rate !== 'number' || conversion_rate < 0 || conversion_rate > 1) {
    return res.status(400).json({ error: 'Conversion rate must be a number between 0 and 1' });
  }

  db.run('UPDATE users SET conversion_rate = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND role = "client"', [conversion_rate, id], function (err: any) {
    if (err) {
      console.error('Error updating client conversion rate:', err);
      return res.status(500).json({ error: 'Failed to update client conversion rate' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ message: 'Client conversion rate updated successfully', conversion_rate });
  });
});

// Upload client map image
router.post('/clients/:id/map-image', authenticateToken, requireAdmin, imageUpload.single('image'), (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({ error: 'Image file is required' });
  }

  const imagePath = `/uploads/${req.file.filename}`;

  db.run('UPDATE users SET map_image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND role = "client"', [imagePath, id], function (err: any) {
    if (err) {
      console.error('Error updating client map image:', err);
      return res.status(500).json({ error: 'Failed to update client map image' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ message: 'Client map image uploaded successfully', map_image: imagePath });
  });
});

// Upload CSV for search queries
router.post('/clients/:clientId/upload-csv', authenticateToken, requireAdmin, csvUpload.single('csv'), async (req, res) => {
  const { clientId } = req.params;
  const { period, data_type = 'queries' } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'CSV file is required' });
  }

  if (!period) {
    return res.status(400).json({ error: 'Period is required' });
  }

  try {
    // Parse CSV data using Papa.parse
    const csvString = req.file.buffer.toString();
    const parseResult = Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim()
    });

    if (parseResult.errors.length > 0) {
      console.error('CSV parsing errors:', parseResult.errors);
      return res.status(400).json({ error: 'Invalid CSV format' });
    }

    const csvData: any[] = [];

    if (data_type === 'pages') {
      // Map CSV columns for top pages data
      parseResult.data.forEach((row: any) => {
        const pageUrl = row['Top pages'] || row['Page'] || row['page'] || row['URL'] || row['url'] || '';
        const clicks = parseInt(row['Clicks'] || row['clicks'] || '0') || 0;
        const impressions = parseInt(row['Impressions'] || row['impressions'] || '0') || 0;
        const position = parseFloat(row['Position'] || row['position'] || '0') || 0;

        if (pageUrl.trim()) {
          csvData.push({
            page_url: pageUrl.trim(),
            clicks,
            impressions,
            position
          });
        }
      });
    } else {
      // Map CSV columns for search queries data
      parseResult.data.forEach((row: any) => {
        const query = row['Top queries'] || row['Query'] || row['query'] || '';
        const clicks = parseInt(row['Clicks'] || row['clicks'] || '0') || 0;
        const impressions = parseInt(row['Impressions'] || row['impressions'] || '0') || 0;
        const position = parseFloat(row['Position'] || row['position'] || '0') || 0;

        if (query.trim()) {
          csvData.push({
            query: query.trim(),
            clicks,
            impressions,
            position
          });
        }
      });
    }

    if (csvData.length === 0) {
      return res.status(400).json({ error: 'No valid data found in CSV' });
    }

    if (data_type === 'pages') {
      // Clear existing pages data for this period
      await new Promise((resolve, reject) => {
        db.run('DELETE FROM top_pages WHERE client_id = ? AND period = ?', [clientId, period], (err) => {
          if (err) reject(err);
          else resolve(undefined);
        });
      });

      // Insert new pages data
      const insertPromises = csvData.map((row) => {
        return new Promise((resolve, reject) => {
          db.run(`
            INSERT INTO top_pages (client_id, page_url, clicks, impressions, position, period)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [clientId, row.page_url, row.clicks, row.impressions, row.position, period], (err) => {
            if (err) reject(err);
            else resolve(undefined);
          });
        });
      });

      await Promise.all(insertPromises);
    } else {
      // Clear existing queries data for this period
      await new Promise((resolve, reject) => {
        db.run('DELETE FROM search_queries WHERE client_id = ? AND period = ?', [clientId, period], (err) => {
          if (err) reject(err);
          else resolve(undefined);
        });
      });

      // Insert new queries data
      const insertPromises = csvData.map((row) => {
        return new Promise((resolve, reject) => {
          db.run(`
            INSERT INTO search_queries (client_id, query, clicks, impressions, position, period)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [clientId, row.query, row.clicks, row.impressions, row.position, period], (err) => {
            if (err) reject(err);
            else resolve(undefined);
          });
        });
      });

      await Promise.all(insertPromises);
    }

    res.json({
      message: 'CSV data uploaded successfully',
      recordsInserted: csvData.length
    });

  } catch (error) {
    console.error('CSV upload error:', error);
    res.status(500).json({ error: 'Failed to process CSV file' });
  }
});

// Get search queries for a client
router.get('/clients/:clientId/search-queries', authenticateToken, requireAdmin, (req, res) => {
  const { clientId } = req.params;
  const { period } = req.query;

  let query = `
    SELECT * FROM search_queries
    WHERE client_id = ?
  `;
  const params: any[] = [clientId];

  if (period) {
    query += ' AND period = ?';
    params.push(period);
  }

  query += ' ORDER BY clicks DESC, impressions DESC';

  db.all(query, params, (err: any, queries: any[]) => {
    if (err) {
      console.error('Error fetching search queries:', err);
      return res.status(500).json({ error: 'Failed to fetch search queries' });
    }
    res.json(queries);
  });
});

// Get top pages for a client
router.get('/clients/:clientId/top-pages', authenticateToken, requireAdmin, (req, res) => {
  const { clientId } = req.params;
  const { period } = req.query;

  let query = `
    SELECT * FROM top_pages
    WHERE client_id = ?
  `;
  const params: any[] = [clientId];

  if (period) {
    query += ' AND period = ?';
    params.push(period);
  }

  query += ' ORDER BY clicks DESC, impressions DESC';

  db.all(query, params, (err: any, pages: any[]) => {
    if (err) {
      console.error('Error fetching top pages:', err);
      return res.status(500).json({ error: 'Failed to fetch top pages' });
    }
    res.json(pages);
  });
});

export default router;