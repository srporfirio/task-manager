import { useFonts, Inter_400Regular, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { HankenGrotesk_600SemiBold, HankenGrotesk_800ExtraBold } from "@expo-google-fonts/hanken-grotesk";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/contexts/AuthContext";
import { ErrorBoundary } from "./src/components/ErrorBoundary";
import { AppNavigation } from "./src/navigation/RootNavigator";
import { colors } from "./src/theme/colors";

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_800ExtraBold,
  });

  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <AuthProvider>
            <AppNavigation />
            <StatusBar style="dark" />
          </AuthProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
