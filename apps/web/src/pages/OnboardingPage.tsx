import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { exportLocalPayload, hasLocalPayload } from "../lib/local-data";
import { importLegacyPayload, userHasCloudData } from "../lib/import-legacy";
import { ensureUserProfile } from "../lib/profile";
import { formatSupabaseError } from "../lib/supabase-error";

export function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [localAvailable, setLocalAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!user) return;

      try {
        await ensureUserProfile(user);
        const [cloudData, localData] = await Promise.all([
          userHasCloudData(user.id),
          hasLocalPayload(),
        ]);

        if (!mounted) return;

        if (cloudData) {
          navigate("/", { replace: true });
          return;
        }

        setLocalAvailable(localData);
      } catch (err) {
        if (!mounted) return;
        setError(formatSupabaseError(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void init();

    return () => {
      mounted = false;
    };
  }, [user, navigate]);

  async function handleImport() {
    if (!user) return;
    setImporting(true);
    setError(null);
    setStatus("Lendo dados locais...");

    try {
      const payload = await exportLocalPayload();
      if (!payload) {
        setError("Nenhum dado local encontrado no IndexedDB.");
        return;
      }

      setStatus("Importando temas e notas...");
      await importLegacyPayload(payload, user);
      setStatus("Importação concluída.");
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : formatSupabaseError(err));
    } finally {
      setImporting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        Preparando onboarding...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Bem-vindo</h1>
        <p className="mt-2 text-sm text-slate-600">
          Esta é sua primeira vez aqui. Você pode importar os dados salvos no navegador (versão HTML)
          ou começar do zero.
        </p>

        {localAvailable ? (
          <button
            type="button"
            onClick={handleImport}
            disabled={importing}
            className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
          >
            {importing ? "Importando..." : "Importar dados locais"}
          </button>
        ) : (
          <p className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            Nenhum dado local encontrado neste navegador.
          </p>
        )}

        <button
          type="button"
          onClick={() => navigate("/", { replace: true })}
          disabled={importing}
          className="mt-3 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          Começar do zero
        </button>

        {status ? <p className="mt-4 text-sm text-slate-600">{status}</p> : null}
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <p className="mt-6 text-center text-sm text-slate-600">
          Prefere a versão antiga?{" "}
          <a
            href="/legacy/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-900"
          >
            Abrir HTML offline
          </a>
        </p>
      </div>
    </div>
  );
}
