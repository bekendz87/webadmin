'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  label?: string;
  animated?: boolean;
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    className, 
    value = 0, 
    max = 100, 
    variant = 'default',
    size = 'md',
    showValue = false,
    label,
    animated = true,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const sizeClasses = {
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4'
    };

    const variantClasses = {
      default: 'bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)]',
      success: 'bg-gradient-to-r from-[var(--macos-green)] to-emerald-500',
      warning: 'bg-gradient-to-r from-[var(--macos-orange)] to-yellow-500',
      danger: 'bg-gradient-to-r from-[var(--macos-red)] to-red-600',
      info: 'bg-gradient-to-r from-[var(--macos-blue)] to-blue-500'
    };

    return (
      <div className="w-full space-y-2">
        {(label || showValue) && (
          <div className="flex items-center justify-between text-sm">
            {label && (
              <span className="font-medium text-[var(--primary-text)] font-['SF_Pro_Display']">
                {label}
              </span>
            )}
            {showValue && (
              <span className="font-semibold text-[var(--primary-text)] min-w-[3rem] text-right font-mono">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}
        
        <div
          ref={ref}
          className={cn(
            'w-full overflow-hidden rounded-full backdrop-filter backdrop-blur-lg',
            'bg-[var(--card-bg)] border border-[var(--card-border)]',
            sizeClasses[size],
            className
          )}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-label={label || `Progress: ${Math.round(percentage)}%`}
          {...props}
        >
          <div
            className={cn(
              'h-full rounded-full backdrop-filter backdrop-blur-sm',
              'transition-all duration-500 ease-out relative overflow-hidden',
              variantClasses[variant],
              !animated && 'transition-none'
            )}
            style={{ width: `${percentage}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </div>
        </div>
        
        {showValue && !label && (
          <div className="text-center">
            <span className="text-xs text-[var(--primary-text-secondary)] font-mono">
              {value} / {max}
            </span>
          </div>
        )}
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export { Progress };