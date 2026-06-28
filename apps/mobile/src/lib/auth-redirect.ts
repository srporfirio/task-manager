import { Platform } from "react-native";

/** Deve coincidir com app.json → expo.scheme e Supabase Redirect URLs */
export const AUTH_REDIRECT_URI = "diarioatividades://auth/callback";

export function getOAuthRedirectUri(): string {
  if (Platform.OS === "web") {
    return typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : AUTH_REDIRECT_URI;
  }
  // Nunca usar makeRedirectUri() no APK — em alguns builds vira localhost:5173
  return AUTH_REDIRECT_URI;
}
