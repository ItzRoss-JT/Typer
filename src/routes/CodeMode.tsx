/*
 * Code Mode — JS / TS / Python snippets with leading-whitespace auto-skip.
 * Spec §7.6.
 */
import { useCallback, useMemo, useState } from 'react';
import { TypingSession } from '../components/typing/TypingSession';
import { randomSnippet, snippetsByLanguage } from '../data/codeSnippets';
import { Button } from '../components/ui/Button';
import { Shuffle } from 'lucide-react';
import { makeLeadingSpaceSkipper } from '../engine/session';
import type { CodeLanguage, CodeSnippet } from '../types';

const LANGS: { id: CodeLanguage; label: string }[] = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'python', label: 'Python' },
];

export default function CodeMode() {
  const [lang, setLang] = useState<CodeLanguage>('javascript');
  const [snippet, setSnippet] = useState<CodeSnippet>(() => randomSnippet('javascript'));
  const [nonce, setNonce] = useState(0);

  const skipper = useMemo(() => makeLeadingSpaceSkipper(), []);

  const handleLang = (next: CodeLanguage) => {
    setLang(next);
    setSnippet(randomSnippet(next));
    setNonce((n) => n + 1);
  };

  const handleShuffle = () => {
    setSnippet(randomSnippet(lang));
    setNonce((n) => n + 1);
  };

  const handleNext = useCallback(() => {
    handleShuffle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-600">
            Code Mode
          </div>
          <h1 className="mt-1 text-3xl font-bold text-ink">{snippet.title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-md border border-border bg-surface p-1">
            {LANGS.map((l) => (
              <button
                key={l.id}
                onClick={() => handleLang(l.id)}
                className={[
                  'rounded px-3 py-1 text-sm font-medium transition-colors duration-150 ease-standard',
                  lang === l.id ? 'bg-brand-500 text-white' : 'text-muted hover:text-ink',
                ].join(' ')}
              >
                {l.label}
              </button>
            ))}
          </div>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Shuffle size={14} />}
            onClick={handleShuffle}
          >
            New snippet
          </Button>
        </div>
      </header>

      <p className="text-xs text-muted">
        Indentation is auto-skipped — just type the first non-whitespace character of each line.
      </p>

      <TypingSession
        key={`${snippet.id}-${nonce}`}
        mode="code"
        sourceId={snippet.id}
        target={snippet.code}
        autoSkippable={skipper}
        title={snippet.title}
        subtitle={`${snippet.language} · ${snippetsByLanguage(lang).length} snippets`}
        onNext={handleNext}
        onRetry={() => setNonce((n) => n + 1)}
        onExit={handleNext}
      />
    </div>
  );
}
