import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { DashboardTheme } from "@task-manager/shared";
import { useAuth } from "./AuthContext";
import { hybridFetchThemes } from "../lib/hybrid-adapter";

type ThemesContextValue = {
  themes: DashboardTheme[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

const ThemesContext = createContext<ThemesContextValue | undefined>(undefined);

export function ThemesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [themes, setThemes] = useState<DashboardTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!user) return;
    const data = await hybridFetchThemes(user.id);
    setThemes(data);
  }, [user]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    void reload()
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err.message : "Falha ao carregar temas.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [reload]);

  const value = useMemo(
    () => ({ themes, loading, error, reload }),
    [themes, loading, error, reload],
  );

  return <ThemesContext.Provider value={value}>{children}</ThemesContext.Provider>;
}

export function useThemes() {
  const ctx = useContext(ThemesContext);
  const { user } = useAuth();

  if (!ctx) {
    throw new Error("useThemes must be used within ThemesProvider");
  }

  return { ...ctx, user };
}
