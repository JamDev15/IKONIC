import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gvypahxaefchjqdflxik.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2eXBhaHhhZWZjaGpxZGZseGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMDE3OTAsImV4cCI6MjA5MTc3Nzc5MH0.UJ2ziFiljy8cZE7m6DtOfW0qaE7LnW4CHA9JEe63dXA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
