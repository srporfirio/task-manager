import type { SortMode, WeekPlanFilter } from "@task-manager/shared";

export interface DashboardFiltersState {
  search: string;
  status: string;
  weekPlan: WeekPlanFilter;
  sort: SortMode;
}

interface Props {
  filters: DashboardFiltersState;
  onChange: (next: DashboardFiltersState) => void;
  onAddTheme: () => void;
}

export function DashboardFilters({ filters, onChange, onAddTheme }: Props) {
  return (
    <section className="sticky top-16 z-30 flex flex-col md:flex-row md:flex-wrap gap-4 items-end mb-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex flex-col gap-1 w-full md:flex-1 min-w-[200px]">
        <label className="text-xs font-medium text-slate-500">Pesquisa Rápida</label>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Procurar por Tema ou Jira Key..."
          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1 w-full md:w-auto">
        <label className="text-xs font-medium text-slate-500">Filtrar por Status</label>
        <select
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
          className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm min-w-[180px]"
        >
          <option value="ALL">Todos</option>
          <option value="To do">To do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
      </div>

      <div className="flex flex-col gap-1 w-full md:w-auto">
        <label className="text-xs font-medium text-slate-500">Week plan</label>
        <select
          value={filters.weekPlan}
          onChange={(e) => onChange({ ...filters, weekPlan: e.target.value as WeekPlanFilter })}
          className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm min-w-[180px]"
        >
          <option value="ALL">Todos</option>
          <option value="PLANNED">No plano da semana</option>
          <option value="NOT_PLANNED">Fora do plano</option>
        </select>
      </div>

      <div className="flex flex-col gap-1 w-full md:w-auto">
        <label className="text-xs font-medium text-slate-500">Ordenar</label>
        <select
          value={filters.sort}
          onChange={(e) => onChange({ ...filters, sort: e.target.value as SortMode })}
          className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm min-w-[200px]"
        >
          <option value="update_desc">Atualização (mais recente)</option>
          <option value="update_asc">Atualização (mais antiga)</option>
          <option value="tema_az">Tema (A-Z)</option>
          <option value="tema_za">Tema (Z-A)</option>
        </select>
      </div>

      <button
        type="button"
        onClick={onAddTheme}
        className="bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 whitespace-nowrap"
      >
        + Adicionar novo tema
      </button>
    </section>
  );
}
