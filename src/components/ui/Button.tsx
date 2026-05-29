import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const VARIANT: Record<Variant, string> = {
  primary:
    'bg-brand-500 text-white shadow-elevated hover:-translate-y-0.5 hover:bg-brand-600 active:translate-y-0 active:bg-brand-700',
  secondary:
    'bg-surface text-ink border border-border shadow-card hover:-translate-y-0.5 hover:bg-elevated active:translate-y-0',
  ghost:
    'bg-transparent text-ink hover:bg-elevated active:bg-brand-100',
  danger:
    'bg-error text-white shadow-elevated hover:-translate-y-0.5 hover:opacity-95 active:translate-y-0',
};

const SIZE: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-5 py-2.5 text-sm rounded-md',
  lg: 'px-7 py-3.5 text-base rounded-md font-semibold',
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'primary', size = 'md', leftIcon, rightIcon, className = '', children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={[
        'inline-flex items-center justify-center gap-2 font-medium',
        'transition-[transform,background-color,box-shadow,opacity] duration-200 ease-standard',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0',
        VARIANT[variant],
        SIZE[size],
        className,
      ].join(' ')}
      {...rest}
    >
      {leftIcon ? <span className="-ml-0.5 inline-flex">{leftIcon}</span> : null}
      {children}
      {rightIcon ? <span className="-mr-0.5 inline-flex">{rightIcon}</span> : null}
    </button>
  );
});
