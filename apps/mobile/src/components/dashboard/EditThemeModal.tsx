import { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import type { DashboardTheme } from "@task-manager/shared";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

type Props = {
  theme: DashboardTheme | null;
  onClose: () => void;
  onSubmit: (themeId: string, payload: { name: string; jiraKey: string; description: string }) => Promise<void>;
};

export function EditThemeModal({ theme, onClose, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [jiraKey, setJiraKey] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (theme) {
      setName(theme.name);
      setJiraKey(theme.jiraKey ?? "");
      setDescription(theme.description ?? "");
    }
  }, [theme]);

  if (!theme) return null;

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert("Campo obrigatório", "Informe o nome do tema.");
      return;
    }
    setSaving(true);
    try {
      await onSubmit(theme!.id, { name, jiraKey, description });
      onClose();
    } catch (err) {
      Alert.alert("Erro", err instanceof Error ? err.message : "Falha ao atualizar tema.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>Editar Tema</Text>

            <Text style={styles.label}>Tema</Text>
            <TextInput value={name} onChangeText={setName} style={styles.input} />

            <Text style={styles.label}>Jira Key</Text>
            <TextInput
              value={jiraKey}
              onChangeText={setJiraKey}
              style={styles.input}
              autoCapitalize="characters"
            />

            <Text style={styles.label}>Descrição</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              multiline
              style={[styles.input, styles.textarea]}
            />

            <View style={styles.actions}>
              <Pressable onPress={onClose} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable onPress={() => void handleSave()} disabled={saving} style={styles.saveBtn}>
                <Text style={styles.saveText}>{saving ? "Salvando..." : "Salvar"}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
  },
  content: {
    padding: spacing.marginMobile,
    paddingBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.onSurface,
    marginBottom: spacing.gapMd,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.onSurfaceVariant,
    marginBottom: 4,
    marginTop: spacing.gapSm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.onSurface,
    backgroundColor: colors.surfaceContainerLow,
  },
  textarea: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.gapSm,
    marginTop: spacing.gapMd,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  cancelText: { fontSize: 14, color: colors.onSurface },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  saveText: { fontSize: 14, fontWeight: "600", color: colors.onPrimary },
});
