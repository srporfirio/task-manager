import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import type { DashboardTheme } from "@task-manager/shared";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { ThemeBoardCard } from "./ThemeBoardCard";

type Props = {
  title: string;
  themes: DashboardTheme[];
  accentColor: string;
  defaultOpen?: boolean;
  emptyText?: string;
};

export function AccordionColumn({ title, themes, accentColor, defaultOpen = true, emptyText }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View style={styles.wrap}>
      <Pressable onPress={() => setOpen((v) => !v)} style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.accent, { backgroundColor: accentColor }]} />
          <Text style={styles.title}>{title}</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{themes.length}</Text>
          </View>
        </View>
        <MaterialIcons
          name="expand-more"
          size={24}
          color={colors.onSurfaceVariant}
          style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}
        />
      </Pressable>
      {open ? (
        <View style={styles.body}>
          {themes.length === 0 ? (
            <Text style={styles.empty}>{emptyText ?? "Nenhum tema."}</Text>
          ) : (
            themes.map((theme) => <ThemeBoardCard key={theme.id} theme={theme} variant="kanban" />)
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(188, 201, 201, 0.3)",
    marginBottom: spacing.gapSm,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.marginMobile,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.gapSm,
  },
  accent: {
    width: 8,
    height: 24,
    borderRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.onSurface,
  },
  countBadge: {
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  countText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.onSurfaceVariant,
  },
  body: {
    paddingHorizontal: spacing.marginMobile,
    paddingBottom: spacing.marginMobile,
    gap: spacing.gapSm,
  },
  empty: {
    fontSize: 14,
    color: colors.outline,
  },
});
