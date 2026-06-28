import { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildPrintSections,
  computeWeekViewStats,
  filterThemesWithWeekActivity,
  getWeekEfficiencyDisplay,
  formatWeekPeriod,
  getNotesInWeekRange,
  getWeekRange,
  getWeekViewEmptyMessage,
  getWeekViewFilterSummary,
  type DashboardTheme,
  type WeekViewFilterMode,
} from "@task-manager/shared";
import { KanbanBoard } from "../components/views/KanbanBoard";
import { PrintReport } from "../components/views/PrintReport";
import { WeekViewFilter } from "../components/views/WeekViewFilter";
import { usePrintExport } from "../hooks/usePrintExport";
import { useThemes } from "../hooks/useThemes";
import { hybridFetchPlannedThemes } from "../lib/hybrid-adapter";

export function WeekViewPage() {
  const { themes, loading, error, user } = useThemes();
  const [planned, setPlanned] = useState<DashboardTheme[]>([]);
  const [filterMode, setFilterMode] = useState<WeekViewFilterMode>("week_plan");
  const [pageError, setPageError] = useState<string | null>(null);
  const weekRange = useMemo(() => getWeekRange(), []);
  const exportPdf = usePrintExport("print-export-week");

  const loadPlanned = useCallback(async () => {
    if (!user) return;
    const data = await hybridFetchPlannedThemes(user.id);
    setPlanned(data);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    void loadPlanned().catch((err) => {
      setPageError(err instanceof Error ? err.message : "Falha ao carregar plano.");
    });
  }, [user, loadPlanned, themes]);

  const visibleThemes = useMemo(() => {
    if (filterMode === "week_plan") return planned;
    return filterThemesWithWeekActivity(themes, weekRange.monday, weekRange.sunday);
  }, [filterMode, planned, themes, weekRange]);

  const { done, inProgress, todo, completedCount, pendingCount, total } = useMemo(
    () => computeWeekViewStats(visibleThemes),
    [visibleThemes],
  );

  const efficiencyDisplay = useMemo(
    () => getWeekEfficiencyDisplay(completedCount, total),
    [completedCount, total],
  );

  const getWeekNotes = (theme: DashboardTheme) =>
    getNotesInWeekRange(theme.notes, weekRange.monday, weekRange.sunday);

  const printSections = useMemo(
    () =>
      buildPrintSections(visibleThemes, {
        showNotes: true,
        monday: weekRange.monday,
        sunday: weekRange.sunday,
      }),
    [visibleThemes, weekRange],
  );

  const summary = getWeekViewFilterSummary(filterMode, visibleThemes.length);
  const emptyMessage = getWeekViewEmptyMessage(filterMode);

  if (loading) {
    return <p className="text-on-surface-variant">Carregando Week View...</p>;
  }

  return (
    <section className="mt-2 flex flex-col gap-4">
      <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
        <div className="week-screen-only flex items-center justify-end gap-4 mb-4">
          <div className="flex flex-col gap-1 mr-auto">
            <p className="text-label-md text-outline uppercase tracking-wide">Current Period</p>
            <p className="font-headline text-headline-md text-on-surface font-semibold">
              {formatWeekPeriod(weekRange.monday, weekRange.sunday)}
            </p>
          </div>
          <button
            type="button"
            onClick={exportPdf}
            className="bg-primary text-on-primary px-4 py-2 rounded-lg text-body-md font-semibold hover:opacity-90 flex items-center gap-2 shrink-0 print:hidden"
            title="Exportar resumo semanal em PDF"
          >
            <span className="material-symbols-outlined">picture_as_pdf</span>
            Export PDF
          </button>
        </div>

        <WeekViewFilter mode={filterMode} onChange={setFilterMode} />
        <p className="week-screen-only text-label-md text-outline mb-4">{summary}</p>

        <div className="week-screen-only grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 print:hidden">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4">
            <p className="text-label-md text-on-surface-variant mb-2">Weekly Efficiency</p>
            <div className="flex items-end gap-3">
              <span className="text-headline-md font-semibold text-primary">{efficiencyDisplay.percentageLabel}</span>
              <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden mb-1">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: efficiencyDisplay.isEmpty ? "0%" : `${efficiencyDisplay.percentage ?? 0}%` }}
                />
              </div>
            </div>
            <p className="text-label-md text-outline mt-2">{efficiencyDisplay.detail}</p>
          </div>
          <div className="bg-secondary-fixed border border-outline-variant/30 rounded-xl p-4 flex flex-col justify-between min-h-[108px]">
            <span className="material-symbols-outlined text-on-secondary-fixed">task_alt</span>
            <div>
              <p className="text-headline-md font-semibold text-on-secondary-fixed">{completedCount}</p>
              <p className="text-label-md font-semibold text-on-secondary-fixed-variant">Completed</p>
            </div>
          </div>
          <div className="bg-tertiary-fixed border border-outline-variant/30 rounded-xl p-4 flex flex-col justify-between min-h-[108px]">
            <span className="material-symbols-outlined text-on-tertiary-fixed">pending</span>
            <div>
              <p className="text-headline-md font-semibold text-on-tertiary-fixed">{pendingCount}</p>
              <p className="text-label-md font-semibold text-on-tertiary-fixed-variant">Pending</p>
            </div>
          </div>
        </div>

        {error || pageError ? (
          <p className="mb-4 text-sm text-red-600">{error ?? pageError}</p>
        ) : null}

        <div className="week-screen-only">
          {visibleThemes.length === 0 ? (
            <p className="text-body-md text-outline">{emptyMessage}</p>
          ) : (
            <KanbanBoard
              done={done}
              inProgress={inProgress}
              todo={todo}
              emptyText={emptyMessage}
              showWeekNotes
              getWeekNotes={getWeekNotes}
              cardVariant="week"
            />
          )}
        </div>

        <PrintReport
          title="Week View"
          period={formatWeekPeriod(weekRange.monday, weekRange.sunday)}
          summary={summary}
          sections={printSections}
          globalEmptyMessage={emptyMessage}
          showPlannedTag
        />
      </div>
    </section>
  );
}
