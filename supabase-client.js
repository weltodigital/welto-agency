import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ddtyovjdxdfpqjemmtyp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkdHlvdmpkeGRmcHFqZW1tdHlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODIzMjYsImV4cCI6MjA3OTE1ODMyNn0.uIGMXSqbUg-5HOVQUznYwBb1GAetPqpi0aJ5iVKj8Y0'

export const supabase = createClient(supabaseUrl, supabaseKey)