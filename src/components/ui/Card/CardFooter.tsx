import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'macos-card-footer flex items-center justify-between',
        className
      )}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';
