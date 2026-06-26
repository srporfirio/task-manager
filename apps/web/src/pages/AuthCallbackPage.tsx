import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

/** Fallback só para retorno legado com tokens no hash (#access_token=). */
async function tryHashSession(): Promise<boolean> {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return false;

  const params = new URLSearchParams(hash);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (!accessToken || !refreshToken) return false;

  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (error) throw error;

  window.history.replaceState(null, "", window.location.pathname);
  return true;
}

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Finalizando login...");

  useEffect(() => {
    let mounted = true;
    let redirected = false;

    const goHome = () => {
      if (!mounted || redirected) return;
      redirected = true;
      navigate("/", { replace: true });
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        goHome();
      }
    });

    async function finishAuth() {
      try {
        // PKCE (?code=): o client Supabase troca automaticamente (detectSessionInUrl).
        // Não chamar exchangeCodeForSession aqui — evita 401 por troca duplicada.
        await tryHashSession();

        for (let i = 0; i < 30; i++) {
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();

          if (!mounted) return;
          if (error) {
            setMessage(error.message);
            return;
          }
          if (session) {
            goHome();
            return;
          }
          await new Promise((r) => setTimeout(r, 100));
        }

        if (mounted) {
          setMessage("Não foi possível concluir o login. Tente novamente em /login.");
        }
      } catch (err) {
        if (!mounted) return;
        setMessage(err instanceof Error ? err.message : "Falha ao concluir login.");
      }
    }

    void finishAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center text-slate-600 px-6 text-center">
      {message}
    </div>
  );
}
