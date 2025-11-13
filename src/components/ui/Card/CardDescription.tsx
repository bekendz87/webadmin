import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        'macos-body-secondary relative z-10 mt-2',
        className
      )}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';
