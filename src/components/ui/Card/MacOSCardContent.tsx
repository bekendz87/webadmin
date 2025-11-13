import React from 'react';
import { cn } from '@/lib/utils';

export interface MacOSCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const MacOSCardContent = React.forwardRef<HTMLDivElement, MacOSCardContentProps>(
    ({ className, padding = 'md', children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'relative z-10 transition-all duration-200 ease-in-out',
                    {
                        'p-0': padding === 'none',
                        'p-2': padding === 'sm',
                        'p-4 md:p-6': padding === 'md',
                        'p-6 md:p-8': padding === 'lg',
                        'p-8 md:p-12': padding === 'xl',
                    },
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

MacOSCardContent.displayName = 'MacOSCardContent';

export { MacOSCardContent };
