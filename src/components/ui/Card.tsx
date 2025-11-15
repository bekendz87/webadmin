import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated' | 'glass';
  children: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    
    const variants = {
      default: 'macos-card',
      outlined: 'macos-card macos-card-outlined',
      elevated: 'macos-card macos-card-elevated',
      glass: 'liquid-glass-card'
    };

    return (
      <div
        className={cn(variants[variant], className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('macos-card-header', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('macos-heading-3', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('macos-body-secondary', className)}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('macos-card-body', className)}
      {...props}
    />
  )
);
CardContent.displayName = 'CardContent';

const CardBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('macos-card-body', className)}
      {...props}
    />
  )
);
CardBody.displayName = 'CardBody';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('macos-card-footer', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

// MacOS specific card components with enhanced styling
const MacOSCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'glass', children, ...props }, ref) => (
    <Card
      ref={ref}
      className={className}
      variant={variant}
      {...props}
    >
      {children}
    </Card>
  )
);
MacOSCard.displayName = 'MacOSCard';

const MacOSCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('macos-card-body', className)}
      {...props}
    />
  )
);
MacOSCardContent.displayName = 'MacOSCardContent';

export { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardBody, 
  CardFooter,
  MacOSCard,
  MacOSCardContent
};