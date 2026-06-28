import { formatDateDisplay } from "@task-manager/shared";

export function formatRelativeUpdate(value: string | null | undefined): string {
  const t = Date.parse(String(value || ""));
  if (!Number.isFinite(t)) return "-";

  const diffMs = Date.now() - t;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Atualizado agora";
  if (mins < 60) return `Atualizado há ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Atualizado há ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Atualizado ontem";
  if (days < 7) return `Atualizado há ${days} dias`;

  return formatDateDisplay(value).split(",")[0] ?? formatDateDisplay(value);
}
