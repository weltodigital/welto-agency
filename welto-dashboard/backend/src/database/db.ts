import { supabase } from './supabase';

export class DatabaseService {
  // Users
  async getUser(where: any) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .match(where)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw error;
    }

    return data;
  }

  async getAllUsers(where?: any) {
    let query = supabase.from('users').select('*');

    if (where) {
      query = query.match(where);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  async createUser(userData: any) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async updateUser(id: number, updates: any) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async deleteUser(id: number) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return true;
  }

  // Reports
  async getAllReports(clientId?: string) {
    let query = supabase.from('reports').select('*');

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  async createReport(reportData: any) {
    const { data, error } = await supabase
      .from('reports')
      .insert([reportData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async deleteReport(id: number) {
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return true;
  }

  // Metrics
  async getAllMetrics(clientId?: string) {
    let query = supabase.from('metrics').select('*');

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  async createMetric(metricData: any) {
    const { data, error } = await supabase
      .from('metrics')
      .insert([metricData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async deleteMetric(id: number) {
    const { error } = await supabase
      .from('metrics')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return true;
  }

  // Search Queries
  async getAllSearchQueries(clientId: string, period?: string) {
    let query = supabase.from('search_queries').select('*').eq('client_id', clientId);

    if (period) {
      query = query.eq('period', period);
    }

    const { data, error } = await query.order('clicks', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  async deleteSearchQueries(clientId: string, period: string) {
    const { error } = await supabase
      .from('search_queries')
      .delete()
      .eq('client_id', clientId)
      .eq('period', period);

    if (error) {
      throw error;
    }

    return true;
  }

  async createSearchQuery(queryData: any) {
    const { data, error } = await supabase
      .from('search_queries')
      .upsert([queryData], { onConflict: 'client_id,query,period' })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async bulkCreateSearchQueries(queries: any[]) {
    const { data, error } = await supabase
      .from('search_queries')
      .upsert(queries, { onConflict: 'client_id,query,period' })
      .select();

    if (error) {
      throw error;
    }

    return data || [];
  }

  // Top Pages
  async getAllTopPages(clientId: string, period?: string) {
    let query = supabase.from('top_pages').select('*').eq('client_id', clientId);

    if (period) {
      query = query.eq('period', period);
    }

    const { data, error } = await query.order('clicks', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  async deleteTopPages(clientId: string, period: string) {
    const { error } = await supabase
      .from('top_pages')
      .delete()
      .eq('client_id', clientId)
      .eq('period', period);

    if (error) {
      throw error;
    }

    return true;
  }

  async createTopPage(pageData: any) {
    const { data, error } = await supabase
      .from('top_pages')
      .upsert([pageData], { onConflict: 'client_id,page_url,period' })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async bulkCreateTopPages(pages: any[]) {
    const { data, error } = await supabase
      .from('top_pages')
      .upsert(pages, { onConflict: 'client_id,page_url,period' })
      .select();

    if (error) {
      throw error;
    }

    return data || [];
  }

  // Transaction-like operations
  async deleteClientData(clientId: string) {
    // Delete in sequence to avoid foreign key issues
    await supabase.from('metrics').delete().eq('client_id', clientId);
    await supabase.from('reports').delete().eq('client_id', clientId);
    await supabase.from('search_queries').delete().eq('client_id', clientId);
    await supabase.from('top_pages').delete().eq('client_id', clientId);

    return true;
  }
}

export const db = new DatabaseService();