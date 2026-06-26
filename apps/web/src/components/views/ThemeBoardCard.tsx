import type { DashboardNote, DashboardTheme } from "@task-manager/shared";
import { formatDateDisplay } from "@task-manager/shared";
import { StatusBadge, WeekPlanTag } from "../dashboard/StatusBadge";

type ThemeBoardCardProps = {
  theme: DashboardTheme;
  weekNotes?: DashboardNote[];
  onRemove?: () => void;
  removeLabel?: string;
};

export function ThemeBoardCard({ theme, weekNotes, onRemove, removeLabel = "Remover" }: ThemeBoardCardProps) {
  return (
    <article className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-slate-900">{theme.name}</h3>
            <StatusBadge status={String(theme.status)} />
            {theme.inWeekPlan ? <WeekPlanTag /> : null}
          </div>
          {theme.description ? (
            <p className="mt-1 text-sm text-slate-600 line-clamp-3">{theme.description}</p>
          ) : null}
          {theme.jiraKey ? (
            <p className="mt-2 text-xs font-medium text-blue-700">{theme.jiraKey}</p>
          ) : null}
        </div>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 text-xs text-red-600 hover:text-red-800 underline"
          >
            {removeLabel}
          </button>
        ) : null}
      </div>

      {weekNotes && weekNotes.length > 0 ? (
        <ul className="mt-4 space-y-3 border-t border-slate-100 pt-3">
          {weekNotes.map((note) => (
            <li key={note.id} className="text-sm">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <StatusBadge status={note.status} />
                <span className="text-xs text-slate-500">{formatDateDisplay(note.updatedAt)}</span>
              </div>
              <p className="text-slate-700 whitespace-pre-wrap">{note.content}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
