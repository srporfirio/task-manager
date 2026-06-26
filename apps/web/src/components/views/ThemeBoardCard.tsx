import type { DashboardNote, DashboardTheme } from "@task-manager/shared";
import { formatDateDisplay } from "@task-manager/shared";
import { StatusBadge, WeekPlanTag } from "../dashboard/StatusBadge";
import { statusPillClass } from "../../lib/status-styles";

type ThemeBoardCardProps = {
  theme: DashboardTheme;
  weekNotes?: DashboardNote[];
  onRemove?: () => void;
  removeLabel?: string;
  variant?: "default" | "planner" | "week";
};

export function ThemeBoardCard({
  theme,
  weekNotes,
  onRemove,
  removeLabel = "Remover",
  variant = "default",
}: ThemeBoardCardProps) {
  if (variant === "planner") {
    return (
      <article className="bg-surface-container-low border border-outline-variant rounded-xl p-4 flex flex-col gap-2 relative">
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            title={removeLabel}
            className="absolute top-3 right-3 bg-error text-on-error w-8 h-8 rounded-md hover:opacity-90 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        ) : null}
        <div className="pr-10">
          <div className="text-label-md font-bold text-on-surface">{theme.name}</div>
          {theme.description ? (
            <p className="text-body-md text-on-surface-variant text-sm mt-1 whitespace-pre-wrap">{theme.description}</p>
          ) : null}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className={`px-2 py-0.5 text-label-md rounded ${statusPillClass(String(theme.status))}`}>
              {theme.status}
            </span>
            {theme.inWeekPlan ? <WeekPlanTag /> : null}
          </div>
          {theme.jiraKey ? (
            <div className="mt-3 pt-2 border-t border-outline-variant text-label-md text-secondary break-all">
              {theme.jiraKey}
            </div>
          ) : null}
        </div>
      </article>
    );
  }

  if (variant === "week") {
    return (
      <article className="bg-surface-container-low p-3 rounded-lg border border-outline-variant flex flex-col gap-1">
        <div className="text-label-md font-semibold text-on-surface">{theme.name}</div>
        {theme.description ? (
          <p className="text-body-md text-on-surface-variant text-xs mt-0.5 whitespace-pre-wrap">{theme.description}</p>
        ) : null}
        {theme.inWeekPlan ? <div className="mt-1"><WeekPlanTag /></div> : null}
        {theme.jiraKey ? <span className="text-label-md text-outline">{theme.jiraKey}</span> : null}
        {weekNotes && weekNotes.length > 0
          ? weekNotes.map((note) => (
              <div key={note.id} className="border-t border-outline-variant pt-2 mt-1 flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2 py-0.5 text-label-md rounded ${statusPillClass(note.status)}`}>
                    {note.status}
                  </span>
                  <span className="text-label-md text-outline text-xs">{formatDateDisplay(note.updatedAt)}</span>
                </div>
                <p className="text-body-md text-on-surface whitespace-pre-wrap">{note.content}</p>
              </div>
            ))
          : null}
      </article>
    );
  }

  return (
    <article className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-headline text-headline-md font-semibold text-on-surface">{theme.name}</h3>
            <StatusBadge status={String(theme.status)} />
            {theme.inWeekPlan ? <WeekPlanTag /> : null}
          </div>
          {theme.description ? (
            <p className="mt-1 text-body-md text-on-surface-variant line-clamp-3">{theme.description}</p>
          ) : null}
          {theme.jiraKey ? (
            <p className="mt-2 text-label-md font-medium text-secondary">{theme.jiraKey}</p>
          ) : null}
        </div>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 text-label-md text-error hover:opacity-80 underline"
          >
            {removeLabel}
          </button>
        ) : null}
      </div>

      {weekNotes && weekNotes.length > 0 ? (
        <ul className="mt-4 space-y-3 border-t border-outline-variant pt-3">
          {weekNotes.map((note) => (
            <li key={note.id} className="text-body-md">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <StatusBadge status={note.status} />
                <span className="text-label-md text-outline">{formatDateDisplay(note.updatedAt)}</span>
              </div>
              <p className="text-on-surface whitespace-pre-wrap">{note.content}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
