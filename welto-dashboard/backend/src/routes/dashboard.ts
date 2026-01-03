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
router.get('/:client_id/overview', authenticateToken, requireClientAccess, async (req: AuthRequest, res) => {
  const { client_id } = req.params;

  try {
    // Get recent reports count
    const { count: reportCount, error: reportError } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', client_id);

    if (reportError) {
      throw reportError;
    }

    // Get recent metrics
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: metricsData, error: metricsError } = await supabase
      .from('metrics')
      .select('metric_type')
      .eq('client_id', client_id)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);

    if (metricsError) {
      throw metricsError;
    }

    // Group metrics by type and count
    const metricsCounts: { [key: string]: number } = {};
    metricsData?.forEach(metric => {
      metricsCounts[metric.metric_type] = (metricsCounts[metric.metric_type] || 0) + 1;
    });

    const formattedMetrics = Object.entries(metricsCounts).map(([metric_type, count]) => ({
      metric_type,
      count
    }));

    res.json({
      client_id,
      reports: {
        total: reportCount || 0
      },
      metrics: formattedMetrics,
      last_updated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get metrics for a client
router.get('/:client_id/metrics', authenticateToken, requireClientAccess, async (req: AuthRequest, res) => {
  const { client_id } = req.params;
  const { type, startDate, endDate } = req.query;

  try {
    let query = supabase.from('metrics').select('*').eq('client_id', client_id);

    if (type) {
      query = query.eq('metric_type', type as string);
    }

    if (startDate) {
      query = query.gte('date', startDate as string);
    }

    if (endDate) {
      query = query.lte('date', endDate as string);
    }

    const { data, error } = await query.order('date', { ascending: false }).order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json(data || []);
  } catch (error) {
    console.error('Metrics fetch error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Add metrics (admin only)
router.post('/:client_id/metrics', authenticateToken, async (req: AuthRequest, res) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { client_id } = req.params;
  const { metric_type, metric_name, value, date } = req.body;

  if (!metric_type || !metric_name || !value || !date) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const newMetric = await db.createMetric({
      client_id,
      metric_type,
      metric_name,
      value,
      date
    });

    res.status(201).json(newMetric);
  } catch (error) {
    console.error('Metric creation error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get lead potential value calculations
router.get('/:client_id/lead-potential', authenticateToken, requireClientAccess, async (req: AuthRequest, res) => {
  const { client_id } = req.params;

  try {
    // Get client's lead value, start date, and conversion rate
    const clientData = await db.getUser({ client_id, role: 'client' });

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
    const { data: currentMonthData, error: currentError } = await supabase
      .from('metrics')
      .select('metric_type, value')
      .eq('client_id', client_id)
      .eq('date', currentMonth)
      .in('metric_type', ['gbp_website_clicks', 'gbp_phone_calls', 'gsc_organic_clicks']);

    if (currentError) {
      throw currentError;
    }

    // Calculate total since start date
    let totalQuery = supabase
      .from('metrics')
      .select('metric_type, value')
      .eq('client_id', client_id)
      .in('metric_type', ['gbp_website_clicks', 'gbp_phone_calls', 'gsc_organic_clicks']);

    if (startDate) {
      totalQuery = totalQuery.gte('date', startDate);
    }

    const { data: totalData, error: totalError } = await totalQuery;

    if (totalError) {
      throw totalError;
    }

    // Calculate current month totals
    const currentMonthTotals: { [key: string]: number } = {};
    let currentMonthClicks = 0;

    currentMonthData?.forEach(metric => {
      const value = metric.value || 0;
      currentMonthTotals[metric.metric_type] = (currentMonthTotals[metric.metric_type] || 0) + value;
      currentMonthClicks += value;
    });

    // Calculate total since start
    const totalTotals: { [key: string]: number } = {};
    let totalClicks = 0;

    totalData?.forEach(metric => {
      const value = metric.value || 0;
      totalTotals[metric.metric_type] = (totalTotals[metric.metric_type] || 0) + value;
      totalClicks += value;
    });

    const currentMonthValue = currentMonthClicks * leadValue * conversionRate;
    const totalValue = totalClicks * leadValue * conversionRate;

    // Format breakdown data
    const currentMonthBreakdown = Object.entries(currentMonthTotals).map(([metric_type, total_value]) => ({
      metric_type,
      total_value
    }));

    const totalBreakdown = Object.entries(totalTotals).map(([metric_type, total_value]) => ({
      metric_type,
      total_value
    }));

    res.json({
      client_id,
      lead_value: leadValue,
      conversion_rate: conversionRate,
      current_month: {
        month: currentMonth,
        total_clicks: currentMonthClicks,
        total_value: currentMonthValue,
        breakdown: currentMonthBreakdown
      },
      since_start: {
        start_date: startDate,
        total_clicks: totalClicks,
        total_value: totalValue,
        breakdown: totalBreakdown
      }
    });
  } catch (error) {
    console.error('Lead potential calculation error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;