/*
 * Dashboard hero per spec §7.2: streak flame + daily goal ring + Continue
 * Lesson CTA; quick-start chips; mini weak-key heatmap; recent sessions.
 */
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Code2, Keyboard as KeyboardIcon } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StreakFlame } from '../components/gamification/StreakFlame';
import { DailyGoalRing } from '../components/gamification/DailyGoalRing';
import { useProgressStore } from '../store/useProgressStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { CURRICULUM } from '../data/curriculum';
import { nextSuggestedLesson } from '../engine/progression';
import { isStreakAtRisk } from '../engine/streaks';
import { KeyHeatmap } from '../components/charts/KeyHeatmap';

export default function Dashboard() {
  const progress = useProgressStore((s) => s.progress);
  const dailyGoal = useSettingsStore((s) => s.settings.dailyGoalMinutes);
  const next = nextSuggestedLesson(CURRICULUM, progress.lessonsCompleted);
  const atRisk = isStreakAtRisk(progress.streak, dailyGoal);
  const recent = [...progress.history].reverse().slice(0, 3);

  return (
    <div className="space-y-8">
      <Card elevated className="relative overflow-hidden">
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-8">
          <div className="flex flex-wrap items-center gap-8">
            <StreakFlame
              current={progress.streak.current}
              longest={progress.streak.longest}
              atRisk={atRisk}
            />
            <DailyGoalRing
              todayMinutes={progress.streak.todayMinutes}
              goalMinutes={dailyGoal}
            />
          </div>
          {next ? (
            <Link to={`/lesson/${next.id}`}>
              <Button size="lg" rightIcon={<ArrowRight size={16} />}>
                Continue: {next.title}
              </Button>
            </Link>
          ) : (
            <Link to="/practice">
              <Button size="lg" rightIcon={<ArrowRight size={16} />}>
                Free practice
              </Button>
            </Link>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <QuickChip
          to="/practice"
          eyebrow="Random quotes"
          title="Free practice"
          icon={<KeyboardIcon size={18} className="text-brand-500" />}
        />
        <QuickChip
          to="/code"
          eyebrow="JS, TS, Python"
          title="Code mode"
          icon={<Code2 size={18} className="text-brand-500" />}
        />
        <QuickChip
          to="/stats?drill=1"
          eyebrow="Adaptive session"
          title="Drill weak spots"
          icon={<BarChart3 size={18} className="text-brand-500" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card elevated>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">Per-key strength</h2>
            <Link
              to="/stats"
              className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-600 hover:text-brand-700"
            >
              View full stats →
            </Link>
          </div>
          <KeyHeatmap perKey={progress.weakness.perKey} />
        </Card>

        <Card elevated>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">Recent sessions</h2>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-muted">
              Complete your first session to start tracking results here.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm"
                >
                  <div className="text-muted">
                    {new Date(s.startedAt).toLocaleString()} ·{' '}
                    <span className="text-ink">{s.mode}</span>
                  </div>
                  <div className="flex gap-3 font-mono tabular-nums text-ink">
                    <span>{Math.round(s.wpm)} wpm</span>
                    <span className="text-muted">{Math.round(s.accuracy * 100)}%</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function QuickChip({
  to,
  eyebrow,
  title,
  icon,
}: {
  to: string;
  eyebrow: string;
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      // p-6 (24px) on all sides — every interior child (eyebrow, title, icon)
      // gets the same breathing room from every card edge. The raw `card`
      // class is presentational only (background/border/shadow) and ships
      // with no padding, so we add it here.
      className="card group block p-6 transition-transform duration-200 ease-pop hover:-translate-y-0.5"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-600">
            {eyebrow}
          </div>
          <span className="mt-1 block text-lg font-semibold text-ink">{title}</span>
        </div>
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50">
          {icon}
        </div>
      </div>
    </Link>
  );
}
