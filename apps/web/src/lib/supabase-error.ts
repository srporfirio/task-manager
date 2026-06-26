import type { PostgrestError } from "@supabase/supabase-js";

export function formatSupabaseError(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "Erro desconhecido.";
  }

  const err = error as PostgrestError & { message?: string };
  const parts = [err.message, err.details, err.hint].filter(Boolean);
  return parts.join(" — ") || "Falha na operação.";
}
