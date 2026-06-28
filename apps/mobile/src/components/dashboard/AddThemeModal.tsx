import { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
} from "react-native";
import { THEME_STATUSES } from "../../lib/status-styles";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

type FormState = {
  name: string;
  status: string;
  jiraKey: string;
  description: string;
  notesText: string;
  addToWeekPlan: boolean;
  addMore: boolean;
};

const emptyForm: FormState = {
  name: "",
  status: "To do",
  jiraKey: "",
  description: "",
  notesText: "",
  addToWeekPlan: false,
  addMore: false,
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: Omit<FormState, "addMore">) => Promise<void>;
};

export function AddThemeModal({ visible, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) setForm(emptyForm);
  }, [visible]);

  async function handleSave() {
    if (!form.name.trim()) {
      Alert.alert("Campo obrigatório", "Informe o nome do tema.");
      return;
    }
    setSaving(true);
    try {
      const { addMore, ...payload } = form;
      await onSubmit(payload);
      if (addMore) {
        setForm({ ...emptyForm, addMore: true });
      } else {
        onClose();
      }
    } catch (err) {
      Alert.alert("Erro", err instanceof Error ? err.message : "Falha ao criar tema.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>Adicionar Tema</Text>

            <Text style={styles.label}>Tema</Text>
            <TextInput
              value={form.name}
              onChangeText={(name) => setForm((f) => ({ ...f, name }))}
              placeholder="Ex.: KPI enhancements"
              style={styles.input}
            />

            <Text style={styles.label}>Status</Text>
            <View style={styles.statusRow}>
              {THEME_STATUSES.map((s) => (
                <Pressable
                  key={s}
                  onPress={() => setForm((f) => ({ ...f, status: s }))}
                  style={[styles.statusChip, form.status === s && styles.statusChipActive]}
                >
                  <Text style={[styles.statusChipText, form.status === s && styles.statusChipTextActive]}>
                    {s}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Jira Key (opcional)</Text>
            <TextInput
              value={form.jiraKey}
              onChangeText={(jiraKey) => setForm((f) => ({ ...f, jiraKey }))}
              placeholder="BEESOT-68606"
              style={styles.input}
              autoCapitalize="characters"
            />

            <Text style={styles.label}>Descrição (opcional)</Text>
            <TextInput
              value={form.description}
              onChangeText={(description) => setForm((f) => ({ ...f, description }))}
              multiline
              style={[styles.input, styles.textarea]}
            />

            <Text style={styles.label}>Notas (separe com linha em branco)</Text>
            <TextInput
              value={form.notesText}
              onChangeText={(notesText) => setForm((f) => ({ ...f, notesText }))}
              multiline
              style={[styles.input, styles.textareaLg]}
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Adicionar ao plano da semana</Text>
              <Switch
                value={form.addToWeekPlan}
                onValueChange={(addToWeekPlan) => setForm((f) => ({ ...f, addToWeekPlan }))}
                trackColor={{ true: colors.primaryContainer }}
              />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Adicionar mais temas</Text>
              <Switch
                value={form.addMore}
                onValueChange={(addMore) => setForm((f) => ({ ...f, addMore }))}
                trackColor={{ true: colors.primaryContainer }}
              />
            </View>

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
    maxHeight: "92%",
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
    minHeight: 72,
    textAlignVertical: "top",
  },
  textareaLg: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.gapSm,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  statusChipActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryContainer,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.onSurfaceVariant,
  },
  statusChipTextActive: {
    color: colors.onPrimaryContainer,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.gapMd,
  },
  switchLabel: {
    fontSize: 14,
    color: colors.onSurface,
    flex: 1,
    marginRight: spacing.gapMd,
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
  cancelText: {
    fontSize: 14,
    color: colors.onSurface,
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  saveText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.onPrimary,
  },
});
