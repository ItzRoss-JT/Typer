/*
 * Pop-in toast that surfaces when a badge unlocks. Dismisses itself after
 * a few seconds; user can also click to dismiss.
 */
import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { findBadge } from '../../data/badges';

interface Props {
  /** Badge IDs that just unlocked. */
  badgeIds: string[];
  onDismiss: () => void;
}

export function BadgeToast({ badgeIds, onDismiss }: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (badgeIds.length === 0) return;
    const id = window.setTimeout(() => {
      setVisible(false);
      window.setTimeout(onDismiss, 250);
    }, 5000);
    return () => window.clearTimeout(id);
  }, [badgeIds, onDismiss]);

  if (badgeIds.length === 0 || !visible) return null;

  // Show the first one prominently; if more, indicate "+ N more".
  const first = findBadge(badgeIds[0]);
  if (!first) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 animate-pop-in"
    >
      <button
        onClick={() => {
          setVisible(false);
          window.setTimeout(onDismiss, 250);
        }}
        className="card-elevated relative max-w-sm overflow-hidden p-4 pr-8 text-left"
      >
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-200/60 blur-2xl" />
        <div className="relative flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-500 text-white shadow-elevated">
            <Sparkles size={18} />
          </span>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-700">
              Badge unlocked
            </div>
            <div className="text-sm font-semibold text-ink">{first.title}</div>
            <div className="text-xs text-muted">
              {first.description}
              {badgeIds.length > 1 ? ` (+${badgeIds.length - 1} more)` : ''}
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
