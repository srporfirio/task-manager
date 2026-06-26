import type { WeekRange } from "./types";

export function getWeekRange(date: Date = new Date()): WeekRange {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return {
    monday,
    sunday,
    weekKey: monday.toISOString().slice(0, 10),
  };
}
