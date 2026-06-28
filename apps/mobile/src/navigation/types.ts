import type { NavigatorScreenParams } from "@react-navigation/native";

export type DashboardStackParamList = {
  DashboardHome: undefined;
  ThemeDetail: { themeId: string };
};

export type MainTabParamList = {
  Dashboard: NavigatorScreenParams<DashboardStackParamList>;
  Planner: undefined;
  Themes: undefined;
  Week: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
