import { normalizeStatus } from "./status";
import { compareNotesDesc, deriveThemeStatusFromNotes, type DashboardNote, type DashboardTheme } from "./theme-utils";
import { getWeekRange } from "./week-range";
import type { LegacyPayload, LegacyRow } from "./types";

function legacyRowToNote(row: LegacyRow, themeId: string, index: number): DashboardNote {
  return {
    id: `local:${themeId}:${row.__seq ?? index}`,
    themeId,
    status: normalizeStatus(row.theme_status),
    content: row.notes ?? "",
    updatedAt: row.lastUpdate || new Date().toISOString(),
  };
}

export function buildDashboardThemesFromLegacy(payload: LegacyPayload): DashboardTheme[] {
  const { weekKey } = getWeekRange();
  const plannedNames = new Set(
    payload.weekPlan?.weekKey === weekKey ? (payload.weekPlan.themes ?? []) : [],
  );

  const byTheme = new Map<string, LegacyRow[]>();
  for (const row of payload.rows) {
    const name = (row.theme || "").trim();
    if (!name) continue;
    const list = byTheme.get(name) ?? [];
    list.push(row);
    byTheme.set(name, list);
  }

  const themes: DashboardTheme[] = [];

  for (const [name, rows] of byTheme) {
    const id = `local:${name}`;
    const notes = rows
      .map((row, index) => legacyRowToNote(row, id, index))
      .sort(compareNotesDesc);
    const lastUpdate = notes[0]?.updatedAt ?? new Date().toISOString();
    const updateMs = Date.parse(lastUpdate) || 0;
    const jiraKey = rows.find((r) => (r.jiraKey || "").trim())?.jiraKey?.trim() ?? "";
    const description =
      rows.find((r) => (r.themeDescription || "").trim())?.themeDescription?.trim() ?? "";

    themes.push({
      id,
      name,
      jiraKey,
      description,
      updatedAt: lastUpdate,
      notes,
      inWeekPlan: plannedNames.has(name),
      status: deriveThemeStatusFromNotes(notes),
      lastUpdate,
      updateMs,
    });
  }

  return themes.sort((a, b) => {
    if (b.updateMs !== a.updateMs) return b.updateMs - a.updateMs;
    return a.name.localeCompare(b.name);
  });
}

export function localThemeNameFromId(themeId: string): string | null {
  if (!themeId.startsWith("local:")) return null;
  return themeId.slice("local:".length) || null;
}
