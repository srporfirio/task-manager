import { describe, expect, it } from "vitest";
import { buildDashboardThemesFromLegacy } from "./legacy-to-dashboard";
import { getWeekRange } from "./week-range";
import type { DashboardNote } from "./theme-utils";
import {
  filterThemesByLatestUpdate,
  filterThemesWithWeekActivity,
  getNotesInWeekRange,
  partitionThemesByStatus,
  computeWeekViewStats,
  computeWeekEfficiency,
  formatWeekEfficiencyDetail,
  getWeekEfficiencyDisplay,
  getWeekViewFilterSummary,
} from "./view-utils";

const sampleTheme = (id: string, status: string, updateMs: number, notes: DashboardNote[] = []) => ({
  id,
  name: id,
  jiraKey: "",
  description: "",
  updatedAt: new Date(updateMs).toISOString(),
  notes,
  inWeekPlan: false,
  status,
  lastUpdate: new Date(updateMs).toISOString(),
  updateMs,
});

describe("view-utils", () => {
  it("partitions themes by status", () => {
    const themes = [
      sampleTheme("a", "Done", 3),
      sampleTheme("b", "In Progress", 2),
      sampleTheme("c", "To do", 1),
    ];
    const parts = partitionThemesByStatus(themes);
    expect(parts.done).toHaveLength(1);
    expect(parts.inProgress).toHaveLength(1);
    expect(parts.todo).toHaveLength(1);
  });

  it("filters themes by latest update range", () => {
    const start = new Date(2026, 5, 1);
    const end = new Date(2026, 5, 30, 23, 59, 59, 999);
    const themes = [
      sampleTheme("old", "To do", Date.parse("2026-05-01T10:00:00")),
      sampleTheme("new", "Done", Date.parse("2026-06-15T10:00:00")),
    ];
    const filtered = filterThemesByLatestUpdate(themes, start, end);
    expect(filtered.map((t) => t.id)).toEqual(["new"]);
  });

  it("filters themes with week activity", () => {
    const { monday, sunday } = getWeekRange(new Date(2026, 5, 25));
    const themes = [
      sampleTheme("with", "To do", monday.getTime(), [
        {
          id: "n1",
          themeId: "with",
          status: "To do",
          content: "note",
          updatedAt: new Date(monday.getTime() + 3600000).toISOString(),
        },
      ]),
      sampleTheme("without", "To do", monday.getTime() - 86400000 * 10, []),
    ];
    const filtered = filterThemesWithWeekActivity(themes, monday, sunday);
    expect(filtered.map((t) => t.id)).toEqual(["with"]);
    expect(getNotesInWeekRange(themes[0].notes, monday, sunday)).toHaveLength(1);
  });

  it("computes week view stats from visible themes", () => {
    const themes = [
      sampleTheme("a", "Done", 3),
      sampleTheme("b", "In Progress", 2),
      sampleTheme("c", "To do", 1),
      sampleTheme("d", "Done", 4),
    ];
    const stats = computeWeekViewStats(themes);
    expect(stats.completedCount).toBe(2);
    expect(stats.pendingCount).toBe(2);
    expect(stats.efficiency).toBe(50);
    expect(getWeekViewFilterSummary("week_plan", stats.total)).toContain("plano da semana");
    expect(getWeekViewFilterSummary("week_activity", stats.total)).toContain("atualizados na semana");
    expect(computeWeekEfficiency(2, 4)).toBe(50);
    expect(computeWeekEfficiency(0, 0)).toBe(0);
    expect(formatWeekEfficiencyDetail(2, 4)).toBe("2 de 4 tema(s) concluído(s)");
    expect(formatWeekEfficiencyDetail(0, 0)).toContain("Nenhum tema");
    const emptyDisplay = getWeekEfficiencyDisplay(0, 0);
    expect(emptyDisplay.isEmpty).toBe(true);
    expect(emptyDisplay.percentageLabel).toBe("—");
    const filledDisplay = getWeekEfficiencyDisplay(2, 4);
    expect(filledDisplay.percentageLabel).toBe("50%");
    expect(filledDisplay.isEmpty).toBe(false);
  });
});

describe("buildDashboardThemesFromLegacy", () => {
  it("maps legacy rows to dashboard themes with week plan", () => {
    const { weekKey } = getWeekRange();
    const themes = buildDashboardThemesFromLegacy({
      rows: [
        {
          theme: "Alpha",
          theme_status: "Done",
          jiraKey: "ABC-1",
          themeDescription: "Desc",
          notes: "Nota 1",
          lastUpdate: "2026-06-20T10:00:00",
          __seq: 1,
        },
      ],
      weekPlan: { weekKey, themes: ["Alpha"] },
    });
    expect(themes).toHaveLength(1);
    expect(themes[0].name).toBe("Alpha");
    expect(themes[0].inWeekPlan).toBe(true);
    expect(themes[0].status).toBe("Done");
  });
});
