import { ScrollView, Pressable, Text, StyleSheet } from "react-native";
import { WEEK_VIEW_FILTER_OPTIONS, type WeekViewFilterMode } from "@task-manager/shared";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

type Props = {
  mode: WeekViewFilterMode;
  onChange: (mode: WeekViewFilterMode) => void;
};

export function WeekViewFilterChips({ mode, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      {WEEK_VIEW_FILTER_OPTIONS.map((option) => {
        const active = mode === option.mode;
        return (
          <Pressable
            key={option.mode}
            onPress={() => onChange(option.mode)}
            style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
          >
            <Text style={[styles.chipText, active ? styles.chipTextActive : styles.chipTextInactive]}>
              {option.shortLabel}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginBottom: spacing.gapMd,
  },
  row: {
    gap: spacing.gapSm,
    alignItems: "center",
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  chipActive: {
    backgroundColor: colors.primaryContainer,
  },
  chipInactive: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
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
});
