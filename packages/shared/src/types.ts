export type ThemeStatus = "To do" | "In Progress" | "Done";

export interface LegacyRow {
  theme: string;
  theme_status: string;
  jiraKey: string;
  themeDescription: string;
  notes: string;
  lastUpdate: string;
  __seq: number;
}

export interface LegacyWeekPlan {
  weekKey: string;
  themes: string[];
}

export interface LegacyPayload {
  rows: LegacyRow[];
  weekPlan: LegacyWeekPlan;
}

export interface WeekRange {
  monday: Date;
  sunday: Date;
  weekKey: string;
}
