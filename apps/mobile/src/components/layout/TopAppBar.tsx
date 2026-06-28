import { View, Text, Pressable, StyleSheet, Image, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { useAuth } from "../../contexts/AuthContext";

type Props = {
  title: string;
  onSearchPress?: () => void;
  rightActions?: React.ReactNode;
};

export function TopAppBar({ title, onSearchPress, rightActions }: Props) {
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;

  function handleAvatarPress() {
    Alert.alert("Conta", user?.email ?? "Usuário", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: () => {
          void signOut().catch((err) => {
            Alert.alert("Erro", err instanceof Error ? err.message : "Falha ao sair.");
          });
        },
      },
    ]);
  }

  return (
    <View style={[styles.bar, { paddingTop: insets.top }]}>
      <View style={styles.row}>
        <View style={styles.left}>
          <Pressable onPress={handleAvatarPress} style={styles.avatar}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
            ) : (
              <MaterialIcons name="person" size={20} color={colors.onSecondaryContainer} />
            )}
          </Pressable>
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.right}>
          {rightActions}
          {onSearchPress ? (
            <Pressable onPress={onSearchPress} style={styles.iconBtn} hitSlop={8}>
              <MaterialIcons name="search" size={24} color={colors.primary} />
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.surface,
  },
  row: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.marginMobile,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.gapMd,
    flex: 1,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.gapSm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondaryContainer,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(188, 201, 201, 0.3)",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.primary,
    letterSpacing: -0.3,
  },
  iconBtn: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
  },
});
