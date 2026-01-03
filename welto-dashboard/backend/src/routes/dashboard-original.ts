import express from 'express';
import { db } from '../database/db';
import { supabase } from '../database/supabase';
import { authenticateToken, requireClientAccess } from '../middleware/auth';

const router = express.Router();

interface AuthRequest extends express.Request {
  user?: {
    id: number;
    username: string;
    role: string;
    client_id?: string;
  };
}

// Get dashboard overview for a client
router.get('/:client_id/overview', authenticateToken, requireClientAccess, (req: AuthRequest, res) => {
  const { client_id } = req.params;

  // Get recent reports count
  db.get(
    'SELECT COUNT(*) as report_count FROM reports WHERE client_id = ?',
    [client_id],
    (err, reportData: any) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // Get recent metrics
      db.all(
        `SELECT metric_type, COUNT(*) as count
         FROM metrics
         WHERE client_id = ? AND date >= date('now', '-30 days')
         GROUP BY metric_type`,
        [client_id],
        (err, metricsData: any[]) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          res.json({
            client_id,
            reports: {
              total: reportData?.report_count || 0
            },
            metrics: metricsData || [],
            last_updated: new Date().toISOString()
          });
        }
      );
    }
  );
});

// Get metrics for a client
router.get('/:client_id/metrics', authenticateToken, requireClientAccess, (req: AuthRequest, res) => {
  const { client_id } = req.params;
  const { type, startDate, endDate } = req.query;

  let query = 'SELECT * FROM metrics WHERE client_id = ?';
  const params: any[] = [client_id];

  if (type) {
    query += ' AND metric_type = ?';
    params.push(type);
  }

  if (startDate) {
    query += ' AND date >= ?';
    params.push(startDate);
  }

  if (endDate) {
    query += ' AND date <= ?';
    params.push(endDate);
  }

  query += ' ORDER BY date DESC, created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Add metrics (admin only)
router.post('/:client_id/metrics', authenticateToken, (req: AuthRequest, res) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { client_id } = req.params;
  const { metric_type, metric_name, value, date } = req.body;

  if (!metric_type || !metric_name || !value || !date) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  db.run(
    `INSERT INTO metrics (client_id, metric_type, metric_name, value, date)
     VALUES (?, ?, ?, ?, ?)`,
    [client_id, metric_type, metric_name, value, date],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.status(201).json({
        id: this.lastID,
        client_id,
        metric_type,
        metric_name,
        value,
        date
      });
    }
  );
});

// Get lead potential value calculations
router.get('/:client_id/lead-potential', authenticateToken, requireClientAccess, (req: AuthRequest, res) => {
  const { client_id } = req.params;

  // Get client's lead value, start date, and conversion rate
  db.get(
    'SELECT lead_value, start_date, conversion_rate FROM users WHERE client_id = ? AND role = "client"',
    [client_id],
    (err, clientData: any) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!clientData) {
        return res.status(404).json({ error: 'Client not found' });
      }

      const leadValue = clientData.lead_value || 500.0;
      const conversionRate = clientData.conversion_rate || 0.5;
      const startDate = clientData.start_date;

      // Get previous month (since we're now in January, show December data)
      const now = new Date();
      const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const currentMonth = previousMonth.toISOString().slice(0, 7); // YYYY-MM format

      // Calculate previous month lead potential
      db.all(
        `SELECT metric_type, SUM(value) as total_value
         FROM metrics
         WHERE client_id = ? AND date = ?
         AND metric_type IN ('gbp_website_clicks', 'gbp_phone_calls', 'gsc_organic_clicks')
         GROUP BY metric_type`,
        [client_id, currentMonth],
        (err, currentMonthData: any[]) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          // Calculate total since start date
          db.all(
            `SELECT metric_type, SUM(value) as total_value
             FROM metrics
             WHERE client_id = ?
             AND date >= ?
             AND metric_type IN ('gbp_website_clicks', 'gbp_phone_calls', 'gsc_organic_clicks')
             GROUP BY metric_type`,
            [client_id, startDate],
            (err, totalData: any[]) => {
              if (err) {
                return res.status(500).json({ error: 'Database error' });
              }

              // Calculate current month totals
              let currentMonthClicks = 0;
              currentMonthData.forEach(metric => {
                currentMonthClicks += metric.total_value || 0;
              });

              // Calculate total since start
              let totalClicks = 0;
              totalData.forEach(metric => {
                totalClicks += metric.total_value || 0;
              });

              const currentMonthValue = currentMonthClicks * leadValue * conversionRate;
              const totalValue = totalClicks * leadValue * conversionRate;

              res.json({
                client_id,
                lead_value: leadValue,
                conversion_rate: conversionRate,
                current_month: {
                  month: currentMonth,
                  total_clicks: currentMonthClicks,
                  total_value: currentMonthValue,
                  breakdown: currentMonthData
                },
                since_start: {
                  start_date: startDate,
                  total_clicks: totalClicks,
                  total_value: totalValue,
                  breakdown: totalData
                }
              });
            }
          );
        }
      );
    }
  );
});

export default router;