import React, { useEffect } from 'react';
import { cn } from '@/v0/lib/utils';
import { loadV0Styles } from '@/v0/styles';

export interface V0ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const V0Button: React.FC<V0ButtonProps> = ({
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  ...props
}) => {
  // Load v0 styles when component is first used
  useEffect(() => {
    loadV0Styles().catch(console.error);
  }, []);

  const baseClasses = 'v0-button';

  const variants = {
    primary: 'v0-button-primary',
    secondary: 'v0-button-secondary',
    outline: 'v0-button-outline',
    ghost: 'v0-button-ghost',
    destructive: 'v0-button-destructive',
  };

  const sizes = {
    sm: 'v0-button-sm',
    md: 'v0-button-md',
    lg: 'v0-button-lg',
  };

  return (
    <button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="v0-loading -ml-1 mr-3 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
};
