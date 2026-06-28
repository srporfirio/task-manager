import { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import { formatDateDisplay } from "@task-manager/shared";
import { useThemes } from "../contexts/ThemesContext";
import { TopAppBar } from "../components/layout/TopAppBar";
import { StatusPill } from "../components/ui/StatusPill";
import { EditThemeModal } from "../components/dashboard/EditThemeModal";
import { addNote, deleteNote, deleteTheme, updateTheme } from "../lib/hybrid-adapter";
import { THEME_STATUSES } from "../lib/status-styles";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import type { DashboardStackParamList } from "../navigation/types";

export function ThemeDetailScreen() {
  const route = useRoute<RouteProp<DashboardStackParamList, "ThemeDetail">>();
  const navigation = useNavigation();
  const { themes, reload, user } = useThemes();
  const theme = useMemo(() => themes.find((t) => t.id === route.params.themeId), [themes, route.params.themeId]);

  const [noteText, setNoteText] = useState("");
  const [noteStatus, setNoteStatus] = useState("To do");
  const [saving, setSaving] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  if (!theme) {
    return (
      <View style={styles.root}>
        <TopAppBar title="Tema" />
        <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
      </View>
    );
  }

  async function handleSaveNote() {
    const text = noteText.trim();
    if (!text) {
      Alert.alert("Nota vazia", "Escreva uma nota antes de salvar.");
      return;
    }
    if (!user) return;
    setSaving(true);
    try {
      await addNote(user.id, theme!.id, { content: text, status: noteStatus });
      setNoteText("");
      await reload();
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteTheme() {
    Alert.alert("Excluir tema", "Excluir este tema e todas as suas notas?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => {
          void (async () => {
            await deleteTheme(theme!.id);
            await reload();
            navigation.goBack();
          })();
        },
      },
    ]);
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
    >
      <TopAppBar title={theme.name} />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
      >
        <View style={styles.header}>
          <Text style={styles.name}>{theme.name}</Text>
          {theme.description ? <Text style={styles.desc}>{theme.description}</Text> : null}
          <View style={styles.metaRow}>
            <StatusPill status={String(theme.status)} />
            {theme.jiraKey ? <Text style={styles.jira}>{theme.jiraKey}</Text> : null}
          </View>
          <Text style={styles.updated}>Última atualização: {formatDateDisplay(theme.lastUpdate)}</Text>

          <View style={styles.actions}>
            <Pressable onPress={() => setEditOpen(true)} style={styles.editBtn}>
              <Text style={styles.editText}>Editar tema</Text>
            </Pressable>
            <Pressable onPress={() => void handleDeleteTheme()} style={styles.deleteBtn}>
              <Text style={styles.deleteText}>Excluir tema</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.notesTitle}>Notas</Text>
        {theme.notes.length === 0 ? (
          <Text style={styles.emptyNotes}>Nenhuma nota ainda.</Text>
        ) : (
          theme.notes.map((note) => (
            <View key={note.id} style={styles.noteCard}>
              <View style={styles.noteHeader}>
                <StatusPill status={note.status} compact />
                <Text style={styles.noteDate}>{formatDateDisplay(note.updatedAt)}</Text>
                <Pressable
                  onPress={() => {
                    Alert.alert("Excluir nota", "Excluir esta nota?", [
                      { text: "Cancelar", style: "cancel" },
                      {
                        text: "Excluir",
                        style: "destructive",
                        onPress: () => void deleteNote(note.id).then(reload),
                      },
                    ]);
                  }}
                >
                  <Text style={styles.deleteNote}>Excluir</Text>
                </Pressable>
              </View>
              <Text style={styles.noteContent}>{note.content}</Text>
            </View>
          ))
        )}

        <View style={styles.compose}>
          <Text style={styles.composeLabel}>Nova nota</Text>
          <TextInput
            value={noteText}
            onChangeText={setNoteText}
            multiline
            placeholder="Escreva uma nova nota..."
            placeholderTextColor={colors.outline}
            style={styles.textarea}
          />
          <Text style={styles.composeLabel}>Status da nota</Text>
          <View style={styles.statusRow}>
            {THEME_STATUSES.map((s) => (
              <Pressable
                key={s}
                onPress={() => setNoteStatus(s)}
                style={[styles.statusChip, noteStatus === s && styles.statusChipActive]}
              >
                <Text style={[styles.statusText, noteStatus === s && styles.statusTextActive]}>{s}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable onPress={() => void handleSaveNote()} disabled={saving} style={styles.saveBtn}>
            <Text style={styles.saveText}>{saving ? "Salvando..." : "Salvar"}</Text>
          </Pressable>
        </View>
      </ScrollView>

      <EditThemeModal
        theme={editOpen ? theme : null}
        onClose={() => setEditOpen(false)}
        onSubmit={async (themeId, payload) => {
          await updateTheme(themeId, payload);
          await reload();
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.marginMobile, paddingBottom: 120 },
  header: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.marginMobile,
    marginBottom: spacing.gapMd,
  },
  name: { fontSize: 20, fontWeight: "700", color: colors.onSurface },
  desc: { fontSize: 14, color: colors.onSurfaceVariant, marginTop: 8 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: spacing.gapSm, marginTop: 12, flexWrap: "wrap" },
  jira: { fontSize: 14, fontWeight: "600", color: colors.secondary },
  updated: { fontSize: 12, color: colors.outline, marginTop: 8 },
  actions: { flexDirection: "row", gap: spacing.gapSm, marginTop: spacing.gapMd },
  editBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  editText: { fontSize: 13, color: colors.secondary },
  deleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.errorContainer,
  },
  deleteText: { fontSize: 13, color: colors.onErrorContainer },
  notesTitle: { fontSize: 16, fontWeight: "600", color: colors.onSurface, marginBottom: spacing.gapSm },
  emptyNotes: { fontSize: 14, color: colors.outline, marginBottom: spacing.gapMd },
  noteCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 8,
    padding: spacing.gapMd,
    marginBottom: spacing.gapSm,
  },
  noteHeader: { flexDirection: "row", alignItems: "center", gap: spacing.gapSm, marginBottom: 8, flexWrap: "wrap" },
  noteDate: { fontSize: 11, color: colors.outline, flex: 1 },
  deleteNote: { fontSize: 12, color: colors.error },
  noteContent: { fontSize: 14, color: colors.onSurface, lineHeight: 20 },
  compose: {
    marginTop: spacing.gapMd,
    paddingTop: spacing.gapMd,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  composeLabel: { fontSize: 12, fontWeight: "600", color: colors.onSurfaceVariant, marginBottom: 4, marginTop: 8 },
  textarea: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.onSurface,
    backgroundColor: colors.surfaceContainerLow,
    textAlignVertical: "top",
  },
  statusRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.gapSm, marginTop: 4 },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  statusChipActive: { backgroundColor: colors.primaryContainer, borderColor: colors.primaryContainer },
  statusText: { fontSize: 12, fontWeight: "600", color: colors.onSurfaceVariant },
  statusTextActive: { color: colors.onPrimaryContainer },
  saveBtn: {
    marginTop: spacing.gapMd,
    alignSelf: "flex-end",
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveText: { color: colors.onPrimary, fontWeight: "600", fontSize: 14 },
});
