import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  children?: ReactNode;
}

export function Card({ elevated, className = '', children, ...rest }: CardProps) {
  const base = elevated ? 'card-elevated' : 'card';
  return (
    <div className={`${base} p-6 ${className}`} {...rest}>
      {children}
    </div>
  );
}
