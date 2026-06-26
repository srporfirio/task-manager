import {
  buildDashboardThemesFromLegacy,
  type DashboardTheme,
} from "@task-manager/shared";
import { env } from "./env";
import { userHasCloudData } from "./import-legacy";
import {
  addThemeToLocalWeekPlan,
  exportLocalPayload,
  hasLocalPayload,
  removeThemeFromLocalWeekPlan,
} from "./local-data";
import * as themesApi from "./api/themes";
import * as weekPlanApi from "./api/week-plan";

function useApiForThemes(): boolean {
  return env.useApiThemes || env.useApiNotes || env.useApiViews;
}

function useApiForWeekPlan(): boolean {
  return env.useApiWeekPlan || env.useApiThemes;
}

/**
 * Local IndexedDB only when flags are off, local data exists, and user has not migrated to Supabase.
 * Otherwise reads/writes stay on Supabase (mutations always use API today).
 */
async function shouldUseLocalData(userId: string): Promise<boolean> {
  if (useApiForThemes()) return false;
  if (await userHasCloudData(userId)) return false;
  return hasLocalPayload();
}

export async function hybridFetchThemes(userId: string): Promise<DashboardTheme[]> {
  if (!(await shouldUseLocalData(userId))) {
    return themesApi.fetchDashboardThemes(userId);
  }

  const payload = await exportLocalPayload();
  if (!payload) return [];
  return buildDashboardThemesFromLegacy(payload);
}

export async function hybridFetchPlannedThemes(userId: string): Promise<DashboardTheme[]> {
  const allThemes = await hybridFetchThemes(userId);

  if (useApiForWeekPlan() || !(await shouldUseLocalData(userId))) {
    return weekPlanApi.fetchPlannedThemes(userId, allThemes);
  }

  return allThemes.filter((t) => t.inWeekPlan);
}

export async function hybridAddToWeekPlan(userId: string, themeId: string): Promise<void> {
  if (useApiForWeekPlan() || !(await shouldUseLocalData(userId))) {
    await weekPlanApi.addThemeToWeekPlan(userId, themeId);
    return;
  }
  await addThemeToLocalWeekPlan(themeId);
}

export async function hybridRemoveFromWeekPlan(userId: string, themeId: string): Promise<void> {
  if (useApiForWeekPlan() || !(await shouldUseLocalData(userId))) {
    await weekPlanApi.removeThemeFromWeekPlan(userId, themeId);
    return;
  }
  await removeThemeFromLocalWeekPlan(themeId);
}

export {
  createTheme,
  updateTheme,
  deleteTheme,
  addNote,
  deleteNote,
} from "./api/themes";
