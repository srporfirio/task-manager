import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  async function handleGoogleLogin() {
    setSubmitting(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao iniciar login com Google.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-[#e5e7eb] p-8 shadow-sm">
        <div className="flex flex-col items-center text-center gap-4">
          <img
            src="/logo-diario.png"
            alt="Diário de Atividades"
            className="h-16 w-auto max-w-[200px] object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Diário de Atividades</h1>
            <p className="mt-2 text-sm text-slate-600">
              Entre com Google para sincronizar seus temas entre dispositivos.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={submitting || loading}
          className="mt-8 w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {submitting ? "Redirecionando..." : "Entrar com Google"}
        </button>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
