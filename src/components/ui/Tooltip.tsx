import { useState, type ReactNode } from 'react';

interface Props {
  content: string;
  children: ReactNode;
}

export function Tooltip({ content, children }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open ? (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-30 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2.5 py-1.5 text-xs font-medium text-bg shadow-elevated"
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
