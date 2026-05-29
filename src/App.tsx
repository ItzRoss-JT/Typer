/*
 * App entry: hydrates stores, then renders the React Router shell. Routes
 * are lazy-loaded so first-paint isn't blocked by the full bundle.
 */
import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useHydration } from './lib/hooks/useHydration';
import { useTheme } from './lib/hooks/useTheme';
import { useSettingsStore } from './store/useSettingsStore';
import { AppShell } from './components/AppShell';

const Dashboard = lazy(() => import('./routes/Dashboard'));
const LessonMap = lazy(() => import('./routes/LessonMap'));
const LessonPlayer = lazy(() => import('./routes/LessonPlayer'));
const Practice = lazy(() => import('./routes/Practice'));
const CodeMode = lazy(() => import('./routes/CodeMode'));
const Stats = lazy(() => import('./routes/Stats'));
const Settings = lazy(() => import('./routes/Settings'));
const Onboarding = lazy(() => import('./routes/Onboarding'));

export default function App() {
  const hydrated = useHydration();
  useTheme();
  if (!hydrated) {
    return (
      <div className="bg-warm-mesh flex min-h-screen items-center justify-center">
        <div className="font-mono text-sm uppercase tracking-[0.2em] text-brand-600">Loading…</div>
      </div>
    );
  }
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HomeRedirect />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/lessons" element={<LessonMap />} />
            <Route path="/lesson/:id" element={<LessonPlayer />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/code" element={<CodeMode />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

function HomeRedirect() {
  const onboarded = useSettingsStore((s) => s.settings.onboardingCompleted);
  return <Navigate to={onboarded ? '/dashboard' : '/onboarding'} replace />;
}

function RouteFallback() {
  return (
    <div className="bg-warm-mesh flex min-h-screen items-center justify-center">
      <div className="font-mono text-sm uppercase tracking-[0.2em] text-brand-600">Loading…</div>
    </div>
  );
}
