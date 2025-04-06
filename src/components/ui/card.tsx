import * as React from 'react';

import { cn } from '../../lib/utils';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    glassEffect?: 'none' | 'light' | 'medium' | 'strong';
    hoverEffect?: boolean;
    gradientBorder?: boolean;
  }
>(({ className, glassEffect = 'none', hoverEffect = false, gradientBorder = false, ...props }, ref) => {
  // Enhanced glassmorphism classes with modern effects
  const glassClasses = {
    none: '',
    light: 'glass backdrop-blur-sm bg-white/70 border-white/20 transition-colors duration-300',
    medium: 'glass backdrop-blur-md bg-white/60 border-white/30 shadow-lg transition-colors duration-300',
    strong: 'glass backdrop-blur-xl bg-white/50 border-white/40 shadow-xl transition-colors duration-300',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border bg-card text-card-foreground shadow transition-all duration-300',
        glassEffect !== 'none' && glassClasses[glassEffect],
        hoverEffect && 'glass-hover animate-scale',
        gradientBorder && 'gradient-border',
        className,
      )}
      {...props}
    />
  );
});
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-semibold leading-none tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-light', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
