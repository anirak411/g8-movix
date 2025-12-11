import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://exoarylnsgsqdfjrsvdo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4b2FyeWxuc2dzcWRmanJzdmRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzg5NjMsImV4cCI6MjA3ODk1NDk2M30.uxeDzhsPcEUUr9xZDui3xqnelizFIEadcS1YfylSyAo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);