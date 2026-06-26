import { useMemo, useState } from "react";
import { filterAndSortThemes, type DashboardTheme } from "@task-manager/shared";
import { DashboardFilters, type DashboardFiltersState } from "../components/dashboard/DashboardFilters";
import { ThemeCard } from "../components/dashboard/ThemeCard";
import { AddThemeModal } from "../components/dashboard/AddThemeModal";
import { EditThemeModal } from "../components/dashboard/EditThemeModal";
import { useThemes } from "../hooks/useThemes";
import {
  addNote,
  createTheme,
  deleteNote,
  deleteTheme,
  updateTheme,
} from "../lib/hybrid-adapter";

export function DashboardPage() {
  const { themes, loading, error, reload, user } = useThemes();
  const [filters, setFilters] = useState<DashboardFiltersState>({
    search: "",
    status: "ALL",
    weekPlan: "ALL",
    sort: "update_desc",
  });
  const [addOpen, setAddOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<DashboardTheme | null>(null);

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
