import type { ThemeStatus } from "@task-manager/shared";
import { normalizeStatus } from "@task-manager/shared";
import { colors } from "../theme/colors";

export const THEME_STATUSES: ThemeStatus[] = ["To do", "In Progress", "Done"];

export function statusBarColor(status: string): string {
  const st = normalizeStatus(status);
  if (st === "Done") return colors.primary;
  if (st === "In Progress") return colors.secondary;
  return colors.outline;
}

export function statusPillStyle(status: string): { bg: string; text: string } {
  const st = normalizeStatus(status);
  if (st === "Done") return { bg: colors.primaryContainer, text: colors.onPrimaryContainer };
  if (st === "In Progress") return { bg: colors.secondaryFixed, text: colors.onSecondaryFixed };
  return { bg: colors.surfaceContainerHighest, text: colors.onSurfaceVariant };
}

export function noteBorderColor(status: string): string {
  const st = normalizeStatus(status);
  if (st === "Done") return colors.outline;
  if (st === "In Progress") return colors.primary;
  return colors.error;
}
