// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tpwqjvovhcedpphlyknz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwd3Fqdm92aGNlZHBwaGx5a256Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MTI5MjUsImV4cCI6MjA1ODk4ODkyNX0.ieocHSvG4_ZQEPZkwb2WR0baLwIkpYEIm4GlFBNOLPk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);