import { formatDateDisplay } from "./format";
import type { DashboardNote, DashboardTheme } from "./theme-utils";
import type { ThemeStatus } from "./types";

export function formatWeekPeriod(monday: Date, sunday: Date): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  return `Semana de ${fmt(monday)} a ${fmt(sunday)}`;
}

export function toDateInputValue(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function parseDateInput(value: string, endOfDay = false): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d, endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, endOfDay ? 999 : 0);
  return Number.isFinite(date.getTime()) ? date : null;
}

export function getNotesInWeekRange(
  notes: DashboardNote[],
  monday: Date,
  sunday: Date,
): DashboardNote[] {
  const startMs = monday.getTime();
  const endMs = sunday.getTime();
  return notes
    .filter((n) => {
      const ms = Date.parse(n.updatedAt);
      return Number.isFinite(ms) && ms >= startMs && ms <= endMs;
    })
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export function filterThemesByLatestUpdate(
  themes: DashboardTheme[],
  start: Date | null,
  end: Date | null,
): DashboardTheme[] {
  const startMs = start?.getTime() ?? null;
  const endMs = end?.getTime() ?? null;

  return themes
    .filter((t) => {
      if (startMs !== null && t.updateMs < startMs) return false;
      if (endMs !== null && t.updateMs > endMs) return false;
      return true;
    })
    .sort((a, b) => {
      if (b.updateMs !== a.updateMs) return b.updateMs - a.updateMs;
      return b.id.localeCompare(a.id);
    });
}

export function filterThemesWithWeekActivity(
  themes: DashboardTheme[],
  monday: Date,
  sunday: Date,
): DashboardTheme[] {
  return themes
    .filter((t) => getNotesInWeekRange(t.notes, monday, sunday).length > 0)
    .sort((a, b) => {
      if (b.updateMs !== a.updateMs) return b.updateMs - a.updateMs;
      return b.id.localeCompare(a.id);
    });
}

export function partitionThemesByStatus(themes: DashboardTheme[]): {
  done: DashboardTheme[];
  inProgress: DashboardTheme[];
  todo: DashboardTheme[];
} {
  const done: DashboardTheme[] = [];
  const inProgress: DashboardTheme[] = [];
  const todo: DashboardTheme[] = [];

  for (const theme of themes) {
    if (theme.status === "Done") done.push(theme);
    else if (theme.status === "In Progress") inProgress.push(theme);
    else todo.push(theme);
  }

  return { done, inProgress, todo };
}

export function defaultThemeViewDateRange(): { start: string; end: string } {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(start.getDate() - 30);
  start.setHours(0, 0, 0, 0);
  return { start: toDateInputValue(start), end: toDateInputValue(end) };
}

export interface PrintThemeSection {
  title: string;
  className: string;
  themes: DashboardTheme[];
  showNotes: boolean;
  weekNotesByThemeId?: Map<string, DashboardNote[]>;
}

export function buildPrintSections(
  themes: DashboardTheme[],
  options: { showNotes: boolean; monday?: Date; sunday?: Date },
): PrintThemeSection[] {
  const { done, inProgress, todo } = partitionThemesByStatus(themes);
  const weekNotesByThemeId = new Map<string, DashboardNote[]>();

  if (options.showNotes && options.monday && options.sunday) {
    for (const theme of themes) {
      weekNotesByThemeId.set(theme.id, getNotesInWeekRange(theme.notes, options.monday, options.sunday));
    }
  }

  return [
    { title: "Concluído", className: "done", themes: done, showNotes: options.showNotes, weekNotesByThemeId },
    { title: "Em progresso", className: "in-progress", themes: inProgress, showNotes: options.showNotes, weekNotesByThemeId },
    { title: "A fazer", className: "todo", themes: todo, showNotes: options.showNotes, weekNotesByThemeId },
  ];
}

export function formatNoteTimestamp(value: string): string {
  return formatDateDisplay(value);
}

export function isDoneStatus(status: ThemeStatus | string): boolean {
  return status === "Done";
}
