import { View, Text, Pressable, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { DashboardNote, DashboardTheme } from "@task-manager/shared";
import { formatDateDisplay } from "@task-manager/shared";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { StatusPill } from "../ui/StatusPill";

type Props = {
  theme: DashboardTheme;
  variant?: "planner" | "week" | "kanban";
  weekNotes?: DashboardNote[];
  onRemove?: () => void;
};

export function ThemeBoardCard({ theme, variant = "kanban", weekNotes, onRemove }: Props) {
  if (variant === "planner") {
    return (
      <View style={styles.plannerCard}>
        {onRemove ? (
          <Pressable onPress={onRemove} style={styles.removeBtn} hitSlop={8}>
            <MaterialIcons name="close" size={20} color={colors.onError} />
          </Pressable>
        ) : null}
        <Text style={styles.plannerCategory}>{theme.jiraKey || theme.name.split(" ")[0]}</Text>
        <Text style={styles.plannerTitle}>{theme.name}</Text>
        <View style={styles.plannerMeta}>
          <StatusPill status={String(theme.status)} compact />
          {theme.inWeekPlan ? (
            <View style={styles.weekTag}>
              <Text style={styles.weekTagText}>Week Plan</Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  }

  if (variant === "week") {
    const notes = weekNotes ?? [];
    return (
      <View style={styles.weekCard}>
        <View style={styles.weekHeader}>
          <Text style={styles.weekTitle}>{theme.name}</Text>
          {notes[0] ? (
            <Text style={styles.weekTime}>{formatDateDisplay(notes[0].updatedAt).split(",")[1]?.trim() ?? ""}</Text>
          ) : null}
        </View>
        {notes.map((note) => (
          <Text key={note.id} style={styles.weekNote}>
            {note.content}
          </Text>
        ))}
        {!notes.length && theme.description ? (
          <Text style={styles.weekNote}>{theme.description}</Text>
        ) : null}
      </View>
    );
  }

  return (
    <Pressable style={({ pressed }) => [styles.kanbanCard, pressed && styles.pressed]}>
      <View style={styles.kanbanHeader}>
        <Text style={styles.kanbanTitle}>{theme.name}</Text>
        {theme.jiraKey ? <Text style={styles.kanbanTag}>{theme.jiraKey}</Text> : null}
      </View>
      {theme.description ? (
        <Text style={styles.kanbanDesc} numberOfLines={2}>
          {theme.description}
        </Text>
      ) : null}
      <StatusPill status={String(theme.status)} compact />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  plannerCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.gapMd,
    marginBottom: spacing.gapMd,
    position: "relative",
  },
  removeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1,
    padding: 4,
  },
  plannerCategory: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 4,
  },
  plannerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.onSurface,
    paddingRight: 32,
  },
  plannerMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.gapSm,
    marginTop: spacing.gapSm,
  },
  weekTag: {
    backgroundColor: colors.secondaryFixed,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  weekTagText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.onSecondaryFixed,
  },
  weekCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(188, 201, 201, 0.3)",
    padding: spacing.gapMd,
    marginBottom: spacing.gapSm,
  },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    gap: spacing.gapSm,
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.onSurface,
    flex: 1,
  },
  weekTime: {
    fontSize: 10,
    color: colors.onSurfaceVariant,
  },
  weekNote: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
  },
  kanbanCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 8,
    padding: spacing.marginMobile,
    gap: spacing.gapXs,
  },
  pressed: {
    transform: [{ scale: 0.95 }],
  },
  kanbanHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  kanbanTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.onSurface,
    flex: 1,
  },
  kanbanTag: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    backgroundColor: colors.primaryContainer,
    color: colors.onPrimaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
    marginLeft: 8,
  },
  kanbanDesc: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
});
