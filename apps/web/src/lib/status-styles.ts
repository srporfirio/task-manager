import type { ThemeStatus } from "@task-manager/shared";
import { normalizeStatus } from "@task-manager/shared";

export function statusBarClass(status: string): string {
  const st = normalizeStatus(status);
  if (st === "Done") return "bg-emerald-500";
  if (st === "In Progress") return "bg-sky-500";
  return "bg-slate-400";
}

export function statusPillClass(status: string): string {
  const st = normalizeStatus(status);
  if (st === "Done") return "bg-emerald-100 text-emerald-800";
  if (st === "In Progress") return "bg-sky-100 text-sky-800";
  return "bg-slate-100 text-slate-700";
}

export const THEME_STATUSES: ThemeStatus[] = ["To do", "In Progress", "Done"];
