import { Pressable, View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { DashboardTheme } from "@task-manager/shared";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { StatusPill } from "../ui/StatusPill";
import { formatRelativeUpdate } from "../../lib/relative-time";
import { noteBorderColor } from "../../lib/status-styles";

type Props = {
  theme: DashboardTheme;
  onPress: () => void;
};

export function DashboardThemeCard({ theme, onPress }: Props) {
  const lastNote = theme.notes[0];
  const borderColor = lastNote ? noteBorderColor(lastNote.status) : colors.outline;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {theme.jiraKey ? <Text style={styles.jira}>{theme.jiraKey.toUpperCase()}</Text> : null}
          <Text style={styles.name}>{theme.name}</Text>
        </View>
        <StatusPill status={String(theme.status)} compact />
      </View>

      <View style={styles.metaRow}>
        <MaterialIcons name="calendar-today" size={16} color={colors.outline} />
        <Text style={styles.meta}>{formatRelativeUpdate(theme.lastUpdate)}</Text>
      </View>

      {lastNote ? (
        <View style={[styles.noteBox, { borderLeftColor: borderColor }]}>
          <Text style={styles.noteText} numberOfLines={2}>
            "{lastNote.content}"
          </Text>
        </View>
      ) : (
        <View style={[styles.noteBox, { borderLeftColor: colors.outline }]}>
          <Text style={styles.noteText} numberOfLines={2}>
            Sem notas ainda.
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(188, 201, 201, 0.3)",
    padding: spacing.marginMobile,
    marginBottom: spacing.gapMd,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: "rgba(224, 227, 226, 0.2)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: spacing.gapSm,
  },
  headerLeft: {
    flex: 1,
  },
  jira: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.outline,
    letterSpacing: 1,
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.onSurface,
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.gapSm,
    marginBottom: spacing.gapMd,
  },
  meta: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.onSurfaceVariant,
  },
  noteBox: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
  },
  noteText: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    fontStyle: "italic",
    lineHeight: 20,
  },
});
