import { useMemo } from "react";
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
  filterThemesWithWeekActivity,
  formatWeekPeriod,
  getNotesInWeekRange,
  getWeekRange,
  partitionThemesByStatus,
} from "@task-manager/shared";
import { useThemes } from "../contexts/ThemesContext";
import { TopAppBar } from "../components/layout/TopAppBar";
import { ThemeBoardCard } from "../components/views/ThemeBoardCard";
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
  const { themes, loading, error } = useThemes();
  const weekRange = useMemo(() => getWeekRange(), []);

  const filtered = useMemo(
    () => filterThemesWithWeekActivity(themes, weekRange.monday, weekRange.sunday),
    [themes, weekRange],
  );

  const { done, inProgress, todo } = useMemo(() => partitionThemesByStatus(filtered), [filtered]);

  const completedNotes = filtered.reduce(
    (acc, t) => acc + getNotesInWeekRange(t.notes, weekRange.monday, weekRange.sunday).length,
    0,
  );
  const pendingThemes = todo.length + inProgress.length;
  const efficiency = filtered.length ? Math.round((done.length / filtered.length) * 100) : 0;

  const getWeekNotes = (theme: (typeof filtered)[number]) =>
    getNotesInWeekRange(theme.notes, weekRange.monday, weekRange.sunday);

  const printSections = useMemo(
    () =>
      buildPrintSections(filtered, {
        showNotes: true,
        monday: weekRange.monday,
        sunday: weekRange.sunday,
      }),
    [filtered, weekRange],
  );

  async function handleExportPdf() {
    try {
      await exportPdfReport(
        "Week View",
        formatWeekPeriod(weekRange.monday, weekRange.sunday),
        `${filtered.length} tema(s) atualizado(s) na semana.`,
        printSections,
      );
    } catch (err) {
      Alert.alert("PDF", err instanceof Error ? err.message : "Falha ao exportar PDF.");
    }
  }

  return (
    <View style={styles.root}>
      <TopAppBar title="Week View" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.periodRow}>
          <View>
            <Text style={styles.periodLabel}>Current Period</Text>
            <Text style={styles.period}>{formatWeekPeriod(weekRange.monday, weekRange.sunday)}</Text>
          </View>
          <Pressable onPress={() => void handleExportPdf()} style={styles.exportBtn}>
            <MaterialIcons name="picture-as-pdf" size={18} color={colors.onPrimary} />
            <Text style={styles.exportText}>Export PDF</Text>
          </Pressable>
        </View>

        <View style={styles.bentoLarge}>
          <Text style={styles.bentoLabel}>Weekly Efficiency</Text>
          <View style={styles.progressRow}>
            <Text style={styles.efficiency}>{efficiency}%</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${efficiency}%` }]} />
            </View>
          </View>
        </View>

        <View style={styles.bentoRow}>
          <View style={[styles.bentoSquare, { backgroundColor: colors.secondaryFixed }]}>
            <MaterialIcons name="task-alt" size={24} color={colors.onSecondaryFixed} />
            <Text style={[styles.bentoNumber, { color: colors.onSecondaryFixed }]}>{completedNotes}</Text>
            <Text style={[styles.bentoSub, { color: colors.onSecondaryFixedVariant }]}>Completed</Text>
          </View>
          <View style={[styles.bentoSquare, { backgroundColor: colors.tertiaryFixed }]}>
            <MaterialIcons name="pending" size={24} color={colors.onTertiaryFixed} />
            <Text style={[styles.bentoNumber, { color: colors.onTertiaryFixed }]}>{pendingThemes}</Text>
            <Text style={[styles.bentoSub, { color: colors.onTertiaryFixedVariant }]}>Pending</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <>
            <SectionHeader label="Done" bg={colors.primaryContainer} text={colors.onPrimaryContainer} />
            {done.length === 0 ? (
              <Text style={styles.empty}>Sem itens concluídos.</Text>
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
                <ThemeBoardCard
                  key={theme.id}
                  theme={theme}
                  variant="week"
                  weekNotes={getWeekNotes(theme)}
                />
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
  periodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.gapMd,
    gap: spacing.gapSm,
  },
  periodLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  period: { fontSize: 20, fontWeight: "600", color: colors.onSurface, marginTop: 4 },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  exportText: { color: colors.onPrimary, fontSize: 12, fontWeight: "600" },
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
