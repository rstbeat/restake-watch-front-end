import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7 transition-all duration-300 shadow-sm',
  {
    variants: {
      variant: {
        default: 'bg-background/80 backdrop-blur-md text-foreground border-border/50',
        destructive:
          'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive bg-destructive/10 backdrop-blur-md',
        success: 'border-success/50 text-success [&>svg]:text-success bg-success/10 backdrop-blur-md',
        warning: 'border-warning/50 text-warning [&>svg]:text-warning bg-warning/10 backdrop-blur-md',
        info: 'border-primary/50 text-primary [&>svg]:text-primary bg-primary/10 backdrop-blur-md',
        glass: 'glass border-white/20 text-foreground shadow-md',
      },
      animation: {
        none: '',
        slideIn: 'animate-in slide-in-from-right-10',
        fadeIn: 'animate-in fade-in-0',
        scale: 'animate-in zoom-in-95',
      }
    },
    defaultVariants: {
      variant: 'default',
      animation: 'none',
    },
  },
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & 
  VariantProps<typeof alertVariants> & 
  { gradientBorder?: boolean }
>(({ className, variant, animation, gradientBorder = false, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(
      alertVariants({ variant, animation }), 
      gradientBorder && 'gradient-border',
      className
    )}
    {...props}
  />
));
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-medium leading-none tracking-tight', className)}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
