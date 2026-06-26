import { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildPrintSections,
  formatWeekPeriod,
  getWeekRange,
  type DashboardTheme,
} from "@task-manager/shared";
import { PrintReport } from "../components/views/PrintReport";
import { ThemeBoardCard } from "../components/views/ThemeBoardCard";
import { usePrintExport } from "../hooks/usePrintExport";
import { useThemes } from "../hooks/useThemes";
import {
  hybridAddToWeekPlan,
  hybridFetchPlannedThemes,
  hybridRemoveFromWeekPlan,
} from "../lib/hybrid-adapter";

export function WeekPlannerPage() {
  const { themes, loading, error, reload, user } = useThemes();
  const [planned, setPlanned] = useState<DashboardTheme[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedThemeId, setSelectedThemeId] = useState("");
  const [busy, setBusy] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const weekRange = useMemo(() => getWeekRange(), []);
  const exportPdf = usePrintExport("print-export-planner");

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

  const availableThemes = useMemo(() => {
    const plannedIds = new Set(planned.map((t) => t.id));
    return themes.filter((t) => !plannedIds.has(t.id));
  }, [themes, planned]);

  const printSections = useMemo(
    () =>
      buildPrintSections(planned, {
        showNotes: true,
        monday: weekRange.monday,
        sunday: weekRange.sunday,
      }),
    [planned, weekRange],
  );

  async function handleAdd() {
    if (!user || !selectedThemeId) return;
    setBusy(true);
    setPageError(null);
    try {
      await hybridAddToWeekPlan(user.id, selectedThemeId);
      await reload();
      await loadPlanned();
      setAddOpen(false);
      setSelectedThemeId("");
    } catch (err) {
      setPageError(err instanceof Error ? err.message : "Falha ao adicionar tema.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(themeId: string) {
    if (!user) return;
    setBusy(true);
    setPageError(null);
    try {
      await hybridRemoveFromWeekPlan(user.id, themeId);
      await reload();
      await loadPlanned();
    } catch (err) {
      setPageError(err instanceof Error ? err.message : "Falha ao remover tema.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <p className="text-on-surface-variant">Carregando Week Planner...</p>;
  }

  return (
    <section className="mt-2">
      <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant">
        <div className="planner-screen-only flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="font-headline text-headline-md text-primary font-bold">Plano da semana</p>
            <p className="text-label-md text-outline mt-1">
              {formatWeekPeriod(weekRange.monday, weekRange.sunday)}
            </p>
            <p className="text-body-md text-on-surface-variant mt-1">{planned.length} tema(s) planejado(s).</p>
          </div>
          <button
            type="button"
            onClick={exportPdf}
            disabled={planned.length === 0}
            className="bg-primary text-on-primary px-4 py-2 rounded-lg text-body-md font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-2 shrink-0 print:hidden"
            title="Exportar plano da semana em PDF"
          >
            <span className="material-symbols-outlined">picture_as_pdf</span>
            Export PDF
          </button>
        </div>

        {error || pageError ? <p className="mb-4 text-sm text-red-600">{error ?? pageError}</p> : null}

        {planned.length === 0 ? (
          <div className="planner-screen-only bg-surface-container-low border border-dashed border-outline-variant rounded-xl p-4 text-center text-body-md text-outline mb-4">
            Nenhum tema planejado para esta semana.
          </div>
        ) : (
          <div className="planner-screen-only grid grid-cols-1 md:grid-cols-2 gap-4">
            {planned.map((theme) => (
              <ThemeBoardCard
                key={theme.id}
                theme={theme}
                variant="planner"
                onRemove={() => void handleRemove(theme.id)}
                removeLabel="Remover do plano da semana"
              />
            ))}
          </div>
        )}

        <button
          type="button"
          disabled={busy || availableThemes.length === 0}
          onClick={() => setAddOpen(true)}
          title={
            availableThemes.length
              ? "Adicionar tema ao plano da semana"
              : "Todos os temas já estão no plano da semana"
          }
          className="planner-screen-only week-planner-add-card mt-4 w-full rounded-xl flex items-center justify-center gap-2 text-on-surface-variant text-label-md font-semibold uppercase tracking-wide print:hidden"
        >
          <span className="material-symbols-outlined">add</span>
          Adicionar Tema
        </button>

        <PrintReport
          title="Week Planner"
          meta={formatWeekPeriod(weekRange.monday, weekRange.sunday)}
          sections={printSections}
        />
      </div>

      {addOpen ? (
        <div className="planner-screen-only fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-surface-container-lowest p-6 shadow-xl border border-outline-variant">
            <h3 className="font-headline text-headline-md font-bold text-primary mb-4">Adicionar ao plano</h3>
            <label className="text-label-md font-semibold uppercase tracking-wide text-on-surface-variant">
              Tema
            </label>
            <select
              value={selectedThemeId}
              onChange={(e) => setSelectedThemeId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-body-md focus:ring-2 focus:ring-primary"
            >
              <option value="">Selecione um tema</option>
              {availableThemes.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.name}
                </option>
              ))}
            </select>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="rounded-lg border border-outline-variant px-4 py-2 text-body-md"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!selectedThemeId || busy}
                onClick={() => void handleAdd()}
                className="rounded-lg bg-primary px-4 py-2 text-body-md font-semibold text-on-primary disabled:opacity-50"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
