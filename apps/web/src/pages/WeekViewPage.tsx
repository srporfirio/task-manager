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
    return <p className="text-on-surface-variant">Carregando Week View...</p>;
  }

  return (
    <section className="mt-2 flex flex-col gap-4">
      <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
        <div className="week-screen-only flex items-center justify-end gap-4 mb-6">
          <div className="flex items-center gap-3 mr-auto">
            <div className="text-label-md text-outline">
              {filtered.length} tema(s) atualizados na semana.
            </div>
          </div>
          <button
            type="button"
            onClick={exportPdf}
            disabled={filtered.length === 0}
            className="bg-primary text-on-primary px-4 py-2 rounded-lg text-body-md font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-2 print:hidden"
            title="Exportar resumo semanal em PDF"
          >
            <span className="material-symbols-outlined">picture_as_pdf</span>
            Export PDF
          </button>
        </div>

        {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

        <div className="week-screen-only">
          <KanbanBoard
            done={done}
            inProgress={inProgress}
            todo={todo}
            emptyText="Sem atualizações na semana."
            showWeekNotes
            getWeekNotes={getWeekNotes}
            cardVariant="week"
          />
        </div>

        <PrintReport
          title="Week View"
          meta={formatWeekPeriod(weekRange.monday, weekRange.sunday)}
          sections={printSections}
        />
      </div>
    </section>
  );
}
