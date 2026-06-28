import { Platform } from "react-native";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { env } from "./env";

let configured = false;

export function configureGoogleSignIn(): void {
  if (configured || Platform.OS === "web") return;

  const webClientId = env.googleWebClientId();
  if (!webClientId) return;

  GoogleSignin.configure({
    webClientId,
    offlineAccess: false,
  });
  configured = true;
}

export function canUseNativeGoogleSignIn(): boolean {
  return Platform.OS !== "web" && Boolean(env.googleWebClientId());
}

export async function signInWithGoogleNative(): Promise<void> {
  configureGoogleSignIn();

  const webClientId = env.googleWebClientId();
  if (!webClientId) {
    throw new Error(
      "Configure EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID (Client ID do OAuth Web no Google Cloud).",
    );
  }

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();

  if (!isSuccessResponse(response)) {
    throw new Error("Login com Google cancelado.");
  }

  const idToken = response.data.idToken;
  if (!idToken) {
    throw new Error("Google não retornou idToken. Verifique o OAuth Android (SHA-1) no Google Cloud.");
  }

  const { getSupabase } = await import("./supabase");
  const { error } = await getSupabase().auth.signInWithIdToken({
    provider: "google",
    token: idToken,
  });
  if (error) throw error;
}

export function mapGoogleSignInError(error: unknown): string {
  if (isErrorWithCode(error)) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      return "Login cancelado.";
    }
    if (error.code === statusCodes.IN_PROGRESS) {
      return "Login já em andamento.";
    }
    if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return "Google Play Services indisponível neste dispositivo.";
    }
    if (error.code === "10" || String(error.message).includes("DEVELOPER_ERROR")) {
      return "DEVELOPER_ERROR: confira package com.diario.atividades e SHA-1 do APK no Google Cloud (OAuth Android).";
    }
  }
  return error instanceof Error ? error.message : "Falha no login com Google.";
}

export async function signOutGoogleNative(): Promise<void> {
  if (Platform.OS === "web" || !configured) return;
  try {
    await GoogleSignin.signOut();
  } catch {
    // usuário pode não ter sessão Google ativa
  }
}
