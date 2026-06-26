import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

export const supabase = createClient(env.supabaseUrl(), env.supabaseAnonKey(), {
  auth: {
    flowType: "pkce",
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          created_at: string;
        };
      };
      themes: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          jira_key: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          jira_key?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          theme_id: string;
          user_id: string;
          status: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          theme_id: string;
          user_id: string;
          status: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      week_plans: {
        Row: {
          id: string;
          user_id: string;
          week_key: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_key: string;
          created_at?: string;
        };
      };
      week_plan_items: {
        Insert: {
          id?: string;
          week_plan_id: string;
          theme_id: string;
          sort_order?: number;
        };
      };
    };
  };
};
