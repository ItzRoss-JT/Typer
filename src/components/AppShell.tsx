/*
 * Top-level visual shell: persistent nav bar at top, content area below,
 * warm-mesh background + faint grain texture for atmosphere.
 *
 * The nav is hidden on the typing routes (LessonPlayer, Practice, CodeMode)
 * so the user isn't distracted while typing.
 */
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { BarChart3, BookOpen, Code2, Home, Keyboard as KeyboardIcon, Settings as SettingsIcon } from 'lucide-react';
import { BadgeToastHost } from './gamification/BadgeToastHost';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/lessons', label: 'Lessons', icon: BookOpen },
  { to: '/practice', label: 'Practice', icon: KeyboardIcon },
  { to: '/code', label: 'Code', icon: Code2 },
  { to: '/stats', label: 'Stats', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

const HIDE_NAV_PREFIXES = ['/lesson/', '/onboarding'];

export function AppShell() {
  const location = useLocation();
  const hideNav = HIDE_NAV_PREFIXES.some((p) => location.pathname.startsWith(p));

  return (
    <div className="bg-warm-mesh relative min-h-screen overflow-x-hidden">
      <div className="bg-grain absolute inset-0" />
      {hideNav ? null : (
        <nav className="relative z-20 border-b border-border/60 bg-bg/70 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <NavLink to="/dashboard" className="inline-flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500 text-white font-mono text-lg font-bold shadow-card">
                T
              </span>
              <span className="font-mono text-sm font-semibold uppercase tracking-[0.15em] text-ink">
                Typer
              </span>
            </NavLink>
            <ul className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        [
                          'inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-[background-color,color,transform] duration-150 ease-standard',
                          isActive
                            ? 'bg-brand-100 text-brand-700'
                            : 'text-muted hover:bg-elevated hover:text-ink',
                        ].join(' ')
                      }
                    >
                      <Icon size={16} />
                      <span className="hidden sm:inline">{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      )}
      <main className="relative z-10 mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
      <BadgeToastHost />
    </div>
  );
}
