import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { userHasCloudData } from "../lib/import-legacy";
import { env } from "../lib/env";
import { supabase } from "../lib/supabase";

export function HomePage() {
  const { user, signOut } = useAuth();
  const [themeCount, setThemeCount] = useState<number | null>(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!user) return;

      try {
        const hasData = await userHasCloudData(user.id);
        if (!mounted) return;
        setNeedsOnboarding(!hasData);
        if (hasData) {
          const { count } = await supabase
            .from("themes")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id);
          setThemeCount(count ?? 0);
        }
      } finally {
        if (mounted) setCheckingOnboarding(false);
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [user]);

  if (checkingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        Carregando...
      </div>
    );
  }

  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img src="/logo-diario.png" alt="" className="h-10 w-10 object-contain" />
            <div>
              <h1 className="text-lg font-bold text-slate-900">Diário de Atividades</h1>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Conta conectada</h2>
          <p className="mt-2 text-slate-600">
            Login com Google funcionando. Próxima etapa: migrar o Dashboard para esta aplicação com
            feature flags.
          </p>

          <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <dt className="text-slate-500">Temas na nuvem</dt>
              <dd className="text-2xl font-bold text-slate-900">{themeCount ?? 0}</dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <dt className="text-slate-500">API themes</dt>
              <dd className="font-medium text-slate-900">{env.useApiThemes ? "Ativo" : "Desativado"}</dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="/legacy/index.html"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Abrir versão local (HTML)
            </a>
            <Link
              to="/login"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Voltar ao login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
