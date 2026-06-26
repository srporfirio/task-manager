import type { DashboardTheme } from "@task-manager/shared";
import { ThemeBoardCard } from "./ThemeBoardCard";

type KanbanColumnProps = {
  title: string;
  themes: DashboardTheme[];
  emptyText: string;
  showWeekNotes?: boolean;
  getWeekNotes?: (theme: DashboardTheme) => DashboardTheme["notes"];
  onRemove?: (themeId: string) => void;
};

function KanbanColumn({ title, themes, emptyText, showWeekNotes, getWeekNotes, onRemove }: KanbanColumnProps) {
  return (
    <section className="min-w-0 flex-1">
      <h2 className="text-sm font-bold text-slate-700 mb-3">{title}</h2>
      <div className="space-y-3">
        {themes.length === 0 ? (
          <p className="text-sm text-slate-500 bg-white border border-dashed border-slate-200 rounded-xl p-4">
            {emptyText}
          </p>
        ) : (
          themes.map((theme) => (
            <ThemeBoardCard
              key={theme.id}
              theme={theme}
              weekNotes={showWeekNotes ? getWeekNotes?.(theme) : undefined}
              onRemove={onRemove ? () => onRemove(theme.id) : undefined}
            />
          ))
        )}
      </div>
    </section>
  );
}

type KanbanBoardProps = {
  done: DashboardTheme[];
  inProgress: DashboardTheme[];
  todo: DashboardTheme[];
  emptyText?: string;
  showWeekNotes?: boolean;
  getWeekNotes?: (theme: DashboardTheme) => DashboardTheme["notes"];
  onRemove?: (themeId: string) => void;
};

export function KanbanBoard({
  done,
  inProgress,
  todo,
  emptyText = "Nenhum tema.",
  showWeekNotes = false,
  getWeekNotes,
  onRemove,
}: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <KanbanColumn title="To do" themes={todo} emptyText={emptyText} showWeekNotes={showWeekNotes} getWeekNotes={getWeekNotes} onRemove={onRemove} />
      <KanbanColumn title="In Progress" themes={inProgress} emptyText={emptyText} showWeekNotes={showWeekNotes} getWeekNotes={getWeekNotes} onRemove={onRemove} />
      <KanbanColumn title="Done" themes={done} emptyText={emptyText} showWeekNotes={showWeekNotes} getWeekNotes={getWeekNotes} onRemove={onRemove} />
    </div>
  );
}
