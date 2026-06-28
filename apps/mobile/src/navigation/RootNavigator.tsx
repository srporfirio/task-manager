import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator, type BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { ThemesProvider } from "../contexts/ThemesContext";
import { LoginScreen } from "../screens/LoginScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { ThemeDetailScreen } from "../screens/ThemeDetailScreen";
import { ThemesScreen } from "../screens/ThemesScreen";
import { WeekPlannerScreen } from "../screens/WeekPlannerScreen";
import { WeekViewScreen } from "../screens/WeekViewScreen";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import type { DashboardStackParamList, MainTabParamList, RootStackParamList } from "./types";

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();

const TAB_ICONS: Record<keyof MainTabParamList, keyof typeof MaterialIcons.glyphMap> = {
  Dashboard: "dashboard",
  Planner: "date-range",
  Themes: "palette",
  Week: "view-column",
};

const TAB_LABELS: Record<keyof MainTabParamList, string> = {
  Dashboard: "Dashboard",
  Planner: "Planner",
  Themes: "Themes",
  Week: "Week",
};

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[tabStyles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = TAB_LABELS[route.name as keyof MainTabParamList];
        const icon = TAB_ICONS[route.name as keyof MainTabParamList];
        const isFocused = state.index === index;

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={() => {
              const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            }}
            style={tabStyles.item}
          >
            <View style={[tabStyles.iconWrap, isFocused && tabStyles.iconWrapActive]}>
              <MaterialIcons
                name={icon}
                size={24}
                color={isFocused ? colors.onSecondaryContainer : colors.onSurfaceVariant}
              />
            </View>
            <Text style={[tabStyles.label, isFocused && tabStyles.labelActive]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function DashboardStackNavigator() {
  return (
    <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
      <DashboardStack.Screen name="DashboardHome" component={DashboardScreen} />
      <DashboardStack.Screen name="ThemeDetail" component={ThemeDetailScreen} />
    </DashboardStack.Navigator>
  );
}

function MainTabs() {
  return (
    <ThemesProvider>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen name="Dashboard" component={DashboardStackNavigator} />
        <Tab.Screen name="Planner" component={WeekPlannerScreen} />
        <Tab.Screen name="Themes" component={ThemesScreen} />
        <Tab.Screen name="Week" component={WeekViewScreen} />
      </Tab.Navigator>
    </ThemesProvider>
  );
}

function RootNavigator() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={tabStyles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {session ? (
        <RootStack.Screen name="Main" component={MainTabs} />
      ) : (
        <RootStack.Screen name="Login" component={LoginScreen} />
      )}
    </RootStack.Navigator>
  );
}

export function AppNavigation() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}

const tabStyles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    minHeight: spacing.bottomNavHeight,
    backgroundColor: colors.surfaceContainer,
    borderTopWidth: 1,
    borderTopColor: "rgba(188, 201, 201, 0.3)",
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "space-around",
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: {
    paddingHorizontal: 20,
    paddingVertical: 4,
    borderRadius: 999,
  },
  iconWrapActive: {
    backgroundColor: colors.secondaryContainer,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  labelActive: {
    color: colors.primary,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
