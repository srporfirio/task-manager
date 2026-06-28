import { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import {
  buildPrintSections,
  formatWeekPeriod,
  getWeekRange,
  type DashboardTheme,
} from "@task-manager/shared";
import { useThemes } from "../contexts/ThemesContext";
import { TopAppBar } from "../components/layout/TopAppBar";
import { ThemeBoardCard } from "../components/views/ThemeBoardCard";
import {
  hybridAddToWeekPlan,
  hybridFetchPlannedThemes,
  hybridRemoveFromWeekPlan,
} from "../lib/hybrid-adapter";
import { exportPdfReport } from "../lib/pdf-export";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

export function WeekPlannerScreen() {
  const { themes, loading, error, reload, user } = useThemes();
  const [planned, setPlanned] = useState<DashboardTheme[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
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

  const availableThemes = useMemo(() => {
    const plannedIds = new Set(planned.map((t) => t.id));
    return themes.filter((t) => !plannedIds.has(t.id));
  }, [themes, planned]);

  const doneCount = planned.filter((t) => t.status === "Done").length;
  const progressPct = planned.length ? Math.round((doneCount / planned.length) * 100) : 0;

  const printSections = useMemo(
    () =>
      buildPrintSections(planned, {
        showNotes: true,
        monday: weekRange.monday,
        sunday: weekRange.sunday,
      }),
    [planned, weekRange],
  );

  async function handleAdd() {
    if (!user || !selectedThemeId) return;
    setBusy(true);
    setPageError(null);
    try {
      await hybridAddToWeekPlan(user.id, selectedThemeId);
      await reload();
      await loadPlanned();
      setAddOpen(false);
      setSelectedThemeId(null);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : "Falha ao adicionar tema.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(themeId: string) {
    if (!user) return;
    setBusy(true);
    setPageError(null);
    try {
      await hybridRemoveFromWeekPlan(user.id, themeId);
      await reload();
      await loadPlanned();
    } catch (err) {
      setPageError(err instanceof Error ? err.message : "Falha ao remover tema.");
    } finally {
      setBusy(false);
    }
  }

  async function handleExportPdf() {
    try {
      await exportPdfReport(
        "Week Planner",
        formatWeekPeriod(weekRange.monday, weekRange.sunday),
        `${planned.length} tema(s) planejado(s).`,
        printSections,
      );
    } catch (err) {
      Alert.alert("PDF", err instanceof Error ? err.message : "Falha ao exportar PDF.");
    }
  }

  return (
    <View style={styles.root}>
      <TopAppBar
        title="Week Planner"
        rightActions={
          <Pressable onPress={() => void handleExportPdf()} style={styles.iconBtn} hitSlop={8}>
            <MaterialIcons name="picture-as-pdf" size={24} color={colors.primary} />
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.period}>{formatWeekPeriod(weekRange.monday, weekRange.sunday)}</Text>
        <View style={styles.summaryRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{planned.length} temas planejados</Text>
          </View>
          <Text style={styles.progress}>{progressPct}% concluído</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : error || pageError ? (
          <Text style={styles.error}>{error ?? pageError}</Text>
        ) : planned.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nenhum tema planejado para esta semana.</Text>
          </View>
        ) : (
          planned.map((theme) => (
            <ThemeBoardCard
              key={theme.id}
              theme={theme}
              variant="planner"
              onRemove={() => void handleRemove(theme.id)}
            />
          ))
        )}

        <Pressable
          onPress={() => setAddOpen(true)}
          disabled={busy || availableThemes.length === 0}
          style={[styles.addCard, (busy || availableThemes.length === 0) && styles.addDisabled]}
        >
          <MaterialIcons name="add-circle-outline" size={22} color={colors.onSurfaceVariant} />
          <Text style={styles.addText}>Add Theme</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={addOpen} transparent animationType="fade" onRequestClose={() => setAddOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Adicionar ao plano</Text>
            <ScrollView style={{ maxHeight: 280 }}>
              {availableThemes.map((theme) => (
                <Pressable
                  key={theme.id}
                  onPress={() => setSelectedThemeId(theme.id)}
                  style={[styles.themeOption, selectedThemeId === theme.id && styles.themeOptionActive]}
                >
                  <Text style={styles.themeOptionText}>{theme.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <View style={styles.modalActions}>
              <Pressable onPress={() => setAddOpen(false)} style={styles.cancelBtn}>
                <Text>Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={() => void handleAdd()}
                disabled={!selectedThemeId || busy}
                style={[styles.confirmBtn, (!selectedThemeId || busy) && styles.addDisabled]}
              >
                <Text style={styles.confirmText}>Adicionar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.marginMobile, paddingBottom: 100 },
  iconBtn: { padding: 8 },
  period: { fontSize: 20, fontWeight: "600", color: colors.onSurface, marginBottom: spacing.gapSm },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: spacing.gapSm, marginBottom: spacing.gapMd },
  badge: {
    backgroundColor: colors.secondaryFixed,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { fontSize: 12, fontWeight: "600", color: colors.onSecondaryFixed },
  progress: { fontSize: 12, color: colors.onSurfaceVariant },
  empty: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.outlineVariant,
    borderRadius: 12,
    padding: spacing.marginMobile,
    marginBottom: spacing.gapMd,
  },
  emptyText: { textAlign: "center", color: colors.outline, fontSize: 14 },
  error: { color: colors.error, marginBottom: spacing.gapSm },
  addCard: {
    marginTop: spacing.gapMd,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.outlineVariant,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.gapSm,
  },
  addDisabled: { opacity: 0.5 },
  addText: { fontSize: 18, fontWeight: "600", color: colors.onSurfaceVariant },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: spacing.marginMobile,
  },
  modalSheet: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    padding: spacing.marginMobile,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: colors.primary, marginBottom: spacing.gapMd },
  themeOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginBottom: spacing.gapSm,
  },
  themeOptionActive: { borderColor: colors.primary, backgroundColor: colors.surfaceContainerLow },
  themeOptionText: { fontSize: 14, color: colors.onSurface },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: spacing.gapSm, marginTop: spacing.gapMd },
  cancelBtn: { padding: 10 },
  confirmBtn: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  confirmText: { color: colors.onPrimary, fontWeight: "600" },
});
