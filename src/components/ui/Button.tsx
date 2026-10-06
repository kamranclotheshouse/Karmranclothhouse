'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

/**
 * Semantic button primitives — all colour decisions live here.
 * Future rebrand = change these tokens only.
 */

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'gold' | 'outline' | 'ghost' | 'whatsapp';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      className = '',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const base =
      'inline-flex items-center justify-center font-semibold transition-all duration-300 rounded-sm ' +
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2';

    const variants = {
      primary: 'bg-brand text-white border-brand hover:bg-brand-soft hover:border-brand-soft',
      gold: 'bg-transparent border-gold text-gold hover:bg-gold hover:text-white',
      outline: 'bg-transparent border-brand text-brand hover:bg-brand hover:text-white',
      ghost: 'bg-transparent text-ink hover:bg-cream',
      whatsapp: 'bg-[var(--color-whatsapp)] text-white hover:bg-[var(--color-whatsapp-hover)]',
    };

    const sizes = {
      sm: 'px-4 py-2 text-[10px] tracking-[0.2em]',
      md: 'px-6 py-3 text-xs tracking-[0.25em]',
      lg: 'px-10 py-4 text-xs tracking-[0.25em]',
    };

    const width = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${base} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

/** Link-styled button for navigation actions. */
interface LinkButtonProps {
  href: string;
  variant?: 'primary' | 'gold' | 'outline' | 'ghost' | 'whatsapp';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}

export function LinkButton({
  href,
  variant = 'ghost',
  size = 'md',
  className = '',
  children,
}: LinkButtonProps) {
  const base = 'inline-flex items-center justify-center font-semibold transition-all duration-300 rounded-sm';

  const variants = {
    primary: 'bg-brand text-white border-brand hover:bg-brand-soft',
    gold: 'bg-transparent border-gold text-gold hover:bg-gold hover:text-white',
    outline: 'bg-transparent border-brand text-brand hover:bg-brand hover:text-white',
    ghost: 'bg-transparent text-ink hover:text-gold hover:underline',
    whatsapp: 'bg-[var(--color-whatsapp)] text-white hover:bg-[var(--color-whatsapp-hover)]',
  };

  const sizes = {
    sm: 'px-4 py-2 text-[10px] tracking-[0.2em]',
    md: 'px-6 py-3 text-xs tracking-[0.25em]',
    lg: 'px-10 py-4 text-xs tracking-[0.25em]',
  };

  return (
    <a
      href={href}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </a>
  );
}

/** Input with consistent styling. */
export function Input({
  className = '',
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <div className="w-full">
      <input
        className={`
          w-full px-4 py-3 bg-white text-sm text-ink border focus:outline-none focus:border-brand transition-colors
          ${error ? 'border-red-500' : 'border-line'}
          ${className}
        `}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${props.id}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${props.id}-error`} className="text-red-600 text-xs mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/** Select with consistent styling. */
export function Select({
  className = '',
  error,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string; children: React.ReactNode }) {
  return (
    <div className="w-full">
      <select
        className={`
          w-full px-4 py-3 bg-white text-sm text-ink border appearance-none
          focus:outline-none focus:border-brand transition-colors
          ${error ? 'border-red-500' : 'border-line'}
          ${className}
        `}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${props.id}-error` : undefined}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p id={`${props.id}-error`} className="text-red-600 text-xs mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/** Badge for product tags. */
export function Badge({
  children,
  variant = 'default',
  className = '',
}: { children: React.ReactNode; variant?: 'default' | 'gold' | 'brand'; className?: string }) {
  const variants = {
    default: 'bg-ink text-white',
    gold: 'bg-gold text-white',
    brand: 'bg-brand text-white',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] tracking-widest uppercase font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}