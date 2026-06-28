import { type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ModalProps,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

type Props = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  animationType?: ModalProps["animationType"];
};

/** Minimum space for Android 3-button navigation bar inside modals. */
const ANDROID_NAV_BAR_FALLBACK = 48;

export function KeyboardFormSheet({
  visible,
  onClose,
  children,
  animationType = "slide",
}: Props) {
  const insets = useSafeAreaInsets();
  const bottomInset =
    Platform.OS === "android" ? Math.max(insets.bottom, ANDROID_NAV_BAR_FALLBACK) : insets.bottom;

  return (
    <Modal visible={visible} animationType={animationType} transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
        >
          <View style={[styles.sheet, { paddingBottom: bottomInset }]}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              automaticallyAdjustKeyboardInsets
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "92%",
  },
  content: {
    padding: spacing.marginMobile,
    paddingTop: spacing.marginMobile,
  },
});
