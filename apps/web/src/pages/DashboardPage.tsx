import { useCallback, useEffect, useMemo, useState } from "react";
import { filterAndSortThemes, type DashboardTheme } from "@task-manager/shared";
import { useAuth } from "../contexts/AuthContext";
import { DashboardFilters, type DashboardFiltersState } from "../components/dashboard/DashboardFilters";
import { ThemeCard } from "../components/dashboard/ThemeCard";
import { AddThemeModal } from "../components/dashboard/AddThemeModal";
import { EditThemeModal } from "../components/dashboard/EditThemeModal";
import {
  addNote,
  createTheme,
  deleteNote,
  deleteTheme,
  fetchDashboardThemes,
  updateTheme,
} from "../lib/api/themes";

export function DashboardPage() {
  const { user } = useAuth();
  const [themes, setThemes] = useState<DashboardTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DashboardFiltersState>({
    search: "",
    status: "ALL",
    weekPlan: "ALL",
    sort: "update_desc",
  });
  const [addOpen, setAddOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<DashboardTheme | null>(null);

  const reload = useCallback(async () => {
    if (!user) return;
    const data = await fetchDashboardThemes(user.id);
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

  const filtered = useMemo(
    () =>
      filterAndSortThemes(themes, {
        statusFilter: filters.status,
        weekPlanFilter: filters.weekPlan,
        search: filters.search,
        sortMode: filters.sort,
      }),
    [themes, filters],
  );

  if (loading) {
    return <p className="text-slate-600">Carregando dashboard...</p>;
  }

  return (
    <>
      <DashboardFilters filters={filters} onChange={setFilters} onAddTheme={() => setAddOpen(true)} />

      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6 text-slate-600">
          Nenhuma iniciativa encontrada. Adicione um novo tema.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {filtered.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              onSaveNote={async (themeId, content, status) => {
                if (!user) return;
                await addNote(user.id, themeId, { content, status });
                await reload();
              }}
              onDeleteNote={async (noteId) => {
                await deleteNote(noteId);
                await reload();
              }}
              onEdit={setEditingTheme}
              onDelete={async (themeId) => {
                await deleteTheme(themeId);
                await reload();
              }}
            />
          ))}
        </div>
      )}

      <AddThemeModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={async (payload) => {
          if (!user) return;
          await createTheme(user.id, payload);
          await reload();
        }}
      />

      <EditThemeModal
        theme={editingTheme}
        onClose={() => setEditingTheme(null)}
        onSubmit={async (themeId, payload) => {
          await updateTheme(themeId, payload);
          await reload();
        }}
      />
    </>
  );
}
