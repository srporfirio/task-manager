import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { UserMenu } from "./UserMenu";

const navItems = [
  { to: "/", label: "Dashboard", icon: "dashboard", end: true },
  { to: "/week-planner", label: "Week Planner", icon: "event_note" },
  { to: "/theme-view", label: "Theme View", icon: "view_kanban" },
  { to: "/week-view", label: "Week View", icon: "calendar_month" },
];

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/week-planner": "Week Planner",
  "/theme-view": "Theme View",
  "/week-view": "Week View",
};

export function AppLayout() {
  const { user, signOut } = useAuth();
  const { pathname } = useLocation();
  const title = pageTitles[pathname] ?? "Diário de Atividades";

  return (
    <div className="min-h-screen flex bg-background text-on-background font-body text-body-md">
      <aside className="w-[260px] shrink-0 bg-[#e5e7eb] flex flex-col py-8 px-4 gap-4">
        <div className="px-2 mb-6">
          <img src="/logo-diario.png" alt="" className="h-12 w-full max-w-[200px] object-contain object-left" />
        </div>
        <nav className="flex flex-col gap-1 flex-grow">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-label-md font-semibold uppercase tracking-wide transition-colors ${
                  isActive
                    ? "bg-secondary-container/20 text-primary font-bold"
                    : "text-on-surface-variant hover:bg-surface-container-highest"
                }`
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col bg-background">
        <header className="sticky top-0 z-40 bg-background border-b border-outline-variant h-16 flex items-center justify-between gap-4 px-margin-page">
          <h1 className="font-headline text-headline-md font-bold text-primary tracking-tight truncate min-w-0">
            {title}
          </h1>
          {user ? <UserMenu user={user} onSignOut={() => void signOut()} /> : null}
        </header>
        <div className="flex-1 p-margin-page max-w-container-max w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
