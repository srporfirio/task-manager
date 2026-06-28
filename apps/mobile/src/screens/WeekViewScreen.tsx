import { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import {
  buildPrintSections,
  computeWeekViewStats,
  filterThemesWithWeekActivity,
  getWeekEfficiencyDisplay,
  formatWeekPeriod,
  getNotesInWeekRange,
  getWeekRange,
  getWeekViewEmptyMessage,
  getWeekViewFilterSummary,
  type DashboardTheme,
  type WeekViewFilterMode,
} from "@task-manager/shared";
import { useThemes } from "../contexts/ThemesContext";
import { TopAppBar } from "../components/layout/TopAppBar";
import { ThemeBoardCard } from "../components/views/ThemeBoardCard";
import { WeekViewFilterChips } from "../components/views/WeekViewFilterChips";
import { hybridFetchPlannedThemes } from "../lib/hybrid-adapter";
import { exportPdfReport } from "../lib/pdf-export";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

function SectionHeader({ label, bg, text }: { label: string; bg: string; text: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionPill, { backgroundColor: bg }]}>
        <Text style={[styles.sectionPillText, { color: text }]}>{label}</Text>
      </View>
      <View style={styles.sectionLine} />
    </View>
  );
}

export function WeekViewScreen() {
  const { themes, loading, error, user } = useThemes();
  const [planned, setPlanned] = useState<DashboardTheme[]>([]);
  const [filterMode, setFilterMode] = useState<WeekViewFilterMode>("week_plan");
  const [pageError, setPageError] = useState<string | null>(null);
  const weekRange = useMemo(() => getWeekRange(), []);

  const loadPlanned = useCallback(async () => {
    if (!user) return;
    const data = await hybridFetchPlannedThemes(user.id);
    setPlanned(data);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    void loadPlanned().catch((err) => {
      setPageError(err instanceof Error ? err.message : "Falha ao carregar plano.");
    });
  }, [user, loadPlanned, themes]);

  const visibleThemes = useMemo(() => {
    if (filterMode === "week_plan") return planned;
    return filterThemesWithWeekActivity(themes, weekRange.monday, weekRange.sunday);
  }, [filterMode, planned, themes, weekRange]);

  const { done, inProgress, todo, completedCount, pendingCount, total } = useMemo(
    () => computeWeekViewStats(visibleThemes),
    [visibleThemes],
  );

  const efficiencyDisplay = useMemo(
    () => getWeekEfficiencyDisplay(completedCount, total),
    [completedCount, total],
  );

  const getWeekNotes = (theme: DashboardTheme) =>
    getNotesInWeekRange(theme.notes, weekRange.monday, weekRange.sunday);

  const printSections = useMemo(
    () =>
      buildPrintSections(visibleThemes, {
        showNotes: true,
        monday: weekRange.monday,
        sunday: weekRange.sunday,
      }),
    [visibleThemes, weekRange],
  );

  const summary = getWeekViewFilterSummary(filterMode, visibleThemes.length);
  const emptyMessage = getWeekViewEmptyMessage(filterMode);

  async function handleExportPdf() {
    try {
      await exportPdfReport(
        "Week View",
        formatWeekPeriod(weekRange.monday, weekRange.sunday),
        summary,
        printSections,
      );
    } catch (err) {
      Alert.alert("PDF", err instanceof Error ? err.message : "Falha ao exportar PDF.");
    }
  }

  return (
    <View style={styles.root}>
      <TopAppBar
        title="Week View"
        rightActions={
          <Pressable onPress={() => void handleExportPdf()} style={styles.iconBtn} hitSlop={8}>
            <MaterialIcons name="picture-as-pdf" size={24} color={colors.primary} />
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.periodLabel}>Current Period</Text>
        <Text style={styles.period}>{formatWeekPeriod(weekRange.monday, weekRange.sunday)}</Text>

        <WeekViewFilterChips mode={filterMode} onChange={setFilterMode} />
        <Text style={styles.planSummary}>{summary}</Text>

        <View style={styles.bentoLarge}>
          <Text style={styles.bentoLabel}>Weekly Efficiency</Text>
          <View style={styles.progressRow}>
            <Text style={styles.efficiency}>{efficiencyDisplay.percentageLabel}</Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: efficiencyDisplay.isEmpty ? "0%" : `${efficiencyDisplay.percentage ?? 0}%` },
                ]}
              />
            </View>
          </View>
          <Text style={styles.efficiencyDetail}>{efficiencyDisplay.detail}</Text>
        </View>

        <View style={styles.bentoRow}>
          <View style={[styles.bentoSquare, { backgroundColor: colors.secondaryFixed }]}>
            <MaterialIcons name="task-alt" size={24} color={colors.onSecondaryFixed} />
            <Text style={[styles.bentoNumber, { color: colors.onSecondaryFixed }]}>{completedCount}</Text>
            <Text style={[styles.bentoSub, { color: colors.onSecondaryFixedVariant }]}>Completed</Text>
          </View>
          <View style={[styles.bentoSquare, { backgroundColor: colors.tertiaryFixed }]}>
            <MaterialIcons name="pending" size={24} color={colors.onTertiaryFixed} />
            <Text style={[styles.bentoNumber, { color: colors.onTertiaryFixed }]}>{pendingCount}</Text>
            <Text style={[styles.bentoSub, { color: colors.onTertiaryFixedVariant }]}>Pending</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
        ) : error || pageError ? (
          <Text style={styles.error}>{error ?? pageError}</Text>
        ) : visibleThemes.length === 0 ? (
          <Text style={styles.empty}>{emptyMessage}</Text>
        ) : (
          <>
            <SectionHeader label="Done" bg={colors.primaryContainer} text={colors.onPrimaryContainer} />
            {done.length === 0 ? (
              <Text style={styles.empty}>Sem temas concluídos.</Text>
            ) : (
              done.map((theme) => (
                <ThemeBoardCard key={theme.id} theme={theme} variant="week" weekNotes={getWeekNotes(theme)} />
              ))
            )}

            <SectionHeader label="In Progress" bg={colors.secondaryFixed} text={colors.onSecondaryFixed} />
            {inProgress.length === 0 ? (
              <Text style={styles.empty}>Nada em progresso.</Text>
            ) : (
              inProgress.map((theme) => (
                <ThemeBoardCard key={theme.id} theme={theme} variant="week" weekNotes={getWeekNotes(theme)} />
              ))
            )}

            <SectionHeader label="To Do" bg={colors.surfaceContainerHighest} text={colors.onSurfaceVariant} />
            {todo.length === 0 ? (
              <Text style={styles.empty}>Nada pendente.</Text>
            ) : (
              todo.map((theme) => (
                <ThemeBoardCard key={theme.id} theme={theme} variant="week" weekNotes={getWeekNotes(theme)} />
              ))
            )}
          </>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Keep the momentum going!</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.marginMobile, paddingBottom: 100 },
  iconBtn: { padding: 8 },
  periodLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  period: { fontSize: 20, fontWeight: "600", color: colors.onSurface, marginTop: 4, marginBottom: spacing.gapSm },
  planSummary: { fontSize: 14, color: colors.onSurfaceVariant, marginBottom: spacing.gapMd },
  bentoLarge: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(188, 201, 201, 0.3)",
    padding: spacing.gapMd,
    marginBottom: 12,
  },
  bentoLabel: { fontSize: 12, color: colors.onSurfaceVariant, marginBottom: 8 },
  progressRow: { flexDirection: "row", alignItems: "flex-end", gap: spacing.gapMd },
  efficiency: { fontSize: 28, fontWeight: "600", color: colors.primary },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: { height: "100%", backgroundColor: colors.primary },
  efficiencyDetail: { fontSize: 12, color: colors.onSurfaceVariant, marginTop: 8 },
  bentoRow: { flexDirection: "row", gap: 12, marginBottom: spacing.gapMd },
  bentoSquare: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(188, 201, 201, 0.3)",
    padding: spacing.gapMd,
    justifyContent: "space-between",
  },
  bentoNumber: { fontSize: 24, fontWeight: "600" },
  bentoSub: { fontSize: 12, fontWeight: "600" },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: spacing.gapXs, marginTop: spacing.gapMd, marginBottom: spacing.gapSm },
  sectionPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  sectionPillText: { fontSize: 12, fontWeight: "600", textTransform: "uppercase" },
  sectionLine: { flex: 1, height: 1, backgroundColor: "rgba(188, 201, 201, 0.3)" },
  empty: { fontSize: 14, color: colors.outline, marginBottom: spacing.gapSm },
  error: { color: colors.error },
  footer: { marginTop: spacing.gapMd, alignItems: "center" },
  footerText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
    backgroundColor: "rgba(247, 250, 249, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(0, 77, 78, 0.2)",
  },
});
