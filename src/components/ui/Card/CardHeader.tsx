import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'macos-card-header',
        className
      )}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';
