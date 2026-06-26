import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/week-planner", label: "Week Planner" },
  { to: "/theme-view", label: "Theme View" },
  { to: "/week-view", label: "Week View" },
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
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-[260px] shrink-0 bg-slate-200 border-r border-slate-300 flex flex-col p-4">
        <div className="px-2 py-3 mb-4">
          <img src="/logo-diario.png" alt="" className="h-12 w-auto max-w-[200px] object-contain" />
        </div>
        <nav className="flex flex-col gap-1 flex-grow">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-blue-100 text-blue-800" : "text-slate-700 hover:bg-slate-300/60"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t border-slate-300 pt-4 space-y-2">
          <p className="px-2 text-xs text-slate-600 truncate" title={user?.email ?? ""}>
            {user?.email}
          </p>
          <a
            href="/legacy/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-2 text-xs text-slate-600 underline hover:text-slate-900"
          >
            Modo local (HTML)
          </a>
          <button
            type="button"
            onClick={() => void signOut()}
            className="w-full text-left px-2 text-xs text-slate-600 hover:text-slate-900"
          >
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-40 bg-slate-50 border-b border-slate-200 h-16 flex items-center px-6">
          <h1 className="text-lg font-bold text-blue-800">{title}</h1>
        </header>
        <div className="flex-1 p-6 max-w-6xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
