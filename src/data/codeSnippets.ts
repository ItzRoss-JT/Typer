/*
 * Code snippets for /code mode. Idiomatic in each language, short enough for
 * a single typing session. Indentation is preserved — the surface auto-skips
 * leading whitespace per spec §7.6.
 */
import type { CodeSnippet } from '../types';

export const SNIPPETS: CodeSnippet[] = [
  // JavaScript
  {
    id: 'js-fibonacci',
    language: 'javascript',
    title: 'Fibonacci',
    code: `function fib(n) {
  if (n < 2) return n;
  return fib(n - 1) + fib(n - 2);
}`,
  },
  {
    id: 'js-debounce',
    language: 'javascript',
    title: 'Debounce',
    code: `function debounce(fn, ms) {
  let id;
  return (...args) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), ms);
  };
}`,
  },
  {
    id: 'js-fetch-json',
    language: 'javascript',
    title: 'Fetch JSON',
    code: `async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}`,
  },
  {
    id: 'js-map-filter',
    language: 'javascript',
    title: 'Map and filter',
    code: `const evens = numbers.filter((n) => n % 2 === 0);
const doubled = evens.map((n) => n * 2);
const sum = doubled.reduce((a, b) => a + b, 0);`,
  },
  {
    id: 'js-event-listener',
    language: 'javascript',
    title: 'Click handler',
    code: `document.querySelector('button').addEventListener('click', (e) => {
  e.preventDefault();
  console.log('clicked', e.target);
});`,
  },
  {
    id: 'js-classes',
    language: 'javascript',
    title: 'Class',
    code: `class Counter {
  constructor() {
    this.count = 0;
  }
  increment() {
    this.count += 1;
    return this.count;
  }
}`,
  },

  // TypeScript
  {
    id: 'ts-record',
    language: 'typescript',
    title: 'Record from array',
    code: `function indexBy<T>(items: T[], key: (item: T) => string): Record<string, T> {
  const out: Record<string, T> = {};
  for (const item of items) {
    out[key(item)] = item;
  }
  return out;
}`,
  },
  {
    id: 'ts-discriminated',
    language: 'typescript',
    title: 'Discriminated union',
    code: `type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

function unwrap<T>(r: Result<T>): T {
  if (!r.ok) throw new Error(r.error);
  return r.value;
}`,
  },
  {
    id: 'ts-react-component',
    language: 'typescript',
    title: 'React component',
    code: `interface Props {
  label: string;
  onClick: () => void;
}

export function Button({ label, onClick }: Props) {
  return <button onClick={onClick}>{label}</button>;
}`,
  },
  {
    id: 'ts-generic-cache',
    language: 'typescript',
    title: 'Generic cache',
    code: `class Cache<K, V> {
  private map = new Map<K, V>();
  get(key: K): V | undefined {
    return this.map.get(key);
  }
  set(key: K, value: V): void {
    this.map.set(key, value);
  }
}`,
  },
  {
    id: 'ts-utility-types',
    language: 'typescript',
    title: 'Utility types',
    code: `type User = { id: string; name: string; email: string };
type UserPreview = Pick<User, 'id' | 'name'>;
type UserPatch = Partial<Omit<User, 'id'>>;`,
  },

  // Python
  {
    id: 'py-fibonacci',
    language: 'python',
    title: 'Fibonacci',
    code: `def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)`,
  },
  {
    id: 'py-list-comp',
    language: 'python',
    title: 'List comprehension',
    code: `numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
evens = [n for n in numbers if n % 2 == 0]
squared = [n * n for n in evens]
total = sum(squared)`,
  },
  {
    id: 'py-class',
    language: 'python',
    title: 'Dataclass',
    code: `from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float

    def distance_to(self, other):
        dx = self.x - other.x
        dy = self.y - other.y
        return (dx * dx + dy * dy) ** 0.5`,
  },
  {
    id: 'py-context',
    language: 'python',
    title: 'Context manager',
    code: `with open('data.txt', 'r') as f:
    lines = f.readlines()
    for line in lines:
        print(line.strip())`,
  },
  {
    id: 'py-dict-comp',
    language: 'python',
    title: 'Dict comprehension',
    code: `words = ['the', 'quick', 'brown', 'fox', 'jumps']
lengths = {word: len(word) for word in words}
longest = max(lengths, key=lengths.get)`,
  },
  {
    id: 'py-decorator',
    language: 'python',
    title: 'Simple decorator',
    code: `def timing(fn):
    import time
    def wrapper(*args, **kwargs):
        start = time.time()
        result = fn(*args, **kwargs)
        print(f'{fn.__name__} took {time.time() - start:.3f}s')
        return result
    return wrapper`,
  },
];

export function snippetsByLanguage(lang: CodeSnippet['language']): CodeSnippet[] {
  return SNIPPETS.filter((s) => s.language === lang);
}

export function randomSnippet(lang?: CodeSnippet['language']): CodeSnippet {
  const pool = lang ? snippetsByLanguage(lang) : SNIPPETS;
  return pool[Math.floor(Math.random() * pool.length)];
}
