/*
 * Onboarding flow per spec §7.1:
 *  1. Welcome + 1-paragraph touch-typing explanation
 *  2. "The single most effective trick" — cloth-over-hands card
 *  3. Daily goal picker (5/10/15/30)
 *  4. Mini 30-second diagnostic typing test
 * After step 4 we mark onboardingCompleted and navigate to /dashboard.
 */
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Coffee, EyeOff, Sparkles, Timer } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useSettingsStore } from '../store/useSettingsStore';
import { TypingSession } from '../components/typing/TypingSession';

const DIAGNOSTIC =
  'the small steps you take each day will outpace the giant ones you do not.';

const GOALS: { mins: 5 | 10 | 15 | 30; label: string; sub: string }[] = [
  { mins: 5, label: '5 min', sub: 'A coffee break.' },
  { mins: 10, label: '10 min', sub: 'Recommended.' },
  { mins: 15, label: '15 min', sub: 'A short focus block.' },
  { mins: 30, label: '30 min', sub: 'Serious training.' },
];

type Step = 0 | 1 | 2 | 3;

export default function Onboarding() {
  const [step, setStep] = useState<Step>(0);
  const updateSettings = useSettingsStore((s) => s.update);
  const completeOnboarding = useSettingsStore((s) => s.setOnboardingComplete);
  const navigate = useNavigate();

  const finish = useCallback(() => {
    completeOnboarding();
    navigate('/dashboard');
  }, [completeOnboarding, navigate]);

  return (
    <div className="mx-auto max-w-2xl py-12">
      <Stepper step={step} />
      <div className="mt-8">
        {step === 0 ? <Welcome onNext={() => setStep(1)} /> : null}
        {step === 1 ? <ClothTrick onNext={() => setStep(2)} /> : null}
        {step === 2 ? (
          <GoalPicker
            onSelect={(mins) => {
              updateSettings({ dailyGoalMinutes: mins });
              setStep(3);
            }}
          />
        ) : null}
        {step === 3 ? <Diagnostic onFinish={finish} onSkip={finish} /> : null}
      </div>
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Onboarding progress">
      {[0, 1, 2, 3].map((i) => (
        <li
          key={i}
          className={[
            'h-1.5 flex-1 rounded-full transition-colors duration-200 ease-standard',
            i <= step ? 'bg-brand-500' : 'bg-border',
          ].join(' ')}
        />
      ))}
    </ol>
  );
}

function Welcome({ onNext }: { onNext: () => void }) {
  return (
    <Card elevated className="space-y-5">
      <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-brand-700">
        <Sparkles size={14} />
        Welcome
      </div>
      <h1 className="text-4xl font-bold text-ink">Hello. Let's learn to type.</h1>
      <p className="text-muted">
        Touch typing means your fingers know where the keys are without looking. It
        feels strange at first — and then suddenly it doesn't. We'll get you there
        with short daily sessions, accuracy-first lessons, and drills that target
        whatever your hands struggle with.
      </p>
      <div className="flex justify-end">
        <Button onClick={onNext} rightIcon={<ArrowRight size={16} />}>
          Continue
        </Button>
      </div>
    </Card>
  );
}

function ClothTrick({ onNext }: { onNext: () => void }) {
  return (
    <Card elevated className="space-y-5">
      <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-brand-700">
        <EyeOff size={14} />
        The single best trick
      </div>
      <h1 className="text-3xl font-bold text-ink">Cover your hands.</h1>
      <p className="text-muted">
        Drape a light cloth — a tea towel works perfectly — over the keyboard so
        your hands are hidden. You'll feel the urge to peek. Don't. The on-screen
        keyboard below your typing surface is your training wheel; your fingers
        will learn the rest.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <TipCard icon={<Coffee size={18} />} title="Posture" body="Sit tall. Wrists straight. Feet flat." />
        <TipCard icon={<Timer size={18} />} title="Cadence" body="Slow and even. Speed follows accuracy." />
        <TipCard icon={<EyeOff size={18} />} title="No peeking" body="If you peek, the muscle memory doesn't form." />
      </div>
      <div className="flex justify-end">
        <Button onClick={onNext} rightIcon={<ArrowRight size={16} />}>
          Got it
        </Button>
      </div>
    </Card>
  );
}

function TipCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-lg border border-border bg-elevated p-4">
      <div className="inline-flex items-center gap-2 text-brand-500">{icon}</div>
      <div className="mt-2 text-sm font-semibold text-ink">{title}</div>
      <div className="mt-0.5 text-xs text-muted">{body}</div>
    </div>
  );
}

function GoalPicker({ onSelect }: { onSelect: (mins: 5 | 10 | 15 | 30) => void }) {
  return (
    <Card elevated className="space-y-5">
      <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-brand-700">
        Pick a daily goal
      </div>
      <h1 className="text-3xl font-bold text-ink">How much time per day?</h1>
      <p className="text-muted">
        Research is clear: short daily sessions beat long weekly ones. Pick
        something you'll actually keep. You can change this anytime in Settings.
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {GOALS.map((g) => (
          <button
            key={g.mins}
            onClick={() => onSelect(g.mins)}
            className={[
              // p-6 = 24px on all sides → ≥12px breathing room around the
              // centered pill label even when it wraps to 2 lines.
              // min-h-[156px] reserves space for a 2-line label + the
              // number, so every card matches the tallest one and the
              // numbers sit on a shared baseline.
              'card group flex min-h-[156px] flex-col items-center justify-between p-6 text-center',
              'transition-transform duration-200 ease-pop hover:-translate-y-0.5',
              g.mins === 10 ? 'ring-2 ring-brand-500/40' : '',
            ].join(' ')}
          >
            <span className="flex w-full items-start justify-center text-[10px] font-semibold uppercase leading-snug tracking-[0.15em] text-brand-600">
              {g.sub}
            </span>
            <span
              // Inter (the body font, per §8.2) at weight 700 — NOT JetBrains Mono.
              className="text-2xl font-bold text-ink"
              style={{ letterSpacing: '-0.03em' }}
            >
              {g.label}
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}

function Diagnostic({ onFinish, onSkip }: { onFinish: () => void; onSkip: () => void }) {
  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-600">
              Quick diagnostic
            </div>
            <h2 className="mt-1 text-xl font-semibold text-ink">30 seconds — type what you can</h2>
            <p className="mt-1 text-sm text-muted">
              We'll use this to seed your starting WPM. Don't worry — there's no pass/fail.
            </p>
          </div>
          <Button variant="ghost" onClick={onSkip}>
            Skip
          </Button>
        </div>
      </Card>
      <TypingSession
        mode="practice"
        sourceId="onboarding-diagnostic"
        target={DIAGNOSTIC}
        timeLimitSeconds={30}
        title="Diagnostic"
        subtitle="Type as much as you can in 30 seconds"
        onNext={onFinish}
        onRetry={onFinish}
        onExit={onSkip}
      />
    </div>
  );
}
