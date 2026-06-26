import type { User } from "@supabase/supabase-js";

export function getUserAvatarUrl(user: User): string | null {
  const meta = user.user_metadata;
  if (!meta) return null;
  const url = meta.avatar_url ?? meta.picture;
  return typeof url === "string" && url.trim() ? url.trim() : null;
}

export function getUserDisplayName(user: User): string {
  const meta = user.user_metadata;
  const name =
    (meta?.full_name as string | undefined) ??
    (meta?.name as string | undefined) ??
    user.email?.split("@")[0];
  return name?.trim() || "Usuário";
}

export function getUserInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
