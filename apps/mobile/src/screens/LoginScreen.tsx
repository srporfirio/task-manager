import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

export function LoginScreen() {
  const { signInWithGoogle, initError } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      Alert.alert("Login", err instanceof Error ? err.message : "Falha ao entrar com Google.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.brand}>
        <View style={styles.logo}>
          <MaterialIcons name="view-list" size={40} color={colors.onPrimary} />
        </View>
        <Text style={styles.title}>Diário de Atividades</Text>
        <Text style={styles.subtitle}>Organize temas, notas e o plano da semana.</Text>
      </View>

      {initError ? (
        <Text style={styles.configError}>{initError}</Text>
      ) : null}

      <Pressable
        onPress={() => void handleLogin()}
        disabled={loading}
        style={({ pressed }) => [styles.googleBtn, pressed && styles.pressed, loading && styles.disabled]}
      >
        {loading ? (
          <ActivityIndicator color={colors.onSurface} />
        ) : (
          <>
            <MaterialIcons name="login" size={22} color={colors.primary} />
            <Text style={styles.googleText}>Entrar com Google</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    padding: spacing.marginMobile,
  },
  brand: {
    alignItems: "center",
    marginBottom: 48,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.gapMd,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: spacing.gapSm,
  },
  subtitle: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 20,
  },
  configError: {
    fontSize: 13,
    color: colors.error,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 18,
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.gapSm,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 12,
    paddingVertical: 14,
  },
  googleText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.onSurface,
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.6 },
});
