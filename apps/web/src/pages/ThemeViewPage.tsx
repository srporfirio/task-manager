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
    return <p className="text-on-surface-variant">Carregando Theme View...</p>;
  }

  return (
    <section className="mt-2 flex flex-col gap-4">
      <div className="sticky-below-header bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm">
        <div className="flex flex-col md:flex-row md:flex-nowrap gap-gutter items-center md:items-end">
          <label className="flex flex-col gap-1 w-full md:flex-grow">
            <span className="text-label-md font-semibold uppercase tracking-wide text-on-surface-variant">
              Data início
            </span>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
              className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-md focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 w-full md:flex-grow">
            <span className="text-label-md font-semibold uppercase tracking-wide text-on-surface-variant">
              Data fim
            </span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
              className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-md focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </label>
          <div className="flex items-end w-full md:w-auto">
            <button
              type="button"
              onClick={() => setAppliedRange(dateRange)}
              title="Aplicar filtro por período"
              className="bg-primary text-on-primary px-4 py-2 rounded-lg text-label-md font-semibold uppercase tracking-wide shadow-sm hover:opacity-90 w-full md:w-auto"
            >
              Aplicar
            </button>
          </div>
        </div>
        <p className="mt-1 text-label-md text-outline text-right">{filtered.length} tema(s).</p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <KanbanBoard
        done={done}
        inProgress={inProgress}
        todo={todo}
        emptyText="Nenhum tema no período."
        cardVariant="week"
      />
    </section>
  );
}
