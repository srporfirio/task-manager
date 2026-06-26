import { useMemo, useState } from "react";
import {
  defaultThemeViewDateRange,
  filterThemesByLatestUpdate,
  parseDateInput,
  partitionThemesByStatus,
} from "@task-manager/shared";
import { KanbanBoard } from "../components/views/KanbanBoard";
import { useThemes } from "../hooks/useThemes";

export function ThemeViewPage() {
  const { themes, loading, error } = useThemes();
  const [dateRange, setDateRange] = useState(defaultThemeViewDateRange);
  const [appliedRange, setAppliedRange] = useState(defaultThemeViewDateRange);

  const filtered = useMemo(() => {
    const start = parseDateInput(appliedRange.start, false);
    const end = parseDateInput(appliedRange.end, true);
    return filterThemesByLatestUpdate(themes, start, end);
  }, [themes, appliedRange]);

  const { done, inProgress, todo } = useMemo(() => partitionThemesByStatus(filtered), [filtered]);

  if (loading) {
    return <p className="text-slate-600">Carregando Theme View...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-16 z-30 -mx-6 px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="block text-slate-600 mb-1">De</span>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm">
          <span className="block text-slate-600 mb-1">Até</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <button
          type="button"
          onClick={() => setAppliedRange(dateRange)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Aplicar
        </button>
      </div>

      <p className="text-sm text-slate-600">{filtered.length} tema(s).</p>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <KanbanBoard
        done={done}
        inProgress={inProgress}
        todo={todo}
        emptyText="Nenhum tema no período."
      />
    </div>
  );
}
