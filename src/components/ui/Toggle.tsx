interface Props {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  id?: string;
}

export function Toggle({ checked, onChange, label, id }: Props) {
  return (
    <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-3 select-none">
      <span className="relative inline-block h-6 w-11">
        <input
          id={id}
          type="checkbox"
          className="peer absolute h-full w-full cursor-pointer opacity-0"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span
          aria-hidden
          className={[
            'absolute inset-0 rounded-full border border-border',
            'transition-colors duration-200 ease-standard',
            checked ? 'bg-brand-500' : 'bg-elevated',
          ].join(' ')}
        />
        <span
          aria-hidden
          className={[
            'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-card',
            'transition-transform duration-200 ease-pop',
            checked ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')}
        />
      </span>
      <span className="text-sm font-medium text-ink">{label}</span>
    </label>
  );
}
