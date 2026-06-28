import { Component, type ErrorInfo, type ReactNode } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("App crash:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.root}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>Erro ao iniciar</Text>
            <Text style={styles.message}>{this.state.error.message}</Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.marginMobile, paddingTop: 48 },
  title: { fontSize: 20, fontWeight: "700", color: colors.error, marginBottom: 12 },
  message: { fontSize: 14, color: colors.onSurface, lineHeight: 22 },
});
