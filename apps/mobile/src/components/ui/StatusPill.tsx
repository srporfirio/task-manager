import { View, Text, StyleSheet } from "react-native";
import { statusPillStyle } from "../../lib/status-styles";

type Props = {
  status: string;
  compact?: boolean;
};

export function StatusPill({ status, compact }: Props) {
  const { bg, text } = statusPillStyle(status);
  return (
    <View style={[styles.pill, { backgroundColor: bg }, compact && styles.compact]}>
      <Text style={[styles.text, { color: text }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  compact: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
