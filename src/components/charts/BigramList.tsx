/*
 * Top weak bigrams with a "Drill these" CTA per row.
 */
import { Link } from 'react-router-dom';
import type { BigramStats } from '../../types';
import { Button } from '../ui/Button';
import { ArrowRight } from 'lucide-react';
import { rankWeakBigrams } from '../../engine/drillGenerator';

interface Props {
  perBigram: Record<string, BigramStats>;
}

export function BigramList({ perBigram }: Props) {
  const ranked = rankWeakBigrams(perBigram, 10);
  if (ranked.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted">
        Type 20+ sessions to see your weakest letter pairs.
      </div>
    );
  }
  return (
    <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
      {ranked.map((bg) => {
        const stat = perBigram[bg];
        const rate = stat.errors / Math.max(1, stat.attempts);
        return (
          <li key={bg} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3">
              <code className="rounded-md bg-elevated px-2 py-1 font-mono text-base font-semibold text-ink">
                {bg}
              </code>
              <span className="text-sm text-muted">
                {Math.round(rate * 100)}% errors · {Math.round(stat.attempts)} attempts
              </span>
            </div>
            <Link to="/stats?drill=1">
              <Button variant="secondary" size="sm" rightIcon={<ArrowRight size={14} />}>
                Drill
              </Button>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
