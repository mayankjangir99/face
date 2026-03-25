import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Camera, LayoutDashboard, LogOut, Menu, ShieldCheck, Users, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const navigation = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'teacher'] },
  { to: '/recognition', label: 'Recognition', icon: Camera, roles: ['admin', 'teacher'] },
  { to: '/students', label: 'Students', icon: Users, roles: ['admin'] }
];

const AppShell = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const visibleNavigation = navigation.filter((item) => item.roles.includes(user.role));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl gap-4 lg:grid-cols-[280px_1fr]">
        <aside
          className={`fixed inset-y-4 left-4 z-40 w-[280px] rounded-[2rem] border border-white/20 bg-white/80 p-6 shadow-soft backdrop-blur-xl transition duration-300 dark:border-white/10 dark:bg-slate-900/80 lg:static lg:translate-x-0 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-[120%]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600 dark:text-sky-300">VisionID</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight">Attendance Console</h1>
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="rounded-full border border-slate-200 p-2 lg:hidden dark:border-slate-700"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="mt-8 rounded-3xl bg-gradient-to-br from-sky-500/20 via-cyan-500/10 to-emerald-500/10 p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-slate-950/90 p-3 text-white dark:bg-white/10">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-300">{user.role}</p>
              </div>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            {visibleNavigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-slate-950 text-white shadow-lg dark:bg-sky-500 dark:text-slate-950'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  <Icon className="size-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="soft-button mt-8 w-full rounded-2xl border border-slate-200 bg-white/70 text-slate-700 hover:bg-white dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100"
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </aside>

        {mobileOpen ? (
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
            aria-label="Close navigation overlay"
          />
        ) : null}

        <div className="min-w-0">
          <header className="surface-panel mb-4 flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-500 dark:text-slate-400">Face Recognition Attendance</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Live recognition, analytics, exports, and admin controls from a single interface.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="soft-button rounded-full border border-slate-200 bg-white/80 p-3 text-slate-700 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100 lg:hidden"
              >
                <Menu className="size-4" />
              </button>
            </div>
          </header>

          <main className="space-y-4">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppShell;
