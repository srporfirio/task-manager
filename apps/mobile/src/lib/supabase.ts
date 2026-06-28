import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { assertSupabaseEnv, env } from "./env";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    assertSupabaseEnv();
    client = createClient(env.supabaseUrl(), env.supabaseAnonKey(), {
      auth: {
        storage: AsyncStorage,
        flowType: "pkce",
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}

/** @deprecated use getSupabase() — kept for gradual migration */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return Reflect.get(getSupabase(), prop);
  },
});
