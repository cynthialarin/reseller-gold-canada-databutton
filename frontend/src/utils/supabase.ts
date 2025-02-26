import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = 'https://tviyapvgopjwcpwtokzk.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2aXlhcHZnb3Bqd2Nwd3Rva3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwODQxNzIsImV4cCI6MjA1NTY2MDE3Mn0.Zv-A0WDIBDJn2tI_wQ7HAT9npucLxv4O7UC0is0dOwo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
