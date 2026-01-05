import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database';
import { getUserFromRequest } from '@/lib/jwt';

export async function GET(
  request: NextRequest,
  { params }: { params: { client_id: string } }
) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check access rights
    if (user.role !== 'admin' && user.client_id !== params.client_id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get client data for lead value and conversion rate
    const { data: clientData, error: clientError } = await supabase
      .from('users')
      .select('lead_value, conversion_rate, start_date')
      .eq('client_id', params.client_id)
      .eq('role', 'client')
      .single();

    if (clientError) {
      throw clientError;
    }

    if (!clientData) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    const leadValue = clientData.lead_value || 400;
    const conversionRate = clientData.conversion_rate || 50;

    // Get current month metrics
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const { data: currentMonthMetrics, error: currentMonthError } = await supabase
      .from('metrics')
      .select('metric_type, value')
      .eq('client_id', params.client_id)
      .like('date', `${currentMonth}%`);

    if (currentMonthError) {
      throw currentMonthError;
    }

    // Calculate current month totals
    let currentMonthClicks = 0;
    const currentMonthBreakdown: { metric_type: string; total_value: number }[] = [];

    const clickTypes = ['gbp_calls', 'gbp_directions', 'gbp_website_clicks', 'gsc_organic_clicks'];

    clickTypes.forEach(type => {
      const total = (currentMonthMetrics || [])
        .filter(m => m.metric_type === type)
        .reduce((sum, m) => sum + m.value, 0);

      if (total > 0) {
        currentMonthBreakdown.push({ metric_type: type, total_value: total });
        currentMonthClicks += total;
      }
    });

    // Get all metrics since start
    const { data: allMetrics, error: allMetricsError } = await supabase
      .from('metrics')
      .select('metric_type, value')
      .eq('client_id', params.client_id);

    if (allMetricsError) {
      throw allMetricsError;
    }

    // Calculate total since start
    let totalClicks = 0;
    const totalBreakdown: { metric_type: string; total_value: number }[] = [];

    clickTypes.forEach(type => {
      const total = (allMetrics || [])
        .filter(m => m.metric_type === type)
        .reduce((sum, m) => sum + m.value, 0);

      if (total > 0) {
        totalBreakdown.push({ metric_type: type, total_value: total });
        totalClicks += total;
      }
    });

    const currentMonthValue = Math.round(currentMonthClicks * (conversionRate / 100) * leadValue);
    const totalValue = Math.round(totalClicks * (conversionRate / 100) * leadValue);

    return NextResponse.json({
      client_id: params.client_id,
      lead_value: leadValue,
      conversion_rate: conversionRate,
      current_month: {
        month: currentMonth,
        total_clicks: currentMonthClicks,
        total_value: currentMonthValue,
        breakdown: currentMonthBreakdown
      },
      since_start: {
        start_date: clientData.start_date || '2025-10-29',
        total_clicks: totalClicks,
        total_value: totalValue,
        breakdown: totalBreakdown
      }
    });
  } catch (error) {
    console.error('Lead potential error:', error);
    return NextResponse.json(
      { error: 'Database error' },
      { status: 500 }
    );
  }
}