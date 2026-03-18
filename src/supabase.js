import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xtlxrquvzwfrxgafrkex.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0bHhycXV2endmcnhnYWZya2V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNjEzODMsImV4cCI6MjA4ODczNzM4M30._w9cCfbDEG59cGmaUA0ekKhcH2CsSwt9h4Q1qhKVIS8'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)