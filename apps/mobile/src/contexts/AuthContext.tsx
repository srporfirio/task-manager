import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { getOAuthRedirectUri } from "../lib/auth-redirect";
import {
  canUseNativeGoogleSignIn,
  configureGoogleSignIn,
  mapGoogleSignInError,
  signInWithGoogleNative,
  signOutGoogleNative,
} from "../lib/google-sign-in";
import { getSupabase } from "../lib/supabase";
import { ensureUserProfile } from "../lib/profile";

WebBrowser.maybeCompleteAuthSession();

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  initError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function handleAuthCallback(url: string): Promise<void> {
  const sb = getSupabase();
  const parsed = Linking.parse(url);
  const code = typeof parsed.queryParams?.code === "string" ? parsed.queryParams.code : null;
  if (code) {
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return;
  }

  const hash = url.split("#")[1];
  if (hash) {
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    if (accessToken && refreshToken) {
      const { error } = await sb.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      if (error) throw error;
    }
  }
}

async function signInWithGoogleBrowser(): Promise<void> {
  const sb = getSupabase();
  const redirectTo = getOAuthRedirectUri();
  const { data, error } = await sb.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (!data.url) throw new Error("URL de login não retornada.");

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type === "success") {
    await handleAuthCallback(result.url);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  useEffect(() => {
    let mounted = true;
    let subscription: { unsubscribe: () => void } | undefined;

    try {
      const sb = getSupabase();

      sb.auth.getSession().then(({ data, error }) => {
        if (!mounted) return;
        if (error) setInitError(error.message);
        setSession(data.session);
        setLoading(false);
      });

      const {
        data: { subscription: sub },
      } = sb.auth.onAuthStateChange((event, nextSession) => {
        setSession(nextSession);
        setLoading(false);
        if (nextSession?.user && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
          void ensureUserProfile(nextSession.user).catch((err) => {
            console.warn("ensureUserProfile:", err);
          });
        }
      });
      subscription = sub;
    } catch (err) {
      if (mounted) {
        setInitError(err instanceof Error ? err.message : "Falha ao iniciar autenticação.");
        setLoading(false);
      }
    }

    const linkSub = Linking.addEventListener("url", ({ url }) => {
      void handleAuthCallback(url).catch(console.error);
    });

    Linking.getInitialURL().then((url) => {
      if (url) void handleAuthCallback(url).catch(console.error);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
      linkSub.remove();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      if (canUseNativeGoogleSignIn()) {
        await signInWithGoogleNative();
        return;
      }
      if (Platform.OS === "web") {
        await signInWithGoogleBrowser();
        return;
      }
      throw new Error(
        "Login nativo não configurado. Defina EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID e gere um novo APK.",
      );
    } catch (err) {
      throw new Error(mapGoogleSignInError(err));
    }
  }, []);

  const signOut = useCallback(async () => {
    await signOutGoogleNative();
    const { error } = await getSupabase().auth.signOut();
    if (error) throw error;
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      initError,
      signInWithGoogle,
      signOut,
    }),
    [session, loading, initError, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
