import { describe, expect, it } from "vitest";
import { getWeekRange } from "./week-range";
import { normalizeStatus } from "./status";

describe("normalizeStatus", () => {
  it("normalizes common variants", () => {
    expect(normalizeStatus("todo")).toBe("To do");
    expect(normalizeStatus("in progress")).toBe("In Progress");
    expect(normalizeStatus("DONE")).toBe("Done");
  });
});

describe("getWeekRange", () => {
  it("returns monday as week key", () => {
    const { monday, sunday } = getWeekRange(new Date(2026, 5, 25, 12, 0, 0));
    expect(monday.getDay()).toBe(1);
    expect(monday.getDate()).toBe(22);
    expect(monday.getMonth()).toBe(5);
    expect(sunday.getDay()).toBe(0);
    expect(sunday.getDate()).toBe(28);
  });
});
