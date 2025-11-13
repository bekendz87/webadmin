import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    leftIcon,
    rightIcon,
    disabled, 
    children,
    fullWidth = false,
    ...props 
  }, ref) => {
    
    const variants = {
      primary: 'macos26-btn macos26-btn-primary',
      secondary: 'macos26-btn macos26-btn-secondary', 
      ghost: 'macos26-btn macos26-btn-ghost',
      danger: 'macos26-btn macos26-btn-danger',
      success: 'macos26-btn macos26-btn-success',
      outline: 'macos26-btn macos26-btn-outline'
    };

    const sizes = {
      sm: 'macos26-btn-sm',
      md: 'macos26-btn-md', 
      lg: 'macos26-btn-lg'
    };

    return (
      <button
        className={cn(
          variants[variant],
          sizes[size],
          fullWidth && 'macos26-btn-full',
          loading && 'macos26-btn-loading',
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        <div className="btn-content flex items-center justify-center gap-2">
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin gpu-accelerated" />
              <span>{children}</span>
            </>
          ) : (
            <>
              {leftIcon && <span className="w-4 h-4 flex-shrink-0">{leftIcon}</span>}
              <span>{children}</span>
              {rightIcon && <span className="w-4 h-4 flex-shrink-0">{rightIcon}</span>}
            </>
          )}
        </div>
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };