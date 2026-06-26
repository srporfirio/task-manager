import {
  buildDashboardThemes,
  isThemeStatus,
  normalizeStatus,
  splitNotes,
  type DashboardTheme,
} from "@task-manager/shared";
import { supabase } from "../supabase";
import { fetchWeekPlanThemeIds, addThemeToWeekPlan } from "./week-plan";

export async function fetchDashboardThemes(userId: string): Promise<DashboardTheme[]> {
  const [themesResult, notesResult, weekPlanIds] = await Promise.all([
    supabase.from("themes").select("id, name, jira_key, description, updated_at").eq("user_id", userId),
    supabase.from("notes").select("id, theme_id, status, content, updated_at").eq("user_id", userId),
    fetchWeekPlanThemeIds(userId),
  ]);

  if (themesResult.error) throw themesResult.error;
  if (notesResult.error) throw notesResult.error;

  return buildDashboardThemes(themesResult.data ?? [], notesResult.data ?? [], weekPlanIds);
}

export async function createTheme(
  userId: string,
  payload: {
    name: string;
    status: string;
    jiraKey: string;
    description: string;
    notesText: string;
    addToWeekPlan: boolean;
  },
): Promise<void> {
  const now = new Date().toISOString();
  const { data: theme, error: themeError } = await supabase
    .from("themes")
    .insert({
      user_id: userId,
      name: payload.name.trim(),
      jira_key: payload.jiraKey.trim() || null,
      description: payload.description.trim() || null,
      updated_at: now,
    })
    .select("id")
    .single();

  if (themeError) throw themeError;

  const notesList = splitNotes(payload.notesText);
  const status = normalizeStatus(payload.status);
  const finalStatus = isThemeStatus(status) ? status : "To do";

  const notes = notesList.map((content) => ({
    theme_id: theme.id,
    user_id: userId,
    status: finalStatus,
    content,
    created_at: now,
    updated_at: now,
  }));

  const { error: notesError } = await supabase.from("notes").insert(notes);
  if (notesError) throw notesError;

  if (payload.addToWeekPlan) {
    await addThemeToWeekPlan(userId, theme.id);
  }
}

export async function updateTheme(
  themeId: string,
  payload: { name: string; jiraKey: string; description: string },
): Promise<void> {
  const { error } = await supabase
    .from("themes")
    .update({
      name: payload.name.trim(),
      jira_key: payload.jiraKey.trim() || null,
      description: payload.description.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", themeId);

  if (error) throw error;
}

export async function deleteTheme(themeId: string): Promise<void> {
  const { error } = await supabase.from("themes").delete().eq("id", themeId);
  if (error) throw error;
}

export async function addNote(
  userId: string,
  themeId: string,
  payload: { content: string; status: string },
): Promise<void> {
  const now = new Date().toISOString();
  const status = normalizeStatus(payload.status);
  const finalStatus = isThemeStatus(status) ? status : "To do";

  const { error: noteError } = await supabase.from("notes").insert({
    theme_id: themeId,
    user_id: userId,
    status: finalStatus,
    content: payload.content.trim(),
    created_at: now,
    updated_at: now,
  });
  if (noteError) throw noteError;

  const { error: themeError } = await supabase
    .from("themes")
    .update({ updated_at: now })
    .eq("id", themeId);
  if (themeError) throw themeError;
}

export async function deleteNote(noteId: string): Promise<void> {
  const { error } = await supabase.from("notes").delete().eq("id", noteId);
  if (error) throw error;
}
