import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export async function ensureUserProfile(user: User): Promise<void> {
  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? "unknown@local",
      display_name:
        (user.user_metadata?.full_name as string | undefined) ??
        (user.user_metadata?.name as string | undefined) ??
        user.email ??
        null,
    },
    { onConflict: "id" },
  );

  if (error) throw error;
}
