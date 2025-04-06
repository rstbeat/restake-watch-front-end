import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow hover:shadow-md hover:bg-primary/90 active:shadow transition-all duration-200',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:shadow hover:bg-destructive/90 transition-all duration-200',
        outline:
          'border border-input bg-background shadow-sm hover:shadow hover:bg-accent/10 hover:text-accent-foreground transition-all duration-200',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:shadow hover:bg-secondary/80 transition-all duration-200',
        ghost: 'hover:bg-accent/10 hover:text-accent-foreground transition-all duration-200',
        link: 'text-primary underline-offset-4 hover:underline transition-all duration-200',
        gradient: 'border-0 bg-gradient-to-r from-primary via-tertiary to-accent text-white hover:shadow-lg hover:saturate-150 transition-all duration-200',
        'glass-primary': 'bg-white/20 backdrop-filter backdrop-blur-lg border border-white/30 shadow-sm hover:shadow hover:bg-white/30 text-primary-foreground transition-all duration-200',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  gradientHover?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, gradientHover = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          gradientHover && 'hover:bg-gradient-to-r hover:from-primary hover:via-tertiary hover:to-accent hover:text-white'
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
