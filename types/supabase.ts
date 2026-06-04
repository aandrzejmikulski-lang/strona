// /types/supabase.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string;
          role: string;
          is_active: boolean;
          community_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          phone?: string;
          role?: string;
          is_active?: boolean;
          community_id?: string | null;
          created_at?: string | null;
        };
        Update: {
          full_name?: string;
          phone?: string;
          role?: string;
          is_active?: boolean;
          community_id?: string | null;
        };
      };

      communities: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          address?: string | null;
          created_at?: string | null;
        };
        Update: {
          name?: string;
          address?: string | null;
        };
      };

      tickets: {
        Row: {
          id: string;
          user_id: string;
          community_id: string;
          title: string;
          description: string;
          status: string;
          priority: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          community_id: string;
          title: string;
          description: string;
          status?: string;
          priority?: string;
        };
        Update: {
          title?: string;
          description?: string;
          status?: string;
          priority?: string;
        };
      };
    };
  };
}
