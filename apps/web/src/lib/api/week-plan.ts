import { getWeekRange } from "@task-manager/shared";
import type { DashboardTheme } from "@task-manager/shared";
import { supabase } from "../supabase";

async function getCurrentWeekPlanId(userId: string): Promise<string | null> {
  const { weekKey } = getWeekRange();
  const { data, error } = await supabase
    .from("week_plans")
    .select("id")
    .eq("user_id", userId)
    .eq("week_key", weekKey)
    .maybeSingle();

  if (error) throw error;
  return data?.id ?? null;
}

export async function fetchWeekPlanThemeIds(userId: string): Promise<Set<string>> {
  const planId = await getCurrentWeekPlanId(userId);
  if (!planId) return new Set();

  const { data: items, error: itemsError } = await supabase
    .from("week_plan_items")
    .select("theme_id")
    .eq("week_plan_id", planId);

  if (itemsError) throw itemsError;
  return new Set((items ?? []).map((i) => i.theme_id));
}

export async function fetchWeekPlanOrderedThemeIds(userId: string): Promise<string[]> {
  const planId = await getCurrentWeekPlanId(userId);
  if (!planId) return [];

  const { data: items, error } = await supabase
    .from("week_plan_items")
    .select("theme_id, sort_order")
    .eq("week_plan_id", planId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (items ?? []).map((i) => i.theme_id);
}

export async function fetchPlannedThemes(
  userId: string,
  allThemes: DashboardTheme[],
): Promise<DashboardTheme[]> {
  const orderedIds = await fetchWeekPlanOrderedThemeIds(userId);
  const byId = new Map(allThemes.map((t) => [t.id, t]));
  return orderedIds.map((id) => byId.get(id)).filter((t): t is DashboardTheme => Boolean(t));
}

export async function addThemeToWeekPlan(userId: string, themeId: string): Promise<void> {
  const { weekKey } = getWeekRange();

  let planId: string;
  const { data: existing, error: existingError } = await supabase
    .from("week_plans")
    .select("id")
    .eq("user_id", userId)
    .eq("week_key", weekKey)
    .maybeSingle();

  if (existingError) throw existingError;

  if (existing) {
    planId = existing.id;
  } else {
    const { data: created, error: createError } = await supabase
      .from("week_plans")
      .insert({ user_id: userId, week_key: weekKey })
      .select("id")
      .single();
    if (createError) throw createError;
    planId = created.id;
  }

  const { data: currentItems, error: countError } = await supabase
    .from("week_plan_items")
    .select("sort_order")
    .eq("week_plan_id", planId)
    .order("sort_order", { ascending: false })
    .limit(1);

  if (countError) throw countError;
  const nextOrder = (currentItems?.[0]?.sort_order ?? -1) + 1;

  const { error: insertError } = await supabase.from("week_plan_items").insert({
    week_plan_id: planId,
    theme_id: themeId,
    sort_order: nextOrder,
  });

  if (insertError && insertError.code !== "23505") throw insertError;
}

export async function removeThemeFromWeekPlan(userId: string, themeId: string): Promise<void> {
  const planId = await getCurrentWeekPlanId(userId);
  if (!planId) return;

  const { error } = await supabase
    .from("week_plan_items")
    .delete()
    .eq("week_plan_id", planId)
    .eq("theme_id", themeId);

  if (error) throw error;
}
