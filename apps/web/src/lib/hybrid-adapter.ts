import * as themesApi from "./api/themes";
import * as weekPlanApi from "./api/week-plan";

export async function hybridFetchThemes(userId: string) {
  return themesApi.fetchDashboardThemes(userId);
}

export async function hybridFetchPlannedThemes(userId: string) {
  const allThemes = await hybridFetchThemes(userId);
  return weekPlanApi.fetchPlannedThemes(userId, allThemes);
}

export async function hybridAddToWeekPlan(userId: string, themeId: string) {
  await weekPlanApi.addThemeToWeekPlan(userId, themeId);
}

export async function hybridRemoveFromWeekPlan(userId: string, themeId: string) {
  await weekPlanApi.removeThemeFromWeekPlan(userId, themeId);
}

export {
  createTheme,
  updateTheme,
  deleteTheme,
  addNote,
  deleteNote,
} from "./api/themes";
