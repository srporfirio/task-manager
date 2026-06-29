import { useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

const LOGIN_CARD_BG = "#e5e7eb";

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
      <View style={styles.card}>
        <View style={styles.brand}>
          <Image
            source={require("../../assets/logo-diario.png")}
            style={styles.logo}
            accessibilityLabel="Diário de Atividades"
            resizeMode="contain"
          />
          <Text style={styles.title}>Diário de Atividades</Text>
          <Text style={styles.subtitle}>
            Entre com Google para sincronizar seus temas entre dispositivos.
          </Text>
        </View>

        {initError ? <Text style={styles.configError}>{initError}</Text> : null}

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
  card: {
    width: "100%",
    maxWidth: 448,
    alignSelf: "center",
    backgroundColor: LOGIN_CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 32,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  brand: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 200,
    height: 64,
    marginBottom: spacing.gapMd,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: spacing.gapSm,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#475569",
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
    backgroundColor: "#0f172a",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  googleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.6 },
});
