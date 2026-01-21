/**
 * MIGRATION NOTE:
 * Source: src/lib/supabase.ts
 * Destination: src/lib/supabase.ts (updated for Next.js)
 * This file creates dual Supabase clients for Next.js SSR compatibility.
 * The client configuration is preserved exactly from the original implementation.
 * Environment variables updated to use Next.js pattern.
 * Any deviation is unintentional and should be flagged.
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables for Next.js
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'Connection': 'keep-alive'
    }
  }
});

// Server-side Supabase client for SSR
export function createSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        'Connection': 'keep-alive'
      }
    }
  });
}

// Database types
export interface DatabaseImage {
  id: string;
  filename: string;
  url: string;
  title: string;
  description?: string;
  tags: string[];
  gallery: string;
  uploaded_at: string;
  photographer_id: string;
  width?: number;
  height?: number;
}

export interface Database {
  public: {
    Tables: {
      images: {
        Row: DatabaseImage;
        Insert: Omit<DatabaseImage, 'id' | 'uploaded_at'>;
        Update: Partial<DatabaseImage>;
      };
    };
  };
}
