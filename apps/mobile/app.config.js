/** @type {import('expo/config').ExpoConfig} */
const base = require("./app.json").expo;

const isDevClientBuild = process.env.EAS_BUILD_PROFILE === "development";

module.exports = {
  expo: {
    ...base,
    plugins: [
      ...(isDevClientBuild ? ["expo-dev-client"] : []),
      "@react-native-google-signin/google-signin",
      "expo-web-browser",
      "expo-font",
      "expo-sharing",
      "@react-native-community/datetimepicker",
    ],
    extra: {
      ...base.extra,
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
      googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "",
    },
  },
};
