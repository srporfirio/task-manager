import { statusPillClass, statusBarClass } from "../../lib/status-styles";
import type { ThemeStatus } from "@task-manager/shared";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded ${statusPillClass(status)}`}>
      {status}
    </span>
  );
}

export function StatusBar({ status }: { status: string }) {
  return <div className={`h-1 ${statusBarClass(status as ThemeStatus | string)}`} />;
}

export function WeekPlanTag() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 text-xs rounded-full font-semibold">
      Plano da semana
    </span>
  );
}
