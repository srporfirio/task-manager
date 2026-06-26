import type { DashboardTheme } from "@task-manager/shared";
import { ThemeBoardCard } from "./ThemeBoardCard";

type KanbanColumnProps = {
  title: string;
  themes: DashboardTheme[];
  emptyText: string;
  showWeekNotes?: boolean;
  getWeekNotes?: (theme: DashboardTheme) => DashboardTheme["notes"];
  onRemove?: (themeId: string) => void;
  cardVariant?: "default" | "planner" | "week";
};

function KanbanColumn({
  title,
  themes,
  emptyText,
  showWeekNotes,
  getWeekNotes,
  onRemove,
  cardVariant = "default",
}: KanbanColumnProps) {
  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 min-w-0">
      <h3 className="text-label-md font-semibold uppercase tracking-wide text-on-surface-variant mb-3">{title}</h3>
      <div className="flex flex-col gap-2">
        {themes.length === 0 ? (
          <p className="text-body-md text-outline">{emptyText}</p>
        ) : (
          themes.map((theme) => (
            <ThemeBoardCard
              key={theme.id}
              theme={theme}
              variant={cardVariant}
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
  cardVariant?: "default" | "planner" | "week";
};

export function KanbanBoard({
  done,
  inProgress,
  todo,
  emptyText = "Nenhum tema.",
  showWeekNotes = false,
  getWeekNotes,
  onRemove,
  cardVariant = "default",
}: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <KanbanColumn title="To do" themes={todo} emptyText={emptyText} showWeekNotes={showWeekNotes} getWeekNotes={getWeekNotes} onRemove={onRemove} cardVariant={cardVariant} />
      <KanbanColumn title="In Progress" themes={inProgress} emptyText={emptyText} showWeekNotes={showWeekNotes} getWeekNotes={getWeekNotes} onRemove={onRemove} cardVariant={cardVariant} />
      <KanbanColumn title="Done" themes={done} emptyText={emptyText} showWeekNotes={showWeekNotes} getWeekNotes={getWeekNotes} onRemove={onRemove} cardVariant={cardVariant} />
    </div>
  );
}
