import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
