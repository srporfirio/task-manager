import { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { filterAndSortThemes } from "@task-manager/shared";
import { useThemes } from "../contexts/ThemesContext";
import { TopAppBar } from "../components/layout/TopAppBar";
import { FilterChips, type StatusFilter } from "../components/dashboard/FilterChips";
import { DashboardThemeCard } from "../components/dashboard/DashboardThemeCard";
import { AddThemeModal } from "../components/dashboard/AddThemeModal";
import { AddThemeFab } from "../components/dashboard/AddThemeFab";
import { createTheme } from "../lib/hybrid-adapter";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import type { DashboardStackParamList } from "../navigation/types";
import type { WeekPlanFilter } from "@task-manager/shared";

export function DashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<DashboardStackParamList>>();
  const { themes, loading, error, reload, user } = useThemes();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [weekPlan, setWeekPlan] = useState<WeekPlanFilter>("ALL");
  const [addOpen, setAddOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const filtered = useMemo(
    () =>
      filterAndSortThemes(themes, {
        statusFilter: status,
        weekPlanFilter: weekPlan,
        search,
        sortMode: "update_desc",
      }),
    [themes, status, weekPlan, search],
  );

  function toggleWeekPlan() {
    setWeekPlan((prev) => (prev === "PLANNED" ? "ALL" : "PLANNED"));
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
    >
      <TopAppBar title="Backlog" onSearchPress={() => setSearchFocused(true)} />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.searchWrap}>
          <MaterialIcons name="search" size={20} color={colors.outline} style={styles.searchIcon} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search tasks, themes, or keys..."
            placeholderTextColor={colors.outline}
            style={[styles.searchInput, searchFocused && styles.searchFocused]}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </View>

        <FilterChips
          status={status}
          weekPlan={weekPlan}
          onStatusChange={setStatus}
          onWeekPlanToggle={toggleWeekPlan}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Themes</Text>
          <Text style={styles.viewAll}>{filtered.length} tema(s)</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nenhuma iniciativa encontrada. Adicione um novo tema.</Text>
          </View>
        ) : (
          filtered.map((theme) => (
            <DashboardThemeCard
              key={theme.id}
              theme={theme}
              onPress={() => navigation.navigate("ThemeDetail", { themeId: theme.id })}
            />
          ))
        )}
      </ScrollView>

      <AddThemeFab onPress={() => setAddOpen(true)} />
      <AddThemeModal
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={async (payload) => {
          if (!user) return;
          await createTheme(user.id, payload);
          await reload();
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.gapMd,
    paddingBottom: 120,
  },
  searchWrap: {
    position: "relative",
    marginBottom: spacing.gapMd,
  },
  searchIcon: {
    position: "absolute",
    left: 16,
    top: 14,
    zIndex: 1,
  },
  searchInput: {
    height: 48,
    backgroundColor: colors.surfaceContainerLow,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingLeft: 44,
    paddingRight: 16,
    fontSize: 14,
    color: colors.onSurface,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  searchFocused: {
    borderBottomColor: colors.primary,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.gapMd,
    marginBottom: spacing.gapMd,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.onSurface,
  },
  viewAll: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  empty: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.marginMobile,
  },
  emptyText: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  error: {
    color: colors.error,
    fontSize: 14,
    marginTop: 8,
  },
});
