import { getWeekRange, isThemeStatus, normalizeStatus, type LegacyPayload } from "@task-manager/shared";
import { supabase } from "./supabase";

function groupRowsByTheme(rows: LegacyPayload["rows"]) {
  const map = new Map<string, LegacyPayload["rows"]>();
  for (const row of rows) {
    const key = row.theme || "";
    if (!key) continue;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(row);
  }
  return map;
}

export async function userHasCloudData(userId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from("themes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) throw error;
  return (count ?? 0) > 0;
}

export async function importLegacyPayload(payload: LegacyPayload, userId: string): Promise<void> {
  const grouped = groupRowsByTheme(payload.rows);
  const themeIdByName = new Map<string, string>();

  for (const [name, rows] of grouped) {
    const jiraKey = rows.find((r) => (r.jiraKey || "").trim())?.jiraKey?.trim() ?? "";
    const description =
      rows.find((r) => (r.themeDescription || "").trim())?.themeDescription?.trim() ?? "";

    const { data: theme, error: themeError } = await supabase
      .from("themes")
      .insert({
        user_id: userId,
        name,
        jira_key: jiraKey || null,
        description: description || null,
      })
      .select("id")
      .single();

    if (themeError) throw themeError;
    themeIdByName.set(name, theme.id);

    const notes = rows.map((row) => {
      const status = normalizeStatus(row.theme_status);
      const timestamp = row.lastUpdate || new Date().toISOString();
      return {
        theme_id: theme.id,
        user_id: userId,
        status: isThemeStatus(status) ? status : "To do",
        content: row.notes ?? "",
        created_at: timestamp,
        updated_at: timestamp,
      };
    });

    const { error: notesError } = await supabase.from("notes").insert(notes);
    if (notesError) throw notesError;
  }

  const { weekKey } = getWeekRange();
  const plannedThemes = payload.weekPlan?.themes ?? [];
  if (!plannedThemes.length || payload.weekPlan?.weekKey !== weekKey) {
    return;
  }

  const { data: weekPlan, error: weekPlanError } = await supabase
    .from("week_plans")
    .insert({ user_id: userId, week_key: weekKey })
    .select("id")
    .single();

  if (weekPlanError) throw weekPlanError;

  const items = plannedThemes
    .map((themeName, index) => {
      const themeId = themeIdByName.get(themeName);
      if (!themeId) return null;
      return {
        week_plan_id: weekPlan.id,
        theme_id: themeId,
        sort_order: index,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  if (!items.length) return;

  const { error: itemsError } = await supabase.from("week_plan_items").insert(items);
  if (itemsError) throw itemsError;
}
