import React from 'react';
import { cn } from '@/utils/cn';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
}

interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variantStyles = {
      default: 'macos26-alert',
      success: 'macos26-alert macos26-alert-success',
      warning: 'macos26-alert macos26-alert-warning',
      error: 'macos26-alert macos26-alert-error',
      info: 'macos26-alert'
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(variantStyles[variant], 'macos-fade-in', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<HTMLHeadingElement, AlertTitleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h5
        ref={ref}
        className={cn(
          'mb-2 font-semibold text-lg leading-none tracking-tight',
          'text-[var(--primary-text)]',
          className
        )}
        {...props}
      >
        {children}
      </h5>
    );
  }
);
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(
          'text-sm leading-relaxed',
          'text-[var(--primary-text-secondary)]',
          className
        )}
        {...props}
      >
        {children}
      </p>
    );
  }
);
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
export type { AlertProps, AlertTitleProps, AlertDescriptionProps };
