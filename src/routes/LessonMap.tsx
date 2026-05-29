/*
 * Curriculum overview. Each unit is a card; each lesson within a unit is a
 * pill node. Locked = greyscale + lock icon; unlocked = colored; cleared =
 * colored + checkmark + best WPM.
 */
import { Link } from 'react-router-dom';
import { Check, Lock } from 'lucide-react';
import { CURRICULUM } from '../data/curriculum';
import type { Lesson, UserProgress } from '../types';
import { useProgressStore } from '../store/useProgressStore';
import { isUnlocked } from '../engine/progression';
import { useMemo } from 'react';

const UNIT_TITLES: Record<number, string> = {
  1: 'Home Row',
  2: 'Home Row Words',
  3: 'Top Row',
  4: 'Bottom Row',
  5: 'Common Words',
  6: 'Capitalization',
  7: 'Numbers',
  8: 'Punctuation',
  9: 'Fluency',
};

export default function LessonMap() {
  const completed = useProgressStore((s) => s.progress.lessonsCompleted);

  // Group curriculum by unit, preserving order.
  const units = useMemo(() => {
    const map = new Map<number, Lesson[]>();
    for (const lesson of CURRICULUM) {
      const arr = map.get(lesson.unit) ?? [];
      arr.push(lesson);
      map.set(lesson.unit, arr);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a - b)
      .map(([unit, lessons]) => ({
        unit,
        lessons: lessons.sort((a, b) => a.order - b.order),
      }));
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-600">
          Curriculum
        </div>
        <h1 className="mt-2 text-3xl font-bold text-ink">Lessons</h1>
        <p className="mt-1 text-muted">
          Nine units, thirty-three lessons. Clear each at <strong>95%+ accuracy</strong> to unlock the next.
        </p>
      </header>

      <div className="space-y-6">
        {units.map(({ unit, lessons }) => (
          <UnitCard
            key={unit}
            unit={unit}
            title={UNIT_TITLES[unit] ?? `Unit ${unit}`}
            lessons={lessons}
            completed={completed}
          />
        ))}
      </div>
    </div>
  );
}

function UnitCard({
  unit,
  title,
  lessons,
  completed,
}: {
  unit: number;
  title: string;
  lessons: Lesson[];
  completed: UserProgress['lessonsCompleted'];
}) {
  return (
    // p-6 (24px) — raw card-elevated class is presentational only; add padding here.
    <section className="card-elevated p-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-600">
            Unit {unit}
          </div>
          <h2 className="mt-1 text-xl font-semibold text-ink">{title}</h2>
        </div>
        <div className="text-xs font-medium text-muted">
          {lessons.filter((l) => completed[l.id]).length} / {lessons.length} cleared
        </div>
      </div>
      <ul className="mt-5 flex flex-wrap gap-3">
        {lessons.map((lesson) => (
          <LessonNode key={lesson.id} lesson={lesson} completed={completed} />
        ))}
      </ul>
    </section>
  );
}

function LessonNode({
  lesson,
  completed,
}: {
  lesson: Lesson;
  completed: UserProgress['lessonsCompleted'];
}) {
  const cleared = completed[lesson.id];
  const unlocked = isUnlocked(lesson, completed);

  if (!unlocked) {
    return (
      <li className="inline-flex min-w-[180px] cursor-not-allowed select-none items-center gap-3 rounded-lg border border-border bg-elevated/60 px-4 py-3 opacity-70">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-bg text-muted">
          <Lock size={14} />
        </span>
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
            {lesson.order}
          </span>
          <span className="text-sm font-medium text-muted">{lesson.title}</span>
        </div>
      </li>
    );
  }

  return (
    <li>
      <Link
        to={`/lesson/${lesson.id}`}
        // px-4 py-3 matches the locked-node padding so both states have the
        // same internal breathing room; the raw `card` class has none of its own.
        className="card group inline-flex min-w-[180px] items-center gap-3 px-4 py-3 transition-transform duration-200 ease-pop hover:-translate-y-0.5"
      >
        <span
          className={[
            'grid h-8 w-8 place-items-center rounded-full font-mono text-xs font-bold',
            cleared ? 'bg-accent-500 text-white' : 'bg-brand-100 text-brand-700',
          ].join(' ')}
        >
          {cleared ? <Check size={14} /> : lesson.order}
        </span>
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-brand-600">
            {cleared ? `${Math.round(cleared.bestWpm)} wpm` : 'Ready'}
          </span>
          <span className="text-sm font-medium text-ink">{lesson.title}</span>
        </div>
      </Link>
    </li>
  );
}
