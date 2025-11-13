import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'macos-heading-3 relative z-10 leading-tight',
        className
      )}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';
