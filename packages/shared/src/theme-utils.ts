import { normalizeText } from "./format";
import { normalizeStatus } from "./status";
import type { ThemeStatus } from "./types";

export interface DashboardNote {
  id: string;
  themeId: string;
  status: string;
  content: string;
  updatedAt: string;
}

export interface DashboardTheme {
  id: string;
  name: string;
  jiraKey: string;
  description: string;
  updatedAt: string;
  notes: DashboardNote[];
  inWeekPlan: boolean;
  status: ThemeStatus | string;
  lastUpdate: string;
  updateMs: number;
}

export type SortMode = "update_desc" | "update_asc" | "tema_az" | "tema_za";
export type WeekPlanFilter = "ALL" | "PLANNED" | "NOT_PLANNED";

export function deriveThemeStatusFromNotes(notes: DashboardNote[]): ThemeStatus | string {
  const sorted = [...notes].sort(compareNotesDesc);
  const first = sorted[0];
  return normalizeStatus(first?.status ?? "To do");
}

export function compareNotesDesc(a: DashboardNote, b: DashboardNote): number {
  const aMs = Date.parse(a.updatedAt) || 0;
  const bMs = Date.parse(b.updatedAt) || 0;
  if (bMs !== aMs) return bMs - aMs;
  return b.id.localeCompare(a.id);
}

export function buildDashboardThemes(
  themes: Array<{
    id: string;
    name: string;
    jira_key: string | null;
    description: string | null;
    updated_at: string;
  }>,
  notes: Array<{
    id: string;
    theme_id: string;
    status: string;
    content: string;
    updated_at: string;
  }>,
  weekPlanThemeIds: Set<string>,
): DashboardTheme[] {
  const notesByTheme = new Map<string, DashboardNote[]>();
  for (const n of notes) {
    const list = notesByTheme.get(n.theme_id) ?? [];
    list.push({
      id: n.id,
      themeId: n.theme_id,
      status: n.status,
      content: n.content,
      updatedAt: n.updated_at,
    });
    notesByTheme.set(n.theme_id, list);
  }

  return themes.map((t) => {
    const themeNotes = [...(notesByTheme.get(t.id) ?? [])].sort(compareNotesDesc);
    const latest = themeNotes[0];
    const lastUpdate = latest?.updatedAt ?? t.updated_at;
    const updateMs = Date.parse(lastUpdate) || 0;
    return {
      id: t.id,
      name: t.name,
      jiraKey: t.jira_key?.trim() ?? "",
      description: t.description?.trim() ?? "",
      updatedAt: t.updated_at,
      notes: themeNotes,
      inWeekPlan: weekPlanThemeIds.has(t.id),
      status: deriveThemeStatusFromNotes(themeNotes),
      lastUpdate,
      updateMs,
    };
  });
}

export function filterAndSortThemes(
  themes: DashboardTheme[],
  options: {
    statusFilter: string;
    weekPlanFilter: WeekPlanFilter;
    search: string;
    sortMode: SortMode;
  },
): DashboardTheme[] {
  const normStatusFilter =
    options.statusFilter === "ALL" ? "ALL" : normalizeStatus(options.statusFilter);
  const search = normalizeText(options.search);

  return themes
    .filter((t) => {
      if (normStatusFilter !== "ALL" && t.status !== normStatusFilter) return false;
      if (options.weekPlanFilter === "PLANNED" && !t.inWeekPlan) return false;
      if (options.weekPlanFilter === "NOT_PLANNED" && t.inWeekPlan) return false;
      if (!search) return true;
      const hay = normalizeText(t.name) + " " + normalizeText(t.jiraKey) + " " + normalizeText(t.description);
      return hay.includes(search);
    })
    .sort((a, b) => {
      if (options.sortMode === "update_asc") {
        if (a.updateMs !== b.updateMs) return a.updateMs - b.updateMs;
        return a.id.localeCompare(b.id);
      }
      if (options.sortMode === "tema_az") {
        const cmp = normalizeText(a.name).localeCompare(normalizeText(b.name));
        if (cmp !== 0) return cmp;
        return b.updateMs - a.updateMs;
      }
      if (options.sortMode === "tema_za") {
        const cmp = normalizeText(b.name).localeCompare(normalizeText(a.name));
        if (cmp !== 0) return cmp;
        return b.updateMs - a.updateMs;
      }
      if (b.updateMs !== a.updateMs) return b.updateMs - a.updateMs;
      return b.id.localeCompare(a.id);
    });
}
