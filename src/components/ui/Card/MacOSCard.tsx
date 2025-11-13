import React from 'react';
import { cn } from '@/lib/utils';

export interface MacOSCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated' | 'glass' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
}

const MacOSCard = React.forwardRef<HTMLDivElement, MacOSCardProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'macos-card macos-fade-in',
          {
            // Variants
            'macos-card-outlined': variant === 'outlined',
            'macos-card-elevated': variant === 'elevated',
            'liquid-glass-card': variant === 'glass',
            'bg-transparent border-0 shadow-none': variant === 'minimal',
            // Sizes
            'text-sm': size === 'sm',
            'text-base': size === 'md', 
            'text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);

MacOSCard.displayName = 'MacOSCard';

export { MacOSCard };
