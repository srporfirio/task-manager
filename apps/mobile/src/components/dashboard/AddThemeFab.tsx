import { Pressable, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

type Props = {
  onPress: () => void;
};

export function AddThemeFab({ onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.fab}
      accessibilityRole="button"
      accessibilityLabel="Adicionar tema"
    >
      <MaterialIcons name="add" size={28} color={colors.onPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: spacing.fabOffset,
    bottom: spacing.fabOffset + spacing.bottomNavHeight,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
});
