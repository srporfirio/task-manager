import type { ThemeStatus } from "./types";

export function normalizeStatus(value: string | null | undefined): ThemeStatus | string {
  const raw = String(value || "").trim();
  const v = raw.toLowerCase().replace(/\s+/g, " ");
  if (v === "done") return "Done";
  if (v === "in progress") return "In Progress";
  if (v === "to do" || v === "todo") return "To do";
  if (v.includes("done")) return "Done";
  if (v.includes("in progress")) return "In Progress";
  if (v.includes("to do") || v.includes("todo")) return "To do";
  return raw || "To do";
}

export function isThemeStatus(value: string): value is ThemeStatus {
  return value === "To do" || value === "In Progress" || value === "Done";
}
