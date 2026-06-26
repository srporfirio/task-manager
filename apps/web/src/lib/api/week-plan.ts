import { getWeekRange } from "@task-manager/shared";
import { supabase } from "../supabase";

export async function fetchWeekPlanThemeIds(userId: string): Promise<Set<string>> {
  const { weekKey } = getWeekRange();
  const { data: plan, error: planError } = await supabase
    .from("week_plans")
    .select("id")
    .eq("user_id", userId)
    .eq("week_key", weekKey)
    .maybeSingle();

  if (planError) throw planError;
  if (!plan) return new Set();

  const { data: items, error: itemsError } = await supabase
    .from("week_plan_items")
    .select("theme_id")
    .eq("week_plan_id", plan.id);

  if (itemsError) throw itemsError;
  return new Set((items ?? []).map((i) => i.theme_id));
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
