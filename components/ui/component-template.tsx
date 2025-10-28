import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Example: Card Template with variants
const cardTemplateVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200",
  {
    variants: {
      size: {
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
        xl: "p-8",
      },
      variant: {
        default: "border-border",
        medical: "border-primary/20 bg-gradient-to-br from-card to-primary/5",
        elevated: "shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]",
        outlined: "border-2 border-primary/20",
        ghost: "border-transparent bg-transparent shadow-none",
      },
      shape: {
        rounded: "rounded-lg",
        square: "rounded-none",
        pill: "rounded-full",
        large: "rounded-xl",
      },
      spacing: {
        none: "p-0",
        tight: "p-2",
        normal: "p-4",
        loose: "p-6",
        relaxed: "p-8",
      }
    },
    defaultVariants: {
      size: "md",
      variant: "default",
      shape: "rounded",
      spacing: "normal",
    },
  }
)

// Button Template with extended variants
const buttonTemplateVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        medical: "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gradient: "bg-gradient-to-r from-primary via-accent to-primary bg-size-200 bg-pos-0 hover:bg-pos-100 text-primary-foreground",
      },
      size: {
        xs: "h-6 px-2 text-xs",
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        icon: "h-10 w-10",
      },
      shape: {
        default: "rounded-md",
        square: "rounded-none",
        rounded: "rounded-lg",
        pill: "rounded-full",
        circle: "rounded-full aspect-square",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      shape: "default",
    },
  }
)

// Input Template with variants
const inputTemplateVariants = cva(
  "flex w-full border border-input bg-background ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
  {
    variants: {
      size: {
        sm: "h-8 px-2 py-1 text-sm",
        md: "h-10 px-3 py-2 text-sm",
        lg: "h-12 px-4 py-3 text-base",
      },
      variant: {
        default: "rounded-md",
        medical: "rounded-lg border-primary/20 focus-visible:border-primary/40",
        outlined: "border-2 rounded-lg",
        filled: "bg-muted/50 border-transparent rounded-lg",
        underlined: "border-0 border-b-2 rounded-none bg-transparent",
      },
      state: {
        default: "",
        error: "border-destructive focus-visible:ring-destructive",
        success: "border-success focus-visible:ring-success",
        warning: "border-warning focus-visible:ring-warning",
      }
    },
    defaultVariants: {
      size: "md",
      variant: "default",
      state: "default",
    },
  }
)

// Badge Template with variants
const badgeTemplateVariants = cva(
  "inline-flex items-center border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        success: "border-transparent bg-success text-success-foreground hover:bg-success/80",
        warning: "border-transparent bg-warning text-warning-foreground hover:bg-warning/80",
        outline: "text-foreground border-border",
        medical: "border-transparent bg-gradient-to-r from-primary to-accent text-primary-foreground",
      },
      size: {
        xs: "px-1.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-sm",
        lg: "px-3 py-1 text-sm",
      },
      shape: {
        default: "rounded-full",
        square: "rounded-md",
        pill: "rounded-full px-4",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      shape: "default",
    },
  }
)

// Export variant creators for use in other components
export const createComponentVariants = {
  card: cardTemplateVariants,
  button: buttonTemplateVariants,
  input: inputTemplateVariants,
  badge: badgeTemplateVariants,
}

// Example implementations using the templates
export interface CardTemplateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardTemplateVariants> {}

export const CardTemplate = React.forwardRef<HTMLDivElement, CardTemplateProps>(
  ({ className, size, variant, shape, spacing, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardTemplateVariants({ size, variant, shape, spacing }), className)}
      {...props}
    />
  )
)
CardTemplate.displayName = "CardTemplate"

export interface ButtonTemplateProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonTemplateVariants> {
  asChild?: boolean
}

export const ButtonTemplate = React.forwardRef<HTMLButtonElement, ButtonTemplateProps>(
  ({ className, variant, size, shape, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonTemplateVariants({ variant, size, shape }), className)}
      {...props}
    />
  )
)
ButtonTemplate.displayName = "ButtonTemplate"

export interface InputTemplateProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputTemplateVariants> {}

export const InputTemplate = React.forwardRef<HTMLInputElement, InputTemplateProps>(
  ({ className, size, variant, state, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(inputTemplateVariants({ size, variant, state }), className)}
      {...props}
    />
  )
)
InputTemplate.displayName = "InputTemplate"

export interface BadgeTemplateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeTemplateVariants> {}

export const BadgeTemplate = React.forwardRef<HTMLDivElement, BadgeTemplateProps>(
  ({ className, variant, size, shape, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(badgeTemplateVariants({ variant, size, shape }), className)}
      {...props}
    />
  )
)
BadgeTemplate.displayName = "BadgeTemplate"

// Utility type for creating custom component variants
export type ComponentVariants<T extends (...args: any) => any> = VariantProps<T> & {
  className?: string;
}

// Helper function to create consistent spacing variants
export const spacingVariants = {
  none: "p-0",
  xs: "p-1",
  sm: "p-2", 
  md: "p-4",
  lg: "p-6",
  xl: "p-8",
  "2xl": "p-12",
}

// Helper function to create consistent size variants
export const sizeVariants = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg", 
  xl: "text-xl",
  "2xl": "text-2xl",
}

// Helper function to create consistent border radius variants
export const radiusVariants = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
}