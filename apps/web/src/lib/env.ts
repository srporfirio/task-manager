const required = (key: string): string => {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const env = {
  supabaseUrl: () => required("VITE_SUPABASE_URL"),
  supabaseAnonKey: () => required("VITE_SUPABASE_ANON_KEY"),
  useApiThemes: import.meta.env.VITE_USE_API_THEMES === "true",
  useApiNotes: import.meta.env.VITE_USE_API_NOTES === "true",
  useApiWeekPlan: import.meta.env.VITE_USE_API_WEEK_PLAN === "true",
  useApiViews: import.meta.env.VITE_USE_API_VIEWS === "true",
};
