import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'macos-card macos-fade-in',
        {
          'macos-card-outlined': variant === 'outlined',
          'macos-card-elevated': variant === 'elevated',
        },
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';
