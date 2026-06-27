import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemesProvider } from "./contexts/ThemesContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import { AuthCallbackPage } from "./pages/AuthCallbackPage";
import { DashboardPage } from "./pages/DashboardPage";
import { WeekPlannerPage } from "./pages/WeekPlannerPage";
import { ThemeViewPage } from "./pages/ThemeViewPage";
import { WeekViewPage } from "./pages/WeekViewPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route element={<ProtectedRoute />}>
            <Route
              element={
                <ThemesProvider>
                  <AppLayout />
                </ThemesProvider>
              }
            >
              <Route path="/" element={<DashboardPage />} />
              <Route path="/week-planner" element={<WeekPlannerPage />} />
              <Route path="/theme-view" element={<ThemeViewPage />} />
              <Route path="/week-view" element={<WeekViewPage />} />
            </Route>
          </Route>
          <Route path="/onboarding" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
