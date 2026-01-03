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

// Update client start date
router.put('/clients/:id/start-date', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { start_date } = req.body;

  if (!start_date) {
    return res.status(400).json({ error: 'Start date is required' });
  }

  try {
    await db.updateUser(parseInt(id), { start_date });
    res.json({ message: 'Start date updated successfully' });
  } catch (error) {
    console.error('Error updating start date:', error);
    res.status(500).json({ error: 'Failed to update start date' });
  }
});

router.delete('/clients/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    // Get client info first
    const client = await db.getUser({ id: parseInt(id), role: 'client' });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Delete client and their data
    await db.deleteClientData(client.client_id);
    await db.deleteUser(parseInt(id));

    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

router.get('/clients/:clientId/data', authenticateToken, requireAdmin, async (req, res) => {
  const { clientId } = req.params;

  try {
    const reports = await db.getAllReports(clientId);
    const metrics = await db.getAllMetrics(clientId);

    res.json({ reports, metrics });
  } catch (error) {
    console.error('Error fetching client data:', error);
    res.status(500).json({ error: 'Failed to fetch client data' });
  }
});

router.post('/clients/:clientId/metrics', authenticateToken, requireAdmin, async (req, res) => {
  const { clientId } = req.params;
  const { metric_type, value, month } = req.body;

  if (!metric_type || value === undefined) {
    return res.status(400).json({ error: 'Metric type and value are required' });
  }

  const metricMonth = month || new Date().toISOString().slice(0, 7);

  // Convert metric_type to readable name
  const metricName = metric_type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());

  try {
    const newMetric = await db.createMetric({
      client_id: clientId,
      metric_type,
      metric_name: metricName,
      value: parseFloat(value),
      date: metricMonth
    });

    res.status(201).json({
      message: 'Metric added successfully',
      metric: newMetric
    });
  } catch (error) {
    console.error('Error adding metric:', error);
    res.status(500).json({ error: 'Failed to add metric' });
  }
});

router.post('/clients/:clientId/reports', authenticateToken, requireAdmin, async (req, res) => {
  const { clientId } = req.params;
  const { title, content, report_type, period } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const reportPeriod = period || new Date().toISOString().slice(0, 7);

  try {
    const newReport = await db.createReport({
      client_id: clientId,
      title,
      content,
      report_type: report_type || 'monthly',
      period: reportPeriod
    });

    res.status(201).json({
      message: 'Report added successfully',
      report: newReport
    });
  } catch (error) {
    console.error('Error adding report:', error);
    res.status(500).json({ error: 'Failed to add report' });
  }
});

router.delete('/metrics/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await db.deleteMetric(parseInt(id));
    res.json({ message: 'Metric deleted successfully' });
  } catch (error) {
    console.error('Error deleting metric:', error);
    res.status(500).json({ error: 'Failed to delete metric' });
  }
});

router.delete('/reports/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await db.deleteReport(parseInt(id));
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

// Update client notes
router.put('/clients/:id/notes', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;

  if (typeof notes !== 'string') {
    return res.status(400).json({ error: 'Notes must be a string' });
  }

  try {
    await db.updateUser(parseInt(id), {
      notes,
      updated_at: new Date().toISOString()
    });

    res.json({ message: 'Client notes updated successfully', notes });
  } catch (error) {
    console.error('Error updating client notes:', error);
    res.status(500).json({ error: 'Failed to update client notes' });
  }
});

// Update client lead value
router.put('/clients/:id/lead-value', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { lead_value } = req.body;

  if (typeof lead_value !== 'number' || lead_value <= 0) {
    return res.status(400).json({ error: 'Lead value must be a positive number' });
  }

  try {
    await db.updateUser(parseInt(id), {
      lead_value,
      updated_at: new Date().toISOString()
    });

    res.json({ message: 'Client lead value updated successfully', lead_value });
  } catch (error) {
    console.error('Error updating client lead value:', error);
    res.status(500).json({ error: 'Failed to update client lead value' });
  }
});

// Update client reviews start count
router.put('/clients/:id/reviews-start-count', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { reviews_start_count } = req.body;

  if (typeof reviews_start_count !== 'number' || reviews_start_count < 0) {
    return res.status(400).json({ error: 'Reviews start count must be a non-negative number' });
  }

  try {
    await db.updateUser(parseInt(id), {
      reviews_start_count,
      updated_at: new Date().toISOString()
    });

    res.json({ message: 'Client reviews start count updated successfully', reviews_start_count });
  } catch (error) {
    console.error('Error updating client reviews start count:', error);
    res.status(500).json({ error: 'Failed to update client reviews start count' });
  }
});

// Update client conversion rate
router.put('/clients/:id/conversion-rate', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { conversion_rate } = req.body;

  if (typeof conversion_rate !== 'number' || conversion_rate < 0 || conversion_rate > 1) {
    return res.status(400).json({ error: 'Conversion rate must be a number between 0 and 1' });
  }

  try {
    await db.updateUser(parseInt(id), {
      conversion_rate,
      updated_at: new Date().toISOString()
    });

    res.json({ message: 'Client conversion rate updated successfully', conversion_rate });
  } catch (error) {
    console.error('Error updating client conversion rate:', error);
    res.status(500).json({ error: 'Failed to update client conversion rate' });
  }
});

// Upload client map image
router.post('/clients/:id/map-image', authenticateToken, requireAdmin, imageUpload.single('image'), async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({ error: 'Image file is required' });
  }

  const imagePath = `/uploads/${req.file.filename}`;

  try {
    await db.updateUser(parseInt(id), {
      map_image: imagePath,
      updated_at: new Date().toISOString()
    });

    res.json({ message: 'Client map image uploaded successfully', map_image: imagePath });
  } catch (error) {
    console.error('Error updating client map image:', error);
    res.status(500).json({ error: 'Failed to update client map image' });
  }
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
        const ctr = clicks / impressions || 0;

        if (pageUrl.trim()) {
          csvData.push({
            client_id: clientId,
            page_url: pageUrl.trim(),
            clicks,
            impressions,
            ctr,
            position,
            period
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
            client_id: clientId,
            query: query.trim(),
            clicks,
            impressions,
            position,
            period
          });
        }
      });
    }

    if (csvData.length === 0) {
      return res.status(400).json({ error: 'No valid data found in CSV' });
    }

    if (data_type === 'pages') {
      // Clear existing pages data for this period
      await db.deleteTopPages(clientId, period);

      // Insert new pages data
      await db.bulkCreateTopPages(csvData);
    } else {
      // Clear existing queries data for this period
      await db.deleteSearchQueries(clientId, period);

      // Insert new queries data
      await db.bulkCreateSearchQueries(csvData);
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
router.get('/clients/:clientId/search-queries', authenticateToken, requireAdmin, async (req, res) => {
  const { clientId } = req.params;
  const { period } = req.query;

  try {
    const queries = await db.getAllSearchQueries(clientId, period as string);
    res.json(queries);
  } catch (error) {
    console.error('Error fetching search queries:', error);
    res.status(500).json({ error: 'Failed to fetch search queries' });
  }
});

// Get top pages for a client
router.get('/clients/:clientId/top-pages', authenticateToken, requireAdmin, async (req, res) => {
  const { clientId } = req.params;
  const { period } = req.query;

  try {
    const pages = await db.getAllTopPages(clientId, period as string);
    res.json(pages);
  } catch (error) {
    console.error('Error fetching top pages:', error);
    res.status(500).json({ error: 'Failed to fetch top pages' });
  }
});

export default router;