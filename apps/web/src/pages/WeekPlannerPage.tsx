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
    return <p className="text-slate-600">Carregando Week Planner...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="planner-screen-only flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-600">{formatWeekPeriod(weekRange.monday, weekRange.sunday)}</p>
          <p className="text-sm font-medium text-slate-800">{planned.length} tema(s) planejado(s).</p>
        </div>
        <button
          type="button"
          onClick={exportPdf}
          disabled={planned.length === 0}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white disabled:opacity-50"
        >
          Exportar PDF
        </button>
      </div>

      {error || pageError ? <p className="text-sm text-red-600">{error ?? pageError}</p> : null}

      {planned.length === 0 ? (
        <div className="planner-screen-only bg-white border border-slate-200 rounded-xl p-6 text-slate-600">
          Nenhum tema no plano desta semana.
        </div>
      ) : (
        <div className="planner-screen-only grid grid-cols-1 md:grid-cols-2 gap-4">
          {planned.map((theme) => (
            <ThemeBoardCard
              key={theme.id}
              theme={theme}
              onRemove={() => void handleRemove(theme.id)}
              removeLabel="Remover do plano"
            />
          ))}
        </div>
      )}

      <button
        type="button"
        disabled={busy || availableThemes.length === 0}
        onClick={() => setAddOpen(true)}
        className="planner-screen-only w-full md:w-auto rounded-xl border-2 border-dashed border-slate-300 px-6 py-4 text-sm font-semibold text-slate-700 hover:bg-white disabled:opacity-50"
      >
        + Adicionar Tema ao plano
      </button>

      {addOpen ? (
        <div className="planner-screen-only fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900">Adicionar ao plano da semana</h2>
            <select
              value={selectedThemeId}
              onChange={(e) => setSelectedThemeId(e.target.value)}
              className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
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
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!selectedThemeId || busy}
                onClick={() => void handleAdd()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <PrintReport
        title="Week Planner"
        meta={formatWeekPeriod(weekRange.monday, weekRange.sunday)}
        sections={printSections}
      />
    </div>
  );
}
