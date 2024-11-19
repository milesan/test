import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) throw new Error('Missing VITE_SUPABASE_URL');
if (!supabaseAnonKey) throw new Error('Missing VITE_SUPABASE_ANON_KEY');

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey
    },
    fetch: async (url, options = {}) => {
      let lastError;
      for (let i = 0; i < MAX_RETRIES; i++) {
        try {
          return await fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
        } catch (error) {
          lastError = error;
          if (i < MAX_RETRIES - 1) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, i)));
          }
        }
      }
      throw lastError;
    }
  }
});

// Set up auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    // Update headers with new auth token
    supabase.rest.headers = {
      ...supabase.rest.headers,
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': supabaseAnonKey
    };
  }
});