import { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  defaultThemeViewDateRange,
  filterThemesByLatestUpdate,
  parseDateInput,
  partitionThemesByStatus,
  toDateInputValue,
} from "@task-manager/shared";
import { useThemes } from "../contexts/ThemesContext";
import { TopAppBar } from "../components/layout/TopAppBar";
import { AccordionColumn } from "../components/views/AccordionColumn";
import { AddThemeModal } from "../components/dashboard/AddThemeModal";
import { AddThemeFab } from "../components/dashboard/AddThemeFab";
import { createTheme } from "../lib/hybrid-adapter";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { MaterialIcons } from "@expo/vector-icons";

function formatDisplayDate(value: string): string {
  const d = parseDateInput(value, false);
  if (!d) return value;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ThemesScreen() {
  const { themes, loading, error, reload, user } = useThemes();
  const [dateRange, setDateRange] = useState(defaultThemeViewDateRange);
  const [appliedRange, setAppliedRange] = useState(defaultThemeViewDateRange);
  const [addOpen, setAddOpen] = useState(false);
  const [picker, setPicker] = useState<"start" | "end" | null>(null);

  const filtered = useMemo(() => {
    const start = parseDateInput(appliedRange.start, false);
    const end = parseDateInput(appliedRange.end, true);
    return filterThemesByLatestUpdate(themes, start, end);
  }, [themes, appliedRange]);

  const { done, inProgress, todo } = useMemo(() => partitionThemesByStatus(filtered), [filtered]);

  function openPicker(field: "start" | "end") {
    setPicker(field);
  }

  function onDateChange(_: unknown, date?: Date) {
    if (Platform.OS === "android") setPicker(null);
    if (!date || !picker) return;
    const value = toDateInputValue(date);
    setDateRange((prev) => ({ ...prev, [picker]: value }));
  }

  return (
    <View style={styles.root}>
      <TopAppBar title="Themes" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.periodLabel}>ACTIVE PERIOD</Text>
        <View style={styles.dateRow}>
          <Pressable onPress={() => openPicker("start")} style={styles.dateBox}>
            <MaterialIcons name="calendar-today" size={20} color={colors.primary} />
            <View>
              <Text style={styles.dateHint}>Start</Text>
              <Text style={styles.dateValue}>{formatDisplayDate(dateRange.start)}</Text>
            </View>
          </Pressable>
          <View style={styles.dateDivider} />
          <Pressable onPress={() => openPicker("end")} style={styles.dateBox}>
            <MaterialIcons name="event" size={20} color={colors.primary} />
            <View>
              <Text style={styles.dateHint}>End</Text>
              <Text style={styles.dateValue}>{formatDisplayDate(dateRange.end)}</Text>
            </View>
          </Pressable>
        </View>
        <Pressable onPress={() => setAppliedRange(dateRange)} style={styles.applyBtn}>
          <Text style={styles.applyText}>Aplicar filtro</Text>
        </Pressable>
        <Text style={styles.count}>{filtered.length} tema(s)</Text>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <>
            <AccordionColumn title="To do" themes={todo} accentColor={colors.outline} />
            <AccordionColumn title="In Progress" themes={inProgress} accentColor={colors.secondary} />
            <AccordionColumn title="Done" themes={done} accentColor={colors.primary} defaultOpen={false} />
          </>
        )}
      </ScrollView>

      <AddThemeFab onPress={() => setAddOpen(true)} />

      {picker ? (
        <DateTimePicker
          value={parseDateInput(dateRange[picker], false) ?? new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onDateChange}
        />
      ) : null}

      <AddThemeModal
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={async (payload) => {
          if (!user) return;
          await createTheme(user.id, payload);
          await reload();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.marginMobile, paddingBottom: 120 },
  periodLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.onSurfaceVariant,
    letterSpacing: 0.5,
    marginBottom: spacing.gapSm,
    paddingHorizontal: 4,
  },
  dateRow: { flexDirection: "row", alignItems: "center", gap: spacing.gapSm, marginBottom: spacing.gapSm },
  dateBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.gapSm,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 8,
    padding: 12,
  },
  dateDivider: { width: 16, height: 1, backgroundColor: colors.outlineVariant },
  dateHint: { fontSize: 10, fontWeight: "700", color: colors.outline, textTransform: "uppercase" },
  dateValue: { fontSize: 14, fontWeight: "600", color: colors.onSurface },
  applyBtn: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  applyText: { color: colors.onPrimary, fontWeight: "600", fontSize: 12 },
  count: { fontSize: 12, color: colors.outline, textAlign: "right", marginBottom: spacing.gapMd },
  error: { color: colors.error, fontSize: 14 },
});
