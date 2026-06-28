import Constants from "expo-constants";

type Extra = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  googleWebClientId?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

type EnvKey =
  | "EXPO_PUBLIC_SUPABASE_URL"
  | "EXPO_PUBLIC_SUPABASE_ANON_KEY"
  | "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID";

function read(key: EnvKey): string {
  const fromProcess = process.env[key];
  if (fromProcess && fromProcess !== "your_publishable_or_anon_key_here") {
    return fromProcess;
  }

  if (key === "EXPO_PUBLIC_SUPABASE_URL" && extra.supabaseUrl) {
    return extra.supabaseUrl;
  }
  if (key === "EXPO_PUBLIC_SUPABASE_ANON_KEY" && extra.supabaseAnonKey) {
    return extra.supabaseAnonKey;
  }
  if (key === "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID" && extra.googleWebClientId) {
    return extra.googleWebClientId;
  }

  return "";
}

export const env = {
  supabaseUrl: () => read("EXPO_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: () => read("EXPO_PUBLIC_SUPABASE_ANON_KEY"),
  googleWebClientId: () => read("EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID"),
};

export function assertSupabaseEnv(): void {
  const url = env.supabaseUrl();
  const key = env.supabaseAnonKey();
  if (!url || !key) {
    throw new Error(
      "Supabase não configurado no build. Defina EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY no EAS (preview).",
    );
  }
}
