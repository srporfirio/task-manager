import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { userHasCloudData } from "../../lib/import-legacy";

export function RequireOnboarding({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function check() {
      if (!user) return;
      try {
        const hasData = await userHasCloudData(user.id);
        if (!mounted) return;
        setNeedsOnboarding(!hasData);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void check();
    return () => {
      mounted = false;
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        Carregando...
      </div>
    );
  }

  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
