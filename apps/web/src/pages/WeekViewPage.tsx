import { useMemo } from "react";
import {
  buildPrintSections,
  filterThemesWithWeekActivity,
  formatWeekPeriod,
  getNotesInWeekRange,
  getWeekRange,
  partitionThemesByStatus,
} from "@task-manager/shared";
import { KanbanBoard } from "../components/views/KanbanBoard";
import { PrintReport } from "../components/views/PrintReport";
import { usePrintExport } from "../hooks/usePrintExport";
import { useThemes } from "../hooks/useThemes";

export function WeekViewPage() {
  const { themes, loading, error } = useThemes();
  const weekRange = useMemo(() => getWeekRange(), []);
  const exportPdf = usePrintExport("print-export-week");

  const filtered = useMemo(
    () => filterThemesWithWeekActivity(themes, weekRange.monday, weekRange.sunday),
    [themes, weekRange],
  );

  const { done, inProgress, todo } = useMemo(() => partitionThemesByStatus(filtered), [filtered]);

  const getWeekNotes = (theme: (typeof filtered)[number]) =>
    getNotesInWeekRange(theme.notes, weekRange.monday, weekRange.sunday);

  const printSections = useMemo(
    () =>
      buildPrintSections(filtered, {
        showNotes: true,
        monday: weekRange.monday,
        sunday: weekRange.sunday,
      }),
    [filtered, weekRange],
  );

  if (loading) {
    return <p className="text-slate-600">Carregando Week View...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="week-screen-only flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-600">{formatWeekPeriod(weekRange.monday, weekRange.sunday)}</p>
          <p className="text-sm font-medium text-slate-800">{filtered.length} tema(s) atualizados na semana.</p>
        </div>
        <button
          type="button"
          onClick={exportPdf}
          disabled={filtered.length === 0}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white disabled:opacity-50"
        >
          Exportar PDF
        </button>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="week-screen-only">
        <KanbanBoard
          done={done}
          inProgress={inProgress}
          todo={todo}
          emptyText="Sem atualizações na semana."
          showWeekNotes
          getWeekNotes={getWeekNotes}
        />
      </div>

      <PrintReport
        title="Week View"
        meta={formatWeekPeriod(weekRange.monday, weekRange.sunday)}
        sections={printSections}
      />
    </div>
  );
}
