import { ScrollView, Pressable, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import type { WeekPlanFilter } from "@task-manager/shared";

export type StatusFilter = "ALL" | "To do" | "In Progress" | "Done";

type Props = {
  status: StatusFilter;
  weekPlan: WeekPlanFilter;
  onStatusChange: (status: StatusFilter) => void;
  onWeekPlanToggle: () => void;
};

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "To do", label: "To do" },
  { value: "In Progress", label: "In Progress" },
  { value: "Done", label: "Done" },
];

export function FilterChips({ status, weekPlan, onStatusChange, onWeekPlanToggle }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      {STATUS_OPTIONS.map((opt) => {
        const active = status === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onStatusChange(opt.value)}
            style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
          >
            <Text style={[styles.chipText, active ? styles.chipTextActive : styles.chipTextInactive]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
      <Pressable style={styles.divider} />
      <Pressable
        onPress={onWeekPlanToggle}
        style={[styles.chip, styles.chipInactive, weekPlan === "PLANNED" && styles.weekPlanActive]}
      >
        <MaterialIcons name="calendar-month" size={18} color={colors.onSurfaceVariant} />
        <Text style={styles.chipTextInactive}>Week Plan</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginHorizontal: -spacing.marginMobile,
  },
  row: {
    paddingHorizontal: spacing.marginMobile,
    gap: spacing.gapSm,
    alignItems: "center",
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.gapXs,
  },
  chipActive: {
    backgroundColor: colors.primaryContainer,
  },
  chipInactive: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  weekPlanActive: {
    backgroundColor: colors.secondaryFixed,
    borderColor: colors.secondaryFixed,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  chipTextActive: {
    color: colors.onPrimaryContainer,
  },
  chipTextInactive: {
    color: colors.onSurfaceVariant,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(188, 201, 201, 0.3)",
    marginHorizontal: 4,
  },
});
