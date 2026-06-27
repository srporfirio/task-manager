import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { formatWeekPeriod, getWeekRange } from "@task-manager/shared";

export default function App() {
  const { monday, sunday } = getWeekRange();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Diário de Atividades</Text>
      <Text style={styles.subtitle}>React Native · Android</Text>
      <Text style={styles.meta}>{formatWeekPeriod(monday, sunday)}</Text>
      <Text style={styles.hint}>@task-manager/shared conectado ao monorepo.</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafb",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#006768",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#3d4949",
    marginBottom: 16,
  },
  meta: {
    fontSize: 13,
    color: "#6d7979",
    marginBottom: 24,
  },
  hint: {
    fontSize: 12,
    color: "#6d7979",
    textAlign: "center",
  },
});
